const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
  endpoint: String,
  data: mongoose.Schema.Types.Mixed,
});

const SettingsModel = mongoose.model("Settings", settingsSchema);

module.exports = SettingsModel;
