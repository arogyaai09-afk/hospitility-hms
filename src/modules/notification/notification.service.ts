export {};

const Notification = require('./notification.model');
const { calculateSkip } = require('../../utils/pagination');

async function createNotifications(recipients, data) {
  const uniqueRecipients = [...new Set(recipients.map(String))];
  if (!uniqueRecipients.length) return [];
  return Notification.insertMany(uniqueRecipients.map(recipientId => ({ ...data, recipientId })));
}

async function listNotifications(userId, page, limit, unreadOnly) {
  const filter: any = { recipientId: userId };
  if (unreadOnly) filter.readAt = { $exists: false };
  const [data, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(calculateSkip(page, limit)).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipientId: userId, readAt: { $exists: false } })
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) }, unread };
}

async function markNotificationRead(id, userId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: userId },
    { $set: { readAt: new Date() } },
    { new: true }
  );
  if (!notification) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
  return notification;
}

async function markAllNotificationsRead(userId) {
  const result = await Notification.updateMany(
    { recipientId: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } }
  );
  return { updated: result.modifiedCount };
}

module.exports = { createNotifications, listNotifications, markNotificationRead, markAllNotificationsRead };
