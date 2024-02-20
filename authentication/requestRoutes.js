const Requests = require("../models/request.model.js");
const express = require("express");
const router = express.Router();

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

module.exports = router;
