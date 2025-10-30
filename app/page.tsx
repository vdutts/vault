"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { hasStoredSession } from "@/lib/pin-auth"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (hasStoredSession()) {
      router.push("/auth/pin")
    } else {
      router.push("/vault")
    }
  }, [router])

  return null
}
