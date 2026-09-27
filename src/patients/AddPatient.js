// AddPatient.js
import { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PersonIcon from "@mui/icons-material/Person";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { createPatient } from "../api/patients";
import { getDoctors } from "../api/doctors";
import { useToast } from "../context/ToastContext";
import { uploadFile } from "../api/storage";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const GENDERS = ["Male", "Female", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const STATUSES = ["Available", "Unavailable"];
const DEPARTMENTS = [
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Gynecology",
  "Neurology",
  "Oncology",
  "Psychiatry",
  "Radiology",
  "Urology",
  "Pulmonology",
];

const SPECIALIZATION_TO_DEPARTMENT = {
  Cardiologist: "Cardiology",
  "Orthopedic Surgeon": "Orthopedics",
  Pediatrician: "Pediatrics",
  Gynecologist: "Gynecology",
  Neurosurgeon: "Neurology",
  Oncologist: "Oncology",
  Psychiatrist: "Psychiatry",
  Radiologist: "Radiology",
  Urologist: "Urology",
  Pulmonologist: "Pulmonology",
};

const COUNTRIES = Country.getAllCountries();
// ─── VALIDATION ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.firstName.trim()) e.firstName = "First name is required";
  if (!form.lastName.trim()) e.lastName = "Last name is required";
  if (!form.phone.trim()) e.phone = "Phone number is required";
  else if (!/^\d{6,15}$/.test(form.phone.trim()))
    e.phone = "Enter a valid phone number";
  if (!form.email.trim()) e.email = "Email address is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Enter a valid email address";
  if (!form.primaryDoctor) e.primaryDoctor = "Primary doctor is required";
  if (!form.dob) e.dob = "Date of birth is required";
  if (!form.gender) e.gender = "Gender is required";
  if (!form.bloodGroup) e.bloodGroup = "Blood group is required";
  if (!form.status) e.status = "Status is required";
  if (!form.address1.trim()) e.address1 = "Address 1 is required";
  if (!form.address2.trim()) e.address2 = "Address 2 is required";
  if (!form.country) e.country = "Country is required";
  if (!form.state) e.state = "State is required";
  if (!form.city) e.city = "City is required";
  if (!form.pincode.trim()) e.pincode = "Pincode is required";
  else if (!/^\d{4,10}$/.test(form.pincode.trim()))
    e.pincode = "Enter a valid pincode";
  return e;
}

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function FormGroup({ label, required, error, children }) {
  return (
    <div className="form-group">
      {label && (
        <label>
          {label}
          {required && <span className="req"> *</span>}
        </label>
      )}
      {children}
      {error && <span className="error-msg">{error}</span>}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CreatePatient() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    profileImage: null, profilePreview: "",
    firstName: "", lastName: "",
    countryCode: "+91",
    countryCodeIso: "IN",
    phone: "",
    email: "",
    department: "",
    primaryDoctor: "",
    dob: "",
    gender: "",
    bloodGroup: "",
    status: "",
    address1: "", address2: "",
    country: "", state: "", city: "", pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [statusOpen, setStatusOpen] = useState(false);
  const [ccOpen, setCcOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setDoctorsLoading(true);

        const response = await getDoctors();

        console.log("Doctors API response:", response);

        if (response?.status === "success") {
          const doctorList = response.data || [];

          console.log("Doctors list for dropdown:", doctorList);
          setDoctors(doctorList);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error("Doctors fetch error:", error);
        setDoctors([]);
      } finally {
        setDoctorsLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!form.country) {
      setStates([]);
      setCities([]);
      return;
    }

    const selectedCountry = COUNTRIES.find(
      (country) => country.name === form.country
    );

    if (!selectedCountry) {
      setStates([]);
      setCities([]);
      return;
    }

    const countryStates = State.getStatesOfCountry(
      selectedCountry.isoCode
    );

    setStates(countryStates);
    setCities([]);
  }, [form.country]);

  useEffect(() => {
    if (!form.country || !form.state) {
      setCities([]);
      return;
    }

    const selectedCountry = COUNTRIES.find(
      (country) => country.name === form.country
    );

    const selectedState = states.find(
      (state) => state.name === form.state
    );

    if (!selectedCountry || !selectedState) {
      setCities([]);
      return;
    }

    const stateCities = City.getCitiesOfState(
      selectedCountry.isoCode,
      selectedState.isoCode
    );

    setCities(stateCities);
  }, [form.country, form.state, states]);

  // ── field updater ──
  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: "" }));
  };

  // ── profile image ──
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(p => ({ ...p, profileImage: file, profilePreview: reader.result }));
    reader.readAsDataURL(file);
  };

  // ── submit ──
  // ── submit ──
  const handleSubmit = async () => {
    const errs = validate(form);
    setErrors(errs);

    if (Object.keys(errs).length !== 0) {
      const first = document.querySelector(".error");

      if (first) {
        first.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        first.focus?.();
      }

      return;
    }

    try {
      let profileImageUrl = "";

      // 1️⃣ Upload profile image first, if selected
      if (form.profileImage) {
        const uploadResponse = await uploadFile(
          form.profileImage,
          "images"
        );

        console.log("Profile image upload response:", uploadResponse);

        if (uploadResponse?.status !== "success") {
          throw new Error(
            uploadResponse?.message || "Failed to upload profile image"
          );
        }

        // Storage API ka returned URL
        profileImageUrl =
          uploadResponse?.data?.url ||
          uploadResponse?.data?.fileUrl ||
          uploadResponse?.data?.path ||
          "";
      }

      // 2️⃣ Create patient
      const patientPayload = {
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        phone: `${form.countryCode}${form.phone.trim()}`,
        gender: form.gender.toLowerCase(),
        dateOfBirth: form.dob,

        address: [
          form.address1.trim(),
          form.address2.trim(),
          form.city,
          form.state,
          form.country,
          form.pincode,
        ]
          .filter(Boolean)
          .join(", "),

        bloodGroup: form.bloodGroup,

        status:
          form.status === "Available"
            ? "active"
            : "inactive",
      };

      // Only send profileImage when upload succeeded
      if (profileImageUrl) {
        patientPayload.profileImage = profileImageUrl;
      }

      console.log("Create patient payload:", patientPayload);

      const response = await createPatient(patientPayload);

      console.log("Create patient response:", response);

      if (response?.status === "success") {
        const createdPatient = response?.data;

        console.log(
          "Created patient:",
          createdPatient
        );

        showToast(
          `Patient added successfully${createdPatient?.patientCode
            ? ` - ${createdPatient.patientCode}`
            : ""
          }`,
          "success"
        );

        navigate("/patients");
      } else {
        throw new Error(
          response?.message ||
          "Failed to create patient"
        );
      }
    } catch (error) {
      console.error(
        "Create patient error:",
        error
      );

      showToast(
        error?.message ||
        "Failed to create patient",
        "error"
      );
    }
  };

  const selectedCC =
    COUNTRIES.find(
      (country) => country.isoCode === form.countryCodeIso
    ) ||
    COUNTRIES.find((country) => country.isoCode === "IN") ||
    COUNTRIES[0];

  return (
    <div className="add-doctor-page">

      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="bc-back" onClick={() => navigate("/patients")}>
          <ArrowBackIosNewIcon /> Patients
        </span>
      </div>

      <div className="form-card">
        <div className="form-section">
          <div className="section-title" style={{ paddingTop: 8 }}>Patient Information</div>

          {/* ── Profile Image ── */}
          <div className="profile-upload">
            <span className="upload-label">Profile Image</span>
            <div className="upload-circle">
              {form.profilePreview
                ? <img src={form.profilePreview} alt="preview" />
                : <PersonIcon className="upload-icon" />}
              <div className="upload-cam"><CameraAltIcon /></div>
              <input type="file" accept="image/*" onChange={handleImage} />
            </div>
          </div>

          {/* Row 1 — First Name / Last Name */}
          <div className="form-row">
            <FormGroup label="First Name" required error={errors.firstName}>
              <input
                type="text"
                className={errors.firstName ? "error" : ""}
                placeholder="Enter first name"
                value={form.firstName}
                onChange={e => set("firstName", e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Last Name" required error={errors.lastName}>
              <input
                type="text"
                className={errors.lastName ? "error" : ""}
                placeholder="Enter last name"
                value={form.lastName}
                onChange={e => set("lastName", e.target.value)}
              />
            </FormGroup>
          </div>

          {/* Row 2 — Phone / Email */}
          <div className="form-row">
            <FormGroup label="Phone Number" required error={errors.phone}>
              <div style={{ display: "flex", gap: 8 }}>
                {/* Country code picker */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setCcOpen(o => !o)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      height: "100%",
                      padding: "9px 10px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "white",
                      cursor: "pointer",
                      fontSize: 13,
                      fontFamily: "inherit",
                      color: "#1e293b",
                      minWidth: 90,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>
                      {selectedCC.flag}
                    </span>

                    <span>
                      +{selectedCC.phonecode}
                    </span>

                    <KeyboardArrowDownIcon
                      style={{
                        fontSize: 14,
                        color: "#94a3b8",
                      }}
                    />
                  </button>

                  {ccOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        zIndex: 50,
                        width: 300,
                        maxHeight: 350,
                        overflowY: "auto",
                      }}
                    >
                      {COUNTRIES.map((country) => (
                        <div
                          key={country.isoCode}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              countryCode: country.phonecode,
                              countryCodeIso: country.isoCode,
                            }));

                            setCcOpen(false);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 12px",
                            cursor: "pointer",
                            fontSize: 13,
                            color: "#475569",
                            whiteSpace: "nowrap",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#f8fafc";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "";
                          }}
                        >
                          {/* Flag */}
                          <span
                            style={{
                              fontSize: 16,
                              width: 24,
                            }}
                          >
                            {country.flag}
                          </span>

                          {/* Country name */}
                          <span
                            style={{
                              flex: 1,
                            }}
                          >
                            {country.name}
                          </span>

                          {/* Country code */}
                          <span
                            style={{
                              color: "#94a3b8",
                              minWidth: 55,
                              textAlign: "right",
                            }}
                          >
                            +{country.phonecode}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="tel"
                  className={errors.phone ? "error" : ""}
                  placeholder="98765 43210"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  style={{ flex: 1 }}
                />
              </div>
            </FormGroup>

            <FormGroup label="Email Address" required error={errors.email}>
              <input
                type="email"
                className={errors.email ? "error" : ""}
                placeholder="Enter email address"
                value={form.email}
                onChange={e => set("email", e.target.value)}
              />
            </FormGroup>
          </div>

          <div className="form-row">
            <FormGroup label="Department" required error={errors.department}>
              <select
                className={errors.department ? "error" : ""}
                value={form.department}
                onChange={(e) => {
                  const department = e.target.value;

                  setForm((current) => ({
                    ...current,
                    department,
                    primaryDoctor: "",
                  }));

                  if (errors.department) {
                    setErrors((current) => ({
                      ...current,
                      department: "",
                      primaryDoctor: "",
                    }));
                  }
                }}
              >
                <option value="">Select</option>

                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </FormGroup>

            <div />
          </div>

          {/* Row 3 — Primary Doctor / DOB */}
          <div className="form-row">
            <FormGroup label="Primary Doctor" required error={errors.primaryDoctor}>
              <select
                className={errors.primaryDoctor ? "error" : ""}
                value={form.primaryDoctor}
                onChange={(e) => {
                  const doctorId = e.target.value;

                  const selectedDoctor = doctors.find(
                    (doctor) => doctor._id === doctorId
                  );

                  const doctorDepartment =
                    SPECIALIZATION_TO_DEPARTMENT[selectedDoctor?.specialization];

                  setForm((current) => ({
                    ...current,
                    primaryDoctor: doctorId,
                    department: doctorDepartment || current.department,
                  }));

                  if (errors.primaryDoctor) {
                    setErrors((current) => ({
                      ...current,
                      primaryDoctor: "",
                    }));
                  }
                }}
              >
                <option value="">
                  {doctorsLoading ? "Loading doctors..." : "Select"}
                </option>

                {!doctorsLoading &&
                  doctors
                    .filter((doctor) => {
                      if (!form.department) return true;

                      const doctorDepartment =
                        SPECIALIZATION_TO_DEPARTMENT[doctor.specialization];

                      return doctorDepartment === form.department;
                    })
                    .map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name}
                      </option>
                    ))}
              </select>
            </FormGroup>

            <FormGroup label="DOB" required error={errors.dob}>
              <div className="input-icon-wrap">
                <input
                  type="date"
                  className={errors.dob ? "error" : ""}
                  value={form.dob}
                  onChange={e => set("dob", e.target.value)}
                />
                <span className="input-icon"><CalendarTodayIcon /></span>
              </div>
            </FormGroup>
          </div>

          {/* Row 4 — Gender / Blood Group */}
          <div className="form-row">
            <FormGroup label="Gender" required error={errors.gender}>
              <select
                className={errors.gender ? "error" : ""}
                value={form.gender}
                onChange={e => set("gender", e.target.value)}
              >
                <option value="">Select</option>
                {GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </FormGroup>

            <FormGroup label="Blood Group" required error={errors.bloodGroup}>
              <select
                className={errors.bloodGroup ? "error" : ""}
                value={form.bloodGroup}
                onChange={e => set("bloodGroup", e.target.value)}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
              </select>
            </FormGroup>
          </div>

          {/* Row 5 — Status (custom dropdown) */}
          <div className="form-row">
            <FormGroup label="Status" required error={errors.status}>
              <div style={{ position: "relative" }}>
                <button
                  type="button"
                  onClick={() => setStatusOpen(o => !o)}
                  className={errors.status ? "error" : ""}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    border: `1px solid ${errors.status ? "#ef4444" : "#e2e8f0"}`,
                    borderRadius: 8, padding: "9px 12px",
                    background: "white", cursor: "pointer",
                    fontSize: 13, fontFamily: "inherit",
                    color: form.status ? "#1e293b" : "#94a3b8",
                  }}
                >
                  {form.status || "Select"}
                  <KeyboardArrowDownIcon
                    style={{
                      fontSize: 16, color: "#94a3b8",
                      transform: statusOpen ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {statusOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0,
                    width: "100%", background: "white",
                    border: "1px solid #e2e8f0", borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)", zIndex: 50,
                    overflow: "hidden",
                  }}>
                    {/* "Select" option */}
                    <div
                      onClick={() => { set("status", ""); setStatusOpen(false); }}
                      style={{ padding: "10px 14px", fontSize: 13, color: "#94a3b8", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      Select
                    </div>
                    {STATUSES.map(s => (
                      <div
                        key={s}
                        onClick={() => { set("status", s); setStatusOpen(false); }}
                        style={{
                          padding: "10px 14px", fontSize: 13,
                          color: s === "Available" ? "#16a34a" : "#dc2626",
                          cursor: "pointer", fontWeight: 500,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseLeave={e => e.currentTarget.style.background = ""}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormGroup>

            {/* Empty column to keep layout */}
            <div />
          </div>

          {/* Row 6 — Address 1 / Address 2 */}
          <div className="form-row">
            <FormGroup label="Address 1" required error={errors.address1}>
              <input
                type="text"
                className={errors.address1 ? "error" : ""}
                placeholder="Street address, P.O. box"
                value={form.address1}
                onChange={e => set("address1", e.target.value)}
              />
            </FormGroup>
            <FormGroup label="Address 2" required error={errors.address2}>
              <input
                type="text"
                className={errors.address2 ? "error" : ""}
                placeholder="Apartment, suite, unit"
                value={form.address2}
                onChange={e => set("address2", e.target.value)}
              />
            </FormGroup>
          </div>

          {/* Row 7 — Country / State */}
          <div className="form-row">
            <FormGroup label="Country" required error={errors.country}>
              <select
                className={errors.country ? "error" : ""}
                value={form.country}
                onChange={(e) => {
                  set("country", e.target.value);
                  set("state", "");
                  set("city", "");
                }}
              >
                <option value="">Select</option>

                {COUNTRIES.map((country) => (
                  <option key={country.isoCode} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="State" required error={errors.state}>
              <select
                className={errors.state ? "error" : ""}
                value={form.state}
                disabled={!form.country}
                onChange={(e) => {
                  set("state", e.target.value);
                  set("city", "");
                }}
              >
                <option value="">
                  {!form.country ? "Select country first" : "Select"}
                </option>

                {states.map((state) => (
                  <option key={state.isoCode} value={state.name}>
                    {state.name}
                  </option>
                ))}
              </select>
            </FormGroup>
          </div>

          {/* Row 8 — City / Pincode */}
          <div className="form-row">
            <FormGroup label="City" required error={errors.city}>
              <select
                className={errors.city ? "error" : ""}
                value={form.city}
                disabled={!form.state}
                onChange={(e) => set("city", e.target.value)}
              >
                <option value="">
                  {!form.state ? "Select state first" : "Select"}
                </option>

                {cities.map((city, index) => (
                  <option key={`${city.name}-${index}`} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </FormGroup>
            <FormGroup label="Pincode" required error={errors.pincode}>
              <input
                type="number"
                className={errors.pincode ? "error" : ""}
                placeholder="Enter pincode"
                value={form.pincode}
                onChange={e => set("pincode", e.target.value)}
              />
            </FormGroup>
          </div>

        </div>
      </div>

      {/* ── Footer Buttons ── */}
      <div className="form-footer">
        <button className="btn-cancel-form" onClick={() => navigate("/patients")}>
          Cancel
        </button>
        <button className="btn-submit" onClick={handleSubmit}>
          Add New Patient
        </button>
      </div>

    </div>
  );
}