export {};

const mongoose = require('mongoose');
const Ticket = require('./ticket.model');
const User = require('../auth/auth.model');
const Tenant = require('../tenant/tenant.model');
const { createNotifications } = require('../notification/notification.service');
const { calculateSkip } = require('../../utils/pagination');

function raise(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

async function getTenantRecipients(tenantId) {
  const users = await User.find({ tenantId, role: 'tenant' }).select('_id').lean();
  return users.map(user => user._id);
}

async function createTicket(data, user) {
  if (!data.tenantId || !data.subject || !data.description) raise(400, 'tenantId, subject, and description are required');
  if (!mongoose.isValidObjectId(data.tenantId)) raise(400, 'tenantId must be a valid ID');
  if (!await Tenant.exists({ _id: data.tenantId })) raise(404, 'Tenant not found');
  const ticket = await Ticket.create({
    tenantId: data.tenantId,
    createdBy: user.id,
    subject: data.subject,
    description: data.description,
    category: data.category,
    priority: data.priority
  });
  const tenantRecipients = await getTenantRecipients(data.tenantId);
  await createNotifications(tenantRecipients, {
    tenantId: data.tenantId,
    type: 'ticket.created',
    title: 'New support ticket',
    body: `${ticket.subject} was submitted`,
    entityType: 'ticket',
    entityId: ticket._id
  });
  return ticket;
}

async function listTickets(user, tenantId, page, limit, status) {
  const filter: any = {};
  if (user.role !== 'admin') {
    if (!user.tenantId) raise(403, 'Tenant context is required');
    filter.tenantId = user.tenantId;
  }
  else if (tenantId) filter.tenantId = tenantId;
  if (status) filter.status = status;
  const [data, total] = await Promise.all([
    Ticket.find(filter).sort({ updatedAt: -1 }).skip(calculateSkip(page, limit)).limit(limit)
      .populate('createdBy', 'name email role').populate('assignedTo', 'name email').lean(),
    Ticket.countDocuments(filter)
  ]);
  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function findTicket(id, user) {
  if (!mongoose.isValidObjectId(id)) raise(404, 'Ticket not found');
  const filter: any = { _id: id };
  if (user.role !== 'admin') {
    if (!user.tenantId) raise(403, 'Tenant context is required');
    filter.tenantId = user.tenantId;
  }
  const ticket = await Ticket.findOne(filter).populate('createdBy', 'name email role')
    .populate('assignedTo', 'name email').populate('messages.authorId', 'name email role');
  if (!ticket) raise(404, 'Ticket not found');
  return ticket;
}

async function updateTicket(id, data) {
  const statuses = ['open', 'in_progress', 'waiting_on_tenant', 'resolved', 'closed'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  if (data.status !== undefined && !statuses.includes(data.status)) raise(400, 'Invalid ticket status');
  if (data.priority !== undefined && !priorities.includes(data.priority)) raise(400, 'Invalid ticket priority');
  if (data.assignedTo && !mongoose.isValidObjectId(data.assignedTo)) raise(400, 'assignedTo must be a valid user ID');
  const update: any = {};
  if (data.status !== undefined) update.status = data.status;
  if (data.priority !== undefined) update.priority = data.priority;
  if (data.assignedTo !== undefined) update.assignedTo = data.assignedTo || null;
  update.updatedAt = new Date();
  if (data.status === 'resolved' || data.status === 'closed') update.resolvedAt = new Date();
  else if (data.status && ['open', 'in_progress', 'waiting_on_tenant'].includes(data.status)) update.resolvedAt = null;
  const ticket = await Ticket.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  if (!ticket) raise(404, 'Ticket not found');
  const recipients = new Set((await getTenantRecipients(ticket.tenantId)).map(String));
  recipients.add(String(ticket.createdBy));
  if (data.status || data.assignedTo !== undefined) {
    await createNotifications([...recipients], {
      tenantId: ticket.tenantId,
      type: 'ticket.updated',
      title: 'Support ticket updated',
      body: `${ticket.subject} status: ${ticket.status}`,
      entityType: 'ticket',
      entityId: ticket._id
    });
  }
  return ticket;
}

async function addTicketMessage(id, body, user) {
  if (typeof body !== 'string' || !body.trim()) raise(400, 'Message body is required');
  const ticket = await findTicket(id, user);
  ticket.messages.push({ authorId: user.id, body: body.trim() });
  ticket.updatedAt = new Date();
  await ticket.save();

  const recipients = new Set((await getTenantRecipients(ticket.tenantId)).map(String));
  recipients.add(String(ticket.createdBy));
  recipients.delete(String(user.id));
  if (ticket.assignedTo) recipients.add(String(ticket.assignedTo));
  await createNotifications([...recipients], {
    tenantId: ticket.tenantId,
    type: 'ticket.message',
    title: 'New support ticket reply',
    body: `${ticket.subject} has a new reply`,
    entityType: 'ticket',
    entityId: ticket._id
  });
  return ticket;
}

module.exports = { createTicket, listTickets, findTicket, updateTicket, addTicketMessage };
