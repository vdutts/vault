"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setupPin } from "@/lib/pin-auth"
import { Shield } from "lucide-react"

interface PinSetupDialogProps {
  open: boolean
  onComplete: () => void
  onSkip: () => void
}

export function PinSetupDialog({ open, onComplete, onSkip }: PinSetupDialogProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"enter" | "confirm">("enter")

  const handlePinChange = (value: string) => {
    // Only allow digits and max 4 characters
    const cleaned = value.replace(/\D/g, "").slice(0, 4)

    if (step === "enter") {
      setPin(cleaned)
      if (cleaned.length === 4) {
        setTimeout(() => setStep("confirm"), 100)
      }
    } else {
      setConfirmPin(cleaned)
    }
  }

  const handleSubmit = async () => {
    if (pin !== confirmPin) {
      setError("PINs don't match")
      setConfirmPin("")
      setStep("enter")
      setPin("")
      return
    }

    try {
      await setupPin(pin)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to setup PIN")
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Setup Quick Unlock</DialogTitle>
          <DialogDescription className="text-center">
            {step === "enter" ? "Create a 4-digit PIN for quick access" : "Confirm your PIN"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin" className="sr-only">
              {step === "enter" ? "Enter PIN" : "Confirm PIN"}
            </Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={step === "enter" ? pin : confirmPin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              className="text-center text-2xl tracking-widest"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onSkip} className="flex-1 bg-transparent">
              Skip
            </Button>
            <Button onClick={handleSubmit} disabled={confirmPin.length !== 4} className="flex-1">
              Setup PIN
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
