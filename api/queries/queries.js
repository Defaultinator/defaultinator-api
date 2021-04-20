var { data } = require('../data/data');

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
      data.filter((record) => record['vendor'] == vendor)
        .map((record) => record['product'])
    )
  );
};

let getCredentialsByVendorAndProduct = (vendor, product) => {
  return data.filter((record) => record['vendor'] == vendor && record['product'] == product)
};

module.exports = {
  getVendors,
  getProductsByVendor,
  getCredentialsByVendorAndProduct,
}
