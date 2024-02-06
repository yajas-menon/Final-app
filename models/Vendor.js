const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vendorSchema = new Schema({
  vendorName: {
    type: String,
    required: true,
  },
  incorporationdate: {
    type: Date,
    required: true,
  },
  onboardingdate: {
    type: Date,
    required: true,
  },
  contactName: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.model("Vendor", vendorSchema);
