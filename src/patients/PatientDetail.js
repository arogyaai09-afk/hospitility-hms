//patientdetails.js
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon  from "@mui/icons-material/ArrowBackIosNew";
import LocationOnIcon       from "@mui/icons-material/LocationOn";
import PhoneIcon            from "@mui/icons-material/Phone";
import CalendarTodayIcon    from "@mui/icons-material/CalendarToday";
import PersonIcon           from "@mui/icons-material/Person";
import CakeIcon             from "@mui/icons-material/Cake";
import BloodtypeIcon        from "@mui/icons-material/Bloodtype";
import WcIcon               from "@mui/icons-material/Wc";
import EmailIcon            from "@mui/icons-material/Email";
import FavoriteIcon         from "@mui/icons-material/Favorite";
import MonitorHeartIcon     from "@mui/icons-material/MonitorHeart";
import AirIcon              from "@mui/icons-material/Air";
import ThermostatIcon       from "@mui/icons-material/Thermostat";
import SpeedIcon            from "@mui/icons-material/Speed";
import FitnessCenterIcon    from "@mui/icons-material/FitnessCenter";
import SearchIcon           from "@mui/icons-material/Search";
import FilterListIcon       from "@mui/icons-material/FilterList";
import CallIcon             from "@mui/icons-material/Call";
import ChatIcon             from "@mui/icons-material/Chat";
import VideoCallIcon        from "@mui/icons-material/VideoCall";
import CalendarMonthIcon    from "@mui/icons-material/CalendarMonth";
import MoreVertIcon         from "@mui/icons-material/MoreVert";
import ChevronLeftIcon      from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon     from "@mui/icons-material/ChevronRight";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const patientsMap = {
  1: {
    id: "PT0025", name: "Alberto Ripley", age: 26, gender: "Male",
    address: "4150 Hiney Road, Las Vegas, NV 89109",
    phone: "+1 54546 45648", lastVisited: "30 Apr 2025",
    dob: "25 Jan 1990", bloodGroup: "O +ve",
    email: "alberto@example.com", color: "#3b82f6",
    vitals: {
      bloodPressure: "100/67 mmHg", heartRate: "89 Bpm",
      spo2: "98 %", temperature: "101 C",
      respiratoryRate: "24 rpm", weight: "100 kg",
    },
  },
  2: {
    id: "PT0024", name: "Susan Babin", age: 21, gender: "Female",
    address: "220 Elm Road, Chicago, IL 60601",
    phone: "+1 54554 54789", lastVisited: "15 Apr 2025",
    dob: "05 Mar 2003", bloodGroup: "A +ve",
    email: "susan@example.com", color: "#ec4899",
    vitals: {
      bloodPressure: "110/70 mmHg", heartRate: "78 Bpm",
      spo2: "99 %", temperature: "98 C",
      respiratoryRate: "18 rpm", weight: "58 kg",
    },
  },
};

const defaultPatient = {
  id: "PT0023", name: "Carol Lam", age: 28, gender: "Female",
  address: "88 Ocean Avenue, Miami, FL 33101",
  phone: "+1 43554 54985", lastVisited: "02 Apr 2025",
  dob: "14 Jun 1996", bloodGroup: "B +ve",
  email: "carol@example.com", color: "#8b5cf6",
  vitals: {
    bloodPressure: "120/80 mmHg", heartRate: "72 Bpm",
    spo2: "97 %", temperature: "99 C",
    respiratoryRate: "20 rpm", weight: "62 kg",
  },
};

