const { data } = require('../data/data');

const { CPE2_3_URI } = require('cpe');

let getVendors = () => {
  return Array.from(
    new Set(
      data.map((record) => record['vendor'])
    )
  );
};

let getProductsByVendor = (vendor) => {
  return Array.from(
    new Set(
      data.filter((record) => record['vendor'] === vendor)
        .map((record) => record['product'])
    )
  );
};

let getCredentialsByVendorAndProduct = (vendor = null, product = null) => {
  let resp;

  // TODO: I'm only comparing the fields we have for now
  if (vendor) resp = data.filter((record) => record['vendor'] === vendor );
  if (product) resp = resp.filter((record) => record['product'] === product)

  // Add CPE strings
  resp = resp.map((record) => {
    return { cpe: CPE2_3_URI.generateCpeStringFromAttributes(record), ...record }
  });

  return resp;
};

let getCredentialsByCpe = (cpeString) => {
  console.log(cpeString);
  const { vendor, product } = CPE2_3_URI.parseCpeString(cpeString);

  return getCredentialsByVendorAndProduct(vendor, product);
};

module.exports = {
  getVendors,
  getProductsByVendor,
  getCredentialsByVendorAndProduct,
  getCredentialsByCpe,
};
