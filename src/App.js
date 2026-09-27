//app.js

//import statements
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import "./assets/styles/main.scss";

//dashboard import statements
import Dashboard from "./pages/Dashboard";

//profile import statements
import Profile from "./pages/Profile";

//department import statements
import Departments from "./pages/Departments";

// Staff import statements
import Staff from "./staff/Staff";
import AddStaff from "./staff/AddStaff";
import EditStaff from "./staff/EditStaff";
import StaffDetail from "./staff/StaffDetail";

// Doctor import statements
import Doctors from "./doctors/DoctorList";
import AddDoctor from "./doctors/AddDoctor";
import DoctorDetails from "./doctors/DoctorDetail";
import EditDoctor from "./doctors/EditDoctor";

// Patient import statements
import Patients from "./patients/PatientList";
import CreatePatient from "./patients/AddPatient";
import PatientDetail from "./patients/PatientDetail";
import EditPatient from "./patients/EditPatient";

// Consultation import statements
import Consultation from "./consultations/Consultation";

//appointment import statements
import Appointments from "./appointments/AppointmentList";
import NewAppointment from "./appointments/AddAppointment";
import AppointmentDetail from "./appointments/AppointmentDetail";
import TodayAppointments from "./appointments/TodayAppointments";

// Admission import statements
import Admissions from "./admissions/AdmissionList";
import AddAdmission from "./admissions/AddAdmission";
import AdmissionDetail from "./admissions/AdmissionDetail";

// Discharge Summary import statement
import DischargeSummary from "./admissions/DischargeSummary";

// Emergency import statements
import Emergencies from "./emergencies/EmergencyList";
import AddEmergency from "./emergencies/AddEmergency";
import EmergencyDetail from "./emergencies/EmergencyDetail";

// Bed import statements
import Beds from "./beds/BedList";
import AddBed from "./beds/AddBed";

// Invoice import statements
import Invoices from "./invoices/InvoiceList";
import AddInvoice from "./invoices/AddInvoice";

// Tax import statement
import TaxList from "./taxes/TaxList";
import AddTax from "./taxes/AddTax";
import EditTax from "./taxes/EditTax";

//tenant import statements
import Tenants from "./Tenants/TenantList";
import AddTenant from "./Tenants/AddTenant";

//other import statements
import Login from "./auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { ToastProvider } from "./context/ToastContext";

// import Services from "./sevices/serviceList";
// import Rooms from "./rooms/RoomList";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Layout />}>

              <Route index element={<Dashboard />} />

              {/* Profile */}
              <Route path="profile" element={<Profile />} />
              <Route path="departments" element={<Departments />} />

              {/* Staff section */}
              <Route path="staff" element={<Staff />} />
              <Route path="staff/new" element={<AddStaff />} />
              <Route path="staff/:id" element={<StaffDetail />} />
              <Route path="staff/:id/edit" element={<EditStaff />} />

              {/* Doctor section */}
              <Route path="doctors" element={<Doctors />} />
              <Route path="doctors/add" element={<AddDoctor />} />
              <Route path="doctors/:id" element={<DoctorDetails />} />
              <Route path="doctors/:id/edit" element={<EditDoctor />} />

              {/* Patient section */}
              <Route path="patients" element={<Patients />} />
              <Route path="patients/create" element={<CreatePatient />} />
              <Route path="patients/:id" element={<PatientDetail />} />
              <Route path="patients/:id/edit" element={<EditPatient />} />

              {/* Consultation section */}
              <Route
                path="/patients/:patientId/visits/:visitId/consultation"
                element={<Consultation />}
              />

              {/* Appointment section */}
              <Route path="appointments" element={<Appointments />} />
              <Route path="appointments/new" element={<NewAppointment />} />
              <Route path="appointments/:id/edit" element={<NewAppointment />} />
              <Route path="appointments/:id" element={<AppointmentDetail />} />
              <Route path="doctors/:id/today-appointments" element={<TodayAppointments />} />

              {/* Admissions section */}
              <Route path="admissions" element={<Admissions />} />
              <Route path="admissions/new" element={<AddAdmission />} />
              <Route path="admissions/:id/edit" element={<AddAdmission />} />
              <Route path="admissions/:id" element={<AdmissionDetail />} />

              {/* Discharge Summary section */}
              <Route path="admissions/:id/discharge-summary" element={<DischargeSummary />} />

              {/* Emergencies section */}
              <Route path="emergencies" element={<Emergencies />} />
              <Route path="emergencies/new" element={<AddEmergency />} />
              <Route path="emergencies/:id" element={<EmergencyDetail />} />

              {/* Beds section */}
              <Route path="beds" element={<Beds />} />
              <Route path="beds/new" element={<AddBed />} />

              {/* Invoices section */}
              <Route path="invoices" element={<Invoices />} />
              <Route path="invoices/new" element={<AddInvoice />} />

              {/* Taxes section */}
              <Route path="taxes" element={<TaxList />} />
              <Route path="taxes/new" element={<AddTax />} />
              <Route path="taxes/:id/edit" element={<EditTax />} />

              {/* Other sections */}
              {/* <Route path="services" element={<Services />} />
            <Route path="rooms" element={<Rooms />} /> */}

              {/* Tenant sections */}
              <Route element={<AdminRoute />}>
                <Route path="tenants" element={<Tenants />} />
                <Route path="tenants/new" element={<AddTenant />} />
              </Route>

            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;