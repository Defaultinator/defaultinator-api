const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate');

const { CpeSchema } = require('./CPE');

const credentialSchema = mongoose.Schema({
  cpe: mongoose.Schema(CpeSchema, {_id: false}),
  username: String,
  password: String,
});

credentialSchema.plugin(mongoosePaginate);

const Credential = mongoose.model("Credential", credentialSchema);

module.exports = {
  credentialSchema,
  Credential,
};