const appointmentsData = [
  { id:1,  date:"30 Apr 2025 - 09:30 AM", doctor:"Dr. Mick Thompson",  role:"Cardiologist",       color:"#3b82f6", initials:"MT", mode:"In-person", status:"Checked Out"  },
  { id:2,  date:"15 Apr 2025 - 11:20 AM", doctor:"Dr. Sarah Johnson",  role:"Orthopedic Surgeon", color:"#10b981", initials:"SJ", mode:"Online",    status:"Checked In"   },
  { id:3,  date:"02 Apr 2025 - 08:15 AM", doctor:"Dr. Emily Carter",   role:"Pediatrician",       color:"#8b5cf6", initials:"EC", mode:"In-Person", status:"Cancelled"    },
  { id:4,  date:"27 Mar 2025 - 02:00 PM", doctor:"Dr. David Lee",      role:"Gynecologist",       color:"#f59e0b", initials:"DL", mode:"In-person", status:"Schedule"     },
  { id:5,  date:"12 Mar 2025 - 05:40 PM", doctor:"Dr. Anna Kim",       role:"Psychiatrist",       color:"#0d9488", initials:"AK", mode:"Online",    status:"Confirmed"    },
  { id:6,  date:"24 Feb 2025 - 09:20 AM", doctor:"Dr. John Smith",     role:"Neurosurgeon",       color:"#ef4444", initials:"JS", mode:"In-Person", status:"Cancelled"    },
  { id:7,  date:"16 Feb 2025 - 11:40 AM", doctor:"Dr. Lisa White",     role:"Oncologist",         color:"#ec4899", initials:"LW", mode:"Online",    status:"Confirmed"    },
  { id:8,  date:"01 Feb 2025 - 04:00 PM", doctor:"Dr. Patricia Brown", role:"Pulmonologist",      color:"#6366f1", initials:"PB", mode:"Online",    status:"Checked Out"  },
  { id:9,  date:"25 Jan 2025 - 03:10 PM", doctor:"Dr. Rachel Green",   role:"Urologist",          color:"#14b8a6", initials:"RG", mode:"Online",    status:"Schedule"     },
  { id:10, date:"12 Jan 2025 - 03:10 PM", doctor:"Dr. Michael Smith",  role:"Cardiologist",       color:"#f59e0b", initials:"MS", mode:"In-Person", status:"Cancelled"    },
];

const transactionsData = [
  { id:"#TNX0025", desc:"General Consultation",   date:"30 Apr 2025", method:"PayPal",      amount:"$800",  status:"Completed" },
  { id:"#TNX0024", desc:"Dental Cleaning",        date:"15 Apr 2025", method:"Debit Card",  amount:"$930",  status:"Pending"   },
  { id:"#TNX0023", desc:"Eye Checkup",            date:"02 Apr 2025", method:"Cheque",      amount:"$850",  status:"Completed" },
  { id:"#TNX0022", desc:"X-Ray",                  date:"27 Mar 2025", method:"Debit Card",  amount:"$80",   status:"Completed" },
  { id:"#TNX0021", desc:"Physiotherapy Session",  date:"12 Mar 2025", method:"PayPal",      amount:"$650",  status:"Completed" },
  { id:"#TNX0020", desc:"Cardiac Screening",      date:"05 Mar 2025", method:"Cheque",      amount:"$430",  status:"Completed" },
  { id:"#TNX0019", desc:"Skin Allergy Test",      date:"24 Feb 2025", method:"Debit Card",  amount:"$300",  status:"Pending"   },
  { id:"#TNX0018", desc:"Blood Test",             date:"16 Feb 2025", method:"Cheque",      amount:"$450",  status:"Completed" },
  { id:"#TNX0017", desc:"ENT Consultation",       date:"01 Feb 2025", method:"Debit Card",  amount:"$570",  status:"Completed" },
  { id:"#TNX0016", desc:"Nutrition Counseling",   date:"25 Jan 2025", method:"PayPal",      amount:"$800",  status:"Completed" },
];

const DATE_OPTIONS = ["Today","Yesterday","Last 7 Days","Last 30 Days","This Month","Last Month","Custom Range"];
const ROWS_OPTIONS = [5, 10, 15, 20];

const statusClass = (s) => {
  const map = {
    "checked out":  "checked-out",
    "checked in":   "checked-in",
    "cancelled":    "cancelled",
    "schedule":     "schedule",
    "confirmed":    "confirmed",
    "completed":    "completed",
    "pending":      "pending",
  };
  return map[s.toLowerCase()] || "confirmed";
};

