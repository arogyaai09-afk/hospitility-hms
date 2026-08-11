import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import "./assets/styles/main.scss";
import Doctors from "./doctors/DoctorList";
import AddDoctor from "./doctors/AddDoctor";
import DoctorDetails from "./doctors/DoctorDetail";
import Patients from "./patients/PatientList";
import CreatePatient from "./patients/AddPatient";
import PatientDetail from "./patients/PatientDetail";
import Appointments from "./appointments/AppointmentList";
import NewAppointment from "./appointments/AddAppointment";
import Services from "./sevices/serviceList";
import Rooms from "./rooms/RoomList";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* doctor section */}
            <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/add" element={<AddDoctor />} />
           <Route path="doctors/:id" element={<DoctorDetails />} />

           {/* patient section */}
              <Route path="patients"     element={<Patients />} />
          <Route path="patients/create"  element={<CreatePatient />} />
<Route path="patients/:id"     element={<PatientDetail />} />
 <Route path="appointments"       element={<Appointments />}   />
         <Route path="appointments/new"        element={<NewAppointment />}  />
              <Route path="services"               element={<Services />}         />
                        <Route path="rooms"                  element={<Rooms />}            />

          {/* Add more routes here as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
