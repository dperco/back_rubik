const { Schema, model } = require("mongoose");

const techSchema = new Schema({
  id: { type: String, unique: true },
  name: { type: String }
});

module.exports = model("Technology", techSchema, "technologies");
