//doctors/DoctorDetail.jsx
import { useState, useEffect } from "react";
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
import { getDoctorById } from "../api/doctors";

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DoctorDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeDay, setActiveDay] = useState("Monday");
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDoctorById(id);

        const doctorData = response?.data?.data || response?.data || null;

        setDoc({
          id: doctorData._id,
          name: doctorData.name || "",
          degree: doctorData.specialization || "",
          department: doctorData.specialization || "",
          clinic: "",
          status: "",
          charge: "",
          duration: "",
          color: "#3b82f6",
          bio: "",
          availability: {},
          about: {
            licenseNumber: "",
            phone: doctorData.phone || "",
            email: doctorData.email || "",
            location: "",
            dob: "",
            bloodGroup: "",
            experience: "",
          },
          education: [],
          awards: [],
          certifications: [],
        });
      } catch (error) {
        console.error("Doctor detail API error:", error);

        setError(error?.message || error?.error || "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  if (loading) {
    return <div>Loading doctor...</div>;
  }

  if (error || !doc) {
    return <div>{error || "Doctor not found"}</div>;
  }

  const bioLines = doc?.bio ? doc.bio.split("\n\n") : [];
  const bioShort = bioLines[0] || "";
  const bioFull = doc?.bio || "";
  const hasBioMore = bioLines.length > 1;

  const aboutItems = [
    {
      icon: <BadgeIcon />,
      label: "Medical Liscence Number",
      value: doc.about.licenseNumber,
    },
    { icon: <PhoneIcon />, label: "Phone Number", value: doc.about.phone },
    { icon: <EmailIcon />, label: "Email Address", value: doc.about.email },
    { icon: <LocationOnIcon />, label: "Location", value: doc.about.location },
    { icon: <CakeIcon />, label: "DOB", value: doc.about.dob },
    {
      icon: <BloodtypeIcon />,
      label: "Blood Group",
      value: doc.about.bloodGroup,
    },
    {
      icon: <WorkIcon />,
      label: "Year of Experience",
      value: doc.about.experience,
    },
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
            {doc.name
              .split(" ")
              .slice(1, 3)
              .map((w) => w[0])
              .join("")}
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
            {doc.charge ? `$${doc.charge}` : "Not available"}
            {doc.charge && doc.duration && <span>/ {doc.duration}</span>}
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
              {DAYS.map((day) => (
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
              {doc.availability[activeDay] &&
              doc.availability[activeDay].length > 0 ? (
                doc.availability[activeDay].map((slot, i) => (
                  <div className="time-slot" key={i}>
                    {slot}
                  </div>
                ))
              ) : (
                <div
                  style={{
                    gridColumn: "1/-1",
                    padding: "10px 0",
                    color: "#94a3b8",
                    fontSize: 13,
                  }}
                >
                  No slots available on {activeDay}
                </div>
              )}
            </div>
          </div>

          {/* Short Bio */}
          <div className="detail-card bio-card">
            <div className="dc-title">Short Bio</div>
            <div className="dc-body">
              <div
                className={`bio-text ${!bioExpanded && hasBioMore ? "clamped" : ""}`}
              >
                {bioExpanded ? bioFull : bioShort}
              </div>
              {hasBioMore && (
                <span
                  className="bio-toggle"
                  onClick={() => setBioExpanded((p) => !p)}
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
