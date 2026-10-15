export {};

const mongoose = require('mongoose');
const User = require('../auth/auth.model');
const Tenant = require('../tenant/tenant.model');
const { Conversation, Message } = require('./message.model');
const { createNotifications } = require('../notification/notification.service');
const { calculateSkip } = require('../../utils/pagination');

function raise(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function validateParticipants(participantIds, tenantId) {
  const ids = [...new Set(participantIds.map(String))];
  if (!ids.every(mongoose.isValidObjectId)) raise(400, 'participantIds must contain valid user IDs');
  const users = await User.find({
    _id: { $in: ids },
    $or: [{ tenantId }, { role: 'admin' }]
  }).select('_id').lean();
  if (users.length !== ids.length) raise(400, 'All message participants must belong to the same tenant');
  return ids;
}

async function requireConversation(id, userId) {
  if (!mongoose.isValidObjectId(id)) raise(404, 'Conversation not found');
  const conversation = await Conversation.findOne({ _id: id, participants: userId });
  if (!conversation) raise(404, 'Conversation not found');
  return conversation;
}

async function createConversation(user, data, tenantId) {
  if (!tenantId || !mongoose.isValidObjectId(tenantId) || !Array.isArray(data.participantIds) ||
    data.participantIds.length === 0 || typeof data.body !== 'string' || !data.body.trim()) {
    raise(400, 'tenantId, participantIds, and a non-empty body are required');
  }
  if (!await Tenant.exists({ _id: tenantId })) raise(404, 'Tenant not found');
  const participants = await validateParticipants([...data.participantIds, user.id], tenantId);
  const conversation = await Conversation.create({ tenantId, participants, subject: data.subject });
  const message = await Message.create({
    conversationId: conversation._id,
    tenantId,
    senderId: user.id,
    body: data.body.trim(),
    readBy: [user.id]
  });
  const recipients = participants.filter(id => id !== String(user.id));
  await createNotifications(recipients, {
    tenantId,
    type: 'message.new',
    title: 'New in-app message',
    body: data.subject || 'You have a new message',
    entityType: 'conversation',
    entityId: conversation._id
  });
  return { conversation, message };
}

async function listConversations(user, page, limit) {
  const filter: any = { participants: user.id };
  if (user.role !== 'admin') filter.tenantId = user.tenantId;
  const [data, total] = await Promise.all([
    Conversation.find(filter).sort({ lastMessageAt: -1 }).skip(calculateSkip(page, limit)).limit(limit)
      .populate('participants', 'name email role').lean(),
    Conversation.countDocuments(filter)
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function listMessages(id, userId, page, limit) {
  const conversation = await requireConversation(id, userId);
  const [data, total] = await Promise.all([
    Message.find({ conversationId: conversation._id }).sort({ createdAt: -1 }).skip(calculateSkip(page, limit))
      .limit(limit).populate('senderId', 'name email role').lean(),
    Message.countDocuments({ conversationId: conversation._id })
  ]);
  return { data: data.reverse(), pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function sendMessage(id, user, body) {
  if (typeof body !== 'string' || !body.trim()) raise(400, 'Message body is required');
  const conversation = await requireConversation(id, user.id);
  const message = await Message.create({
    conversationId: conversation._id,
    tenantId: conversation.tenantId,
    senderId: user.id,
    body: body.trim(),
    readBy: [user.id]
  });
  conversation.lastMessageAt = message.createdAt;
  await conversation.save();
  const recipients = conversation.participants.map(String).filter(id => id !== String(user.id));
  await createNotifications(recipients, {
    tenantId: conversation.tenantId,
    type: 'message.new',
    title: 'New in-app message',
    body: conversation.subject || 'You have a new message',
    entityType: 'conversation',
    entityId: conversation._id
  });
  return message;
}

async function markMessageRead(id, userId) {
  if (!mongoose.isValidObjectId(id)) raise(404, 'Message not found');
  const message = await Message.findById(id);
  if (!message) raise(404, 'Message not found');
  await requireConversation(message.conversationId, userId);
  if (!message.readBy.some(readerId => String(readerId) === String(userId))) {
    message.readBy.push(userId);
    await message.save();
  }
  return message;
}

module.exports = { createConversation, listConversations, listMessages, sendMessage, markMessageRead };
