const express = require('express');
const { CPE2_3_URI } = require('cpe');
const { flattenObject } = require('../util/flatten');

const { Credential } = require('../models/Credentials');

const {
  requiresAdmin,
  requiresKey,
} = require('../middleware/auth');

const router = express.Router();

// TODO: Move to config/constants
const RESULTS_PER_PAGE = 10;

// TODO: Swagger
router.get('/typeahead', (req, res, next) => {
  const {
    field,
    prefix = '',
    count = 5,
    part,
    vendor,
    product,
    version,
    update,
    language,
    edition,
  } = req.query;

  if (!field) res.status(500).send({ "message": "The \'field\' parameter is required." });

  const attrs = {
    ...(part && { part: part }),
    ...(vendor && { vendor: vendor }),
    ...(product && { product: product }),
    ...(version && { version: version }),
    ...(update && { update: update }),
    ...(language && { language: language }),
    ...(edition && { edition: edition }),
  };

  const matches = {
    $match: flattenObject({ cpe: attrs }),
  };

  Credential.aggregate([
    {
      $facet: {
        "results": [
          matches,
          {
            $group: {
              _id: `$cpe.${field}`,
              count: { $sum: 1 }
            }
          },
          {
            $match: {
              _id: { $regex: new RegExp(prefix, 'i') }
            },
          },
          {
            $sort: {
              count: -1
            }
          }
        ]
      }
    }
  ])
    .then((docs) => res.send(docs[0]['results'].slice(0, count)))
    .catch((err) => res.status(500).send({ "message": err }));
});

