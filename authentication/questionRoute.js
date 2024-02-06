const express = require("express");
const router = express.Router();
const Question = require("../models/Question");

// Add a new question
router.post("/questions", async (req, res) => {
  const arr = req.body;
  try {
    for (let i = 0; i < arr?.length; i++) {
      let obj = {
        vendor_id: arr[i]?.vendor_id,
        template_id: arr[i]?.template_id,
        text: arr[i]?.text,
      };
      await Question.create(obj).catch((err) => {
        console.log(err);
      });
    }
    return res.status(200).json({
      success: true,
      message: "Successfully Added Questions",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

router.get("/get/questions", async (req, res) => {
  let obj = {};
  if (req.query.template_id) {
    obj.template_id = req.query.template_id;
  }
  if (req.query.vendor_id) {
    obj.vendor_id = req.query.vendor_id;
  }
  try {
    const questions = await Question.find(obj);
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
