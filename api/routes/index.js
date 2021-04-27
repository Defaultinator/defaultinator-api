const express = require('express');
const {getVendorsByCredential} = require("../queries/queries");
const router = express.Router();

const { CPE2_3_URI } = require('cpe');

const {
  getVendors,
  getProductsByVendor,
  getCredentialsByVendorAndProduct,
  getCredentialsByCpe,
} = require('../queries/queries');


/**
 * @openapi
 * /getVendors:
 *   get:
 *     description: Returns a list of all valid vendors.
 *     summary: Get a list of vendors
 *     responses:
 *       200:
 *         description: Returns a list of known vendors.
 *         schema:
 *           type: "array"
 *           items:
 *             type: "string"
 *           example:
 *              - linksys
 *              - microsoft
 *              - apple
 *              - google
 *              - wordpress
 *              - elastic
 */
router.get('/getVendors', (req, res, next) => {
  let vendors = getVendors();

  res.send(vendors);

});

/**
 * @openapi
 * /getProductsByVendor:
 *   post:
 *     description: Returns a list of all known products from a given vendor.
 *     summary: Get a list of products by vendor.
 *     consumes:
 *     - "application/json"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "body"
 *       in: "body"
 *       description: "ID of the vendor"
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           vendor:
 *             type: "string"
 *         example:
 *           vendor: linksys
 *     responses:
 *       200:
 *         description: Returns a list of known products for the provided vendor.
 *         schema:
 *           type: "array"
 *           items:
 *             type: "string"
 *           example:
 *             - router_a
 *             - cms_platform_b
 *             - foo
 *             - bar
 */
router.post('/getProductsByVendor', (req, res, next) => {
  let { vendor } = req.body;
  let products = getProductsByVendor(vendor);

  res.send(products);

});

/**
 * @openapi
 * /getCredentialsByCpe:
 *   post:
 *     description: Returns a list of all known credentials that match a given CPE string.
 *     summary: Get a list of credentials by CPE.
 *     consumes:
 *     - "application/json"
 *     produces:
 *     - "application/json"
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
 *           type: "array"
 *           items:
 *             type: "object"
 *             properties:
 *               cpe: "string"
 *               username: "string"
 *               password: "string"
 *               part: "string"
 *               vendor: "string"
 *               product: "string"
 *               version: "string"
 *               language: "string"
 *               update: "string"
 *               edition: "string"
 *               protocol: "string"
 *               references:
 *                 type: "array"
 *                 items: "string"
 *           example: [ { "cpe": "cpe:/a:linksys:ag041", "username": "", "product": "ag041", "vendor": "linksys", "version": "ANY", "language": "ANY", "update": "ANY", "edition": "ANY", "part": "a", "references": [], "protocol": "Unknown", "password": "admin" } ]
 */
router.post('/getCredentialsByCpe', (req, res, next) => {
  const { cpe } = req.body;
  const credentials = getCredentialsByCpe(cpe);

  res.send(credentials);

});

/**
 * @openapi
 * /getCredentialsByProductAndVendor:
 *   post:
 *     description: Returns a list of all known credentials that match a product and vendro.
 *     summary: Get a list of credentials by product and vendor.
 *     consumes:
 *     - "application/json"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "body"
 *       in: "body"
 *       description: "The product and vendor to query."
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           product: "string"
 *           vendor: "string"
 *         example: { "product": "ag041", "vendor": "linksys" }
 *     responses:
 *       200:
 *         description: Returns a list of credentials that match the provided product and vendor.
 *         schema:
 *           type: "array"
 *           items:
 *             type: "object"
 *             properties:
 *               cpe: "string"
 *               username: "string"
 *               password: "string"
 *               part: "string"
 *               vendor: "string"
 *               product: "string"
 *               version: "string"
 *               language: "string"
 *               update: "string"
 *               edition: "string"
 *               protocol: "string"
 *               references:
 *                 type: "array"
 *                 items: "string"
 *           example: [ { "cpe": "cpe:/a:linksys:ag041", "username": "", "product": "ag041", "vendor": "linksys", "version": "ANY", "language": "ANY", "update": "ANY", "edition": "ANY", "part": "a", "references": [], "protocol": "Unknown", "password": "admin" } ]
 */
router.post('/getCredentialsByProductAndVendor', (req, res, next) => {
  const { vendor, product } = req.body;
  const credentials = getCredentialsByVendorAndProduct(vendor, product);

  res.send(credentials);

});

router.post('/generateCpeStringFromAttributes', (req, res, next) => {
  let cpeString = CPE2_3_URI.generateCpeStringFromAttributes(req.body);

  res.send({cpe: cpeString});

});

/**
 * @openapi
 * /getVendorsByCredential:
 *   post:
 *     description: Returns a list of vendors that have a product with the specified credentials.
 *     summary: List of vendors by valid default credentials.
 *     consumes:
 *     - "application/json"
 *     produces:
 *     - "application/json"
 *     parameters:
 *     - name: "body"
 *       in: "body"
 *       description: "The credentials to query."
 *       required: true
 *       schema:
 *         type: object
 *         properties:
 *           username: "string"
 *           password: "string"
 *         example: { "username": "admin", "password": "admin" }
 *     responses:
 *       200:
 *         description: Returns a list of vendors that have a product with the specified default username and password.
 *         schema:
 *           type: "array"
 *           items:
 *             type: "string"
 *           example:
 *              - linksys
 *              - microsoft
 *              - apple
 *              - google
 *              - wordpress
 *              - elastic
 *
 */
router.post('/getVendorsByCredential', (req, res, next) => {
  const { username, password } = req.body;

  res.send(getVendorsByCredential(req.body));

});

module.exports = router;
