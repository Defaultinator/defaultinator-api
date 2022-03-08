const express = require('express');
const { v4: uuidv4 } = require('uuid');
const {
  requiresAdmin,
  requiresKey,
  AUTH_HEADER,
} = require('../middleware/auth');

const {
  APIKey,
  APIKeySubmissionSchema,
} = require('../models/APIKeys');

const { ROOT_KEY } = require('../config/constants');

const router = express.Router();

// TODO: Move to config/constants?
const RESULTS_PER_PAGE = 50;

// Create the root admin key if it doesn't exist already
const initializeAdminKey = async () => {
  let rootKey = await APIKey.findOne({ isRootKey: true });

  // If the root API key doesn't exist, make it
  if (!rootKey) {
    console.log(`No root key found! Generating one for you.`);
    const apiKey = rootKey = new APIKey({
      apiKey: ROOT_KEY || uuidv4(),
      email: 'ROOT KEY',
      notes: 'This key was automatically generated during initialization.',
      isAdmin: true,
      isRootKey: true,
    });

    await apiKey.save();
  };

  console.log(`Root key: ${rootKey?.apiKey}`);
};

/**
 * @swagger
 * /apikeys/keyinfo:
 *   get:
 *     summary: Get metadata for an API Key
 *     description: Returns metadata about a given API key, specifically if the user is an admin.
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         description: The API key for which to get metadata about.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns a single APIKey object.
 *         schema:
 *           $ref: '#/components/schemas/APIKey'
*       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/keyinfo', requiresKey, async (req, res, next) => {
  const { headers } = req;

  try {
    if (AUTH_HEADER in headers) {
      res.send(await APIKey.findOne({ apiKey: headers[AUTH_HEADER] }));
    } else {
      res.status(500).send({ message: "X-API-KEY not present in headers" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Unknown error." });
  }

});

/**
 * @swagger
 * /apikeys/{id}:
 *   get:
 *     summary: Get data for an API Key
 *     description: Returns an API Key by ID
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the APIKey object to fetch
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Returns a single APIKey object.
 *         schema:
 *           $ref: '#/components/schemas/APIKey'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/:id', requiresAdmin, async (req, res, next) => {
  const { id = '' } = req.params;
  res.send(await APIKey.findOne({ _id: id }));
});

/**
 * @swagger
 * /apikeys:
 *   get:
 *     summary: Get a list of all API Keys
 *     description: Returns all API Keys stored in the database. Requires the user to be Admin.
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Returns a list of APIKey objects.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/APIKey'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', requiresAdmin, (req, res, next) => {
  const { page = 1, limit = RESULTS_PER_PAGE } = req.query;

  APIKey.paginate({}, { page: page, limit: parseInt(limit) }, (err, docs) => {
    res.send(docs);
  });
});

/**
 * @swagger
 * /apikeys:
 *   post:
 *     summary: Create a new API Key
 *     description: Returns a newly created APIKey
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Credential to save
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/APIKeySubmission'
 *     responses:
 *       200:
 *         description: Returns the credential object that was saved.
 *         schema:
 *           $ref: '#/components/schemas/Credential'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', requiresAdmin, async (req, res, next) => {
  const { email, notes, isAdmin = false } = req.body;

  const apiKey = new APIKey({
    apiKey: uuidv4(),
    email: email,
    notes: notes,
    isAdmin: isAdmin,
    isRootKey: false,
  });

  await apiKey.save();
  res.send(apiKey);
});

/**
 * @swagger
 * /apikeys/tourcomplete:
 *   post:
 *     summary: Set product tour to complete
 *     description: Marks that the user has completed the product tour and should not be presented with it upon return.
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Credential to save
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/APIKeySubmission'
 *     responses:
 *       200:
 *         description: Returns the credential object that was saved.
 *         schema:
 *           $ref: '#/components/schemas/Credential'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/tourcomplete', requiresKey, async (req, res, next) => {
  const { headers } = req;

  try {
    if (AUTH_HEADER in headers) {
      res.send(await APIKey.findOneAndUpdate(
        { apiKey: headers[AUTH_HEADER] },
        { tourComplete: true },
        { new: true }
      ));
    } else {
      res.status(500).send({ message: "X-API-KEY not present in headers" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "Unknown error." });
  };
});

/**
 * @swagger
 * /apikeys/{id}:
 *   put:
 *     summary: Update an APIKey
 *     description: Returns an APIKey by ID
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the API Key to update.
 *       required: true
 *       schema:
 *         type: string
 *     - name: details
 *       in: body
 *       description: The APIKey details to be updated
 *       schema:
 *         $ref: '#/components/schemas/APIKey'
 *     responses:
 *       200:
 *         description: Returns the APIKey object that was updated.
 *         schema:
 *           $ref: '#/components/schemas/APIKey'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/:id', requiresAdmin, (req, res, next) => {
  const { id } = req.params;
  const { email, notes, isAdmin } = req.body;

  const updates = {
    ...(email && { email: email }),
    ...(notes && { notes: notes }),
    ...(isAdmin && { isAdmin: isAdmin }),
  };

  APIKey.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  ).then((data) => {
    res.send(data);
  }
  ).catch((err) => {
    console.log(err);
    res.status(500).send({ "message": "Failed to update record." });
  });

});

/**
 * @swagger
 * /apikeys/{id}:
 *   delete:
 *     summary: Delete an API Key
 *     description: Deletes an API Key
 *     tags:
 *       - API Keys
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the key to delete
 *       required: true
 *     responses:
 *       200:
 *         description: Returns the ID of the key that was deleted
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

  APIKey.deleteOne({ _id: id })
    .then(() => {
      res.send({ message: "Success" });
    });

});

initializeAdminKey();

module.exports = router;