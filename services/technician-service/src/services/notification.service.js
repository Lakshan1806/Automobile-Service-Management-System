import Notification from "../models/notification.model.js";

export const createNotification = async (payload) => {
  return Notification.create(payload);
};

export const getNotifications = async (recipientId) => {
  const query = recipientId ? { recipientId } : {};
  return Notification.find(query).sort({ createdAt: -1 });
};

export const markAsRead = async (id) => {
  return Notification.findByIdAndUpdate(id, { read: true }, { new: true });
};
 