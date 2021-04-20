const express = require('express');
const router = express.Router();

const { CPE2_3_URI } = require('cpe');

const {
  getVendors,
  getProductsByVendor,
  getCredentialsByVendorAndProduct,
  getCredentialsByCpe,
} = require('../queries/queries');

router.get('/getVendors', (req, res, next) => {
  let vendors = getVendors();

  res.send(vendors);

});

router.post('/getProductsByVendor', (req, res, next) => {
  let { vendor } = req.body;
  let products = getProductsByVendor(vendor);

  res.send(products);

});

router.post('/getCredentialsByCpe', (req, res, next) => {
  const { cpe } = req.body;
  const credentials = getCredentialsByCpe(cpe);

  res.send(credentials);

});

router.post('/getCredentialsByProductAndVendor', (req, res, next) => {
  const { vendor, product } = req.body;
  const credentials = getCredentialsByVendorAndProduct(vendor, product);

  res.send(credentials);

});

router.post('/generateCpeStringFromAttributes', (req, res, next) => {
  let cpeString = CPE2_3_URI.generateCpeStringFromAttributes(req.body);

  res.send({cpe: cpeString});

});

module.exports = router;
