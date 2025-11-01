"use client"
import { Home, Car, MapPin, FileText, BarChart3, LogOut, Menu, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const Navbar = ({ activeScreen, setActiveScreen }) => {
  const [hoveredItem, setHoveredItem] = useState(null)
  const [isOpen, setIsOpen] = useState(true)
  const sidebarRef = useRef(null)

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, color: "from-green-500 to-emerald-500" },
    { id: "vehicles", label: "Vehicle Logs", icon: Car, color: "from-green-500 to-emerald-500" },
    { id: "zones", label: "Parking Zones", icon: MapPin, color: "from-green-500 to-emerald-500" },
    { id: "logs", label: "Logs & Reports", icon: FileText, color: "from-green-500 to-emerald-500" },
    { id: "TrafficAnalytics", label: "Traffic", icon: BarChart3, color: "from-green-500 to-emerald-500" },
  ]

  // 🧠 Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Toggle Button (always visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 bg-white border border-slate-200 p-2 rounded-lg shadow-md hover:bg-slate-100 transition-all"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full z-40 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-r border-slate-200/60 text-foreground flex flex-col shadow-xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-72`}
      >
        <div className="relative p-8 border-b border-slate-200/40 bg-gradient-to-br from-white via-slate-50 to-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-left">
              <span className="text-black">Vision</span>
              <span className="text-blue-400">Park</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeScreen === item.id
            const isHovered = hoveredItem === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveScreen(item.id)
                  setIsOpen(false) // hide sidebar when clicked
                }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`w-full group relative px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm overflow-hidden ${
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/20 scale-105`
                    : "text-slate-700 hover:text-slate-900"
                }`}
              >
                {!isActive && (
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />
                )}

                <div className="relative z-10 flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 shadow-lg"
                        : "bg-slate-100 group-hover:bg-slate-200 group-hover:shadow-md"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`flex-shrink-0 transition-transform duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-slate-600 group-hover:text-slate-900"
                      } ${isHovered && !isActive ? "scale-110" : ""}`}
                    />
                  </div>
                  <span
                    className={`transition-all duration-300 ${
                      isActive ? "font-semibold" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg" />
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-200/40 bg-gradient-to-t from-slate-50 to-transparent">
          <button className="w-full group relative px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            <div className="relative z-10 flex items-center gap-3 justify-center">
              <LogOut size={18} className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span>Logout</span>
            </div>
          </button>

          <div className="mt-4 pt-4 border-t border-slate-200/40">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                VP
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@visionpark.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
