"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { VaultSidebar } from "./vault-sidebar"
import { VaultContent } from "./vault-content"

export type VaultItemType = "login" | "note" | "checklist"

export interface VaultItem {
  id: string
  user_id: string
  type: VaultItemType
  title: string
  username?: string | null
  password?: string | null
  website_url?: string | null
  notes?: string | null
  tags?: string[] | null
  checklist_items?: { text: string; completed: boolean }[] | null
  created_at: string
  updated_at: string
}

export function VaultLayout({ user }: { user: User }) {
  const [selectedType, setSelectedType] = useState<VaultItemType | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="flex h-screen bg-background">
      <VaultSidebar
        user={user}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
      />
      <VaultContent
        selectedType={selectedType}
        searchQuery={searchQuery}
        selectedItem={selectedItem}
        onSelectItem={setSelectedItem}
        refreshTrigger={refreshTrigger}
        onRefresh={handleRefresh}
      />
    </div>
  )
}
