const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor.js");

router.post("/save/vendors", async (req, res) => {
  try {
    const newVendor = new Vendor(req.body);
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all vendors
router.get("/get/vendors", async (req, res) => {
  let obj = {};
  if (req.query.id) {
    obj._id = req.query.id;
  }
  try {
    const vendor = await Vendor.find(obj);
    res.json(vendor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
