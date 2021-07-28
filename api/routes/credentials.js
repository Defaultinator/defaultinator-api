const express = require('express');
const {CPE2_3_URI} = require('cpe');
const {flattenObject} = require('../util/flatten');

const {Credential} = require('../models/Credentials');

const router = express.Router();

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

  if(!field) res.status(500).send({"message": "The \'field\' parameter is required."});

  const attrs = {
    ...(part && {part: part}),
    ...(vendor && {vendor: vendor}),
    ...(product && {product: product}),
    ...(version && {version: version}),
    ...(update && {update: update}),
    ...(language && {language: language}),
    ...(edition && {edition: edition}),
  };

  const matches = {
    $match: flattenObject({cpe: attrs}),
  };

  Credential.aggregate([
    {
      $facet: {
        "results": [
          matches,
          {
            $group: {
              _id: `$cpe.${field}`,
              count: {$sum: 1}
            }
          },
          {
            $match: {
              _id: {$regex: new RegExp('^' + prefix, 'i')}
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
    .catch((err) => res.status(500).send({"message": err}));
});

/**
 * @swagger
 * /credentials/{id}:
 *   get:
 *     summary: Get a credential by ID
 *     description: Returns a credential by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Credential'
 */
router.get('/:id', async (req, res, next) => {
  const {id = ''} = req.params;
  res.send(await Credential.findOne({_id: id}));
});

/**
 * @swagger
 * /credentials:
 *   get:
 *     summary: Get a list of all credentials
 *     description: Returns all credentials stored in the database
 *     responses:
 *       200:
 *         description: Returns a list of credential objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Credential'
 */
router.get('/', (req, res, next) => {
  const RESULTS_PER_PAGE = 10;
  const {page = 1} = req.query;

  Credential.paginate({}, {page: page, limit: RESULTS_PER_PAGE}, (err, docs) => {
    res.send(docs);
  });
  //res.send(await Credential.find());
});

/**
 * @swagger
 * /credentials:
 *   post:
 *     summary: Save a new credential
 *     description: Returns a credential by ID
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Credential to save
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Credential'
 *     responses:
 *       200:
 *         description: Returns the credential object that was saved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Credential'
 */
router.post('/', async (req, res, next) => {
  // TODO: More validation/testing
  const credential = new Credential({
    ...req.body
  });

  await credential.save();
  res.send(credential);
});

/**
 * @swaggers
 * /credentials/{id}:
 *   put:
 *     summary: Update a credential
 *     description: Returns a credential by ID
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
 *         $ref: '#/components/schemas/Credential'
 *     responses:
 *       200:
 *         description: Returns the credential object that was updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Credential'
 */
router.put('/:id', (req, res, next) => {
  const {id} = req.params;
  const updates = req.body;

  //return res.status(404).send('Not implemented');
  Credential.findByIdAndUpdate(
    id,
    flattenObject(updates),
    {new: true}
  ).then((data) => {
      res.send(data);
    }
  ).catch((err) => {
    res.status(500).send({"message": "Failed to update record"});
  });

  //let credential = await Credential.findOne({ _id: id});

  //console.log(credential, credentials, cpe);
  //console.log({...credential});

  res.send(`OK ${id}`);

});

/**
 * @swagger
 * /credentials/{id}:
 *   delete:
 *     summary: Delete a credential
 *     description: Deletes a credential
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the credential to delete
 *       required: true
 *     responses:
 *       200:
 *         description: Returns the ID of the credential that was deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   required: true
 *                   example: 5
 */
router.delete('/:id', (req, res, next) => {
  const {id} = req.params;

  Credential.deleteOne({_id: id})
    .then(() => {
      res.send({message: "Success"});
    });

});

/**
 * @swagger
 * /credentials/search:
 *   post:
 *     description: Returns a list of all known credentials that match a given CPE string.
 *     summary: Get a list of credentials by CPE.
 *     parameters:
 *     - name: "body"
 *       in: "body"
 *       description: "The CPE string to query."
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           cpe:
 *             type: "string"
 *         example:
 *           cpe: "cpe:/a:linksys:wrt54g"
 *     responses:
 *       200:
 *         description: Returns a list of credentials that match the provided CPE string.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CredentialsList'
 */
router.post('/search', (req, res, next) => {
  const RESULTS_PER_PAGE = 10;
  const {cpe} = req.body;
  const {page = 1} = req.query;
  const {prefix, ...searchCpe} = new CPE2_3_URI(cpe).attrs;

  // TODO: Find/sort/limit/paginate
  // TODO: This is not following the schema
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  Credential.paginate(flattenObject({cpe: searchCpe}), {page: page, limit: RESULTS_PER_PAGE}, (err, docs) => {
    res.send(docs);
  });

});

module.exports = router;
