import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../src/components/admin/Sidebar";
import Navbar from "../src/components/admin/Navbar";
import "../src/pages/Admin/Admin.css";

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="admin-shell">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="admin-content">

        <Navbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <main className="admin-main">

          <Outlet />

        </main>

      </div>

    </div>
  );
};

export default AdminLayout;
