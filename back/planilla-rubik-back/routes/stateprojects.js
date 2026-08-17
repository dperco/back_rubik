const express = require("express");
const router = express.Router();
const stateprojectsController = require("../controllers/stateprojects");


// router.get("/test", stateprojectsController.pruebastate);

router.get("/", stateprojectsController.getAllStates);
// router.get("/:id", stateprojectsController.getStateById);
// router.post("/", stateprojectsController.register); 
// router.put("/:id", stateprojectsController.updateState);
// router.delete("/:id", stateprojectsController.deleteState);

module.exports = router;
