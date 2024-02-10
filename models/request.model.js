const mongoose = require("mongoose");
const Schema = require("mongoose");

const requestSchema = new mongoose.Schema({
  template_id: {
    type: { type: Schema.Types.ObjectId, ref: "Template" },
    required: true,
  },
  user_id: {
    type: { type: Schema.Types.ObjectId, ref: "Users" },
    required: true,
  },
  status: {
    type: String,
  },
});

module.exports = mongoose.model("Requests", requestSchema);
