"use client"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Key, FileText, ListChecks, LogOut, Plus, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { VaultItemType } from "./vault-layout"
import { useState } from "react"
import { AddItemDialog } from "./add-item-dialog"

interface VaultSidebarProps {
  user: User
  selectedType: VaultItemType | "all"
  onTypeChange: (type: VaultItemType | "all") => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onRefresh: () => void
}

export function VaultSidebar({
  user,
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  onRefresh,
}: VaultSidebarProps) {
  const router = useRouter()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const handleAddSuccess = () => {
    setShowAddDialog(false)
    onRefresh()
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

  return (
    <>
      <div className="w-64 border-r border-border/50 glass flex flex-col">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold tracking-tight">Vault</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              title="Sign out"
              className="hover:bg-white/10 transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 glass-input border-white/10 focus:border-primary/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            <Button
              variant={selectedType === "all" ? "secondary" : "ghost"}
              className={`w-full justify-start transition-all duration-200 ${
                selectedType === "all" ? "bg-white/10 text-foreground shadow-lg" : "hover:bg-white/5"
              }`}
              onClick={() => onTypeChange("all")}
            >
              All Items
            </Button>
            <Button
              variant={selectedType === "login" ? "secondary" : "ghost"}
              className={`w-full justify-start transition-all duration-200 ${
                selectedType === "login" ? "bg-white/10 text-foreground shadow-lg" : "hover:bg-white/5"
              }`}
              onClick={() => onTypeChange("login")}
            >
              <Key className="mr-2 h-4 w-4" />
              Logins
            </Button>
            <Button
              variant={selectedType === "note" ? "secondary" : "ghost"}
              className={`w-full justify-start transition-all duration-200 ${
                selectedType === "note" ? "bg-white/10 text-foreground shadow-lg" : "hover:bg-white/5"
              }`}
              onClick={() => onTypeChange("note")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Notes
            </Button>
            <Button
              variant={selectedType === "checklist" ? "secondary" : "ghost"}
              className={`w-full justify-start transition-all duration-200 ${
                selectedType === "checklist" ? "bg-white/10 text-foreground shadow-lg" : "hover:bg-white/5"
              }`}
              onClick={() => onTypeChange("checklist")}
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Checklists
            </Button>
          </div>
        </div>

        <div className="p-3 border-t border-border/50 space-y-2">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button
            variant="outline"
            className="w-full glass-input border-white/10 hover:bg-white/5 transition-all duration-200 bg-transparent"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <p className="text-xs text-muted-foreground text-center truncate px-2">{user.email}</p>
        </div>
      </div>

      <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={handleAddSuccess} />
    </>
  )
}
