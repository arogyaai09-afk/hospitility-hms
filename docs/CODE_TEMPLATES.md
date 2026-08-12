# HMS Backend - Code Templates for Remaining Modules

## Emergency Module Template

### File: `src/modules/emergency/emergency.service.ts`

```typescript
export {};

const Emergency = require('./emergency.model');
const { calculateSkip } = require('../../utils/pagination');

async function createEmergency(data) {
  const emergency = await Emergency.create(data);
  return emergency.toObject();
}

async function listEmergencies(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [emergencies, total] = await Promise.all([
    Emergency.find({ tenantId })
      .select('-__v')
      .populate('patientId', 'name email phone patientCode')
      .populate('doctorId', 'name specialization')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Emergency.countDocuments({ tenantId })
  ]);
  
  return {
    data: emergencies,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getEmergencyById(id, tenantId) {
  return Emergency.findOne({ _id: id, tenantId })
    .select('-__v')
    .populate('patientId')
    .populate('doctorId')
    .lean();
}

async function updateEmergency(id, tenantId, updates) {
  return Emergency.findOneAndUpdate(
    { _id: id, tenantId },
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
}

module.exports = {
  createEmergency,
  listEmergencies,
  getEmergencyById,
  updateEmergency
};
```

### File: `src/modules/emergency/emergency.controller.ts`

```typescript
export {};

const { createEmergency, listEmergencies, getEmergencyById } = require('./emergency.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = {
    ...ctx.request.body,
    tenantId: ctx.state.user.tenantId
  };
  const emergency = await createEmergency(payload);
  ctx.status = 201;
  ctx.body = success(emergency, 'Emergency created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listEmergencies(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Emergencies retrieved', result.pagination);
}

async function show(ctx) {
  const emergency = await getEmergencyById(ctx.params.id, ctx.state.user.tenantId);
  if (!emergency) {
    ctx.throw(404, 'Emergency not found');
  }
  ctx.body = success(emergency);
}

module.exports = { create, index, show };
```

---

## Invoice Module Template

### File: `src/modules/invoice/invoice.service.ts`

```typescript
export {};

const Invoice = require('./invoice.model');
const { calculateSkip } = require('../../utils/pagination');

async function createInvoice(payload) {
  // ... existing logic for calculations ...
  const invoice = await Invoice.create(payload);
  return invoice.toObject();
}

async function listInvoices(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [invoices, total] = await Promise.all([
    Invoice.find({ tenantId })
      .select('-lineItems -taxBreakdown')  // Exclude large nested arrays
      .populate('patientId', 'name patientCode')
      .populate('admissionId', 'admissionCode status')
      .populate('appointmentId', 'appointmentCode status')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Invoice.countDocuments({ tenantId })
  ]);
  
  return {
    data: invoices,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getInvoiceById(id, tenantId) {
  return Invoice.findOne({ _id: id, tenantId })
    .select('-__v')
    .populate('patientId')
    .populate('admissionId')
    .populate('appointmentId')
    .lean();
}

async function updateInvoice(id, tenantId, updates) {
  return Invoice.findOneAndUpdate(
    { _id: id, tenantId },
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
}

module.exports = {
  createInvoice,
  listInvoices,
  getInvoiceById,
  updateInvoice
};
```

### File: `src/modules/invoice/invoice.controller.ts`

```typescript
export {};

const { createInvoice, listInvoices, getInvoiceById } = require('./invoice.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = {
    ...ctx.request.body,
    tenantId: ctx.state.user.tenantId,
    createdBy: ctx.state.user.id
  };
  const invoice = await createInvoice(payload);
  ctx.status = 201;
  ctx.body = success(invoice, 'Invoice created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listInvoices(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Invoices retrieved', result.pagination);
}

async function show(ctx) {
  const invoice = await getInvoiceById(ctx.params.id, ctx.state.user.tenantId);
  if (!invoice) {
    ctx.throw(404, 'Invoice not found');
  }
  ctx.body = success(invoice);
}

module.exports = { create, index, show };
```

---

## Discharge Module Template

### File: `src/modules/discharge/discharge.service.ts`

```typescript
export {};

const Discharge = require('./discharge.model');
const { calculateSkip } = require('../../utils/pagination');

async function createDischarge(payload) {
  const discharge = await Discharge.create(payload);
  return discharge.toObject();
}

async function listDischarges(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [discharges, total] = await Promise.all([
    Discharge.find({ tenantId })
      .select('-__v')
      .populate('admissionId', 'admissionCode patientName doctorId')
      .populate('createdBy', 'name email')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Discharge.countDocuments({ tenantId })
  ]);
  
  return {
    data: discharges,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getDischargeById(id, tenantId) {
  return Discharge.findOne({ _id: id, tenantId })
    .select('-__v')
    .populate('admissionId')
    .populate('createdBy', 'name email')
    .lean();
}

module.exports = {
  createDischarge,
  listDischarges,
  getDischargeById
};
```

