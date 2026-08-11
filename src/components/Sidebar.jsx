import { useState, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import StarIcon from "@mui/icons-material/Star";
import ImageIcon from "@mui/icons-material/Image";
import EventIcon from "@mui/icons-material/Event";
import MessageIcon from "@mui/icons-material/Message";
import GroupIcon from "@mui/icons-material/Group";
import ApartmentIcon from "@mui/icons-material/Apartment";
import BadgeIcon from "@mui/icons-material/Badge";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import CelebrationIcon from "@mui/icons-material/Celebration";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import PersonIcon from "@mui/icons-material/Person";
import BarChartIcon from "@mui/icons-material/BarChart";
import ArticleIcon from "@mui/icons-material/Article";
import BlogIcon from "@mui/icons-material/RssFeed";
import MapIcon from "@mui/icons-material/Map";
import CommentIcon from "@mui/icons-material/Comment";
import HelpIcon from "@mui/icons-material/Help";
import EmailIcon from "@mui/icons-material/Email";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import CampaignIcon from "@mui/icons-material/Campaign";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CollectionsIcon from "@mui/icons-material/Collections";
import TimelineIcon from "@mui/icons-material/Timeline";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import BuildIcon from "@mui/icons-material/Build";
import PolicyIcon from "@mui/icons-material/Policy";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

// Context to share collapsed state globally (used in Layout/Header)
export const SidebarContext = createContext({ collapsed: false, setCollapsed: () => {} });

const menuData = [
  {
    section: "Main Menu",
    items: [
      {
        label: "Dashboard",
        icon: <DashboardIcon style={{ fontSize: 18 }} />,
        key: "dashboard",
        sub: [
          { label: "Admin Dashboard", path: "/" },
          // { label: "Doctor Dashboard", path: "/doctor-dashboard" },
          // { label: "Patient Dashboard", path: "/patient-dashboard" },
        ],
      },
      // { label: "Applications", icon: <EventIcon style={{ fontSize: 18 }} />, key: "applications", chevron: true },
      // { label: "Layouts", icon: <ImageIcon style={{ fontSize: 18 }} />, key: "layouts", chevron: true },
    ],
  },
  {
    section: "Clinic",
    items: [
      {
        label: "Doctors",
        icon: <PersonIcon style={{ fontSize: 18 }} />,
        key: "doctors",
        chevron: true,
        sub: [
          { label: "Doctor List", path: "/doctors" },
          { label: "Add Doctor", path: "/doctors/add" },
        ],
      },
     { label: "Patients", icon: <PeopleIcon style={{ fontSize: 18 }} />, key: "patients", chevron: true,
        sub: [
          { label: "Patients",        path: "/patients"        },
          { label: "Patient Details", path: "/patients/1"      },
          { label: "Create Patient",  path: "/patients/create" },
        ],
      },
      { label: "Appointments", icon: <CalendarMonthIcon style={{ fontSize: 18 }} />, key: "appointments", chevron: true,
        sub: [
          { label: "Appointments",        path: "/appointments"        },
          { label: "New Appointment",        path: "/appointments/new"        },
          
        ],
     },
      // { label: "Locations", icon: <LocationOnIcon style={{ fontSize: 18 }} />, key: "locations", path: "/locations" },
      { label: "Services", icon: <MedicalServicesIcon style={{ fontSize: 18 }} />, key: "services", path: "/services" },
        { label: "Rooms", icon: <MeetingRoomIcon style={{ fontSize: 18 }} />, key: "rooms", path: "/rooms" },
      // { label: "Specializations", icon: <StarIcon style={{ fontSize: 18 }} />, key: "specializations", path: "/specializations" },
      // { label: "Assets", icon: <ImageIcon style={{ fontSize: 18 }} />, key: "assets", path: "/assets" },
      // { label: "Activities", icon: <EventIcon style={{ fontSize: 18 }} />, key: "activities", path: "/activities" },
      // { label: "Messages", icon: <MessageIcon style={{ fontSize: 18 }} />, key: "messages", path: "/messages" },
    ],
  },
  // {
  //   section: "HRM",
  //   items: [
  //     { label: "Staffs", icon: <GroupIcon style={{ fontSize: 18 }} />, key: "staffs", path: "/staffs" },
  //     { label: "Departments", icon: <ApartmentIcon style={{ fontSize: 18 }} />, key: "departments", path: "/departments" },
  //     { label: "Designation", icon: <BadgeIcon style={{ fontSize: 18 }} />, key: "designation", path: "/designation" },
  //     { label: "Attendance", icon: <AccessTimeIcon style={{ fontSize: 18 }} />, key: "attendance", path: "/attendance" },
  //     { label: "Leaves", icon: <BeachAccessIcon style={{ fontSize: 18 }} />, key: "leaves", chevron: true },
  //     { label: "Holidays", icon: <CelebrationIcon style={{ fontSize: 18 }} />, key: "holidays", path: "/holidays" },
  //     { label: "Payroll", icon: <PaymentsIcon style={{ fontSize: 18 }} />, key: "payroll", path: "/payroll" },
  //   ],
  // },
  // {
  //   section: "Finance & Accounts",
  //   items: [
  //     { label: "Expenses", icon: <ReceiptIcon style={{ fontSize: 18 }} />, key: "expenses", chevron: true },
  //     { label: "Income", icon: <AccountBalanceWalletIcon style={{ fontSize: 18 }} />, key: "income", path: "/income" },
  //     { label: "Invoices", icon: <AssignmentIcon style={{ fontSize: 18 }} />, key: "invoices", chevron: true },
  //     { label: "Payments", icon: <PaymentsIcon style={{ fontSize: 18 }} />, key: "payments", path: "/payments" },
  //     { label: "Transactions", icon: <SwapHorizIcon style={{ fontSize: 18 }} />, key: "transactions", path: "/transactions" },
  //   ],
  // },
  // {
  //   section: "Administration",
  //   items: [
  //     { label: "Users", icon: <PersonIcon style={{ fontSize: 18 }} />, key: "users", chevron: true },
  //     { label: "Reports", icon: <BarChartIcon style={{ fontSize: 18 }} />, key: "reports", chevron: true },
  //   ],
  // },
  // {
  //   section: "Content",
  //   items: [
  //     { label: "Pages", icon: <ArticleIcon style={{ fontSize: 18 }} />, key: "pages", path: "/pages" },
  //     { label: "Blogs", icon: <BlogIcon style={{ fontSize: 18 }} />, key: "blogs", chevron: true },
  //     { label: "Location", icon: <MapIcon style={{ fontSize: 18 }} />, key: "location", chevron: true },
  //     { label: "Testimonials", icon: <CommentIcon style={{ fontSize: 18 }} />, key: "testimonials", path: "/testimonials" },
  //     { label: "FAQ", icon: <HelpIcon style={{ fontSize: 18 }} />, key: "faq", path: "/faq" },
  //   ],
  // },
  // {
  //   section: "Support",
  //   items: [
  //     { label: "Contact Messages", icon: <EmailIcon style={{ fontSize: 18 }} />, key: "contact", path: "/contact" },
  //     { label: "Tickets", icon: <ConfirmationNumberIcon style={{ fontSize: 18 }} />, key: "tickets", path: "/tickets" },
  //     { label: "Announcements", icon: <CampaignIcon style={{ fontSize: 18 }} />, key: "announcements", path: "/announcements" },
  //     { label: "Newsletters", icon: <NewspaperIcon style={{ fontSize: 18 }} />, key: "newsletters", path: "/newsletters" },
  //   ],
  // },
  // {
  //   section: "Pages",
  //   items: [
  //     { label: "Starter", icon: <HomeIcon style={{ fontSize: 18 }} />, key: "starter", path: "/starter" },
  //     { label: "Profile", icon: <AccountCircleIcon style={{ fontSize: 18 }} />, key: "profile", path: "/profile" },
  //     { label: "Gallery", icon: <CollectionsIcon style={{ fontSize: 18 }} />, key: "gallery", path: "/gallery" },
  //     { label: "Timeline", icon: <TimelineIcon style={{ fontSize: 18 }} />, key: "timeline", path: "/timeline" },
  //     { label: "Pricing", icon: <AttachMoneyIcon style={{ fontSize: 18 }} />, key: "pricing", path: "/pricing" },
  //     { label: "Coming Soon", icon: <AccessTimeFilledIcon style={{ fontSize: 18 }} />, key: "coming-soon", path: "/coming-soon" },
  //     { label: "Under Maintenance", icon: <BuildIcon style={{ fontSize: 18 }} />, key: "maintenance", path: "/maintenance" },
  //     { label: "Privacy Policy", icon: <PolicyIcon style={{ fontSize: 18 }} />, key: "privacy", path: "/privacy" },
  //   ],
  // },
];

export default function Sidebar() {
  const location = useLocation();
  const { collapsed, setCollapsed } = useContext(SidebarContext);
  const [openMenus, setOpenMenus] = useState({ dashboard: true });

  const toggleMenu = (key) => {
    if (collapsed) return;
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Check if any sub-path of a parent item is currently active
  const isParentActive = (item) => {
    if (!item.sub) return false;
    return item.sub.some((sub) => location.pathname === sub.path);
  };

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>

      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="logo-wrap">
          <div className="logo-icon">
            <LocalHospitalIcon style={{ color: "white", fontSize: 18 }} />
          </div>
          {!collapsed && <span className="logo-text">5-Aarogya-AI</span>}
        </div>
        <div
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed
            ? <MenuIcon style={{ fontSize: 18 }} />
            : <MenuOpenIcon style={{ fontSize: 18 }} />}
        </div>
      </div>

      {/* ── Clinic Info ── */}
      <div className={`clinic-info ${collapsed ? "clinic-info--collapsed" : ""}`}>
        {/* <div className="clinic-avatar" title="Trustcare Clinic">T</div> */}
        {!collapsed && (
          <>
            <div className="clinic-text">
              <div className="clinic-name">Data-driven-Strategy & Solution</div>
              <div className="clinic-location">India</div>
            </div>
            {/* <div className="clinic-expand">
              <ChevronRightIcon style={{ fontSize: 16 }} />
            </div> */}
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      {menuData.map((section) => (
        <div className="nav-section" key={section.section}>
          {!collapsed
            ? <div className="nav-section-title">{section.section}</div>
            : <div className="nav-section-divider" />
          }

          {section.items.map((item) => (
            <div key={item.key} className="nav-item-wrap">

              {/* Items that have sub-menus */}
              {item.sub ? (
                <>
                  <div
                    className={`nav-item ${collapsed ? "nav-item--icon-only" : ""} ${isParentActive(item) ? "active" : ""} ${openMenus[item.key] && !collapsed ? "active-parent" : ""}`}
                    onClick={() => toggleMenu(item.key)}
                  >
                    <div className="nav-left">
                      <span className="nav-icon">{item.icon}</span>
                      {!collapsed && <span className="nav-label">{item.label}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronRightIcon
                        className={`nav-chevron ${openMenus[item.key] ? "open" : ""}`}
                        style={{ fontSize: 14 }}
                      />
                    )}
                    {collapsed && <span className="nav-tooltip">{item.label}</span>}
                  </div>
                  {openMenus[item.key] && !collapsed && (
                    <div className="nav-sub">
                      {item.sub.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`nav-sub-item ${location.pathname === sub.path ? "active" : ""}`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                /* Regular nav items */
                <Link
                  to={item.path || "#"}
                  className={`nav-item ${location.pathname === item.path ? "active" : ""} ${collapsed ? "nav-item--icon-only" : ""}`}
                >
                  <div className="nav-left">
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </div>
                  {!collapsed && item.chevron && (
                    <ChevronRightIcon className="nav-chevron" style={{ fontSize: 14 }} />
                  )}
                  {collapsed && <span className="nav-tooltip">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>
      ))}
    </aside>
  );
}