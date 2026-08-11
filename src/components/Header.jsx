import { useContext, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import GridViewIcon from "@mui/icons-material/GridView";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { SidebarContext } from "./Sidebar";

export default function Header() {
  const { collapsed } = useContext(SidebarContext);
  const [darkMode, setDarkMode] = useState(false);

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
        {/* <button className="btn-ai">
          <span className="ai-dot" />
          <AutoAwesomeIcon style={{ fontSize: 15 }} />
          AI Assistance
        </button> */}

        <div className="header-icon-btn">
          <GridViewIcon style={{ fontSize: 18 }} />
        </div>

        {/* <div className="header-icon-btn theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode
            ? <LightModeIcon style={{ fontSize: 18 }} />
            : <DarkModeIcon style={{ fontSize: 18 }} />}
        </div> */}

        <div className="header-icon-btn">
          <NotificationsIcon style={{ fontSize: 18 }} />
          <span className="badge">3</span>
        </div>

        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer",
          border: "2px solid #e2e8f0", fontFamily: "inherit",
        }}>
          A
        </div>
      </div>
    </header>
  );
}
