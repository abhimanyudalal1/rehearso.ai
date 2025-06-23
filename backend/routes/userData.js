// backend/routes/userData.js
const express = require("express");
const router = express.Router();
const { UserModel } = require("../models/db");

router.get("/userdata", async (req, res) => { // CHANGED: Removed '/api' prefix
  try {
    const users = await UserModel.find();
    res.json({ success: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;