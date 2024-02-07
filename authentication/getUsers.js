const Users = require("../models/User.js");
const express = require("express");
const router = express.Router();


router.get('/find/Users', async (req, res) => {
    try {
      const users = await Users.find({ role: 'user' });
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;