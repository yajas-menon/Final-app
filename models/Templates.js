const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
  Version: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    required: true,
  },
  templatename: {
    type: String,
    required: true,
  },
  createdby: {
    type: String,
  },
  createdon: {
    type: Date,
    required: true,
  },
  vendorid: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Template", TemplateSchema);
