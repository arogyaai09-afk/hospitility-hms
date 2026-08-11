import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PersonIcon from "@mui/icons-material/Person";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DEPARTMENTS = ["Cardiology", "Orthopedics", "Pediatrics", "Gynecology", "Neurology", "Oncology", "Psychiatry", "Radiology", "Urology", "Pulmonology"];
const DESIGNATIONS = ["Cardiologist", "Orthopedic Surgeon", "Pediatrician", "Gynecologist", "Neurosurgeon", "Oncologist", "Psychiatrist", "Radiologist", "Urologist", "Pulmonologist"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GENDERS = ["Male", "Female", "Other"];
const COUNTRIES = ["United States", "United Kingdom", "India", "Canada", "Australia"];
const APPT_TYPES = ["Online", "In-Person", "Both"];
const SESSIONS = ["Morning", "Afternoon", "Evening", "Night"];

// ─── INITIAL STATES ───────────────────────────────────────────────────────────
const initContact = {
  profileImage: null, profilePreview: "",
  name: "", username: "", phone: "", email: "",
  dob: "", experience: "", department: "", designation: "",
  licenseNumber: "", languageSpoken: "", bloodGroup: "", gender: "",
  bio: "", featureOnWebsite: false,
};

const initAddress = {
  address1: "", address2: "",
  country: "", city: "", state: "", pincode: "",
};

const initAvailability = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: [{ session: "", from: "03:05", to: "03:05" }],
}), {});

const initAppointment = {
  type: "", advanceBookingDays: "", durationDays: "", durationMins: "",
  consultationCharge: "", maxBookingsPerSlot: "", displayOnBooking: false,
};

const initEducation = [{ degree: "", university: "", from: "", to: "" }];
const initAwards    = [{ name: "", from: "" }];
const initCerts     = [{ name: "", from: "" }];

// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validateContact(data) {
  const errs = {};
  if (!data.name.trim())         errs.name         = "Name is required";
  if (!data.username.trim())     errs.username     = "Username is required";
  if (!data.phone.trim())        errs.phone        = "Phone number is required";
  else if (!/^\+?[\d\s\-]{7,15}$/.test(data.phone)) errs.phone = "Invalid phone number";
  if (!data.email.trim())        errs.email        = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Invalid email address";
  if (!data.dob)                 errs.dob          = "Date of birth is required";
  if (!data.experience.trim())   errs.experience   = "Year of experience is required";
  if (!data.department)          errs.department   = "Department is required";
  if (!data.designation)         errs.designation  = "Designation is required";
  if (!data.licenseNumber.trim()) errs.licenseNumber = "License number is required";
  if (!data.bloodGroup)          errs.bloodGroup   = "Blood group is required";
  if (!data.gender)              errs.gender       = "Gender is required";
  return errs;
}

function validateAddress(data) {
  const errs = {};
  if (!data.address1.trim()) errs.address1 = "Address is required";
  if (!data.country)         errs.country  = "Country is required";
  if (!data.city)            errs.city     = "City is required";
  if (!data.state)           errs.state    = "State is required";
  if (!data.pincode.trim())  errs.pincode  = "Pincode is required";
  else if (!/^\d{4,10}$/.test(data.pincode)) errs.pincode = "Invalid pincode";
  return errs;
}

function validateAppointment(data) {
  const errs = {};
  if (!data.type) errs.type = "Appointment type is required";
  if (!data.consultationCharge.trim()) errs.consultationCharge = "Consultation charge is required";
  else if (isNaN(data.consultationCharge)) errs.consultationCharge = "Must be a number";
  return errs;
}

