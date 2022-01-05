const { data } = require('../data/data');

const { CPE2_3_URI } = require('cpe');

const getVendors = () => {
  return Array.from(
    new Set(
      data.map((record) => record['vendor'])
    )
  );
};

const getProductsByVendor = (vendor) => {
  return Array.from(
    new Set(
      data.filter((record) => record['vendor'] === vendor)
        .map((record) => record['product'])
    )
  );
};

const getCredentialsByVendorAndProduct = (vendor = null, product = null) => {
  let resp;

  // TODO: I'm only comparing the fields we have for now. This needs fixing.
  if (vendor) resp = data.filter((record) => record['vendor'] === vendor );
  if (product) resp = resp.filter((record) => record['product'] === product)

  // Add CPE strings
  resp = resp.map((record) => {
    return { cpe: CPE2_3_URI.generateCpeStringFromAttributes(record), ...record }
  });

  return resp;
};

const getCredentialsByCpe = (cpeString) => {
  const { vendor, product } = CPE2_3_URI.parseCpeString(cpeString);

  return getCredentialsByVendorAndProduct(vendor, product);
};

const getVendorsByCredential = ({username, password}) => {
  return Array.from(
    new Set(
      data.filter((record) => (record['username'] === username && record['password'] === password))
        .map((record) => record['vendor'])
    )
  );
};

module.exports = {
  getVendors,
  getProductsByVendor,
  getCredentialsByVendorAndProduct,
  getCredentialsByCpe,
  getVendorsByCredential,
};
