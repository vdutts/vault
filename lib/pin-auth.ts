// PIN authentication utilities for quick unlock

const PIN_STORAGE_KEY = "vault_pin_hash"
const PIN_ENABLED_KEY = "vault_pin_enabled"
const SESSION_STORAGE_KEY = "vault_session_backup"

// Simple hash function for PIN (in production, use a proper crypto library)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

export async function setupPin(pin: string): Promise<void> {
  if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
    throw new Error("PIN must be exactly 4 digits")
  }

  const hashedPin = await hashPin(pin)
  localStorage.setItem(PIN_STORAGE_KEY, hashedPin)
  localStorage.setItem(PIN_ENABLED_KEY, "true")
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(PIN_STORAGE_KEY)
  if (!storedHash) return false

  const hashedPin = await hashPin(pin)
  return hashedPin === storedHash
}

export function isPinEnabled(): boolean {
  return localStorage.getItem(PIN_ENABLED_KEY) === "true"
}

export function disablePin(): void {
  localStorage.removeItem(PIN_STORAGE_KEY)
  localStorage.removeItem(PIN_ENABLED_KEY)
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function hasStoredSession(): boolean {
  return isPinEnabled() && localStorage.getItem(SESSION_STORAGE_KEY) !== null
}

export function storeSessionBackup(sessionData: string): void {
  localStorage.setItem(SESSION_STORAGE_KEY, sessionData)
}

export function getSessionBackup(): string | null {
  return localStorage.getItem(SESSION_STORAGE_KEY)
}
