"use client"

import { createContext, useContext, useState } from "react"

// Create Context
const AppContext = createContext()

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider")
  }
  return context
}

// Provider Component
export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  // Add notification
  const addNotification = (message, type = "info") => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, message, type }])

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeNotification(id)
    }, 5000)
  }

  // Remove notification
  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const value = {
    user,
    setUser,
    notifications,
    addNotification,
    removeNotification,
    loading,
    setLoading,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export default AppContext
