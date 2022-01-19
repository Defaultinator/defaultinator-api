const mongoose = require("mongoose");

const { CpeSchema } = require('./CPE');

/**
 * @swagger
 * components:
 *   schemas:
 *     Dictionary:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the dictionary record
 *           example: Apache 2
 *         source:
 *           type: string
 *           description: The source of the dictionary record
 *           example: NVD
 *         cpe:
 *           $ref: '#/components/schemas/CPE'
 *
 */
const dictionarySchema = mongoose.Schema({
  cpe: mongoose.Schema(CpeSchema, {_id: false}),
  title: String,
  source: String,
});

const Dictionary = mongoose.model("Dictionary", dictionarySchema);

module.exports = {
  dictionarySchema,
  Dictionary,
};
