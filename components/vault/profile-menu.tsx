"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle, Download, LogOut, Shield } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { disablePin, isPinEnabled } from "@/lib/pin-auth"

interface ProfileMenuProps {
  user: User
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = useState(false)
  const [pinEnabled, setPinEnabled] = useState(isPinEnabled())

  const handleSignOut = async () => {
    const supabase = createClient()
    disablePin()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleExport = async () => {
    setIsExporting(true)
    const supabase = createClient()

    const { data, error } = await supabase.from("vault_items").select("*").order("updated_at", { ascending: false })

    if (error) {
      console.error("[v0] Error exporting vault:", error)
      alert("Failed to export vault data")
    } else {
      const exportData = {
        exported_at: new Date().toISOString(),
        user_email: user.email,
        items: data,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vault-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    setIsExporting(false)
  }

  const handleTogglePin = () => {
    if (pinEnabled) {
      disablePin()
      setPinEnabled(false)
    } else {
      // Redirect to login to set up new PIN
      router.push("/auth/login")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10 transition-all duration-200"
          title="Profile"
        >
          <UserCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass border-border/50">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Account</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem onClick={handleExport} disabled={isExporting} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          <span>{isExporting ? "Exporting..." : "Export Vault"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTogglePin} className="cursor-pointer">
          <Shield className="mr-2 h-4 w-4" />
          <span>{pinEnabled ? "Disable PIN" : "Enable PIN"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-400 focus:text-red-400">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
