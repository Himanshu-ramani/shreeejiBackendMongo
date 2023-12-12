const SettingsModel = require("../models/settings");

exports.createSetting = async (req, res) => {
  try {
    let { body, params } = req;
    let { endpoint } = params;

    let { data } = body;
    console.log(data, endpoint);
    if (!endpoint || !data) {
      return res
        .status(400)
        .json({ message: "Both name and json fields are required" });
    }
    let updatedData = await SettingsModel.findOneAndUpdate(
      { endpoint },
      { endpoint, data },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: updatedData?.data });

    // res.status(201).json({ message: "Product created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error with saving settings" });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    let { body, params } = req;
    let { endpoint } = params;

    const deletedData = await SettingsModel.findOneAndRemove({ endpoint });
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Error deleting settings" });
  }
};

exports.readSetting = async (req, res) => {
  try {
    let { body, params } = req;
    let { endpoint } = params;
    const { data } = await SettingsModel.findOne({ endpoint });
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: "Error getting settings" });
  }
};

exports.optionsSettings = async (req, res) => {
  try {
    let { query } = req;
    let { options } = query;

    const data = await SettingsModel.find({
      endpoint: { $in: options?.split(",") },
    });
    let resData = {};

    data?.forEach((d) => {
      let { endpoint, data } = d;
      resData[endpoint] = data;
    });
    res.status(201).json({ success: true, data: resData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting settings" });
  }
};
