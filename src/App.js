import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import "./assets/styles/main.scss";
import Doctors from "./doctors/DoctorList";
import AddDoctor from "./doctors/AddDoctor";
import DoctorDetails from "./doctors/DoctorDetail";
import Patients from "./patients/PatientList";
import CreatePatient from "./patients/AddPatient";
import PatientDetail from "./patients/PatientDetail";
import Appointments from "./appointments/AppointmentList";
import NewAppointment from "./appointments/AddAppointment";
import Admissions from "./admissions/AdmissionList";
import Emergencies from "./emergencies/EmergencyList";
import Beds from "./beds/BedList";
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

            {/* Doctor section */}
            <Route path="doctors" element={<Doctors />} />
            <Route path="doctors/add" element={<AddDoctor />} />
            <Route path="doctors/:id" element={<DoctorDetails />} />

            {/* Patient section */}
            <Route path="patients" element={<Patients />} />
            <Route path="patients/create" element={<CreatePatient />} />
            <Route path="patients/:id" element={<PatientDetail />} />

            {/* Appointment section */}
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/new" element={<NewAppointment />} />

            {/* Admissions section */}
            <Route path="admissions" element={<Admissions />} />

            {/* Emergencies section */}
            <Route path="emergencies" element={<Emergencies />} />

            {/* Beds section */}
            <Route path="beds" element={<Beds />} />

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