const mongoose = require("mongoose");

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
 */
const CpeSchema = mongoose.Schema({
  part: String,
  vendor: String,
  product: String,
  version: String,
  update: String,
  language: String,
  edition: String,
});

const CPE = mongoose.model("CPE", CpeSchema);

module.exports = {
  CpeSchema,
  CPE,
};
