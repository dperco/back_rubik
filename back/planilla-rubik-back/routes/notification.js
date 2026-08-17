const express = require("express");
const router = express.Router();
const NotiController = require("../controllers/notification");

router.get("/notiContracts", NotiController.checkContractExpiration);

router.get("/notiProjects", NotiController.checkProjectExpiration);

router.post("/markAsRead", NotiController.markNotificationAsRead);

router.post("/markAllAsRead", NotiController.markAllNotificationsAsRead);

router.get("/byUser/:email", NotiController.getNotificationsByUser);

router.get("/byManager", NotiController.getNotificationsByManager);

router.get("/all", NotiController.getAllNotifications);

router.get("/by-read-status", NotiController.getNotificationsByReadStatus);
module.exports = router;
