import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import AddIcon from "@mui/icons-material/Add";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { getDashboardSummary } from "../api/dashboard";

// ─── DATA ────────────────────────────────────────────────────────────────────

const mockStatsCards = [
  {
    label: "Doctors",
    value: "247",
    icon: <PersonIcon style={{ fontSize: 22 }} />,
    colorClass: "blue",
    badge: "+95%",
    badgeType: "up",
    trend: [20, 35, 28, 45, 38, 52, 48, 60],
    trendColor: "#3b82f6",
  },
  {
    label: "Patients",
    value: "4178",
    icon: <PeopleIcon style={{ fontSize: 22 }} />,
    colorClass: "red",
    badge: "+25%",
    badgeType: "up",
    trend: [30, 25, 40, 35, 50, 42, 55, 48],
    trendColor: "#ef4444",
  },
  {
    label: "Appointment",
    value: "12178",
    icon: <CalendarMonthIcon style={{ fontSize: 22 }} />,
    colorClass: "teal",
    badge: "-15%",
    badgeType: "down",
    trend: [50, 40, 45, 35, 42, 38, 35, 30],
    trendColor: "#0d9488",
  },
  {
    label: "Revenue",
    value: "$55,1240",
    icon: <AttachMoneyIcon style={{ fontSize: 22 }} />,
    colorClass: "green",
    badge: "+25%",
    badgeType: "up",
    trend: [20, 30, 25, 38, 32, 45, 40, 52],
    trendColor: "#10b981",
  },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const appointmentData = months.map((month, i) => ({
  month,
  Completed: [1200, 1800, 2000, 2800, 3200, 2600, 3800, 3200, 2900, 2400, 2000, 1600][i],
  Ongoing: [800, 1200, 1400, 1900, 2100, 1800, 2600, 2200, 2000, 1700, 1400, 1100][i],
  Rescheduled: [400, 600, 700, 900, 1100, 900, 1300, 1100, 1000, 850, 700, 550][i],
}));

const calendarDays = [
  null, null, null, 1, 2, 3, 4,
  5, 6, 7, 8, 9, 10, 11,
  12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, null,
  null, null, null, null, null, null, null,
];

const appointments = [
  { time: "Wed, 05 Apr 2025, 06:30 PM", type: "General Visit" },
  { time: "Wed, 05 Apr 2025, 04:10 PM", type: "General Visit" },
  { time: "Wed, 05 Apr 2025, 10:00 AM", type: "General Visit" },
];

const popularDoctors = [
  { name: "Dr. Alex Morgan", specialty: "Cardiologist", bookings: 258, initials: "AM", color: "#3b82f6" },
  { name: "Dr. Emily Carter", specialty: "Pediatrician", bookings: 125, initials: "EC", color: "#10b981" },
  { name: "Dr. David Lee", specialty: "Gynecologist", bookings: 115, initials: "DL", color: "#8b5cf6" },
];

const deptData = [
  { name: "Cardiology", value: 214, color: "#3b82f6" },
  { name: "Dental", value: 150, color: "#10b981" },
  { name: "Neurology", value: 121, color: "#8b5cf6" },
];

const scheduleData = [
  { name: "Dr. Sarah Johnson", role: "Orthopedic Surgeon", initials: "SJ", color: "#3b82f6" },
  { name: "Dr. Emily Carter", role: "Pediatrician", initials: "EC", color: "#10b981" },
  { name: "Dr. David Lee", role: "Gynecologist", initials: "DL", color: "#8b5cf6" },
  { name: "Dr. Michael Smith", role: "Cardiologist", initials: "MS", color: "#f59e0b" },
];

const incomeData = [
  { name: "Cardiology", count: "4,556 Appointments", amount: "$5,985" },
  { name: "Radiology", count: "4,125 Appointments", amount: "$5,194" },
  { name: "Dental Surgery", count: "1,796 Appointments", amount: "$2,716" },
  { name: "Orthopaedics", count: "3,827 Appointments", amount: "$4,682" },
  { name: "General Medicine", count: "9,894 Appointments", amount: "$9,450" },
];

const allAppointments = [
  {
    doctor: "Dr. John Smith", dRole: "Neurosurgeon", dInitials: "JS", dColor: "#3b82f6",
    patient: "Jesus Adams", pPhone: "+1 41254 45214", pInitials: "JA", pColor: "#8b5cf6",
    dateTime: "28 May 2025 - 11:15 AM", mode: "Online", status: "confirmed",
  },
  {
    doctor: "Dr. Lisa White", dRole: "Oncologist", dInitials: "LW", dColor: "#ef4444",
    patient: "Ezra Belcher", pPhone: "+1 65895 41247", pInitials: "EB", pColor: "#f59e0b",
    dateTime: "29 May 2025 - 11:30 AM", mode: "In-Person", status: "cancelled",
  },
  {
    doctor: "Dr. Patricia Brown", dRole: "Pulmonologist", dInitials: "PB", dColor: "#10b981",
    patient: "Glen Lentz", pPhone: "+1 62458 45845", pInitials: "GL", pColor: "#3b82f6",
    dateTime: "30 May 2025 - 09:30 AM", mode: "Online", status: "confirmed",
  },
  {
    doctor: "Dr. Rachel Green", dRole: "Urologist", dInitials: "RG", dColor: "#0d9488",
    patient: "Bernard Griffith", pPhone: "+1 61422 45214", pInitials: "BG", pColor: "#10b981",
    dateTime: "30 May 2025 - 10:00 AM", mode: "Online", status: "checked-out",
  },
  {
    doctor: "Dr. Michael Smith", dRole: "Cardiologist", dInitials: "MS", dColor: "#f59e0b",
    patient: "John Elsass", pPhone: "+1 47851 26371", pInitials: "JE", pColor: "#8b5cf6",
    dateTime: "30 May 2025 - 11:00 AM", mode: "Online", status: "schedule",
  },
];

const topPatients = [
  { name: "Jesus Adams", paid: "$6589", appointments: 80, initials: "JA", color: "#8b5cf6" },
  { name: "Ezra Belcher", paid: "$5632", appointments: 60, initials: "EB", color: "#f59e0b" },
  { name: "Glen Lentz", paid: "$4125", appointments: 40, initials: "GL", color: "#3b82f6" },
  { name: "Bernard Griffith", paid: "$3140", appointments: 25, initials: "BG", color: "#10b981" },
  { name: "John Elsass", paid: "$2654", appointments: 25, initials: "JE", color: "#0d9488" },
];

const transactions = [
  { name: "General Check-up", id: "#INV5889", amount: "+$234", type: "positive", icon: "S" },
  { name: "Online Consultation", id: "#INV7874", amount: "+$234", type: "positive", icon: "P" },
  { name: "Purchase Product", id: "#INV4458", amount: "-$88", type: "negative", icon: "S" },
  { name: "Online Consultation", id: "#INV5456", amount: "+$234", type: "positive", icon: "P" },
  { name: "Online Consultation", id: "#INV4557", amount: "+$234", type: "positive", icon: "S" },
];

const leaveRequests = [
  { name: "James Allaire", reason: "4 Days - Personal Reason", initials: "JA", color: "#3b82f6" },
  { name: "Esther Schmidt", reason: "2 Days - Going to Hospital", initials: "ES", color: "#10b981" },
  { name: "Valerie Padgett", reason: "1 Day - Changing Account", initials: "VP", color: "#8b5cf6" },
  { name: "Diane Nash", reason: "1 Day - Not Well", initials: "DN", color: "#f59e0b" },
  { name: "Sally Cavazos", reason: "2 Days - Going to Checkup", initials: "SC", color: "#ef4444" },
];

const statusLabels = {
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  "checked-out": "Checked Out",
  schedule: "Schedule",
};

// ─── MINI SPARKLINE ───────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 36;
  const w = 80;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── MOCK DATA BADGE ──────────────────────────────────────────────────────────
function MockDataBadge() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 7px",
        marginLeft: 8,
        borderRadius: 5,
        background: "#fff7ed",
        color: "#c2410c",
        border: "1px solid #fed7aa",
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 0.3,
      }}
    >
      MOCK DATA
    </span>
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString("en-US")}`;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardError, setDashboardError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setDashboardError("");
        const response = await getDashboardSummary();
        if (mounted) {
          const payload = response?.data ?? response ?? {};
          setDashboardData(payload);
        }
      } catch (error) {
        if (mounted) {
          setDashboardData(null);
          setDashboardError(error?.message || "Dashboard data is unavailable right now.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const hasActual = (value) => typeof value === "number" && Number.isFinite(value);

  const statsCards = mockStatsCards.map((card) => {
    if (!dashboardData) return { ...card, isMock: true };

    if (card.label === "Patients" && hasActual(dashboardData.totalPatients)) {
      return { ...card, value: dashboardData.totalPatients.toLocaleString("en-US"), isMock: false };
    }

    if (card.label === "Appointment" && hasActual(dashboardData.todayAppointments)) {
      return { ...card, value: dashboardData.todayAppointments.toLocaleString("en-US"), isMock: false };
    }

    if (card.label === "Revenue" && hasActual(dashboardData.monthlyRevenue)) {
      return { ...card, value: formatCurrency(dashboardData.monthlyRevenue), isMock: false };
    }

    // Dashboard summary currently does not provide a doctor count.
    if (card.label === "Doctors" && hasActual(dashboardData.totalDoctors)) {
      return { ...card, value: dashboardData.totalDoctors.toLocaleString("en-US"), isMock: false };
    }

    if (card.label === "Revenue" && hasActual(dashboardData.monthlyRevenue)) {
      return { ...card, value: formatCurrency(dashboardData.monthlyRevenue), isMock: false };
    }

    return { ...card, isMock: true };
  });

  const hasDashboardData = !!dashboardData && Object.keys(dashboardData).length > 0;

  return (
    <div className="dashboard">

      {/* Page Header */}
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate("/appointments/new")}>
            <AddIcon style={{ fontSize: 16 }} /> New Appointment
          </button>
          <button className="btn-outline">
            <CalendarTodayIcon style={{ fontSize: 14 }} /> Schedule Availability
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        {statsCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <div className="stat-left">
              <div className={`stat-icon-wrap ${card.colorClass}`}>{card.icon}</div>
              <div className="stat-label">{card.label}{card.isMock && <MockDataBadge />}</div>
              <div className="stat-value">{card.value}</div>
            </div>
            <div className="stat-right">
              <div className={`stat-badge ${card.badgeType}`}>
                {card.badgeType === "up" ? <TrendingUpIcon style={{ fontSize: 11, marginRight: 2 }} /> : <TrendingDownIcon style={{ fontSize: 11, marginRight: 2 }} />}
                {card.badge}
              </div>
              <div className="stat-chart">
                <Sparkline data={card.trend} color={card.trendColor} />
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>in last 7 Days</div>
            </div>
          </div>
        ))}
      </div>

      {dashboardError && !loading && (
        <div style={{ margin: "8px 0 20px", padding: 12, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, color: "#9a4d00" }}>
          {dashboardError}
        </div>
      )}

      {!hasDashboardData && !loading && (
        <div style={{ padding: 20, textAlign: "center", background: "#f8fafc", borderRadius: 12, color: "#475569" }}>
          No data found.
        </div>
      )}

      {/* Main Grid: Chart + Calendar */}
      <div className="main-grid">
        {/* Appointment Statistics */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Appointment Statistics<MockDataBadge /></span>
            <div className="card-actions">
              <select className="filter-select"><option>Monthly</option></select>
            </div>
          </div>
          <div className="card-body appt-stats">
            <div className="stats-legend">
              {[
                { label: "All Appointments", value: "6314", color: "#3b82f6" },
                { label: "Cancelled", value: "456", color: "#ef4444" },
                { label: "Reschedule", value: "745", color: "#f59e0b" },
                { label: "Completed", value: "4578", color: "#10b981" },
              ].map((leg) => (
                <div className="legend-item" key={leg.label}>
                  <span className="dot" style={{ background: leg.color }} />
                  <div>
                    <div className="legend-label">{leg.label}</div>
                    <div className="legend-count">{leg.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData} barSize={8} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Bar dataKey="Completed" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Ongoing" fill="#7dd3fc" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Rescheduled" fill="#312e81" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-legend">
              {[{ label: "Completed", color: "#3b82f6" }, { label: "Ongoing", color: "#7dd3fc" }, { label: "Rescheduled", color: "#312e81" }].map((l) => (
                <div className="cl-item" key={l.label}>
                  <span className="cl-dot" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar + Appointments */}
        <div className="card calendar-card">
          <div className="card-header">
            <span className="card-title">Appointments<MockDataBadge /></span>
            <div className="card-actions">
              <select className="filter-select"><option>All Type</option></select>
              <div style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <SettingsIcon style={{ fontSize: 14, color: "#94a3b8" }} />
              </div>
            </div>
          </div>
          {/* Calendar Navigation */}
          <div className="calendar-nav">
            <button className="nav-btn"><ArrowBackIosNewIcon style={{ fontSize: 9 }} /></button>
            <span className="month-label">March 2026</span>
            <button className="nav-btn"><ArrowForwardIosIcon style={{ fontSize: 9 }} /></button>
          </div>
          <div className="calendar-grid">
            <div className="day-names">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div className="day-name" key={d}>{d}</div>
              ))}
            </div>
            <div className="days">
              {calendarDays.map((day, i) => (
                <div key={i} className={`day ${day === 7 ? "today" : ""} ${!day ? "other-month" : ""}`}>
                  {day || ""}
                </div>
              ))}
            </div>
          </div>
          <div className="appt-list">
            {appointments.map((a, i) => (
              <div className="appt-item" key={i}>
                <div className="appt-left">
                  <div className="appt-type">{a.type}</div>
                  <div className="appt-time">
                    <CalendarTodayIcon style={{ fontSize: 10 }} />
                    {a.time}
                  </div>
                </div>
                <div className="appt-avatars">
                  {["A", "B"].map((av, j) => (
                    <div
                      key={j}
                      className="avatar-placeholder"
                      style={{ background: j === 0 ? "#dbeafe" : "#dcfce7", color: j === 0 ? "#2563eb" : "#16a34a" }}
                    >
                      {av}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="view-all-btn">View All Appointments</div>
          </div>
        </div>
      </div>

      {/* Popular Doctors */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">Popular Doctors<MockDataBadge /></span>
          <div className="card-actions">
            <select className="filter-select"><option>Weekly</option></select>
          </div>
        </div>
        <div className="card-body popular-doctors">
          <div className="doctors-grid">
            {popularDoctors.map((doc) => (
              <div className="doctor-card" key={doc.name}>
                <div className="doctor-avatar">
                  <div style={{ width: "100%", height: "100%", background: doc.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: doc.color }}>
                    {doc.initials}
                  </div>
                </div>
                <div className="doctor-name">{doc.name}</div>
                <div className="doctor-specialty">{doc.specialty}</div>
                <div className="doctor-bookings"><span>{doc.bookings}</span> Bookings</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom 3-col: Departments + Schedule + Income */}
      <div className="bottom-grid">
        {/* Top 3 Departments */}
        <div className="card departments-card">
          <div className="card-header">
            <span className="card-title">Top 3 Departments<MockDataBadge /></span>
            <div className="card-actions">
              <select className="filter-select"><option>Weekly</option></select>
            </div>
          </div>
          <div className="card-body">
            <div className="donut-wrap">
              <PieChart width={180} height={180}>
                <Pie data={deptData} cx={85} cy={85} innerRadius={55} outerRadius={82} paddingAngle={3} dataKey="value">
                  {deptData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>Total Patient</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>638</div>
              </div>
            </div>
            <div className="donut-legend">
              {deptData.map((d) => (
                <div className="dl-item" key={d.name}>
                  <span className="dl-dot" style={{ background: d.color }} />
                  {d.value} {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctors Schedule */}
        <div className="card schedule-card">
          <div className="card-header">
            <span className="card-title">Doctors Schedule<MockDataBadge /></span>
            <span className="view-all" style={{ fontSize: 13, color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}>View All</span>
          </div>
          <div className="card-body">
            <div className="schedule-summary">
              {[{ label: "Available", value: 48, color: "#10b981" }, { label: "Unavailable", value: 28, color: "#ef4444" }, { label: "Leave", value: 12, color: "#f59e0b" }].map((s) => (
                <div className="sum-item" key={s.label}>
                  <div className="sum-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="sum-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="schedule-list">
              {scheduleData.map((doc) => (
                <div className="sch-item" key={doc.name}>
                  <div className="sch-doc">
                    <div className="doc-avatar" style={{ background: doc.color + "22", color: doc.color }}>
                      {doc.initials}
                    </div>
                    <div className="doc-info">
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-role">{doc.role}</div>
                    </div>
                  </div>
                  <button className="btn-book">Book Now</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Income By Treatment */}
        <div className="card income-card">
          <div className="card-header">
            <span className="card-title">Income By Treatment<MockDataBadge /></span>
            <div className="card-actions">
              <select className="filter-select"><option>Weekly</option></select>
            </div>
          </div>
          <div className="card-body">
            <div className="income-list">
              {incomeData.map((inc) => (
                <div className="income-item" key={inc.name}>
                  <div className="income-info">
                    <div className="income-name">{inc.name}</div>
                    <div className="income-count">{inc.count}</div>
                  </div>
                  <div className="income-amount">{inc.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All Appointments Table */}
      <div className="card appointments-table" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">All Appointments<MockDataBadge /></span>
          <span className="view-all" style={{ fontSize: 13, color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}>View All</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allAppointments.map((appt, i) => (
                <tr key={i}>
                  <td>
                    <div className="doc-cell">
                      <div className="cell-avatar" style={{ background: appt.dColor + "22", color: appt.dColor }}>{appt.dInitials}</div>
                      <div>
                        <div className="cell-name">{appt.doctor}</div>
                        <div className="cell-sub">{appt.dRole}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="patient-cell">
                      <div className="cell-avatar" style={{ background: appt.pColor + "22", color: appt.pColor }}>{appt.pInitials}</div>
                      <div>
                        <div className="cell-name">{appt.patient}</div>
                        <div className="cell-sub">{appt.pPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td>{appt.dateTime}</td>
                  <td>{appt.mode}</td>
                  <td>
                    <span className={`status-badge ${appt.status}`}>{statusLabels[appt.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 3-col: Patients + Transactions + Leaves */}
      <div className="bottom-3-grid">
        {/* Top 5 Patients */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top 5 Patients<MockDataBadge /></span>
            <span className="view-all" style={{ fontSize: 13, color: "#3b82f6", fontWeight: 500, cursor: "pointer" }}>View All</span>
          </div>
          <div className="card-body">
            {topPatients.map((p) => (
              <div className="patient-card-item" key={p.name}>
                <div className="patient-info">
                  <div className="p-avatar" style={{ background: p.color + "22", color: p.color }}>{p.initials}</div>
                  <div>
                    <div className="p-name">{p.name}</div>
                    <div className="p-paid">Total Paid: {p.paid}</div>
                  </div>
                </div>
                <div className="appt-badge">{p.appointments} Appointments</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Transactions<MockDataBadge /></span>
            <div className="card-actions">
              <select className="filter-select"><option>Weekly</option></select>
            </div>
          </div>
          <div className="card-body">
            {transactions.map((txn, i) => (
              <div className="transaction-item" key={i}>
                <div className="txn-left">
                  <div className="txn-icon" style={{ background: "#eff6ff", color: "#3b82f6", fontWeight: 700, fontSize: 13 }}>
                    {txn.icon}
                  </div>
                  <div>
                    <div className="txn-name">{txn.name}</div>
                    <div className="txn-id">{txn.id}</div>
                  </div>
                </div>
                <div className={`txn-amount ${txn.type}`}>{txn.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leave Requests */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Leave Requests<MockDataBadge /></span>
            <div className="card-actions">
              <select className="filter-select"><option>Today</option></select>
            </div>
          </div>
          <div className="card-body">
            {leaveRequests.map((lr) => (
              <div className="leave-item" key={lr.name}>
                <div className="leave-person">
                  <div className="l-avatar" style={{ background: lr.color + "22", color: lr.color }}>{lr.initials}</div>
                  <div>
                    <div className="l-name">{lr.name}</div>
                    <div className="l-reason">{lr.reason}</div>
                  </div>
                </div>
                <div className="leave-actions">
                  <button className="la-btn reject"><CloseIcon style={{ fontSize: 13 }} /></button>
                  <button className="la-btn approve"><CheckIcon style={{ fontSize: 13 }} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
