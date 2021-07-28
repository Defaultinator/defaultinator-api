const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

const { CpeSchema } = require('./CPE');

/**
 * @swagger
 * components:
 *   schemas:
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
 *         protocol:
 *           type: string
 *           example: telnet
 *         references:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - https://www.linksys.com
 *             - https://www.example.com
 *         cpe:
 *           $ref: '#/components/schemas/CPE'
 */
const credentialSchema = mongoose.Schema({
  cpe: mongoose.Schema(CpeSchema, {_id: false}),
  username: String,
  password: String,
  protocol: String,
  references: [String],
});

/**
 * @swagger
 * components:
 *   schemas:
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
credentialSchema.plugin(mongoosePaginate);

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = {
  credentialSchema,
  Credential,
};
