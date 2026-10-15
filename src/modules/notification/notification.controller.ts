export {};

const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');
const {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead
} = require('./notification.service');

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listNotifications(ctx.state.user.id, page, limit, ctx.query.unreadOnly === 'true');
  ctx.body = success(result.data, 'Notifications retrieved', { ...result.pagination, unread: result.unread });
}

async function markRead(ctx) {
  const notification = await markNotificationRead(ctx.params.id, ctx.state.user.id);
  ctx.body = success(notification, 'Notification marked as read');
}

async function markAllRead(ctx) {
  const result = await markAllNotificationsRead(ctx.state.user.id);
  ctx.body = success(result, 'Notifications marked as read');
}

module.exports = { index, markRead, markAllRead };
