const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

/**
 * @swagger
 * components:
 *   schemas:
 *     APIKey:
 *       type: object
 *       properties:
 *         apiKey:
 *           type: string
 *           example: abcdef0123456789
 *         email:
 *           type: string
 *           example: foo@bar.com
 *         notes:
 *           type: string
 *           example: A fine human, and excellent hacker.
 *         isAdmin:
 *           type: boolean
 *           example: false
 *         isRootKey:
 *           type: boolean
 *           example: false
 */
const APIKeySchema = mongoose.Schema({
  apiKey: String,
  email: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
  isAdmin: Boolean,
  isRootKey: Boolean,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     APIKeyList:
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
 *             $ref: '#/components/schemas/APIKey'
 *
 */
 APIKeySchema.plugin(mongoosePaginate);

const APIKey = mongoose.model("APIKey", APIKeySchema);

/**
 * @swagger
 * components:
 *   schemas:
 *     APIKeySubmission:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: foo@bar.com
 *         notes:
 *           type: string
 *           example: A fine human, and excellent hacker.
 *         isAdmin:
 *           type: boolean
 *           example: false
 *         isRootKey:
 *           type: boolean
 *           example: false
 */
 const APIKeySubmissionSchema = mongoose.Schema({
  email: String,
  notes: String,
  isAdmin: Boolean,
  isRootKey: Boolean,
});

const APIKeySubmission = mongoose.model("APIKeySubmission", APIKeySubmissionSchema);


module.exports = {
  APIKeySchema,
  APIKey,
  APIKeySubmissionSchema,
  APIKeySubmission,
};
