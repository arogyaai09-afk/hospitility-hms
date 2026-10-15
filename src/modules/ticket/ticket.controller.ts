export {};

const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');
const { createTicket, listTickets, findTicket, updateTicket, addTicketMessage } = require('./ticket.service');

function resolveTenantId(user, requestedTenantId) {
  return user.role === 'admin' ? requestedTenantId : user.tenantId;
}

async function create(ctx) {
  const data = { ...ctx.request.body, tenantId: resolveTenantId(ctx.state.user, ctx.request.body.tenantId) };
  const ticket = await createTicket(data, ctx.state.user);
  ctx.status = 201;
  ctx.body = success(ticket, 'Ticket created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listTickets(ctx.state.user, ctx.query.tenantId, page, limit, ctx.query.status);
  ctx.body = success(result.data, 'Tickets retrieved', result.pagination);
}

async function show(ctx) {
  ctx.body = success(await findTicket(ctx.params.id, ctx.state.user), 'Ticket retrieved');
}

async function update(ctx) {
  if (ctx.state.user.role !== 'admin') ctx.throw(403, 'Only platform administrators can update ticket status and assignment');
  ctx.body = success(await updateTicket(ctx.params.id, ctx.request.body), 'Ticket updated');
}

async function addMessage(ctx) {
  const ticket = await addTicketMessage(ctx.params.id, ctx.request.body.body, ctx.state.user);
  ctx.body = success(ticket, 'Ticket reply added');
}

module.exports = { create, index, show, update, addMessage };
