import * as NotificationService from "../services/notification.service.js";
import { success, error } from "../utils/response.js";

export const createNotificationHandler = async (req, res) => {
  try {
    const n = await NotificationService.createNotification(req.body);
    return success(res, n, "Notification created", 201);
  } catch (err) {
    return error(res, "Failed to create notification", 500, err.message);
  }
};

export const getNotificationsHandler = async (req, res) => {
  try {
    const recipientId = req.query.recipientId;
    const list = await NotificationService.getNotifications(recipientId);
    return success(res, list, "Notifications fetched");
  } catch (err) {
    return error(res, "Failed to fetch notifications", 500, err.message);
  }
};

export const markNotificationReadHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await NotificationService.markAsRead(id);
    return success(res, updated, "Marked as read");
  } catch (err) {
    return error(res, "Failed to mark read", 500, err.message);
  }
};