// ─── REUSABLE FIELD COMPONENTS ────────────────────────────────────────────────
function FormGroup({ label, required, error, children }) {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}{required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

function InputField({ label, required, error, type = "text", ...props }) {
  return (
    <FormGroup label={label} required={required} error={error}>
      <input type={type} className={error ? "error" : ""} {...props} />
    </FormGroup>
  );
}

function SelectField({ label, required, error, options, placeholder = "Select", ...props }) {
  return (
    <FormGroup label={label} required={required} error={error}>
      <select className={error ? "error" : ""} {...props}>
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </FormGroup>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AddDoctor() {
  const navigate = useNavigate();

  // Form state
  const [contact,      setContact]      = useState(initContact);
  const [address,      setAddress]      = useState(initAddress);
  const [availability, setAvailability] = useState(initAvailability);
  const [activeDay,    setActiveDay]    = useState("Thursday");
  const [appointment,  setAppointment]  = useState(initAppointment);
  const [education,    setEducation]    = useState(initEducation);
  const [awards,       setAwards]       = useState(initAwards);
  const [certs,        setCerts]        = useState(initCerts);

  // Error state
  const [contactErrors,    setContactErrors]    = useState({});
  const [addressErrors,    setAddressErrors]    = useState({});
  const [appointmentErrors,setAppointmentErrors]= useState({});
  const [submitted,        setSubmitted]        = useState(false);

  // ── Handlers ──
  const handleContact = (field, val) => {
    setContact(p => ({ ...p, [field]: val }));
    if (contactErrors[field]) setContactErrors(p => ({ ...p, [field]: "" }));
  };

  const handleAddress = (field, val) => {
    setAddress(p => ({ ...p, [field]: val }));
    if (addressErrors[field]) setAddressErrors(p => ({ ...p, [field]: "" }));
  };

  const handleAppointment = (field, val) => {
    setAppointment(p => ({ ...p, [field]: val }));
    if (appointmentErrors[field]) setAppointmentErrors(p => ({ ...p, [field]: "" }));
  };

  // Profile image
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setContact(p => ({ ...p, profileImage: file, profilePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  // ── Availability slots ──
  const addSlot = (day) =>
    setAvailability(p => ({ ...p, [day]: [...p[day], { session: "", from: "03:05", to: "03:05" }] }));

  const removeSlot = (day, idx) =>
    setAvailability(p => ({ ...p, [day]: p[day].filter((_, i) => i !== idx) }));

  const updateSlot = (day, idx, field, val) =>
    setAvailability(p => ({
      ...p,
      [day]: p[day].map((s, i) => i === idx ? { ...s, [field]: val } : s),
    }));

  const applyAll = () => {
    const template = availability[activeDay];
    const updated = DAYS.reduce((acc, d) => ({ ...acc, [d]: template.map(s => ({ ...s })) }), {});
    setAvailability(updated);
  };

  // ── Dynamic rows ──
  const addRow    = (setter, blank) => setter(p => [...p, { ...blank }]);
  const removeRow = (setter, idx)   => setter(p => p.filter((_, i) => i !== idx));
  const updateRow = (setter, idx, field, val) =>
    setter(p => p.map((r, i) => i === idx ? { ...r, [field]: val } : r));

  // ── Submit ──
  const handleSubmit = () => {
    const cErr = validateContact(contact);
    const aErr = validateAddress(address);
    const apErr = validateAppointment(appointment);

    setContactErrors(cErr);
    setAddressErrors(aErr);
    setAppointmentErrors(apErr);
    setSubmitted(true);

    if (Object.keys(cErr).length === 0 && Object.keys(aErr).length === 0 && Object.keys(apErr).length === 0) {
      alert("Doctor added successfully!");
      navigate("/doctors");
    } else {
      // Scroll to first error
      const firstErr = document.querySelector(".error");
      if (firstErr) firstErr.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="add-doctor-page">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/doctors")}>
          <ArrowBackIosNewIcon /> Doctor
        </span>
      </div>

      <div className="form-card">
        <div className="form-card-title">New Doctor</div>

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — Contact Information
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Contact Information</div>

          {/* Profile Image */}
          <div className="profile-upload">
            <span className="upload-label">Profile Image</span>
            <div className="upload-circle">
              {contact.profilePreview
                ? <img src={contact.profilePreview} alt="preview" />
                : <PersonIcon className="upload-icon" />
              }
              <div className="upload-cam"><CameraAltIcon /></div>
              <input type="file" accept="image/*" onChange={handleImage} />
            </div>
          </div>

          <div className="form-row">
            <InputField
              label="Name" required
              placeholder="Enter full name"
              value={contact.name}
              onChange={e => handleContact("name", e.target.value)}
              error={contactErrors.name}
            />
            <InputField
              label="Username" required
              placeholder="Enter username"
              value={contact.username}
              onChange={e => handleContact("username", e.target.value)}
              error={contactErrors.username}
            />
          </div>

          <div className="form-row">
            <InputField
              label="Phone Number" required type="tel"
              placeholder="Enter phone number"
              value={contact.phone}
              onChange={e => handleContact("phone", e.target.value)}
              error={contactErrors.phone}
            />
            <InputField
              label="Email Address" required type="email"
              placeholder="Enter email address"
              value={contact.email}
              onChange={e => handleContact("email", e.target.value)}
              error={contactErrors.email}
            />
          </div>

          <div className="form-row">
            <FormGroup label="DOB" required error={contactErrors.dob}>
              <div className="input-icon-wrap">
                <input
                  type="date"
                  className={contactErrors.dob ? "error" : ""}
                  value={contact.dob}
                  onChange={e => handleContact("dob", e.target.value)}
                />
                <span className="input-icon"><CalendarTodayIcon /></span>
              </div>
            </FormGroup>
            <InputField
              label="Year Of Experience" required type="number"
              placeholder="e.g. 5"
              value={contact.experience}
              onChange={e => handleContact("experience", e.target.value)}
              error={contactErrors.experience}
            />
          </div>

          <div className="form-row">
            <SelectField
              label="Department" required
              options={DEPARTMENTS}
              value={contact.department}
              onChange={e => handleContact("department", e.target.value)}
              error={contactErrors.department}
            />
            <SelectField
              label="Designation" required
              options={DESIGNATIONS}
              value={contact.designation}
              onChange={e => handleContact("designation", e.target.value)}
              error={contactErrors.designation}
            />
          </div>

          <div className="form-row">
            <InputField
              label="Medical License Number" required
              placeholder="Enter license number"
              value={contact.licenseNumber}
              onChange={e => handleContact("licenseNumber", e.target.value)}
              error={contactErrors.licenseNumber}
            />
            <InputField
              label="Language Spoken"
              placeholder="e.g. English, French"
              value={contact.languageSpoken}
              onChange={e => handleContact("languageSpoken", e.target.value)}
            />
          </div>

          <div className="form-row">
            <SelectField
              label="Blood Group" required
              options={BLOOD_GROUPS}
              value={contact.bloodGroup}
              onChange={e => handleContact("bloodGroup", e.target.value)}
              error={contactErrors.bloodGroup}
            />
            <SelectField
              label="Gender" required
              options={GENDERS}
              value={contact.gender}
              onChange={e => handleContact("gender", e.target.value)}
              error={contactErrors.gender}
            />
          </div>

          <div className="form-row single">
            <FormGroup label="Bio">
              <textarea
                placeholder="About Doctor"
                value={contact.bio}
                onChange={e => handleContact("bio", e.target.value)}
              />
            </FormGroup>
          </div>

          {/* Feature on website toggle */}
          <div
            className="feature-toggle"
            onClick={() => handleContact("featureOnWebsite", !contact.featureOnWebsite)}
          >
            <div className={`toggle-box ${contact.featureOnWebsite ? "checked" : ""}`}>
              {contact.featureOnWebsite && <CheckIcon />}
            </div>
            <span>Feature On Website</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — Address Information
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Address Information</div>

          <div className="form-row">
            <InputField
              label="Address 1" required
              placeholder="Street address, P.O. box"
              value={address.address1}
              onChange={e => handleAddress("address1", e.target.value)}
              error={addressErrors.address1}
            />
            <InputField
              label="Address 2"
              placeholder="Apartment, suite, unit, building"
              value={address.address2}
              onChange={e => handleAddress("address2", e.target.value)}
            />
          </div>

          <div className="form-row">
            <SelectField
              label="Country" required
              options={COUNTRIES}
              value={address.country}
              onChange={e => handleAddress("country", e.target.value)}
              error={addressErrors.country}
            />
            <SelectField
              label="City" required
              options={["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"]}
              value={address.city}
              onChange={e => handleAddress("city", e.target.value)}
              error={addressErrors.city}
            />
          </div>

          <div className="form-row">
            <SelectField
              label="State" required
              options={["California", "New York", "Texas", "Florida", "Illinois"]}
              value={address.state}
              onChange={e => handleAddress("state", e.target.value)}
              error={addressErrors.state}
            />
            <InputField
              label="Pincode" required type="number"
              placeholder="Enter pincode"
              value={address.pincode}
              onChange={e => handleAddress("pincode", e.target.value)}
              error={addressErrors.pincode}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — Availability / Schedule
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Address Information</div>

          {/* Day tabs */}
          <div className="avail-tabs">
            {DAYS.map(day => (
              <button
                key={day}
                className={`avail-tab ${activeDay === day ? "active" : ""}`}
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Slot header */}
          <div className="avail-slots">
            <div className="slot-header">
              <span>Session</span>
              <span>From</span>
              <span>To</span>
              <span></span>
            </div>

            {availability[activeDay].map((slot, idx) => (
              <div className="slot-row" key={idx}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <select
                    value={slot.session}
                    onChange={e => updateSlot(activeDay, idx, "session", e.target.value)}
                  >
                    <option value="">Select</option>
                    {SESSIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div className="input-icon-wrap">
                    <input
                      type="time"
                      value={slot.from}
                      onChange={e => updateSlot(activeDay, idx, "from", e.target.value)}
                    />
                    <span className="input-icon"><AccessTimeIcon /></span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <div className="input-icon-wrap">
                    <input
                      type="time"
                      value={slot.to}
                      onChange={e => updateSlot(activeDay, idx, "to", e.target.value)}
                    />
                    <span className="input-icon"><AccessTimeIcon /></span>
                  </div>
                </div>

                <div className="slot-actions">
                  {idx === availability[activeDay].length - 1 && (
                    <button className="slot-btn add" onClick={() => addSlot(activeDay)}>
                      <AddIcon />
                    </button>
                  )}
                  {availability[activeDay].length > 1 && (
                    <button className="slot-btn remove" onClick={() => removeSlot(activeDay, idx)}>
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="btn-apply-all" onClick={applyAll}>Apply All</button>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — Appointment Information
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Appointment Information</div>

          <div className="form-row">
            <SelectField
              label="Appointment Type" required
              options={APPT_TYPES}
              value={appointment.type}
              onChange={e => handleAppointment("type", e.target.value)}
              error={appointmentErrors.type}
            />
          </div>

          <div className="form-row">
            <InputField
              label="Accept bookings (in Advance)"
              type="number"
              placeholder="Days"
              value={appointment.advanceBookingDays}
              onChange={e => handleAppointment("advanceBookingDays", e.target.value)}
            />
            <FormGroup label="Appointment Duration">
              <div className="duration-wrap">
                <input
                  type="number"
                  placeholder="Days"
                  value={appointment.durationDays}
                  onChange={e => handleAppointment("durationDays", e.target.value)}
                />
                <span className="dur-label">Days</span>
                <input
                  type="number"
                  placeholder="Mins"
                  value={appointment.durationMins}
                  onChange={e => handleAppointment("durationMins", e.target.value)}
                />
                <span className="dur-label">Mins</span>
              </div>
            </FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Consultation Charge" required error={appointmentErrors.consultationCharge}>
              <div className="input-icon-wrap">
                <input
                  type="number"
                  placeholder="0"
                  className={appointmentErrors.consultationCharge ? "error" : ""}
                  style={{ paddingLeft: 28 }}
                  value={appointment.consultationCharge}
                  onChange={e => handleAppointment("consultationCharge", e.target.value)}
                />
                <span className="input-icon" style={{ left: 10, right: "auto" }}>$</span>
              </div>
            </FormGroup>
            <InputField
              label="Max Bookings Per Slot"
              type="number"
              placeholder="e.g. 10"
              value={appointment.maxBookingsPerSlot}
              onChange={e => handleAppointment("maxBookingsPerSlot", e.target.value)}
            />
          </div>

          <div
            className="feature-toggle"
            onClick={() => handleAppointment("displayOnBooking", !appointment.displayOnBooking)}
          >
            <div className={`toggle-box ${appointment.displayOnBooking ? "checked" : ""}`}>
              {appointment.displayOnBooking && <CheckIcon />}
            </div>
            <span>Display on Booking Page</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — Educational Information
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Educational Information</div>
          <div className="dynamic-section">
            {education.map((row, idx) => (
              <div className="dynamic-row edu-row" key={idx}>
                <InputField
                  label={idx === 0 ? "Educational Degree" : ""}
                  placeholder="Degree"
                  value={row.degree}
                  onChange={e => updateRow(setEducation, idx, "degree", e.target.value)}
                />
                <InputField
                  label={idx === 0 ? "University" : ""}
                  placeholder="University"
                  value={row.university}
                  onChange={e => updateRow(setEducation, idx, "university", e.target.value)}
                />
                <FormGroup label={idx === 0 ? "From" : ""}>
                  <div className="input-icon-wrap">
                    <input type="date" value={row.from} onChange={e => updateRow(setEducation, idx, "from", e.target.value)} />
                    <span className="input-icon"><CalendarTodayIcon /></span>
                  </div>
                </FormGroup>
                <FormGroup label={idx === 0 ? "To" : ""}>
                  <div className="input-icon-wrap">
                    <input type="date" value={row.to} onChange={e => updateRow(setEducation, idx, "to", e.target.value)} />
                    <span className="input-icon"><CalendarTodayIcon /></span>
                  </div>
                </FormGroup>
                <div className="dr-actions">
                  {idx === education.length - 1 && (
                    <button className="add-btn" onClick={() => addRow(setEducation, { degree: "", university: "", from: "", to: "" })}>
                      <AddIcon />
                    </button>
                  )}
                  {education.length > 1 && (
                    <button className="remove-btn" onClick={() => removeRow(setEducation, idx)}>
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — Awards & Recognition
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Awards & Recognition</div>
          <div className="dynamic-section">
            {awards.map((row, idx) => (
              <div className="dynamic-row award-row" key={idx}>
                <InputField
                  label={idx === 0 ? "Name" : ""}
                  placeholder="Award name"
                  value={row.name}
                  onChange={e => updateRow(setAwards, idx, "name", e.target.value)}
                />
                <FormGroup label={idx === 0 ? "From" : ""}>
                  <div className="input-icon-wrap">
                    <input type="date" value={row.from} onChange={e => updateRow(setAwards, idx, "from", e.target.value)} />
                    <span className="input-icon"><CalendarTodayIcon /></span>
                  </div>
                </FormGroup>
                <div className="dr-actions">
                  {idx === awards.length - 1 && (
                    <button className="add-btn" onClick={() => addRow(setAwards, { name: "", from: "" })}>
                      <AddIcon />
                    </button>
                  )}
                  {awards.length > 1 && (
                    <button className="remove-btn" onClick={() => removeRow(setAwards, idx)}>
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — Certifications
        ══════════════════════════════════════════════════════ */}
        <div className="form-section">
          <div className="section-title">Certifications</div>
          <div className="dynamic-section">
            {certs.map((row, idx) => (
              <div className="dynamic-row cert-row" key={idx}>
                <InputField
                  label={idx === 0 ? "Name" : ""}
                  placeholder="Certification name"
                  value={row.name}
                  onChange={e => updateRow(setCerts, idx, "name", e.target.value)}
                />
                <FormGroup label={idx === 0 ? "From" : ""}>
                  <div className="input-icon-wrap">
                    <input type="date" value={row.from} onChange={e => updateRow(setCerts, idx, "from", e.target.value)} />
                    <span className="input-icon"><CalendarTodayIcon /></span>
                  </div>
                </FormGroup>
                <div className="dr-actions">
                  {idx === certs.length - 1 && (
                    <button className="add-btn" onClick={() => addRow(setCerts, { name: "", from: "" })}>
                      <AddIcon />
                    </button>
                  )}
                  {certs.length > 1 && (
                    <button className="remove-btn" onClick={() => removeRow(setCerts, idx)}>
                      <DeleteIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORM FOOTER ── */}
      <div className="form-footer">
        <button className="btn-cancel-form" onClick={() => navigate("/doctors")}>
          Cancel
        </button>
        <button className="btn-submit" onClick={handleSubmit}>
          Add Doctor
        </button>
      </div>
    </div>
  );
}