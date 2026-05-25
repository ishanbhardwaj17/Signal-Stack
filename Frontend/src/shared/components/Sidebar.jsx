import {
  NavLink,
} from "react-router-dom";

function Sidebar() {
  const navItemClass = ({ isActive }) =>
    `block rounded px-4 py-3 transition ${
      isActive
        ? "bg-black text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <aside className="w-64 border-r bg-white p-4">
      <h1 className="mb-8 text-2xl font-bold">
        SignalStack
      </h1>

      <nav className="space-y-2">
        <NavLink
          to="/"
          className={navItemClass}
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/incidents"
          className={navItemClass}
        >
          Incidents
        </NavLink>

        <NavLink
          to="/monitoring"
          className={navItemClass}
        >
          Monitoring
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;