/**
 * @swagger
 * /credentials/search:
 *   get:
 *     description: Returns a list of all known credentials that match a given CPE string.
 *     summary: Get a list of credentials by CPE.
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: page
 *       in: query
 *       description: "The page of results to retrieve."
 *       required: false
 *       schema:
 *         type: number
 *         example: 1
 *     - name: limit
 *       in: query
 *       description: "The number of results to return per page."
 *       required: false
 *       schema:
 *         type: number
 *         example: 10
 *     - name: part
 *       in: query
 *       description: "The part field of the CPE to search for."
 *       required: false
 *       schema:
 *         type: string
 *         example: h
 *     - name: vendor
 *       in: query
 *       description:  "The vendor field of the CPE to search for."
 *       required: false
 *       schema:
 *         type: string
 *         example: linksys
 *     - name: product
 *       in: query
 *       description:  "The product field of the CPE to search for."
 *       required: false
 *       schema:
 *         type: string
 *         example: wrt54g
 *     - name: username
 *       in: query
 *       description:  "The username to search for."
 *       required: false
 *       schema:
 *         type: string
 *     - name: password
 *       in: query
 *       description: "The password to search for."
 *       required: false
 *       schema:
 *         type: string
*     - name: unique
 *       in: query
 *       description: "Only return unique credential pairs with no CPE information."
 *       required: false
 *       schema:
 *         type: boolean
 *       default: false
 *     responses:
 *       200:
 *         description: Returns a list of credentials that match the provided CPE string.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CredentialsList'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/search', requiresKey, (req, res, next) => {
  const {
    page = 1,
    limit = RESULTS_PER_PAGE,
    part,
    vendor,
    product,
    version,
    username,
    password,
    unique = false,
  } = req.query;

  // TODO: Need to revisit this. I don't think this matches the Swagger docs?
  const searchCpe = {
    ...(part && { part, part }),
    ...(vendor && { vendor, vendor }),
    ...(product && { product, product }),
    ...(version && { version, version }),
  };

  const queryFields = {
    cpe: searchCpe,
    ...(username && { username: username }),
    ...(password && { password: password }),
  };

  if (unique === 'true') {
    const aggregate = Credential.aggregate([
      { $match: { ...flattenObject({ cpe: searchCpe }), ...{ ...(username && { username: username }), ...(password && { password: password }) } } },
      { $group: { "_id": { username: "$username", password: "$password" } } },
    ]);
    Credential
      .aggregatePaginate(aggregate, { page: page, limit: parseInt(limit) })
      // TODO: This sends [{_id: {username: str, password: str}}] which does not match the schema. Wonder if it needs to be it's own endpoint
      .then((docs) => res.send(docs));
  } else {
    // TODO: This is not following the schema
    // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
    Credential
      .paginate(flattenObject(queryFields), { page: page, limit: parseInt(limit) })
      .then((docs) => {
        res.send({
          ...docs,
          docs: docs.docs.map((doc) => ({
            ...doc.toObject(),
            edits: doc.toObject().edits.map((edit) => {
              delete edit['apiKey'];
              return edit;
            })
          }))
        });
      });
  }
});

/**
 * @swagger
 * /credentials/{id}/verify:
 *   post:
 *     summary: Verifies credential
 *     description: Toggles the verification status of a credential
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - in: path
 *       name: id
 *       required: false
 *       description: ID of the credential object to fetch
 *       schema:
 *         type: integer
 *     - name: body
 *       in: body
 *       description: The verification state to set on the credential
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           isVerified:
 *             type: boolean
 *             required: true
 *             example: true
 *     responses:
 *       200:
 *         description: Returns the updated credential object.
 *         schema:
 *           $ref: '#/components/schemas/Credential'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/:id/verify', requiresAdmin, async (req, res, next) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  if (isVerified == null) res.status(500).send({ "message": "Missing required field \"isVerified\"." })

  Credential.findByIdAndUpdate(
    id,
    { isVerified: isVerified },
    { new: true }
  ).then((data) => {
    res.send({
      ...data.toObject(),
      edits: data.toObject().edits.map((edit) => {
        delete edit['apiKey'];
        return edit;
      }),
    });
  }
  ).catch((err) => {
    res.status(500).send({ "message": "Failed to validate record" });
  });
});


/**
 * @swagger
 * /credentials/{id}:
 *   get:
 *     summary: Get a credential by ID
 *     description: Returns a credential by ID
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: false
 *         description: ID of the credential object to fetch
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns a single credential object.
 *         schema:
 *           $ref: '#/components/schemas/Credential'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', requiresKey, async (req, res, next) => {
  const { id = '' } = req.params;

  Credential.findOne({ _id: id })
    .then((data) => {
      res.send({
        ...data.toObject(),
        edits: data.toObject().edits.map((edit) => {
          delete edit['apiKey'];
          return edit;
        }),
      });
    }
    ).catch((err) => {
      res.status(500).send({ "message": "Failed to get the requested record." });
    });
});

/**
 * @swagger
 * /credentials:
 *   get:
 *     summary: Get a list of all credentials
 *     description: Returns all credentials stored in the database
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of credential objects.
 *         schema:
 *           $ref: '#/components/schemas/CredentialsList'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', requiresKey, (req, res, next) => {
  const { page = 1, limit = RESULTS_PER_PAGE } = req.query;

  Credential.paginate({}, { page: page, limit: parseInt(limit) }, (err, docs) => {
    // Remove the apiKey
    res.send({
      ...docs,
      docs: docs.docs.map((doc) => ({
        ...doc.toObject(),
        edits: doc.toObject().edits.map((edit) => {
          delete edit['apiKey'];
          return edit;
        })
      }))
    });
  });
});

/**
 * @swagger
 * /credentials:
 *   post:
 *     summary: Save a new credential
 *     description: Returns a credential by ID
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Credential to save
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/CredentialUpdate'
 *     responses:
 *       200:
 *         description: Returns the credential object that was saved.
 *         schema:
 *           $ref: '#/components/schemas/Credential'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', requiresKey, async (req, res, next) => {
  const { username, password, cpe, protocol, references } = req.body;
  const { key } = req;

  const updates = {
    ...(username && { username: username }),
    ...(password && { password: password }),
    ...(cpe && { cpe: cpe }),
    ...(protocol && { protocol: protocol }),
    ...(references && { references: references }),
  };

  // TODO: More validation/testing
  const credential = new Credential({
    ...updates,
    edits: [{
      apiKey: key,
      timestamp: Date.now(),
      edit: updates,
    }],
  });

  credential.save()
    .then((data) => {
      res.send({
        ...data.toObject(),
        edits: data.toObject().edits.map((edit) => {
          delete edit['apiKey'];
          return edit;
        }),
      });
    }
    ).catch((err) => {
      console.log(err);
      res.status(500).send({ "message": "Failed to save record." });
    });
});

/**
 * @swagger
 * /credentials/{id}:
 *   put:
 *     summary: Update a credential
 *     description: Returns a credential by ID. Requires Admin.
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the credential to update.
 *       required: true
 *       schema:
 *         type: string
 *     - name: details
 *       in: body
 *       description: The Credential details to be updated
 *       schema:
 *         $ref: '#/components/schemas/CredentialUpdate'
 *     responses:
 *       200:
 *         description: Returns the credential object that was updated.
 *         schema:
 *           $ref: '#/components/schemas/Credential'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/:id', requiresAdmin, (req, res, next) => {
  const { id } = req.params;
  const { key } = req;
  const { username, password, cpe, protocol, references } = req.body;

  const updates = {
    ...(username && { username: username }),
    ...(password && { password: password }),
    ...(cpe && { cpe: cpe }),
    ...(protocol && { protocol: protocol }),
    ...(references && { references: references }),
  };

  const edit = {
    edit: updates,
    timestamp: Date.now(),
    apiKey: key,
  };

  Credential.findOne({ _id: id })
    .then((data) => {
      const { isVerified } = data.toObject();
      if (isVerified) {
        res.status(403).send({ "message": "Cannot update a verified record." });
        next();
      } else {
        Credential.findByIdAndUpdate(
          id,
          {
            $set: flattenObject(updates),
            $push: { edits: edit }
          },
          { new: true }
        ).then((data) => {
          res.send({
            ...data.toObject(),
            edits: data.toObject().edits.map((edit) => {
              delete edit['apiKey'];
              return edit;
            }),
          });
        }
        ).catch((err) => {
          console.log(err);
          res.status(500).send({ "message": "Failed to update record." });
        });
      }
    })
    .catch((err) => {
      res.status(500).send({ "message": "Failed to update record" });
    });
});

/**
 * @swagger
 * /credentials/{id}:
 *   delete:
 *     summary: Delete a credential
 *     description: Deletes a credential. Requires Admin.
 *     tags:
 *       - Credentials
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the credential to delete
 *       required: true
 *     responses:
 *       200:
 *         description: Returns the ID of the credential that was deleted
 *         schema:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               required: true
 *               example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.delete('/:id', requiresAdmin, (req, res, next) => {
  const { id } = req.params;

  Credential.deleteOne({ _id: id })
    .then(() => {
      res.send({ id: id });
    });

});

module.exports = router;