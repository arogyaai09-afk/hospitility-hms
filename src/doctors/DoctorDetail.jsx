import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarBookmarkIcon from "@mui/icons-material/CalendarMonth";
import BadgeIcon from "@mui/icons-material/Badge";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CakeIcon from "@mui/icons-material/Cake";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import WorkIcon from "@mui/icons-material/Work";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VerifiedIcon from "@mui/icons-material/Verified";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const doctorsData = {
  1: {
    id: 1,
    name: "Dr. John Smith",
    degree: "MBBS, M.D, Cardiology",
    department: "Cardiology",
    clinic: "Downtown Medical Clinic",
    status: "Available",
    charge: 499,
    duration: "30 Min",
    color: "#3b82f6",
    bio: `Dr. John Smith has been practicing family medicine for over 10 years. She has extensive experience in managing chronic illnesses, preventive care, and treating a wide range of medical conditions for patients of all ages.\n\nDr. Smith is dedicated to providing patient-centered care and emphasizes building long-term relationships with her patients.`,
    availability: {
      Monday:    ["11:30 AM - 12:30 PM", "06:00 PM - 07:30 PM"],
      Tuesday:   ["12:30 PM - 01:30 PM", "07:00 PM - 08:30 PM"],
      Wednesday: ["02:30 PM - 03:30 PM", "09:00 PM - 11:00 PM"],
      Thursday:  ["04:30 PM - 05:30 PM", "11:00 PM - 11:30 PM"],
      Friday:    ["10:00 AM - 11:00 AM", "03:00 PM - 04:00 PM"],
      Saturday:  ["09:00 AM - 10:30 AM"],
      Sunday:    [],
    },
    about: {
      licenseNumber: "ML566659898",
      phone: "+1 54546 45648",
      email: "john@example.com",
      location: "4150 Hiney Road, Las Vegas, NV 89109",
      dob: "25 Jan 1990",
      bloodGroup: "O +ve",
      experience: "10+ Years",
    },
    education: [
      { name: "Boston Medicine Institutuion - MD",       dates: "25 May 1990 - 29 Jan 1992", dot: "filled" },
      { name: "Harvard Medical School, Boston - MBBS",   dates: "25 May 1985 - 29 Jan 1990", dot: "outline" },
    ],
    awards: [
      { name: "Top Doctor Award (2023)",       desc: "Recognized by U.S. News & World Report for outstanding achievements in family medicine." },
      { name: "Patient Choice Award (2022)",   desc: "Awarded by Vitals.com for consistently receiving high patient ratings in satisfaction and care." },
    ],
    certifications: [
      { name: "Certification by the American Board of Family Medicine (ABFM), 2015", desc: "Demonstrates mastery of comprehensive, ongoing care for individuals and families, across all ages and genders." },
      { name: "American Heart Association, 2024",                                    desc: "Certification in performing life-saving techniques, including CPR and emergency cardiac care for adults and children." },
    ],
  },
  2: {
    id: 2,
    name: "Dr. Sarah Johnson",
    degree: "MBBS, M.S, Orthopedics",
    department: "Orthopedics",
    clinic: "City Medical Center",
    status: "Available",
    charge: 512,
    duration: "45 Min",
    color: "#10b981",
    bio: "Dr. Sarah Johnson is a highly skilled Orthopedic Surgeon with over 8 years of experience in treating musculoskeletal conditions, sports injuries, and joint replacements.\n\nShe is committed to helping patients regain mobility and improve their quality of life through advanced surgical and non-surgical treatments.",
    availability: {
      Monday:    ["09:00 AM - 11:00 AM", "02:00 PM - 04:00 PM"],
      Tuesday:   ["10:00 AM - 12:00 PM"],
      Wednesday: ["09:00 AM - 01:00 PM"],
      Thursday:  ["02:00 PM - 05:00 PM"],
      Friday:    ["09:00 AM - 11:00 AM"],
      Saturday:  ["10:00 AM - 12:00 PM"],
      Sunday:    [],
    },
    about: {
      licenseNumber: "ML123456789",
      phone: "+1 43554 54584",
      email: "sarah@example.com",
      location: "200 Main Street, Chicago, IL 60601",
      dob: "10 Mar 1985",
      bloodGroup: "A +ve",
      experience: "8+ Years",
    },
    education: [
      { name: "Johns Hopkins University - M.S Orthopedics", dates: "10 Jun 2010 - 15 Aug 2012", dot: "filled" },
      { name: "University of Chicago - MBBS",               dates: "01 Sep 2003 - 30 May 2009", dot: "outline" },
    ],
    awards: [
      { name: "Best Orthopedic Surgeon Award (2022)", desc: "Awarded by Medical Excellence Foundation for outstanding contributions to orthopedic care." },
    ],
    certifications: [
      { name: "American Board of Orthopedic Surgery, 2013", desc: "Board certified in orthopedic surgery with specialization in sports medicine and joint replacement." },
    ],
  },
};

