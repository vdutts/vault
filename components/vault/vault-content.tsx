"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { VaultItem, VaultItemType } from "./vault-layout"
import { VaultItemCard } from "./vault-item-card"
import { VaultItemDetail } from "./vault-item-detail"
import { Loader2, Plus } from "lucide-react"
import { AddItemDialog } from "./add-item-dialog"
import { Button } from "@/components/ui/button"

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
  const [showAddDialog, setShowAddDialog] = useState(false)

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
    <>
      <div className="flex-1 flex">
        <div className="flex-1 overflow-y-auto p-6 relative">
          <Button
            onClick={() => setShowAddDialog(true)}
            size="icon"
            className="absolute top-6 right-6 z-10 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-200 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
          >
            <Plus className="h-5 w-5" />
          </Button>

          {items.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">No items yet</p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first item
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 max-w-4xl pr-16">
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

      <AddItemDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={() => {
          setShowAddDialog(false)
          onRefresh()
        }}
      />
    </>
  )
}
