const mongoose = require("mongoose");
const Schema = require("mongoose");

const requestSchema = new mongoose.Schema({
  template_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  vendor_id: {
    type: String,
  },
  requestID: {
    type: String,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Requests", requestSchema);
