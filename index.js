const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
const port = 8000;

// reqular middleware
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// db connection
connectDB = mongoose
  .connect(
    "mongodb+srv://menoniyajas:" +
      process.env.MONGO_PASSWORD +
      "@cluster0.d4hqoke.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(console.log("DB Connected Succesfully...."))
  .catch((err) => {
    console.log("DB Connection Failed!");
    console.log(err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log("App is running on port ", +port);
});

//router middleware
const authRoutes = require("./authentication/userRoutes");
const questionRoute = require("./authentication/questionRoute");
const vendorRoute = require("./authentication/vendorRoute");
const templateRoute = require("./authentication/templateRoutes");
const requestRoute = require("./authentication/requestRoutes");

// ... other imports
app.use("/api/auth", authRoutes);
app.use("/api/auth", questionRoute);
app.use("/api/auth", vendorRoute);
app.use("/api/auth", templateRoute);
app.use("/api/auth", requestRoute);

