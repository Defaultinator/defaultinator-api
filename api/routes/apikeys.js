const express = require('express');
const { v4 : uuidv4 } = require('uuid');

const {
  APIKey,
  APIKeySubmissionSchema,
} = require('../models/APIKeys');

const router = express.Router();

// TODO: Move to config/constants
const RESULTS_PER_PAGE = 20;

/**
 * @swagger
 * /apikeys/{id}:
 *   get:
 *     summary: Get data for an API Key
 *     description: Returns am API Key by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIKey'
 */
router.get('/:id', async (req, res, next) => {
  const {id = ''} = req.params;
  res.send(await APIKey.findOne({_id: id}));
});

/**
 * @swagger
 * /apikeys:
 *   get:
 *     summary: Get a list of all API Keys
 *     description: Returns all API Keys stored in the database
 *     responses:
 *       200:
 *         description: Returns a list of APIKey objects.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/APIKey'
 */
router.get('/', (req, res, next) => {
  const {page = 1, limit = RESULTS_PER_PAGE} = req.query;

  APIKey.paginate({}, {page: page, limit: parseInt(limit)}, (err, docs) => {
    res.send(docs);
  });
});

/**
 * @swagger
 * /apikeys:
 *   post:
 *     summary: Save a new API Key
 *     description: Returns a newly created APIKey
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Credential'
 */
router.post('/', async (req, res, next) => {
  // TODO: Check to see if the key is already in use.
  const apiKey = new APIKey({
    apiKey: uuidv4(),
    ...req.body,
  });

  await apiKey.save();
  res.send(apiKey);
});

/**
 * @swagger
 * /apiKeys/{id}:
 *   put:
 *     summary: Update an APIKey
 *     description: Returns an APIKey by ID
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/APIKey'
 */
// router.put('/:id', (req, res, next) => {
//   const {id} = req.params;
//   const updates = req.body;

//   //return res.status(404).send('Not implemented');
//   Credential.findByIdAndUpdate(
//     id,
//     flattenObject(updates),
//     {new: true}
//   ).then((data) => {
//       res.send(data);
//     }
//   ).catch((err) => {
//     res.status(500).send({"message": "Failed to update record"});
//   });

//   //let credential = await Credential.findOne({ _id: id});

//   //console.log(credential, credentials, cpe);
//   //console.log({...credential});

//   res.send(`OK ${id}`);

// });

/**
 * @swagger
 * /apikeys/{id}:
 *   delete:
 *     summary: Delete an API Key
 *     description: Deletes an API Key
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the key to delete
 *       required: true
 *     responses:
 *       200:
 *         description: Returns the ID of the key that was deleted
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

  APIKey.deleteOne({_id: id})
    .then(() => {
      res.send({message: "Success"});
    });

});

module.exports = router;