// Fallback for other doctor IDs
const defaultDoctor = {
  id: 0,
  name: "Dr. Emily Carter",
  degree: "MBBS, M.D, Pediatrics",
  department: "Pediatrics",
  clinic: "Children's Health Clinic",
  status: "Available",
  charge: 300,
  duration: "30 Min",
  color: "#8b5cf6",
  bio: "Dr. Emily Carter is a compassionate Pediatrician with over 6 years of experience caring for children from newborns to adolescents.\n\nShe specializes in developmental pediatrics and preventive healthcare, ensuring every child gets the best possible start in life.",
  availability: {
    Monday:    ["09:00 AM - 11:00 AM"],
    Tuesday:   ["10:00 AM - 12:00 PM"],
    Wednesday: ["02:00 PM - 04:00 PM"],
    Thursday:  ["09:00 AM - 11:00 AM"],
    Friday:    ["01:00 PM - 03:00 PM"],
    Saturday:  [],
    Sunday:    [],
  },
  about: {
    licenseNumber: "ML987654321",
    phone: "+1 47554 54585",
    email: "emily@example.com",
    location: "88 Pediatric Ave, Boston, MA 02101",
    dob: "22 Jun 1988",
    bloodGroup: "B +ve",
    experience: "6+ Years",
  },
  education: [
    { name: "Boston Children's Hospital - MD Pediatrics", dates: "01 Jul 2014 - 30 Jun 2017", dot: "filled" },
    { name: "Harvard Medical School - MBBS",              dates: "01 Sep 2007 - 30 May 2013", dot: "outline" },
  ],
  awards: [
    { name: "Best Pediatrician Award (2023)", desc: "Recognized for excellence in pediatric care and patient satisfaction." },
  ],
  certifications: [
    { name: "American Board of Pediatrics, 2017", desc: "Board certified in general pediatrics with focus on developmental and behavioral health." },
  ],
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DoctorDetails() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const doc = doctorsData[id] || defaultDoctor;

  const [activeDay, setActiveDay] = useState("Monday");
  const [bioExpanded, setBioExpanded] = useState(false);

  const bioLines = doc.bio.split("\n\n");
  const bioShort = bioLines[0];
  const bioFull  = doc.bio;
  const hasBioMore = bioLines.length > 1;

  const aboutItems = [
    { icon: <BadgeIcon />,        label: "Medical Liscence Number", value: doc.about.licenseNumber },
    { icon: <PhoneIcon />,        label: "Phone Number",            value: doc.about.phone         },
    { icon: <EmailIcon />,        label: "Email Address",           value: doc.about.email         },
    { icon: <LocationOnIcon />,   label: "Location",                value: doc.about.location      },
    { icon: <CakeIcon />,         label: "DOB",                     value: doc.about.dob           },
    { icon: <BloodtypeIcon />,    label: "Blood Group",             value: doc.about.bloodGroup    },
    { icon: <WorkIcon />,         label: "Year of Experience",      value: doc.about.experience    },
  ];

  return (
    <div className="doctor-details-page">

      {/* Breadcrumb */}
      <div className="breadcrumb" onClick={() => navigate("/doctors")}>
        <ArrowBackIosNewIcon /> Doctors
      </div>

      {/* ── Profile Hero ── */}
      <div className="profile-hero">
        <div className="hero-img" style={{ background: doc.color + "18" }}>
          <span className="hero-initials" style={{ color: doc.color }}>
            {doc.name.split(" ").slice(1, 3).map(w => w[0]).join("")}
          </span>
        </div>

        <div className="hero-info">
          <div className="hero-name-row">
            <h2>{doc.name}</h2>
            <span className="dept-badge">{doc.department}</span>
          </div>
          <div className="hero-degree">{doc.degree}</div>
          <div className="hero-meta">
            <div className="meta-item">
              <BusinessIcon />
              Clinic : {doc.clinic}
            </div>
            <div className="meta-item available">
              <span className="avail-dot" />
              {doc.status}
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="charge-label">Consultation Charge</div>
          <div className="charge-value">
            ${doc.charge} <span>/ {doc.duration}</span>
          </div>
          <button className="btn-book">
            <CalendarBookmarkIcon /> Book Apppointment
          </button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="details-layout">

        {/* LEFT COLUMN */}
        <div className="details-left">

          {/* Availability */}
          <div className="detail-card avail-card">
            <div className="dc-title">Availability</div>
            <div className="avail-tabs-row">
              {DAYS.map(day => (
                <div
                  key={day}
                  className={`avail-tab ${activeDay === day ? "active" : ""}`}
                  onClick={() => setActiveDay(day)}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="avail-slots-grid">
              {doc.availability[activeDay] && doc.availability[activeDay].length > 0
                ? doc.availability[activeDay].map((slot, i) => (
                    <div className="time-slot" key={i}>{slot}</div>
                  ))
                : (
                    <div style={{ gridColumn: "1/-1", padding: "10px 0", color: "#94a3b8", fontSize: 13 }}>
                      No slots available on {activeDay}
                    </div>
                  )
              }
            </div>
          </div>

          {/* Short Bio */}
          <div className="detail-card bio-card">
            <div className="dc-title">Short Bio</div>
            <div className="dc-body">
              <div className={`bio-text ${!bioExpanded && hasBioMore ? "clamped" : ""}`}>
                {bioExpanded ? bioFull : bioShort}
              </div>
              {hasBioMore && (
                <span
                  className="bio-toggle"
                  onClick={() => setBioExpanded(p => !p)}
                >
                  {bioExpanded ? "Less" : "More"}
                </span>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="detail-card edu-card">
            <div className="dc-title">Education Information</div>
            <div className="dc-body">
              <div className="edu-list">
                {doc.education.map((edu, i) => (
                  <div className="edu-item" key={i}>
                    <span className={`edu-dot ${edu.dot}`} />
                    <div className="edu-info">
                      <div className="edu-name">{edu.name}</div>
                      <div className="edu-date">{edu.dates}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Awards */}
          <div className="detail-card awards-card">
            <div className="dc-title">Awards & Recognition</div>
            <div className="dc-body">
              <div className="award-list">
                {doc.awards.map((award, i) => (
                  <div className="award-item" key={i}>
                    <EmojiEventsIcon className="award-icon" />
                    <div className="award-info">
                      <div className="award-name">{award.name}</div>
                      <div className="award-desc">{award.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="detail-card certs-card">
            <div className="dc-title">Certifications</div>
            <div className="dc-body">
              <div className="award-list">
                {doc.certifications.map((cert, i) => (
                  <div className="award-item" key={i}>
                    <VerifiedIcon className="cert-icon" />
                    <div className="award-info">
                      <div className="award-name">{cert.name}</div>
                      <div className="award-desc">{cert.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — About */}
        <div className="about-card">
          <div className="ac-title">About</div>
          <div className="about-list">
            {aboutItems.map((item, i) => (
              <div className="about-item" key={i}>
                <div className="about-icon">{item.icon}</div>
                <div className="about-content">
                  <div className="about-label">{item.label}</div>
                  <div className="about-value">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}