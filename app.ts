export {};

declare const require: any;
declare const process: any;
declare const console: any;

import Koa = require('koa');
import Router = require('koa-router');
import bodyParser = require('koa-bodyparser');
import cors = require('koa2-cors');
import * as dotenv from 'dotenv';

// Performance: Use compress instead of koa-logger for smaller responses
const compress = require('koa-compress');

dotenv.config();

import connectDB = require('./config/db');
import config = require('./config');
import errorMiddleware = require('./src/middlewares/error.middleware');
const { errorHandler } = errorMiddleware as any;
import authRoutes = require('./src/modules/auth/auth.routes');
import tenantRoutes = require('./src/modules/tenant/tenant.routes');
import doctorRoutes = require('./src/modules/doctor/doctor.routes');
import staffRoutes = require('./src/modules/staff/staff.routes');
import appointmentRoutes = require('./src/modules/appointment/appointment.routes');
import admissionRoutes = require('./src/modules/admission/admission.routes');
import dischargeRoutes = require('./src/modules/discharge/discharge.routes');
import patientRoutes = require('./src/modules/patient/patient.routes');
import bedRoutes = require('./src/modules/bed/bed.routes');
import emergencyRoutes = require('./src/modules/emergency/emergency.routes');
import invoiceRoutes = require('./src/modules/invoice/invoice.routes');
import taxRoutes = require('./src/modules/tax/tax.routes');
import departmentRoutes = require('./src/modules/department/department.routes');
import dashboardRoutes = require('./src/modules/dashboard/dashboard.routes');
import analyticsRoutes = require('./src/modules/analytics/analytics.routes');
import visitRoutes = require('./src/modules/visit/visit.routes');
import clinicalRoutes = require('./src/modules/clinical/clinical.routes');
import historyRoutes = require('./src/modules/history/history.routes');
import storageRoutes = require('./src/modules/storage/storage.routes');

const app = new Koa();
const router = new Router({ prefix: '/api/v1' });

// Performance middleware stack (optimized order)
app.use(compress({ threshold: 1024 })); // Compress responses > 1KB
app.use(cors());
app.use(bodyParser({ jsonLimit: '10mb', formLimit: '10mb' }));
app.use(errorHandler);

router.get('/health', async (ctx: any) => {
  ctx.body = { status: 'ok', version: '1.0.0' };
});

router.use((authRoutes as any).routes());
router.use((tenantRoutes as any).routes());
router.use((doctorRoutes as any).routes());
router.use((staffRoutes as any).routes());
router.use((patientRoutes as any).routes());
router.use((visitRoutes as any).routes());
router.use((clinicalRoutes as any).routes());
router.use((historyRoutes as any).routes());
router.use((storageRoutes as any).routes());
router.use((bedRoutes as any).routes());
router.use((emergencyRoutes as any).routes());
router.use((taxRoutes as any).routes());
router.use((departmentRoutes as any).routes());
router.use((appointmentRoutes as any).routes());
router.use((admissionRoutes as any).routes());
router.use((dischargeRoutes as any).routes());
router.use((invoiceRoutes as any).routes());
router.use((dashboardRoutes as any).routes());
router.use((analyticsRoutes as any).routes());

app.use(router.routes()).use(router.allowedMethods());

;(connectDB as any)()
  .then(() => {
    const port = ((config as any) && (config as any).PORT) || process.env.PORT || 4000;
    const server = app.listen(port, () => {
      console.log(`HMS server started on port ${port}`);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Change PORT in .env or stop the other process.`);
      } else {
        console.error('Server failed to start', err);
      }
      process.exit(1);
    });
  })
  .catch((err: any) => {
    console.error('Database connection failed', err);
    process.exit(1);
  });
