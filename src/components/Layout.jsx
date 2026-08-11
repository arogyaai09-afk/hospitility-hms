import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar, { SidebarContext } from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="app-layout">
        <Sidebar />
        <div
          className="main-content"
          style={{
            marginLeft: collapsed ? 64 : 240,
            transition: "margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Header />
          <div className="page-content">
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
