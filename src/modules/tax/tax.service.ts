export {};

const Tax = require('./tax.model');

function normalizeTaxPayload(payload: any, existingTax?: any) {
  const components = payload.components || [];
  const componentRate = components.reduce((total, component) => total + Number(component.rate || 0), 0);
  const rate = components.length > 0 ? componentRate : Number(payload.rate ?? existingTax?.rate ?? 0);

  if (rate <= 0) {
    const err = new Error('Tax rate must be greater than zero');
    err.status = 400;
    throw err;
  }

  return {
    ...payload,
    rate,
    components
  };
}

async function createTax(payload) {
  const data = normalizeTaxPayload(payload);
  const existing = await Tax.findOne({ tenantId: data.tenantId, code: data.code });
  if (existing) {
    const err = new Error('Tax code already exists for this tenant');
    err.status = 409;
    throw err;
  }

  if (data.isDefault) {
    await Tax.updateMany({ tenantId: data.tenantId }, { isDefault: false, updatedAt: new Date() });
  }

  return Tax.create(data);
}

async function listTaxes(tenantId: any, filters: { isActive?: boolean } = {}) {
  const query: any = { tenantId };
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }
  return Tax.find(query).sort({ isDefault: -1, createdAt: -1 });
}

async function getTaxById(id, tenantId) {
  const tax = await Tax.findOne({ _id: id, tenantId });
  if (!tax) {
    const err = new Error('Tax not found');
    err.status = 404;
    throw err;
  }
  return tax;
}

async function getActiveTaxById(id, tenantId) {
  const tax = await Tax.findOne({ _id: id, tenantId, isActive: true });
  if (!tax) {
    const err = new Error('Active tax not found');
    err.status = 404;
    throw err;
  }
  return tax;
}

async function getDefaultTax(tenantId) {
  return Tax.findOne({ tenantId, isDefault: true, isActive: true });
}

async function updateTax(id, tenantId, payload) {
  const existingTax = await Tax.findOne({ _id: id, tenantId });
  if (!existingTax) {
    const err = new Error('Tax not found');
    err.status = 404;
    throw err;
  }

  const data = normalizeTaxPayload(payload, existingTax);

  if (data.isDefault) {
    await Tax.updateMany({ tenantId, _id: { $ne: id } }, { isDefault: false, updatedAt: new Date() });
  }

  const tax = await Tax.findOneAndUpdate(
    { _id: id, tenantId },
    { ...data, updatedAt: new Date() },
    { new: true }
  );

  return tax;
}

module.exports = {
  createTax,
  listTaxes,
  getTaxById,
  getActiveTaxById,
  getDefaultTax,
  updateTax
};
