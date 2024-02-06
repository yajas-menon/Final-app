const express = require("express");
const router = express.Router();
const Template = require("../models/Templates.js");
const Users = require("../models/User.js");
// save all template
router.post("/save/template", async (req, res) => {
  try {
    const newTemplate = new Template(req.body);
    await newTemplate.save();
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all template
router.get("/get/Template", async (req, res) => {
  let obj = {};
  if (req.query.vendor_id) {
    obj.vendorid = req.query.vendor_id;
  }
  try {
    const template = await Template.find(obj);
    let arr = [];
    for (let i = 0; i < template.length; i++) {
      let obj = {};
      let item = template[i];
      await Users.findById(item?.createdby)
        .then((data) => {
          obj = { ...item._doc, creator_name: data?.name };
          arr.push(obj);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    console.log(arr);
    res.json(arr);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
