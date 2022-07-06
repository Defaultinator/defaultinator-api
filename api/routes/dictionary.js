const express = require('express');
const {CPE2_3_URI} = require('cpe');
const {flattenObject} = require('../util/flatten');

const {Dictionary} = require('../models/Dictionary');

const {
  requiresAdmin,
  requiresKey,
} = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /dictionary/typeahead:
 *   get:
 *     summary: Typeahead suggestions
 *     description: Returns suggested CPE field values based on query parameters
 *     tags:
 *       - Dictionary
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: field
 *         required: true
 *         description: The field for which you want suggestions
 *         schema:
 *           type: string
 *           example: vendor
 *       - in: path
 *         name: prefix
 *         description: The prefix for possible values to be returned
 *         schema:
 *           type: string
 *           example: link
 *       - in: path
 *         name: count
 *         description: The number of responses requested
 *         schema:
 *           type: number
 *           example: 5
 *       - in: path
 *         name: part
 *         description: The fixed part portion of the dictionary query
 *         schema:
 *           type: string
 *           example: a
 *       - in: path
 *         name: vendor
 *         description: The fixed vendor portion of the dictionary query
 *         schema:
 *           type: string
 *           example: linksys
 *       - in: path
 *         name: product
 *         description: The fixed product portion of the dictionary query
 *         schema:
 *           type: string
 *           example: wrt54g
 *       - in: path
 *         name: version
 *         description: The fixed version portion of the dictionary query
 *         schema:
 *           type: string
 *       - in: path
 *         name: update
 *         description: The fixed update portion of the dictionary query
 *         schema:
 *           type: string
 *       - in: path
 *         name: language
 *         description: The fixed language portion of the dictionary query
 *         schema:
 *           type: string
 *       - in: path
 *         name: edition
 *         description: The fixed edition portion of the dictionary query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returns the credential object that was saved.
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Dictionary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/typeahead', requiresKey, (req, res, next) => {
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

  if(!field) throw Error("The \'field\' parameter is required.");

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

  Dictionary.aggregate([
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
              _id: {$regex: new RegExp(prefix, 'i')}
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
 * /dictionary:
 *   post:
 *     summary: Save a new dictionary record
 *     description: Returns a credential by ID. Requires Admin.
 *     tags:
 *       - Dictionary
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: body
 *       in: body
 *       description: Dictionary record to save
 *       required: true
 *       schema:
 *         $ref: '#/components/schemas/Dictionary'
 *     responses:
 *       200:
 *         description: Returns the credential object that was saved.
 *         schema:
 *           $ref: '#/components/schemas/Dictionary'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', requiresAdmin, async (req, res, next) => {
  // TODO: More validation/testing
  const dictionary = new Dictionary({
    ...req.body
  });

  await dictionary.save();
  res.send(dictionary);
});

/**
 * @swagger
 * /dictionary/{id}:
 *   delete:
 *     summary: Delete a dictionary record
 *     description: Deletes a dictionary record. Requires Admin.
 *     tags:
 *       - Dictionary
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *     - name: id
 *       in: path
 *       description: ID of the dictionary record to delete
 *       required: true
 *     responses:
 *       200:
 *         description: Returns the ID of the dictionary record that was deleted
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
  const {id} = req.params;

  Dictionary.deleteOne({_id: id})
    .then(() => {
      res.send({message: "Success"});
    });

});

module.exports = router;
