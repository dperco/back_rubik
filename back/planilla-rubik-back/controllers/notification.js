const NotificationModel= require("../models/notification");
const NotificationService = require("../services/NotificationService");

const checkContractExpiration = async (req, res, next) => {
  try {
    const result = await NotificationService.checkContractExpiration();
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

const checkProjectExpiration = async (req, res, next) => {
  try {
    const result = await NotificationService.checkProjectExpiration();
    res.status(200).json({ status: "success", ...result });
  } catch (error) {
    next(error);
  }
};

const getAllNotifications = async (req, res) => {
  const notifs = await NotificationModel.find();
  return res.status(200).json({
    status: "success",
    data: notifs,
  });
};

const getNotificationsByManager = async (req, res) => {
  let emails = req.query.emails;
  if (!emails) {
    return res.status(400).json({
      status: "error",
      message: "Falta el parámetro 'emails' (uno o varios separados por coma)",
    });
  }

  const emailList = emails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e);

  if (emailList.length === 0) {
    return res.status(400).json({
      status: "error",
      message: "El parámetro 'emails' está vacío o mal formado",
    });
  }

  const notifs = await NotificationModel.find();

  const data = notifs.map((n) => {
    const readers = (n.readers || []).filter((r) => emailList.includes(r.email));
    return {
      _id: n._id,
      message: n.message,
      sentAt: n.sentAt,
      readers,
    };
  });

  return res.status(200).json({
    status: "success",
    data,
  });
};

const getNotificationsByReadStatus = async (req, res) => {
  const read = req.query.read;
  if (read !== "true" && read !== "false") {
    return res.status(400).json({
      status: "error",
      message: "Falta el parámetro 'read' (true/false)",
    });
  }

  const notifs = await NotificationModel.find();

  const data = notifs.map((n) => {
    const readers = n.readers || [];
    const recipients = n.recipients || [];
    const readBy = readers.map((r) => ({ email: r.email, readAt: r.readAt || null }));
    const notReadBy = recipients
      .filter((email) => !readers.some((r) => r.email === email))
      .map((email) => ({ email, readAt: null }));

    return {
      _id: n._id,
      message: n.message,
      sentAt: n.sentAt,
      readers: read === "true" ? readBy : notReadBy,
    };
  });

  return res.status(200).json({
    status: "success",
    data,
  });
};

const markNotificationAsRead = async (req, res) => {
  const { email, referenceId, type } = req.body;
  if (!email || !referenceId || !type) {
    return res
      .status(400)
      .json({ status: "error", message: "Faltan parámetros" });
  }

  const notif = await NotificationModel.findOne({ referenceId, type, recipients: email });
  if (!notif) {
    return res
      .status(404)
      .json({ status: "error", message: "Notificación no encontrada" });
  }

  const readerIndex = notif.readers.findIndex((r) => r.email === email);
  if (readerIndex !== -1) {
    notif.readers[readerIndex].readAt = new Date();
  } else {
    notif.readers.push({ email, readAt: new Date() });
  }
  await notif.save();

  return res
    .status(200)
    .json({ status: "success", message: "Marcada como leída" });
};

const markAllNotificationsAsRead = async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  if (!email) {
    return res
      .status(400)
      .json({ status: "error", message: "Falta el email" });
  }

  const notifs = await NotificationModel.find({ recipients: email });

  for (const notif of notifs) {
    const readerIndex = notif.readers.findIndex((r) => r.email === email);
    if (readerIndex !== -1) {
      notif.readers[readerIndex].readAt = new Date();
    } else {
      notif.readers.push({
        email,
        readAt: new Date(),
      });
    }
    await notif.save();
  }

  return res
    .status(200)
    .json({ status: "success", message: "Todas marcadas como leídas" });
};

const getNotificationsByUser = async (req, res,next) => {
  
  try{
  const email = (req.params.email || "").trim().toLowerCase();
  

  if (!email) {
    return res.status(400).json({ status: "error", message: "Falta el email" });
  }
  

  const notifs = await NotificationModel.find({
    recipients: email,
    "readers.email": { $ne: email }
  });
 
  const result = notifs.map(n => ({
    _id: n._id,
    type: n.type,
    referenceId: n.referenceId,
    message: n.message,
    alertLevel: n.alertLevel,
    sentAt: n.sentAt,
    read: false
  }));
 
  return res.status(200).json({
    status: "success",
    data: result,
  });
  }catch (error) {
    next(error);
  }
}
module.exports = {
  checkContractExpiration,
  checkProjectExpiration,
  getNotificationsByManager,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getAllNotifications,
  getNotificationsByReadStatus,
  getNotificationsByUser,
};
