"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { VaultItem, VaultItemType } from "./vault-layout"
import { VaultItemCard } from "./vault-item-card"
import { VaultItemDetail } from "./vault-item-detail"
import { Loader2 } from "lucide-react"

interface VaultContentProps {
  selectedType: VaultItemType | "all"
  searchQuery: string
  selectedItem: VaultItem | null
  onSelectItem: (item: VaultItem | null) => void
  refreshTrigger: number
  onRefresh: () => void
}

export function VaultContent({
  selectedType,
  searchQuery,
  selectedItem,
  onSelectItem,
  refreshTrigger,
  onRefresh,
}: VaultContentProps) {
  const [items, setItems] = useState<VaultItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      const supabase = createClient()

      let query = supabase.from("vault_items").select("*").order("updated_at", { ascending: false })

      if (selectedType !== "all") {
        query = query.eq("type", selectedType)
      }

      const { data, error } = await query

      if (error) {
        console.error("[v0] Error fetching vault items:", error)
      } else {
        let filteredData = data || []

        if (searchQuery) {
          const lowerQuery = searchQuery.toLowerCase()
          filteredData = filteredData.filter((item) => {
            return (
              item.title.toLowerCase().includes(lowerQuery) ||
              item.username?.toLowerCase().includes(lowerQuery) ||
              item.website_url?.toLowerCase().includes(lowerQuery) ||
              item.notes?.toLowerCase().includes(lowerQuery) ||
              item.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
            )
          })
        }

        setItems(filteredData)
      }
      setIsLoading(false)
    }

    fetchItems()
  }, [selectedType, searchQuery, refreshTrigger])

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No items found</p>
          </div>
        ) : (
          <div className="grid gap-3 max-w-4xl">
            {items.map((item) => (
              <VaultItemCard
                key={item.id}
                item={item}
                isSelected={selectedItem?.id === item.id}
                onClick={() => onSelectItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedItem && (
        <VaultItemDetail
          item={selectedItem}
          onClose={() => onSelectItem(null)}
          onUpdate={onRefresh}
          onDelete={() => {
            onSelectItem(null)
            onRefresh()
          }}
        />
      )}
    </div>
  )
}
