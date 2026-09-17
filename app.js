"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Koa = require("koa");
var Router = require("koa-router");
var bodyParser = require("koa-bodyparser");
var cors = require("koa2-cors");
var logger = require("koa-logger");
var dotenv = require("dotenv");
dotenv.config();
var connectDB = require("./config/db");
var config = require("./config");
var errorMiddleware = require("./src/middlewares/error.middleware");
var errorHandler = errorMiddleware.errorHandler;
var authRoutes = require("./src/modules/auth/auth.routes");
var tenantRoutes = require("./src/modules/tenant/tenant.routes");
var doctorRoutes = require("./src/modules/doctor/doctor.routes");
var staffRoutes = require("./src/modules/staff/staff.routes");
var appointmentRoutes = require("./src/modules/appointment/appointment.routes");
var admissionRoutes = require("./src/modules/admission/admission.routes");
var dischargeRoutes = require("./src/modules/discharge/discharge.routes");
var patientRoutes = require("./src/modules/patient/patient.routes");
var bedRoutes = require("./src/modules/bed/bed.routes");
var emergencyRoutes = require("./src/modules/emergency/emergency.routes");
var invoiceRoutes = require("./src/modules/invoice/invoice.routes");
var taxRoutes = require("./src/modules/tax/tax.routes");
var analyticsRoutes = require("./src/modules/analytics/analytics.routes");
var app = new Koa();
var router = new Router({ prefix: '/api/v1' });
app.use(logger());
app.use(cors());
app.use(bodyParser());
app.use(errorHandler);
router.get('/health', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        ctx.body = { status: 'ok', version: '1.0.0' };
        return [2 /*return*/];
    });
}); });
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
router.use(analyticsRoutes.routes());
app.use(router.routes()).use(router.allowedMethods());
;
connectDB()
    .then(function () {
    var port = (config && config.PORT) || process.env.PORT || 4000;
    var server = app.listen(port, function () {
        console.log("HMS server started on port ".concat(port));
    });
    server.on('error', function (err) {
        if (err.code === 'EADDRINUSE') {
            console.error("Port ".concat(port, " is already in use. Change PORT in .env or stop the other process."));
        }
        else {
            console.error('Server failed to start', err);
        }
        process.exit(1);
    });
})
    .catch(function (err) {
    console.error('Database connection failed', err);
    process.exit(1);
});
