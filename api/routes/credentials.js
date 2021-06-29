const express = require('express');
const { CPE2_3_URI } = require('cpe');
const { flattenObject } = require('../util/flatten');

const { Credential } = require('../models/Credentials');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CPE:
 *       type: object
 *       properties:
 *         part:
 *           type: string
 *           example: a
 *         vendor:
 *           type: string
 *           example: linksys
 *         product:
 *           type: string
 *           example: wrt53g
 *         version:
 *           type: string
 *           example: ANY
 *         language:
 *           type: string
 *           example: ANY
 *         update:
 *           type: string
 *           example: ANY
 *         edition:
 *           type:  string
 *           example: ANY
 *         protocol:
 *           type: string
 *           example: ANY
 *         references:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - https://www.linksys.com
 *             - https://www.example.com
 *
 *     Credential:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: The default username
 *           example: admin
 *         password:
 *           type: string
 *           description: The default password
 *           example: admin
 *         cpe:
 *           $ref: '#/components/schemas/CPE'
 *
 *     CredentialsList:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         limit:
 *           type: integer
 *         page:
 *           type: integer
 *         pages:
 *           type: integer
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Credential'
 *
 */

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
  const { id = '' } = req.params;
  res.send(await Credential.findOne({ _id: id}));
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
router.get('/', async (req, res, next) => {
  res.send(await Credential.find());
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
    username: req.body.username,
    password: req.body.password,
    cpe: req.body.cpe,
  });

  console.log(credential);

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
  // const { id } = req.params;
  // const updates = req.body;

  return res.status(404).send('Not implemented');
  // Credential.findByIdAndUpdate(
  //   id,
  //   updates,
  //   {new: true}
  // ).then(
  //   (err, cred) => {
  //     console.log(err, cred);
  //   }
  // );

  //let credential = await Credential.findOne({ _id: id});

  //console.log(credential, credentials, cpe);
  //console.log({...credential});

  // res.send(`OK ${id}`);

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
  const { id } = req.params;

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
  const { cpe } = req.body;
  const { page = 1 } = req.query;
  const {prefix, ...searchCpe} = new CPE2_3_URI(cpe).attrs;

  // TODO: Find/sort/limit/paginate
  // TODO: This is not following the schema
  // https://stackoverflow.com/questions/5830513/how-do-i-limit-the-number-of-returned-items
  Credential.paginate(flattenObject({cpe: searchCpe}), {page: page, limit: RESULTS_PER_PAGE}, (err, docs) => {
    res.send(docs);
  });

});

module.exports = router;
