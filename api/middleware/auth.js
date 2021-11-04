const {
  APIKey,
} = require('../models/APIKeys');

const AUTH_HEADER = 'x-api-key';


/**
 * @swagger
 * securityDefinitions:
 *   ApiKeyAuth:
 *     type: apiKey
 *     in: header
 *     name: X-API-KEY 
 * components:
 *   schemas:
 *     ErrorMessage:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: A detailed description of the error.
 *   responses:
 *     UnauthorizedError:
 *       description: API key is missing or invalid.
 *       schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 *     ForbiddenError:
 *       description: User has insufficient permissions.
 *       schema:
 *         $ref: '#/components/schemas/ErrorMessage'
 */

const requiresKey = async (req, res, next) => {
  const { headers } = req;

  if(AUTH_HEADER in headers) {
    APIKey.findOne({apiKey: headers[AUTH_HEADER]})
      .then((key) => {
        if (key) {
          next();
        } else {
          //res.status(401).send({message: "Invalid API key provided."});
          next();
        }
      });
  } else {
    //res.status(401).send({message: "No API key provided."});
    next();
  }
};

const requiresAdmin = async (req, res, next) => {
  const { headers } = req;

  if(AUTH_HEADER in headers) {
    APIKey.findOne({apiKey: headers[AUTH_HEADER]})
      .then((key) => {
        if (key) {
          if(key.isAdmin) {
            next();
          } else {
            //res.status(403).send({message: "User is not an Admin."});
            next();
          }
        } else {
          //res.status(401).send({message: "Invalid API key provided."});
          next();
        }
      });
  } else {
    //res.status(401).send({message: "No API key provided."});
    next();
  }
};

module.exports = {
  requiresAdmin,
  requiresKey,
}