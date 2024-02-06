const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  vendor_id: {
    type: String,
    required: true,
  },
  template_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Question", QuestionSchema);
