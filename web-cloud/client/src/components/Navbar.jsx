import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      {/* Brand */}
      <div className="text-xl font-bold text-indigo-400">Vamshi Pages</div>

      {/* Links */}
      <div className="flex gap-6">
        <NavLink
          to="/page7"
          className={({ isActive }) =>
            `px-3 py-1 rounded-md font-medium ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`
          }
        >
          Page 7
        </NavLink>
        <NavLink
          to="/page9"
          className={({ isActive }) =>
            `px-3 py-1 rounded-md font-medium ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:text-white hover:bg-gray-700"
            }`
          }
        >
          Page 9
        </NavLink>
      </div>
    </nav>
  );
}
