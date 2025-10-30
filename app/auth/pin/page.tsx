"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { verifyPin, hasStoredSession, disablePin } from "@/lib/pin-auth"
import { Shield, AlertCircle } from "lucide-react"

export default function PinUnlockPage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // If no stored session, redirect to login
    if (!hasStoredSession()) {
      router.push("/auth/login")
    }
  }, [router])

  const handlePinChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 4)
    setPin(cleaned)
    setError(null)

    // Auto-submit when 4 digits entered
    if (cleaned.length === 4) {
      handleUnlock(cleaned)
    }
  }

  const handleUnlock = async (pinValue: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const isValid = await verifyPin(pinValue)

      if (isValid) {
        router.push("/vault")
      } else {
        setError("Incorrect PIN")
        setPin("")
      }
    } catch (err) {
      setError("Failed to verify PIN")
      setPin("")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPin = () => {
    disablePin()
    router.push("/auth/login")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Enter PIN</CardTitle>
            <CardDescription className="text-center">Enter your 4-digit PIN to unlock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••"
                className="text-center text-3xl tracking-widest"
                autoFocus
                disabled={isLoading}
              />

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button variant="ghost" onClick={handleForgotPin} className="w-full">
                Forgot PIN? Sign in with password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
