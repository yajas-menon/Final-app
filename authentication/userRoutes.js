const Users = require("../models/User.js");
const Questions = require("../models/Question.js");
const Requests = require("../models/request.model.js");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  Types: { ObjectId },
} = require("mongoose");

// Generate JWT token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const existingUser = await Users.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).json({ msg: "User already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    const newUser = new Users({
      name: req.body.name,
      email: req.body.email,
      password,
      role: req.body.role,
      vendor_id: req.body.vendor_id,
    });

    await newUser.save();

    res.status(201).json({
      msg: "User registered.",
      accessToken: generateAccessToken(newUser._id),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const isMatched = await bcrypt.compare(req.body.password, user.password);
    if (!isMatched) {
      return res.status(401).json({ msg: "Wrong password." });
    }

    const questions = user?.questions?.map((item, key) => {
      let x = item.EvidenceBinary?.toString("base64");
      return {
        question_id: item.question_id,
        answer: item.Answer,
        file: x,
        requestID: item?.RequestID,
        status: item?.status,
      };
    });
    user._doc.questions = questions;
    user = { ...user._doc, accessToken: generateAccessToken(user._id) };
    res.status(200).json({
      msg: "Successfully logged in.",
      data: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err: err.message });
  }
});

router.put("/addAnswers/:id", async (req, res) => {
  const id = req.params.id;
  const questions = req.body;

  await Users.findOneAndUpdate({ _id: id }, { $push: { questions: questions } })
    .then(async (data) => {
      let obj1 = {
        template_id: req.query.template_id,
      };
      let obj = {
        status: "PENDING",
        user_id: id,
        template_id: req.query.template_id,
        vendor_id: req.query.vendor_id,
        requestID: req.query.requestID,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await Requests.updateOne(obj1, obj, { upsert: true })
        .then((data1) => {
          return res.status(200).json({
            success: true,
            message: "Successfully Updated Details",
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(501).json({
            success: false,
            error: err,
            message: "Something went wrong",
          });
        });
    })
    .catch((err) => {
      console.log(err);
      return res.status(501).json({
        success: false,
        error: err,
        message: "Something went wrong",
      });
    });
});

router.put("/test/:id", async (req, res) => {
  let id = req.params.id;
  let obj1 = {
    template_id: req.query.template_id,
  };
  let obj = {
    status: "PENDING",
    user_id: id,
    template_id: req.query.template_id,
    vendor_id: req.query.vendor_id,
    requestID: req.query.requestID,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await Requests.updateOne(obj1, obj, { upsert: true })
    .then((data1) => {
      console.log(data1);
      return res.status(200).json({
        success: true,
        message: "Successfully Updated Details",
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(501).json({
        success: false,
        error: err,
        message: "Something went wrong",
      });
    });
});

router.get("/get/user", async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/getuserstemplateWise", async (req, res) => {
  let obj = {};
  if (req.query.vendor_id) {
    obj.vendor_id = req.query.vendor_id;
  }
  if (req.query.template_id) {
    obj.template_id = req.query.template_id;
  }

  let questions = await Questions.find(obj).catch((err) => {
    console.log(err);
    return res.status(501).json({
      success: false,
      message: "Something went wrong",
    });
  });
  let finalData = [];

  for (let i of questions) {
    await Users.find({
      $and: [
        { "questions.question_id": i?._id },
        { "questions.status": "ACTIVE" },
      ],
    })
      .then(async (data) => {
        for (let j of data) {
          let questions = j?.questions?.filter(
            (s) => s.question_id == i?._id && s.status == "ACTIVE"
          );
          for (let k of questions) {
            let obj = {
              template_id: i?.template_id,
              Question: k?.question_id,
              answer: k?.Answer,
              user_id: j?._id,
              user_question_id: k?._id,
              EvidenceBinary: k?.EvidenceBinary,
              userName: j?.name,
              status: k?.status,
            };
            finalData.push(obj);
          }
        }
      })
      .catch((err) => {
        console.log(err);
        return res.status(501).json({
          success: false,
          message: "Something went wrong",
        });
      });
  }
  // console.log(finalData);
  return res.status(200).json({
    success: true,
    data: finalData,
    message: "Successfully Sent Details",
  });
});

router.get("/getUsers", async (req, res) => {
  const id = req.query.id;
  await Users.findById(id)
    .then((data) => {
      return res.status(200).json({
        success: true,
        data: data,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(501).json({
        success: false,
        message: "Internal Server Error",
      });
    });
});

router.post("/uploadFile", async (req, res) => {
  const storage = admin.storage();

  const bucket = storage.bucket("gs://event-bf7c6.appspot.com");

  //new code
  const fileName = req.file.originalname;

  // Upload the file to Firebase Storage
  const fileUpload = bucket.file(fileName);
  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: req.file.mimetype,
    },
    resumable: false,
  });

  stream.on("error", (error) => {
    console.error(error);
    return res.status(500).send("Error uploading file to Firebase Storage.");
  });

  stream.on("finish", () => {
    // Generate a signed URL for the uploaded file
    fileUpload.getSignedUrl(
      {
        action: "read",
        expires: "03-09-2491", // Adjust the expiration date as needed
      },
      (error, signedUrl) => {
        if (error) {
          console.error(error);
          return res.status(500).send("Error generating signed URL.");
        } else {
          return res.status(200).json({ fileUrl: signedUrl });
        }
      }
    );
  });
});

router.get("/dashboardApi", async (req, res) => {
  const totalRequests = await Requests.find({}).catch((err) => {
    console.log(err);
  });
  const approvedRequests = totalRequests?.filter((s) => s.status == "APPROVED");
  const rejectedRequests = totalRequests?.filter((s) => s.status == "DECLINED");

  const risk_percent = Math.floor(
    (rejectedRequests?.length / totalRequests?.length) * 100
  );
  const approved_percent = Math.floor(
    (approvedRequests?.length / totalRequests?.length) * 100
  );

  let monthCount = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  let finalMonths = [];
  let finalMonthCount = [];
  for (let i of totalRequests) {
    let updatedData = i?.updatedAt.toISOString().split("T")[0];
    let month = parseInt(updatedData.slice(5, 7));
    monthCount[month - 1]++;
  }

  for (let i = 0; i < monthCount?.length; i++) {
    if (monthCount[i] != 0) {
      finalMonthCount.push(monthCount[i]);
      finalMonths.push(months[i]);
    }
  }

  let obj = {
    risk_percent: risk_percent,
    approved_percent: approved_percent,
    months: finalMonths,
    monthCount: finalMonthCount,
  };

  return res.status(200).json({
    success: true,
    message: "Successfully Sent Details",
    data: obj,
  });
});
module.exports = router;
