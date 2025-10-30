"use client"

import { useEffect } from "react"

export function PWARegister() {
  useEffect(() => {
    // Service workers work better in production deployments
    // Uncomment below to enable in production:
    /*
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[v0] Service Worker registered:", registration)
        })
        .catch((error) => {
          console.log("[v0] Service Worker registration failed:", error)
        })
    }
    */
  }, [])

  return null
}
