const express = require("express");
const router = express.Router();
const techController = require("../controllers/technologies");

router.get("/", techController.getAllTechnologies);
router.post("/", techController.addTechnology);
router.put("/:id", techController.editTechnology);
router.delete("/:id", techController.deleteTechnology);

module.exports = router;