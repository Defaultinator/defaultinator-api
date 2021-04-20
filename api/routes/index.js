var express = require('express');
var router = express.Router();

var {
  getVendors,
  getProductsByVendor,
  getCredentialsByVendorAndProduct,
} = require('../queries/queries');

router.get('/vendors', (req, res, next) => {
  let vendors = getVendors();

  res.send(vendors);

});

router.post('/products', (req, res, next) => {
  let { vendor } = req.body;
  let products = getProductsByVendor(vendor);

  res.send(products);

});

router.post('/credentials', (req, res, next) => {
  let { vendor, product } = req.body;
  let credentials = getCredentialsByVendorAndProduct(vendor, product);

  res.send(credentials);

});

module.exports = router;
