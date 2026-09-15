import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GridViewIcon from "@mui/icons-material/GridView";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { SidebarContext } from "./Sidebar";

export default function Header() {
  const { collapsed } = useContext(SidebarContext);
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setShowUserMenu(false);
  };

  return (
    <header
      className="header"
      style={{
        left: collapsed ? 64 : 240,
        transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Left - Search */}
      <div className="header-left">
        <div className="search-box">
          <SearchIcon className="search-icon" />
          <input type="text" placeholder="Search" />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="header-right">
        <div className="header-icon-btn">
          <GridViewIcon style={{ fontSize: 18 }} />
        </div>

        <div className="header-icon-btn">
          <NotificationsIcon style={{ fontSize: 18 }} />
          <span className="badge">3</span>
        </div>

        {/* User Menu */}
        <div className="user-menu-wrapper">
          <div
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
            title="User Menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              border: "2px solid #e2e8f0",
              fontFamily: "inherit",
            }}
          >
            A
          </div>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <button 
                className="menu-item"
                onClick={handleProfileClick}
              >
                <AccountCircleIcon style={{ fontSize: 18 }} />
                <span>Profile</span>
              </button>
              <div className="menu-divider" />
              <button 
                className="menu-item logout"
                onClick={handleLogout}
              >
                <LogoutIcon style={{ fontSize: 18 }} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
