const mongoose = require("mongoose");

const CpeSchema = mongoose.Schema({
  part: String,
  vendor: String,
  product: String,
  version: String,
  update: String,
  language: String,
  edition: String,
  protocol: String,
  references: [String],
});

const CPE = mongoose.model("CPE", CpeSchema);

module.exports = {
  CpeSchema,
  CPE,
};
