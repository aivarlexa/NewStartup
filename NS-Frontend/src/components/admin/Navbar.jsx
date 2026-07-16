import { Bell, Menu } from "lucide-react";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

const Navbar = ({ setCollapsed }) => {

  const { user } = useContext(AuthContext);

  return (

    <header className="admin-topbar">

      <div className="admin-topbar-left">

        <button
          className="admin-mobile-menu"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <Menu />
        </button>

        <div>

          <h1>

            Dashboard

          </h1>

          <p>

            Welcome back, {user?.name}

          </p>

        </div>

      </div>

      <div className="admin-topbar-actions">

        <button className="admin-icon-button">

          <Bell />

        </button>

        <img
          src={
            user?.avatar ||
            "https://ui-avatars.com/api/?name=Admin"
          }
          className="admin-avatar"
          alt="Admin"
        />

      </div>

    </header>

  );

};

export default Navbar;
