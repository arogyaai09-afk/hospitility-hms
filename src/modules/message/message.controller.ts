export {};

const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');
const {
  createConversation,
  listConversations,
  listMessages,
  sendMessage,
  markMessageRead
} = require('./message.service');

function resolveTenantId(user, requestedTenantId) {
  return user.role === 'admin' ? requestedTenantId : user.tenantId;
}

async function create(ctx) {
  const result = await createConversation(
    ctx.state.user,
    ctx.request.body,
    resolveTenantId(ctx.state.user, ctx.request.body.tenantId)
  );
  ctx.status = 201;
  ctx.body = success(result, 'Conversation created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listConversations(ctx.state.user, page, limit);
  ctx.body = success(result.data, 'Conversations retrieved', result.pagination);
}

async function messages(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listMessages(ctx.params.id, ctx.state.user.id, page, limit);
  ctx.body = success(result.data, 'Messages retrieved', result.pagination);
}

async function send(ctx) {
  const message = await sendMessage(ctx.params.id, ctx.state.user, ctx.request.body.body);
  ctx.status = 201;
  ctx.body = success(message, 'Message sent');
}

async function markRead(ctx) {
  const message = await markMessageRead(ctx.params.messageId, ctx.state.user.id);
  ctx.body = success(message, 'Message marked as read');
}

module.exports = { create, index, messages, send, markRead };