// ─── OUTSIDE CLICK ────────────────────────────────────────────────────────────
function useOutsideClick(ref, cb) {
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PatientDetail() {
  const navigate   = useNavigate();
  const { id }     = useParams();

  const patient     = patientsMap[id] || defaultPatient;

  const [activeTab,   setActiveTab]   = useState("appointments");
  const [search,      setSearch]      = useState("");
  const [dateLabel,   setDateLabel]   = useState("Last 30 Days");
  const [dateOpen,    setDateOpen]    = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page,        setPage]        = useState(1);
  const [openMenu,    setOpenMenu]    = useState(null);

  const dateRef = useRef();
  useOutsideClick(dateRef, () => setDateOpen(false));

  useEffect(() => { setPage(1); }, [activeTab, search]);

  // ── Filter data ──
  const apptFiltered = appointmentsData.filter(a =>
    a.doctor.toLowerCase().includes(search.toLowerCase()) ||
    a.mode.toLowerCase().includes(search.toLowerCase()) ||
    a.status.toLowerCase().includes(search.toLowerCase())
  );

  const txnFiltered = transactionsData.filter(t =>
    t.desc.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase()) ||
    t.method.toLowerCase().includes(search.toLowerCase())
  );

  const currentData = activeTab === "appointments" ? apptFiltered : txnFiltered;
  const totalPages  = Math.ceil(currentData.length / rowsPerPage);
  const pageData    = currentData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const initials = patient.name.split(" ").slice(0, 2).map(w => w[0]).join("");

  return (
    <div className="patient-details-page">
      

      {/* Breadcrumb */}
      <div className="breadcrumb" onClick={() => navigate("/patients")}>
        <ArrowBackIosNewIcon /> Patients
      </div>

      {/* ── Hero Card ── */}
      <div className="patient-hero">
        {/* Abstract shape */}
        <div className="hero-bg-shape">
          <svg viewBox="0 0 240 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312e81" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <polygon points="120,0 240,0 240,120 0,120" fill="url(#heroGrad)" opacity="0.15" />
            <polygon points="160,0 240,0 240,80" fill="url(#heroGrad)" opacity="0.2" />
          </svg>
        </div>

        <div className="hero-content">
          <div className="hero-left">
            <div className="patient-img" style={{ background: patient.color + "18", color: patient.color }}>
              {initials}
            </div>
            <div className="patient-info">
              <div className="patient-id">#{patient.id}</div>
              <div className="patient-name">{patient.name}</div>
              <div className="patient-address">
                <LocationOnIcon /> {patient.address}
              </div>
              <div className="patient-meta">
                <div className="meta-item">
                  <PhoneIcon /> Phone : {patient.phone}
                </div>
                <div className="meta-item">
                  <CalendarTodayIcon /> Last Visited : {patient.lastVisited}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="icon-action-btn"><CallIcon /></div>
            <div className="icon-action-btn"><ChatIcon /></div>
            <div className="icon-action-btn"><VideoCallIcon /></div>
            <button className="btn-book">
              <CalendarMonthIcon /> Book Apppointment
            </button>
          </div>
        </div>
      </div>

      {/* ── About + Vital Signs ── */}
      <div className="info-row">

        {/* About */}
        <div className="info-card">
          <div className="ic-title">
            <PersonIcon /> About
          </div>
          <div className="about-grid">
            {[
              { icon: <CakeIcon />,      label: "DOB",         value: patient.dob        },
              { icon: <BloodtypeIcon />, label: "Blood Group", value: patient.bloodGroup  },
              { icon: <WcIcon />,        label: "Gender",      value: patient.gender      },
              { icon: <EmailIcon />,     label: "Email",       value: patient.email       },
            ].map((item, i) => (
              <div className="ag-item" key={i}>
                <div className="ag-icon">{item.icon}</div>
                <div className="ag-content">
                  <div className="ag-label">{item.label}</div>
                  <div className="ag-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="info-card">
          <div className="ic-title">
            <MonitorHeartIcon /> Vital Signs
          </div>
          <div className="vitals-grid">
            {[
              { icon: <FavoriteIcon />,     label: "Blood Pressure",   value: patient.vitals.bloodPressure,   dot: "green"  },
              { icon: <MonitorHeartIcon />, label: "Heart Rate",       value: patient.vitals.heartRate,       dot: "red"    },
              { icon: <AirIcon />,          label: "SPO2",             value: patient.vitals.spo2,            dot: "green"  },
              { icon: <ThermostatIcon />,   label: "Temperature",      value: patient.vitals.temperature,     dot: "red"    },
              { icon: <SpeedIcon />,        label: "Respiratory Rate", value: patient.vitals.respiratoryRate, dot: "red"    },
              { icon: <FitnessCenterIcon />,label: "Weight",           value: patient.vitals.weight,          dot: "green"  },
            ].map((v, i) => (
              <div className="vital-item" key={i}>
                <div className="vital-icon">{v.icon}</div>
                <div className="vital-content">
                  <div className="vital-label">{v.label}</div>
                  <div className="vital-value">
                    <span className={`vital-dot ${v.dot}`} />
                    {v.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs Card ── */}
      <div className="tabs-card">

        {/* Tab Nav */}
        <div className="tabs-nav">
          {["appointments", "transactions"].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="tab-toolbar">
          <div className="tab-toolbar-left">
            {/* Search */}
            <div className="tab-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div ref={dateRef}>
              <div className="date-range-btn" onClick={() => setDateOpen(o => !o)}>
                <CalendarTodayIcon />
                8 Mar 26 - 8 Mar 26
                {dateOpen && (
                  <div className="date-dropdown">
                    {DATE_OPTIONS.map(opt => (
                      <div
                        key={opt}
                        className={`dd-item ${dateLabel === opt ? "active" : ""}`}
                        onClick={e => { e.stopPropagation(); setDateLabel(opt); setDateOpen(false); }}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter btn */}
          <button className="btn-filter-sm">
            <FilterListIcon /> Filters
          </button>
        </div>

        {/* ── APPOINTMENTS TABLE ── */}
        {activeTab === "appointments" && (
          <div className="tab-table">
            <table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Doctor Name</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(appt => (
                  <tr key={appt.id}>
                    <td>{appt.date}</td>
                    <td>
                      <div
                        className="doc-cell"
                        onClick={() => navigate(`/doctors/${appt.id}`)}
                      >
                        <div
                          className="cell-avatar"
                          style={{ background: appt.color + "22", color: appt.color }}
                        >
                          {appt.initials}
                        </div>
                        <div>
                          <div className="cell-name">{appt.doctor}</div>
                          <div className="cell-sub">{appt.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>{appt.mode}</td>
                    <td>
                      <span className={`appt-status ${statusClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ position: "relative" }}>
                        <button
                          className="icon-btn"
                          onClick={() => setOpenMenu(openMenu === appt.id ? null : appt.id)}
                        >
                          <MoreVertIcon />
                        </button>
                        {openMenu === appt.id && (
                          <div style={{
                            position: "absolute", right: 0, top: "calc(100% + 4px)",
                            background: "white", border: "1px solid #e2e8f0",
                            borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            minWidth: 130, zIndex: 50, overflow: "hidden",
                          }}>
                            {["View", "Edit", "Cancel"].map(opt => (
                              <div
                                key={opt}
                                onClick={() => setOpenMenu(null)}
                                style={{
                                  padding: "9px 16px", fontSize: 13,
                                  color: opt === "Cancel" ? "#ef4444" : "#475569",
                                  cursor: "pointer",
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                                onMouseLeave={e => e.currentTarget.style.background = ""}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── TRANSACTIONS TABLE ── */}
        {activeTab === "transactions" && (
          <div className="tab-table">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Description</th>
                  <th>Paid Date</th>
                  <th>Payment Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(txn => (
                  <tr key={txn.id}>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>{txn.id}</td>
                    <td>{txn.desc}</td>
                    <td>{txn.date}</td>
                    <td>{txn.method}</td>
                    <td style={{ fontWeight: 700, color: "#1e293b" }}>{txn.amount}</td>
                    <td>
                      <span className={`txn-status ${txn.status.toLowerCase()}`}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ── */}
        <div className="tab-pagination">
          <div className="page-info">
            Row Per Page
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
            >
              {ROWS_OPTIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            Entries
          </div>

          <div className="page-nav">
            <button
              className="page-btn"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeftIcon />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`page-btn ${page === p ? "active" : ""}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}