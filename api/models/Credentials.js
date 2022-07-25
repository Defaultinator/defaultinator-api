const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

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
 *         isVerified:
 *           type: boolean
 *           description: Has the credential been verified by an admin
 *           example: false
 *         references:
 *           type: array
 *           items:
 *             type: string
 *           example:
 *             - https://www.linksys.com
 *             - https://www.example.com
 *         cpe:
 *           $ref: '#/components/schemas/CPE'
 *         edits:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               apiKey:
 *                 type: string
 *                 description: The API key that made the edit.
 *                 required: true
 *                 example: abcdef0123456789
 *               timestamp:
 *                 type: number
 *                 description: The epoch timestamp at the time the edit was applied
 *                 required: true
 *                 example: 1642713858
 *               edit:
 *                 type: object
 *                 description: The changes that were applied.
 *                 required: true
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: The default username
 *                     example: admin
 *                   password:
 *                     type: string
 *                     description: The default password
 *                     example: admin
 *                   protocol:
 *                     type: string
 *                     example: telnet
 *                   references:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example:
 *                       - https://www.linksys.com
 *                       - https://www.example.com
 *                   cpe:
 *                     $ref: '#/components/schemas/CPE'
 */
const credentialSchema = mongoose.Schema({
  cpe: mongoose.Schema(CpeSchema, { _id: false }),
  username: String,
  password: String,
  protocol: String,
  isVerified: Boolean,
  references: [String],
  edits: [{
    apiKey: String,
    timestamp: Number,
    edit: {
      username: String,
      password: String,
      protocol: String,
      references: {
        type: [String],
        default: undefined,
      },
      cpe: mongoose.Schema(CpeSchema, { _id: false }),
    }
  }],
});

/**
 * @swagger
 * components:
 *   schemas:
 *     CredentialUpdate:
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

/**
 * @swagger
 * components:
 *   schemas:
 *     CredentialsList:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           example: 1
 *         limit:
 *           type: integer
 *           example: 10
 *         page:
 *           type: integer
 *           example: 1
 *         pages:
 *           type: integer
 *           example: 1
 *         docs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Credential'
 *
 */
 credentialSchema.plugin(mongoosePaginate);
 credentialSchema.plugin(aggregatePaginate);

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = {
  credentialSchema,
  Credential,
};
