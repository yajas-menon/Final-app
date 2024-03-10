const Requests = require("../models/request.model.js");
const express = require("express");
const User = require("../models/User.js");
const router = express.Router();
const Questions = require("../models/Question.js");

router.get("/getRequests", async (req, res) => {
  let obj = {};
  if (req.query.user_id) {
    obj.user_id = req.query.user_id;
  }
  if (req.query.vendor_id) {
    obj.vendor_id = req.query.vendor_id;
  }

  if (req.query.template_id) {
    obj.template_id = req.query.template_id;
  }

  if (req.query.status) {
    obj.status = req.query.status;
  }

  await Requests.find(obj)
    .then((data) => {
      return res.status(200).json({
        success: true,
        data: data,
        message: "Successfully Sent Details",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(501).json({
        success: false,
        message: "Something went Wrong",
      });
    });
});

router.post("/updateRequests", async (req, res) => {
  const { data, status } = req.body;
  const newData = data?.map((item) => {
    return {
      updateOne: {
        filter: { _id: item?._id },
        update: { status: status, updatedAt: new Date() },
      },
    };
  });

  await Requests.bulkWrite(newData, {
    ordered: false,
  })
    .then((data) => {
      return res.status(200).json({
        success: true,
        message: "Successfully Updated Details",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(501).json({
        success: false,
        message: "Something went Wrong",
      });
    });
});

router.post("/updateRequests1", async (req, res) => {
  let { user_id, user_question_id, status, template_id } = req.body;
  await User.findOneAndUpdate(
    {
      _id: user_id,
      "questions._id": user_question_id,
    },
    {
      $set: { "questions.$.status": status },
    },
    { raw: true }
  )
    .then(async (data) => {
      const user = await User.aggregate([
        {
          $match: { _id: user_id },
        },
        {
          $unwind: "$questions",
        },
        {
          $match: { "questions.template_id": template_id },
        },
        {
          $group: { _id: "$_id", questions: { $push: "$questions" } },
        },
        {
          $project: { _id: 0, user_id: "$_id", questions: 1 },
        },
      ]).catch((err) => {
        console.log(err);
      });
      console.log(user);
      let noofApprovedQuestions = user?.questions?.filter(
        (s) => s.status == "ACTIVE" || s.status == "REJECTED"
      )?.length;
      if (noofApprovedQuestions == 0) {
        let obj = {
          user_id: user_id,
          template_id: template_id,
        };
        let request = await Requests.find(obj).catch((err) => {
          console.log(err);
        });
        await Requests.updateOne(
          { _id: request?._id },
          { $set: { status: "APPROVED" } }
        ).catch((err) => {
          console.log(err);
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(501).json({
        success: false,
        message: "Something went Wrong",
      });
    });
});

module.exports = router;
