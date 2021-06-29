const mongoose = require("mongoose");

const { CpeSchema } = require('./CPE');

const credentialSchema = mongoose.Schema({
  cpe: mongoose.Schema(CpeSchema, {_id: false}),
  username: String,
  password: String,
});

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = {
  credentialSchema,
  Credential,
};
