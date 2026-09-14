# HMS Modules - Quick Status & Checklist

## 📊 Status Overview

```
✅ = Complete (Pagination + Optimization)
🔄 = TODO (Needs Pagination + Optimization)  
⚠️  = Optional Review (May need minor updates)
```

---

## Module Status Matrix

| Module | Status | Files to Update | Estimated Time | Priority |
|--------|--------|-----------------|-----------------|----------|
| patient | ✅ | Done | - | P0 |
| appointment | ✅ | Done | - | P0 |
| bed | ✅ | Done | - | P0 |
| admission | ✅ | Done | - | P0 |
| doctor | ✅ | Done | - | P0 |
| staff | ✅ | Done | - | P0 |
| emergency | 🔄 | service.ts, controller.ts | 10 min | P1 |
| invoice | 🔄 | service.ts, controller.ts | 15 min | P1 |
| discharge | 🔄 | service.ts, controller.ts | 10 min | P2 |
| tax | 🔄 | service.ts, controller.ts | 10 min | P3 |
| tenant | ⚠️ | Review only | 5 min | P3 |
| auth | ⚠️ | Review only | - | - |

---

## 🔄 TODO Modules - What to Do

### 1️⃣ Emergency Module (10 min)
**Location:** `src/modules/emergency/`

```
📝 emergency.service.ts
  ├─ Import calculateSkip from pagination utility
  ├─ Add page, limit params to listEmergencies()
  ├─ Add .select('-__v').lean() to queries
  └─ Return { data, pagination } format

📝 emergency.controller.ts
  ├─ Import getPaginationParams from pagination utility
  ├─ Update index() to extract page/limit
  └─ Pass pagination to service
```

**Test Command:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:4000/api/v1/emergencies?page=1&limit=20"
```

---

### 2️⃣ Invoice Module (15 min)
**Location:** `src/modules/invoice/`

```
📝 invoice.service.ts
  ├─ Import calculateSkip
  ├─ Add pagination to listInvoices()
  ├─ Optimize populate() with field selection
  ├─ Add .lean() and .select()
  └─ Return { data, pagination }

📝 invoice.controller.ts
  ├─ Import getPaginationParams
  ├─ Update index() with pagination
  └─ Handle both list and detail views
```

**Estimated Lines Changed:** 20-30 lines per file

---

### 3️⃣ Discharge Module (10 min)
**Location:** `src/modules/discharge/`

```
📝 discharge.service.ts
  ├─ Import calculateSkip
  ├─ Add listDischarges(tenantId, page, limit)
  ├─ Add populate for admissionId, patientId
  ├─ Add .lean() and .select()
  └─ Return paginated response

📝 discharge.controller.ts
  ├─ Import getPaginationParams
  ├─ Create or update list endpoint
  └─ Add pagination support
```

---

### 4️⃣ Tax Module (10 min)
**Location:** `src/modules/tax/`

```
📝 tax.service.ts
  ├─ Optional: Add pagination (small list)
  ├─ Add .select('-__v').lean()
  └─ Keep efficient even without pagination

📝 tax.controller.ts
  ├─ Optional: Add pagination params
  └─ Update response format if needed
```

---

## ⚠️ Optional Reviews

### Tenant Module
- Usually admin-only, small dataset
- Optional pagination (might not be needed)
- **Should update:** Add `.lean()` and `.select()`

### Auth Module
- No pagination needed (login/register endpoints)
- **No changes required**

### User Module
- Not implemented as separate module
- Currently using auth.model.ts
- **Future consideration** only

---

## 📋 Quick Checklist for Each Module

### For Emergency:
- [ ] Read emergency.service.ts current code
- [ ] Compare with patient.service.ts (reference)
- [ ] Update listEmergencies() with pagination
- [ ] Update emergency.controller.ts index()
- [ ] Test with `?page=1&limit=20`
- [ ] Commit: `perf: Add pagination to emergency endpoints`

### For Invoice:
- [ ] Read invoice.service.ts current code
- [ ] Update listInvoices() with pagination
- [ ] Add populate with field selection
- [ ] Update invoice.controller.ts
- [ ] Test pagination
- [ ] Commit: `perf: Add pagination to invoice endpoints`

### For Discharge:
- [ ] Check if listDischarges() exists
- [ ] Add pagination support
- [ ] Optimize queries with .lean()
- [ ] Test endpoint
- [ ] Commit: `perf: Add pagination to discharge endpoints`

### For Tax:
- [ ] Review tax.service.ts
- [ ] Add .lean() and .select()
- [ ] Test
- [ ] Commit: `perf: Optimize tax queries`

---
```bash
git add src/modules/{module}/*
git commit -m "perf: Add pagination to {module} endpoints

- Add pagination utility support
- Optimize queries with .lean() and .select()
- Reduce response size by 60-80%
- Faster query execution"
```

---

## 📈 Performance Impact by Module

**Emergency:** 5-10 min faster loading, 80-90% size reduction  
**Invoice:** 10-15 min faster (larger documents), 60-70% size reduction  
**Discharge:** 2-5 min faster, 70-80% size reduction  
**Tax:** Minimal (small dataset), 50-60% size reduction  

---

## 🎯 Recommended Order

1. **First:** Emergency (most impactful)
2. **Second:** Invoice (billing critical)
3. **Third:** Discharge (clinical workflow)
4. **Last:** Tax (administrative)

**Total Time:** ~45-50 minutes for all updates

---

## 🔗 Reference Files

**Perfect Templates:**
- `src/modules/patient/patient.service.ts` → service pattern
- `src/modules/patient/patient.controller.ts` → controller pattern
- `src/utils/pagination.ts` → utility functions

Copy-paste from these files and adjust field names for each module.

---

## ✅ Done - Mark as Complete

Once a module is updated:

- [ ] Delete from "TODO" list
- [ ] Update module status to ✅
- [ ] Add to completed list in README
- [ ] Push commit to repository

---

## 📞 Need Help?

If stuck on any module:
1. Check the reference files (patient, appointment, doctor)
2. Follow the pattern exactly
3. Test with `npm run build` first
4. Use the checklist above
5. Compare before/after carefully

---

## Performance Verification

After updating all modules, verify improvement:

```bash
# Check response compression
curl -i -H "Accept-Encoding: gzip" \
  "http://localhost:4000/api/v1/emergencies" | grep "Content-Encoding"
# Should show: Content-Encoding: gzip

# Monitor with Apache Bench
ab -n 100 -c 10 "http://localhost:4000/api/v1/emergencies?page=1&limit=20"
# Compare RPS (requests/sec) - should be 50+ RPS
```
