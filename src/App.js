//app.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Departments from "./pages/Departments";
import Staff from "./pages/Staff";
import AddStaff from "./pages/AddStaff";
import "./assets/styles/main.scss";
import Doctors from "./doctors/DoctorList";
import AddDoctor from "./doctors/AddDoctor";
import DoctorDetails from "./doctors/DoctorDetail";
import EditDoctor from "./doctors/EditDoctor";
import Patients from "./patients/PatientList";
import CreatePatient from "./patients/AddPatient";
import PatientDetail from "./patients/PatientDetail";
import EditPatient from "./patients/EditPatient";
import Appointments from "./appointments/AppointmentList";
import NewAppointment from "./appointments/AddAppointment";
import Admissions from "./admissions/AdmissionList";
import AddAdmission from "./admissions/AddAdmission";
import AdmissionDetail from "./admissions/AdmissionDetail";
import Emergencies from "./emergencies/EmergencyList";
import AddEmergency from "./emergencies/AddEmergency";
import Beds from "./beds/BedList";
import AddBed from "./beds/AddBed";
import Invoices from "./invoices/InvoiceList";
import AddInvoice from "./invoices/AddInvoice";
// import Services from "./sevices/serviceList";
// import Rooms from "./rooms/RoomList";
import Login from "./auth/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Tenants from "./Tenants/TenantList";
import AddTenant from "./Tenants/AddTenant";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
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
            <Route path="staff" element={<Staff />} />
            <Route path="staff/new" element={<AddStaff />} />

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

            {/* Appointment section */}
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/new" element={<NewAppointment />} />

            {/* Admissions section */}
            <Route path="admissions" element={<Admissions />} />
            <Route path="admissions/new" element={<AddAdmission />} />
            <Route path="admissions/:id" element={<AdmissionDetail />} />

            {/* Emergencies section */}
            <Route path="emergencies" element={<Emergencies />} />
            <Route path="emergencies/new" element={<AddEmergency />} />

            {/* Beds section */}
            <Route path="beds" element={<Beds />} />
            <Route path="beds/new" element={<AddBed />} />

            {/* Invoices section */}
            <Route path="invoices" element={<Invoices />} />
            <Route path="invoices/new" element={<AddInvoice />} />

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
  );
}

export default App;