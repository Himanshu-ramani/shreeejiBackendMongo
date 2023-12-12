const express = require("express");
const {
  createSetting,
  deleteSetting,
  readSetting,
  optionsSettings,
} = require("../controller/settings");

const router = require("express").Router();

router.post("/:endpoint", createSetting);
router.delete("/:endpoint", deleteSetting);
router.get("/:endpoint", readSetting);
router.get("/", optionsSettings);

module.exports = router;
