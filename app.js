const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa2-cors');
const logger = require('koa-logger');
const dotenv = require('dotenv');

dotenv.config();
const connectDB = require('./config/db');
const { PORT } = require('./config');
const { errorHandler } = require('./src/middlewares/error.middleware');
const authRoutes = require('./src/modules/auth/auth.routes');
const tenantRoutes = require('./src/modules/tenant/tenant.routes');
const doctorRoutes = require('./src/modules/doctor/doctor.routes');
const staffRoutes = require('./src/modules/staff/staff.routes');
const appointmentRoutes = require('./src/modules/appointment/appointment.routes');
const admissionRoutes = require('./src/modules/admission/admission.routes');
const dischargeRoutes = require('./src/modules/discharge/discharge.routes');
const patientRoutes = require('./src/modules/patient/patient.routes');
const bedRoutes = require('./src/modules/bed/bed.routes');
const emergencyRoutes = require('./src/modules/emergency/emergency.routes');
const invoiceRoutes = require('./src/modules/invoice/invoice.routes');
const taxRoutes = require('./src/modules/tax/tax.routes');

const app = new Koa();
const router = new Router({ prefix: '/api/v1' });

app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(errorHandler);

router.get('/health', async (ctx) => {
  ctx.body = { status: 'ok', version: '1.0.0' };
});

router.use(authRoutes.routes());
router.use(tenantRoutes.routes());
router.use(doctorRoutes.routes());
router.use(staffRoutes.routes());
router.use(patientRoutes.routes());
router.use(bedRoutes.routes());
router.use(emergencyRoutes.routes());
router.use(taxRoutes.routes());
router.use(appointmentRoutes.routes());
router.use(admissionRoutes.routes());
router.use(dischargeRoutes.routes());
router.use(invoiceRoutes.routes());

app.use(router.routes()).use(router.allowedMethods());

connectDB()
  .then(() => {
    const port = PORT;
    const server = app.listen(port, () => {
      console.log(`HMS server started on port ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Change PORT in .env or stop the other process.`);
      } else {
        console.error('Server failed to start', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Database connection failed', err);
    process.exit(1);
  });