### File: `src/modules/discharge/discharge.controller.ts`

```typescript
export {};

const { createDischarge, listDischarges, getDischargeById } = require('./discharge.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = {
    ...ctx.request.body,
    tenantId: ctx.state.user.tenantId,
    createdBy: ctx.state.user.id
  };
  const discharge = await createDischarge(payload);
  ctx.status = 201;
  ctx.body = success(discharge, 'Discharge created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listDischarges(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Discharges retrieved', result.pagination);
}

async function show(ctx) {
  const discharge = await getDischargeById(ctx.params.id, ctx.state.user.tenantId);
  if (!discharge) {
    ctx.throw(404, 'Discharge not found');
  }
  ctx.body = success(discharge);
}

module.exports = { create, index, show };
```

---

## Tax Module Template

### File: `src/modules/tax/tax.service.ts`

```typescript
export {};

const Tax = require('./tax.model');
const { calculateSkip } = require('../../utils/pagination');

async function createTax(data) {
  const tax = await Tax.create(data);
  return tax.toObject();
}

// For small dataset, pagination is optional but recommended for consistency
async function listTaxes(tenantId, page = 1, limit = 50) {
  const skip = calculateSkip(page, limit);
  const [taxes, total] = await Promise.all([
    Tax.find({ tenantId })
      .select('-__v')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Tax.countDocuments({ tenantId })
  ]);
  
  return {
    data: taxes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getTaxById(id, tenantId) {
  return Tax.findOne({ _id: id, tenantId })
    .select('-__v')
    .lean();
}

async function getActiveTaxById(id, tenantId) {
  return Tax.findOne({ _id: id, tenantId, status: 'active' })
    .select('-__v')
    .lean();
}

async function getDefaultTax(tenantId) {
  return Tax.findOne({ tenantId, isDefault: true })
    .select('-__v')
    .lean();
}

module.exports = {
  createTax,
  listTaxes,
  getTaxById,
  getActiveTaxById,
  getDefaultTax
};
```

### File: `src/modules/tax/tax.controller.ts`

```typescript
export {};

const { createTax, listTaxes, getTaxById } = require('./tax.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = {
    ...ctx.request.body,
    tenantId: ctx.state.user.tenantId
  };
  const tax = await createTax(payload);
  ctx.status = 201;
  ctx.body = success(tax, 'Tax created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx, 50);  // Default: 50 for small dataset
  const result = await listTaxes(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Taxes retrieved', result.pagination);
}

async function show(ctx) {
  const tax = await getTaxById(ctx.params.id, ctx.state.user.tenantId);
  if (!tax) {
    ctx.throw(404, 'Tax not found');
  }
  ctx.body = success(tax);
}

module.exports = { create, index, show };
```

---

## Key Points for Each Module

### Emergency
- Patient is critical reference
- May have location/department fields
- Adjust `.populate()` based on actual schema
- Default limit: 20

### Invoice
- Complex nested structures (lineItems, taxBreakdown)
- Consider excluding large arrays in list view
- Keep detailed view separate for full data
- Default limit: 20

### Discharge
- Link to admission, patient, doctor
- Clinical notes (usually text)
- May need status field for workflow
- Default limit: 20

### Tax
- Typically small dataset (5-20 records)
- Optional pagination (not critical)
- But should follow consistency
- Default limit: 50 (larger than others)

---

## How to Use These Templates

1. **Open** the current module file
2. **Compare** with template
3. **Copy** the template structure
4. **Adjust** field names to match actual schema
5. **Test** with `npm run build`
6. **Verify** endpoint works
7. **Commit** changes

---

## Field Names to Adjust

When copying templates, replace these common fields:

| Generic Name | Emergency | Invoice | Discharge | Tax |
|---|---|---|---|---|
| `item/items` | `emergency` | `invoice` | `discharge` | `tax` |
| `Item` | `Emergency` | `Invoice` | `Discharge` | `Tax` |
| `createItem` | `createEmergency` | `createInvoice` | `createDischarge` | `createTax` |
| `listItems` | `listEmergencies` | `listInvoices` | `listDischarges` | `listTaxes` |
| `getItemById` | `getEmergencyById` | `getInvoiceById` | `getDischargeById` | `getTaxById` |

---

## Testing Template Response

After implementing, test each module:

```bash
# Emergency
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:4000/api/v1/emergencies?page=1&limit=20"

# Invoice
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:4000/api/v1/invoices?page=1&limit=20"

# Discharge
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:4000/api/v1/discharge?page=1&limit=20"

# Tax
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:4000/api/v1/tax?page=1&limit=50"
```

Expected response structure for all:
```json
{
  "status": "success",
  "message": "Items retrieved",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```
