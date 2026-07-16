import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";

import { NavLink,useNavigate } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { adminMenu } from "../../config/adminMenu";

const Sidebar = ({ collapsed, setCollapsed }) => {

    const { logout } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleLogout = () => {

        logout();

        navigate("/admin/login");

    };
  return (

    <aside
      className={`admin-sidebar ${collapsed ? "admin-sidebar-collapsed" : ""}`}
    >

      <div className="admin-sidebar-brand-row">

        {!collapsed && (

          <h1 className="admin-sidebar-logo">

            <span>

              Varlexa

            </span>

              Admin

          </h1>

        )}

        <button
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight />
          ) : (
            <ChevronLeft />
          )}
        </button>

      </div>

      <div className="admin-sidebar-nav">

        {adminMenu.map((menu) => {

          const Icon = menu.icon;

          return (

            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `admin-sidebar-link ${isActive ? "active" : ""}`
              }
            >

              <Icon size={20} />

              {!collapsed && menu.title}

            </NavLink>

          );

        })}

      </div>

      <div className="admin-sidebar-footer">

        <button
    onClick={handleLogout}
    className="admin-logout-button"
>

          <LogOut size={18} />

          {!collapsed && "Logout"}

        </button>

      </div>

    </aside>

  );

};

export default Sidebar;
