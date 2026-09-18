import { useState, useRef, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PATIENTS = [
  "Alberto Ripley",
  "Susan Babin",
  "Carol Lam",
  "Marsha Noland",
  "Irma Armstrong",
  "Jesus Adams",
  "Ezra Belcher",
  "Glen Lentz",
  "Bernard Griffith",
  "John Elsass",
  "Martin Lisa",
  "Ava Mitchell",
];

const ROOM_OPTIONS = [
  { type: "General", price: 500 },
  { type: "Deluxe", price: 1200 },
  { type: "Super Deluxe", price: 2000 },
  { type: "Suite", price: 3500 },
  { type: "ICU", price: 5000 },
  { type: "Private Ward", price: 800 },
];

const SORT_OPTIONS = ["Recently Added", "Oldest", "Ascending", "Descending"];

const initialRooms = [
  {
    id: 1,
    roomNo: "R101",
    patient: "Alberto Ripley",
    roomType: "General",
    price: 500,
    checkIn: "01 Mar 2026",
    checkOut: "05 Mar 2026",
    status: "Discharged",
  },
  {
    id: 2,
    roomNo: "R205",
    patient: "Susan Babin",
    roomType: "Deluxe",
    price: 1200,
    checkIn: "03 Mar 2026",
    checkOut: "",
    status: "Booked",
  },
  {
    id: 3,
    roomNo: "R310",
    patient: "Carol Lam",
    roomType: "Super Deluxe",
    price: 2000,
    checkIn: "04 Mar 2026",
    checkOut: "",
    status: "Booked",
  },
  {
    id: 4,
    roomNo: "R402",
    patient: "Marsha Noland",
    roomType: "Suite",
    price: 3500,
    checkIn: "28 Feb 2026",
    checkOut: "03 Mar 2026",
    status: "Discharged",
  },
  {
    id: 5,
    roomNo: "R115",
    patient: "Irma Armstrong",
    roomType: "ICU",
    price: 5000,
    checkIn: "05 Mar 2026",
    checkOut: "",
    status: "Booked",
  },
  {
    id: 6,
    roomNo: "R220",
    patient: "Jesus Adams",
    roomType: "Private Ward",
    price: 800,
    checkIn: "02 Mar 2026",
    checkOut: "06 Mar 2026",
    status: "Discharged",
  },
  {
    id: 7,
    roomNo: "R318",
    patient: "Ezra Belcher",
    roomType: "General",
    price: 500,
    checkIn: "06 Mar 2026",
    checkOut: "",
    status: "Booked",
  },
  {
    id: 8,
    roomNo: "R410",
    patient: "Glen Lentz",
    roomType: "Deluxe",
    price: 1200,
    checkIn: "07 Mar 2026",
    checkOut: "",
    status: "Booked",
  },
  {
    id: 9,
    roomNo: "R501",
    patient: "Bernard Griffith",
    roomType: "Suite",
    price: 3500,
    checkIn: "01 Mar 2026",
    checkOut: "04 Mar 2026",
    status: "Discharged",
  },
  {
    id: 10,
    roomNo: "R122",
    patient: "John Elsass",
    roomType: "General",
    price: 500,
    checkIn: "08 Mar 2026",
    checkOut: "",
    status: "Booked",
  },
];

const ROOM_COLORS = {
  General: "#3b82f6",
  Deluxe: "#8b5cf6",
  "Super Deluxe": "#ec4899",
  Suite: "#f59e0b",
  ICU: "#ef4444",
  "Private Ward": "#10b981",
};

// ─── BOOK ROOM MODAL ──────────────────────────────────────────────────────────
function BookRoomModal({ onClose, onBook }) {
  const [patient, setPatient] = useState("");
  const [roomType, setRoomType] = useState("");
  const [price, setPrice] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [pOpen, setPOpen] = useState(false);
  const [rOpen, setROpen] = useState(false);
  const [errors, setErrors] = useState({});

  // When room type selected, auto-fill price
  const selectRoom = (type) => {
    const found = ROOM_OPTIONS.find((r) => r.type === type);
    setRoomType(type);
    if (found) setPrice(String(found.price));
    setROpen(false);
    setErrors((p) => ({ ...p, roomType: "" }));
  };

  const submit = () => {
    const e = {};
    if (!patient) e.patient = "Patient is required";
    if (!roomType) e.roomType = "Room type is required";
    if (!checkIn) e.checkIn = "Check-in date is required";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      const roomNos = {
        General: "R1",
        Deluxe: "R2",
        "Super Deluxe": "R3",
        Suite: "R4",
        ICU: "R5",
        "Private Ward": "R6",
      };
      onBook({
        patient,
        roomType,
        price: Number(price),
        checkIn,
        checkOut: "",
        status: "Booked",
        roomNo: roomNos[roomType] + Math.floor(Math.random() * 99 + 10),
      });
      onClose();
    }
  };

  // Shared dropdown style
  const ddWrap = (open) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "9px 12px",
    cursor: "pointer",
    background: "white",
    userSelect: "none",
  });

  const dropList = {
    position: "absolute",
    top: "calc(100% + 4px)",
    left: 0,
    right: 0,
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 500,
    maxHeight: 200,
    overflowY: "auto",
  };

  const optStyle = (active) => ({
    padding: "9px 14px",
    fontSize: 13,
    cursor: "pointer",
    background: active ? "#3b82f6" : "white",
    color: active ? "white" : "#475569",
    fontWeight: active ? 600 : 400,
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 12,
          width: 480,
          maxWidth: "95vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <MeetingRoomIcon style={{ color: "#3b82f6", fontSize: 20 }} /> Book
            Room
          </span>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "20px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Patient dropdown */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Patient <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  ...ddWrap(pOpen),
                  borderColor: errors.patient ? "#ef4444" : "#e2e8f0",
                }}
                onClick={() => setPOpen((o) => !o)}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: patient ? "#1e293b" : "#94a3b8",
                  }}
                >
                  {patient || "Select Patient"}
                </span>
                <KeyboardArrowDownIcon
                  style={{
                    fontSize: 16,
                    color: "#94a3b8",
                    transform: pOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
              {pOpen && (
                <div style={dropList}>
                  <div
                    style={optStyle(false)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                    onClick={() => {
                      setPatient("");
                      setPOpen(false);
                    }}
                  >
                    Select
                  </div>
                  {PATIENTS.map((p) => (
                    <div
                      key={p}
                      style={optStyle(patient === p)}
                      onClick={() => {
                        setPatient(p);
                        setPOpen(false);
                        setErrors((x) => ({ ...x, patient: "" }));
                      }}
                      onMouseEnter={(e) => {
                        if (patient !== p)
                          e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (patient !== p)
                          e.currentTarget.style.background = "white";
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.patient && (
              <span
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {errors.patient}
              </span>
            )}
          </div>

          {/* Room Type dropdown */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Room Type <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  ...ddWrap(rOpen),
                  borderColor: errors.roomType ? "#ef4444" : "#e2e8f0",
                }}
                onClick={() => setROpen((o) => !o)}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: roomType ? "#1e293b" : "#94a3b8",
                  }}
                >
                  {roomType || "Select Room Type"}
                </span>
                <KeyboardArrowDownIcon
                  style={{
                    fontSize: 16,
                    color: "#94a3b8",
                    transform: rOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </div>
              {rOpen && (
                <div style={dropList}>
                  {ROOM_OPTIONS.map((r) => (
                    <div
                      key={r.type}
                      style={{
                        ...optStyle(roomType === r.type),
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                      onClick={() => selectRoom(r.type)}
                      onMouseEnter={(e) => {
                        if (roomType !== r.type)
                          e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        if (roomType !== r.type)
                          e.currentTarget.style.background = "white";
                      }}
                    >
                      <span>{r.type}</span>
                      <span
                        style={{
                          fontSize: 12,
                          color:
                            roomType === r.type
                              ? "rgba(255,255,255,0.8)"
                              : "#94a3b8",
                          fontWeight: 500,
                        }}
                      >
                        ${r.price}/day
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.roomType && (
              <span
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {errors.roomType}
              </span>
            )}
          </div>

          {/* Price (auto-filled, editable) */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Price per Day
            </label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                $
              </span>
              <input
                type="number"
                value={price}
                min="0"
                onChange={(e) => setPrice(e.target.value)}
                style={{
                  width: "100%",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "9px 12px 9px 26px",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  background: "#f8fafc",
                  color: "#475569",
                }}
                placeholder="Auto-filled on room selection"
              />
            </div>
          </div>

          {/* Check-in date */}
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#1e293b",
                display: "block",
                marginBottom: 6,
              }}
            >
              Check-in Date <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                setErrors((p) => ({ ...p, checkIn: "" }));
              }}
              style={{
                width: "100%",
                border: `1px solid ${errors.checkIn ? "#ef4444" : "#e2e8f0"}`,
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 13,
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            {errors.checkIn && (
              <span
                style={{
                  fontSize: 11,
                  color: "#ef4444",
                  marginTop: 3,
                  display: "block",
                }}
              >
                {errors.checkIn}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              color: "#475569",
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            style={{
              padding: "9px 24px",
              borderRadius: 8,
              border: "none",
              background: "#3b82f6",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            Book Room
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FILTER PANEL ─────────────────────────────────────────────────────────────
function RoomFilterField({
  label,
  values,
  onRemove,
  onAdd,
  options,
  placeholder,
}) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const filteredOptions = options.filter((option) => {
    return (
      option.toLowerCase().includes(input.toLowerCase()) &&
      !values.includes(option)
    );
  });

  const addValue = (value) => {
    if (!value || values.includes(value)) return;

    onAdd(value);
    setInput("");
    setOpen(false);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1e293b",
          }}
        >
          {label}
        </span>

        <span
          onClick={() => {
            values.forEach((value) => onRemove(value));
            setInput("");
          }}
          style={{
            fontSize: 11,
            color: "#3b82f6",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Reset
        </span>
      </div>

      <div
        style={{
          position: "relative",
          minHeight: 42,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          background: "white",
        }}
      >
        {values.map((value) => (
          <span
            key={value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "#eff6ff",
              color: "#3b82f6",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: 20,
            }}
          >
            {value}

            <span
              onClick={(event) => {
                event.stopPropagation();
                onRemove(value);
              }}
              style={{
                cursor: "pointer",
                fontSize: 14,
                lineHeight: 1,
              }}
            >
              ×
            </span>
          </span>
        ))}

        <input
          type="text"
          value={input}
          placeholder={values.length === 0 ? placeholder : ""}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setInput(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              if (filteredOptions.length > 0) {
                addValue(filteredOptions[0]);
              } else if (input.trim()) {
                addValue(input.trim());
              }
            }

            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          style={{
            border: "none",
            outline: "none",
            flex: "1 1 100px",
            minWidth: 90,
            background: "transparent",
            padding: "4px 0",
            fontSize: 13,
          }}
        />

        {open && filteredOptions.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "calc(100% + 5px)",
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              zIndex: 1000,
              maxHeight: 180,
              overflowY: "auto",
            }}
          >
            {filteredOptions.map((option) => (
              <div
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => addValue(option)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "#475569",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = "white";
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RoomFilterPanel({ appliedFilters, onApply, onClose }) {
  const [filters, setFilters] = useState(appliedFilters);

  const addValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: [...current[key], value],
    }));
  };

  const removeValue = (key, value) => {
    setFilters((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== value),
    }));
  };

  const resetGroup = (key) => {
    setFilters((current) => ({
      ...current,
      [key]: [],
    }));
  };

  const clearAll = () => {
    setFilters({
      patient: [],
      roomType: [],
      amount: [],
      status: [],
    });
  };

  const patientOptions = [...new Set(initialRooms.map((room) => room.patient))];

  const roomTypeOptions = [
    ...new Set(initialRooms.map((room) => room.roomType)),
  ];

  const amountOptions = [
    "Under $500",
    "$501 - $1000",
    "$1001 - $2000",
    "Above $2000",
  ];

  const statusOptions = [...new Set(initialRooms.map((room) => room.status))];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.18)",
          zIndex: 200,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 320,
          height: "100vh",
          background: "white",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 40px rgba(0,0,0,0.12)",
          fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Filter
          </span>

          <span
            onClick={clearAll}
            style={{
              fontSize: 13,
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear All
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
          }}
        >
          <RoomFilterField
            label="Patient Name"
            values={filters.patient}
            onAdd={(value) => addValue("patient", value)}
            onRemove={(value) => removeValue("patient", value)}
            options={patientOptions}
            placeholder="Search patient..."
          />

          <RoomFilterField
            label="Room Type"
            values={filters.roomType}
            onAdd={(value) => addValue("roomType", value)}
            onRemove={(value) => removeValue("roomType", value)}
            options={roomTypeOptions}
            placeholder="Search room type..."
          />

          <RoomFilterField
            label="Amount"
            values={filters.amount}
            onAdd={(value) => addValue("amount", value)}
            onRemove={(value) => removeValue("amount", value)}
            options={amountOptions}
            placeholder="Select amount..."
          />

          <RoomFilterField
            label="Status"
            values={filters.status}
            onAdd={(value) => addValue("status", value)}
            onRemove={(value) => removeValue("status", value)}
            options={statusOptions}
            placeholder="Select status..."
          />
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "14px 20px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "white",
              color: "#475569",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onApply(filters);
              onClose();
            }}
            style={{
              flex: 1,
              padding: "9px 12px",
              borderRadius: 8,
              border: "none",
              background: "#3b82f6",
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
}

// ─── DOWNLOAD PDF AND EXCEL ─────────────────────────────────────────────────────────────────────
const downloadPDF = (data) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Room List", 14, 15);

  autoTable(doc, {
    startY: 25,
    head: [
      [
        "Room No",
        "Patient",
        "Room Type",
        "Price/Day",
        "Check In",
        "Check Out",
        "Status",
      ],
    ],
    body: data.map((room) => [
      room.roomNo,
      room.patient,
      room.roomType,
      `$${room.price}`,
      room.checkIn,
      room.checkOut || "-",
      room.status,
    ]),
  });

  doc.save("rooms.pdf");
};

const downloadExcel = (data) => {
  const excelData = data.map((room) => ({
    "Room No": room.roomNo,
    Patient: room.patient,
    "Room Type": room.roomType,
    "Price/Day": room.price,
    "Check In": room.checkIn,
    "Check Out": room.checkOut || "-",
    Status: room.status,
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Rooms");

  XLSX.writeFile(workbook, "rooms.xlsx");
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Rooms() {
  const [rooms, setRooms] = useState(initialRooms);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortVal, setSortVal] = useState("Recently Added");
  const [openMenu, setOpenMenu] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({
    patient: [],
    roomType: [],
    amount: [],
    status: [],
  });

  const exportRef = useRef(null);
  const sortRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setExportOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target))
        setSortOpen(false);
      setOpenMenu(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleBook = (booking) => {
    setRooms((p) => [...p, { id: p.length + 1, ...booking }]);
  };

  const handleDischarge = (id) => {
    const today = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/ /g, " ");
    setRooms((p) =>
      p.map((r) =>
        r.id === id
          ? { ...r, status: "Discharged", checkOut: "08 Mar 2026" }
          : r,
      ),
    );
    setOpenMenu(null);
  };

  const handleDelete = (id) => {
    setRooms((p) => p.filter((r) => r.id !== id));
    setOpenMenu(null);
  };

  const filtered = rooms
    .filter((r) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        r.patient.toLowerCase().includes(searchText) ||
        r.roomType.toLowerCase().includes(searchText) ||
        r.roomNo.toLowerCase().includes(searchText);

      if (!matchesSearch) return false;

      if (
        appliedFilters.patient.length > 0 &&
        !appliedFilters.patient.includes(r.patient)
      ) {
        return false;
      }

      if (
        appliedFilters.roomType.length > 0 &&
        !appliedFilters.roomType.includes(r.roomType)
      ) {
        return false;
      }

      if (
        appliedFilters.status.length > 0 &&
        !appliedFilters.status.includes(r.status)
      ) {
        return false;
      }

      if (appliedFilters.amount.length > 0) {
        const amountMatches = appliedFilters.amount.some((range) => {
          if (range === "Under $500") {
            return r.price < 500;
          }

          if (range === "$501 - $1000") {
            return r.price >= 501 && r.price <= 1000;
          }

          if (range === "$1001 - $2000") {
            return r.price >= 1001 && r.price <= 2000;
          }

          if (range === "Above $2000") {
            return r.price > 2000;
          }

          return true;
        });

        if (!amountMatches) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortVal === "Ascending") return a.patient.localeCompare(b.patient);
      if (sortVal === "Descending") return b.patient.localeCompare(a.patient);
      if (sortVal === "Oldest") return a.id - b.id;
      return b.id - a.id; // Recently Added
    });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageData = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // shared styles
  const th = {
    textAlign: "left",
    padding: "11px 16px",
    fontSize: 11,
    fontWeight: 600,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  };
  const td = (extra = {}) => ({
    padding: "12px 16px",
    fontSize: 13,
    color: "#475569",
    verticalAlign: "middle",
    borderBottom: "1px solid #e2e8f0",
    ...extra,
  });

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans','Segoe UI',sans-serif" }}>
      {/* ── Page Top ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Rooms
          </h1>
          <span
            style={{
              background: "#eff6ff",
              color: "#3b82f6",
              fontSize: 12,
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: 20,
              border: "1px solid #bfdbfe",
            }}
          >
            Total Rooms : {filtered.length}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Export */}
          <div ref={exportRef} style={{ position: "relative" }}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#1e293b",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Export{" "}
              <KeyboardArrowDownIcon
                style={{ fontSize: 15, color: "#94a3b8" }}
              />
            </button>
            {exportOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  minWidth: 180,
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {[
                  {
                    icon: (
                      <PictureAsPdfIcon
                        style={{ fontSize: 16, color: "#ef4444" }}
                      />
                    ),
                    label: "Download as PDF",
                  },
                  {
                    icon: (
                      <TableChartIcon
                        style={{ fontSize: 16, color: "#10b981" }}
                      />
                    ),
                    label: "Download as Excel",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 16px",
                      fontSize: 13,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      if (item.label === "Download as PDF") {
                        downloadPDF(filtered);
                      }

                      if (item.label === "Download as Excel") {
                        downloadExcel(filtered);
                      }

                      setExportOpen(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f8fafc")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    {item.icon} {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Book Room */}
          <button
            onClick={() => setShowModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2563eb")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#3b82f6")}
          >
            <AddIcon style={{ fontSize: 16 }} /> Book Room
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "8px 14px",
            width: 240,
          }}
        >
          <SearchIcon style={{ fontSize: 15, color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            style={{
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "#1e293b",
              fontFamily: "inherit",
              width: "100%",
              background: "transparent",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setShowFilter(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 500,
              color: "#1e293b",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <FilterListIcon style={{ fontSize: 15, color: "#64748b" }} />{" "}
            Filters
          </button>
          <div ref={sortRef} style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen((o) => !o)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                color: "#1e293b",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              Sort By : {sortVal}{" "}
              <KeyboardArrowDownIcon
                style={{ fontSize: 15, color: "#94a3b8" }}
              />
            </button>
            {sortOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 6px)",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                  minWidth: 180,
                  zIndex: 50,
                  overflow: "hidden",
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setSortVal(opt);
                      setSortOpen(false);
                    }}
                    style={{
                      padding: "10px 16px",
                      fontSize: 13,
                      cursor: "pointer",
                      color: sortVal === opt ? "#3b82f6" : "#475569",
                      fontWeight: sortVal === opt ? 600 : 400,
                      background: sortVal === opt ? "#eff6ff" : "white",
                    }}
                    onMouseEnter={(e) => {
                      if (sortVal !== opt)
                        e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      if (sortVal !== opt)
                        e.currentTarget.style.background = "white";
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {[
                "Room No",
                "Patient",
                "Room Type",
                "Price/Day",
                "Check In",
                "Check Out",
                "Status",
                "",
              ].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((room) => (
              <tr
                key={room.id}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#fafafa")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <td style={td({ fontWeight: 700, color: "#1e293b" })}>
                  {room.roomNo}
                </td>

                {/* Patient */}
                <td style={td()}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "#eff6ff",
                        color: "#3b82f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {room.patient
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>
                      {room.patient}
                    </span>
                  </div>
                </td>

                {/* Room Type badge */}
                <td style={td()}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background:
                        (ROOM_COLORS[room.roomType] || "#3b82f6") + "18",
                      color: ROOM_COLORS[room.roomType] || "#3b82f6",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    <MeetingRoomIcon style={{ fontSize: 12 }} /> {room.roomType}
                  </span>
                </td>

                <td style={td({ fontWeight: 700, color: "#1e293b" })}>
                  ${room.price}
                </td>
                <td style={td()}>{room.checkIn}</td>
                <td
                  style={td({ color: room.checkOut ? "#475569" : "#94a3b8" })}
                >
                  {room.checkOut || "—"}
                </td>

                {/* Status */}
                <td style={td()}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      background:
                        room.status === "Booked" ? "#dcfce7" : "#f1f5f9",
                      color: room.status === "Booked" ? "#16a34a" : "#64748b",
                      border: `1px solid ${room.status === "Booked" ? "#bbf7d0" : "#e2e8f0"}`,
                    }}
                  >
                    {room.status}
                  </span>
                </td>

                {/* 3-dot menu */}
                <td style={td()} onClick={(e) => e.stopPropagation()}>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <button
                      onClick={() =>
                        setOpenMenu(openMenu === room.id ? null : room.id)
                      }
                      style={{
                        width: 28,
                        height: 28,
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        background: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#64748b",
                      }}
                    >
                      <MoreVertIcon style={{ fontSize: 14 }} />
                    </button>
                    {openMenu === room.id && (
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: "calc(100% + 4px)",
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: 8,
                          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                          minWidth: 140,
                          zIndex: 50,
                          overflow: "hidden",
                        }}
                      >
                        {room.status === "Booked" && (
                          <div
                            onClick={() => handleDischarge(room.id)}
                            style={{
                              padding: "9px 16px",
                              fontSize: 13,
                              color: "#f59e0b",
                              cursor: "pointer",
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#fffbeb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "")
                            }
                          >
                            Discharge
                          </div>
                        )}
                        <div
                          onClick={() => setOpenMenu(null)}
                          style={{
                            padding: "9px 16px",
                            fontSize: 13,
                            color: "#475569",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#f8fafc")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "")
                          }
                        >
                          Edit
                        </div>
                        <div
                          onClick={() => handleDelete(room.id)}
                          style={{
                            padding: "9px 16px",
                            fontSize: 13,
                            color: "#ef4444",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#fff1f2")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "")
                          }
                        >
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#64748b",
            }}
          >
            Row Per Page
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: 13,
                fontFamily: "inherit",
                outline: "none",
                background: "white",
                cursor: "pointer",
              }}
            >
              {[5, 10, 15, 20].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            Entries
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                width: 30,
                height: 30,
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                background: "white",
                cursor: page === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeftIcon style={{ fontSize: 14 }} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 30,
                  height: 30,
                  border: `1px solid ${page === p ? "#3b82f6" : "#e2e8f0"}`,
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  background: page === p ? "#3b82f6" : "white",
                  color: page === p ? "white" : "#64748b",
                  fontWeight: page === p ? 700 : 400,
                }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                width: 30,
                height: 30,
                border: "1px solid #e2e8f0",
                borderRadius: 6,
                background: "white",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRightIcon style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <BookRoomModal
          onClose={() => setShowModal(false)}
          onBook={handleBook}
        />
      )}
      {showFilter && (
        <RoomFilterPanel
          appliedFilters={appliedFilters}
          onApply={setAppliedFilters}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  );
}
