const express = require("express");
const router = express.Router();

const { submitContact } = require("../controller/contactController");

router.post("/", submitContact);

module.exports = router;