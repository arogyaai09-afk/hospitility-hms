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
import Emergencies from "./emergencies/EmergencyList";
import AddEmergency from "./emergencies/AddEmergency";
import Beds from "./beds/BedList";
import AddBed from "./beds/AddBed";
import Invoices from "./invoices/InvoiceList";
import Services from "./sevices/serviceList";
import Rooms from "./rooms/RoomList";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

            {/* Emergencies section */}
            <Route path="emergencies" element={<Emergencies />} />
            <Route path="emergencies/new" element={<AddEmergency />} />

            {/* Beds section */}
            <Route path="beds" element={<Beds />} />
            <Route path="beds/new" element={<AddBed />} />

            {/* Invoices section */}
            <Route path="invoices" element={<Invoices />} />

            {/* Other sections */}
            <Route path="services" element={<Services />} />
            <Route path="rooms" element={<Rooms />} />

          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;