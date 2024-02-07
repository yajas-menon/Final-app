const Users = require("../models/User.js");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  console.log(req.body);
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
    const user = await Users.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    const isMatched = await bcrypt.compare(req.body.password, user.password);
    if (!isMatched) {
      return res.status(401).json({ msg: "Wrong password." });
    }

    const questions = user?.questions?.map((item, key) => {
      let x = item.file.toString("base64");
      return {
        question_id: item.question_id,
        answer: item.answer,
        file: x,
      };
    });
    user.questions = questions;
    res.status(200).json({
      msg: "Successfully logged in.",
      accessToken: generateAccessToken(user._id),
      data: user,
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.put("/addAnswers/:id", async (req, res) => {
  const id = req.params.id;
  const questions = req.body;
  // questions?.forEach((item, key) => {
  //   item.file = item.file.split(",")[1];
  // });
  await Users.findOneAndUpdate({ _id: id }, { $set: { questions: questions } })
    .then((data) => {
      return res.status(200).json({
        success: true,
        message: "Successfully Updated Details",
      });
    })
    .catch((err) => {
      // console.log(err);
      return res.status(501).json({
        success: false,
        error: err,
        message: "Something went wrong",
      });
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

module.exports = router;
