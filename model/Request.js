const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  bloodType: { type: String, required: true },
  requestCategory: { type: String, required: true },
  numberOfUnits: { type: Number },
  predefinedAilments: { type: String },
  approved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Request', requestSchema);
