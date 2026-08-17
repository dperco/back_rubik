const Technology = require("../models/technologies");

async function getAllTechnologies() {
  return Technology.find();
}

async function addTechnology(data) {
  return Technology.create(data);
}

async function editTechnology(id, name) {
  return Technology.findOneAndUpdate({ id }, { name }, { new: true });
}

async function deleteTechnology(id) {
  return Technology.findOneAndDelete({ id });
}

module.exports = {
  getAllTechnologies,
  addTechnology,
  editTechnology,
  deleteTechnology,
};