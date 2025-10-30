"use client"

import type { VaultItem } from "./vault-layout"
import { Card } from "@/components/ui/card"
import { Key, FileText, ListChecks, Globe, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VaultItemCardProps {
  item: VaultItem
  isSelected: boolean
  onClick: () => void
}

export function VaultItemCard({ item, isSelected, onClick }: VaultItemCardProps) {
  const getIcon = () => {
    switch (item.type) {
      case "login":
        return <Key className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      case "checklist":
        return <ListChecks className="h-4 w-4" />
    }
  }

  const getChecklistProgress = () => {
    if (item.type !== "checklist" || !item.checklist_items) return null
    const total = item.checklist_items.length
    const completed = item.checklist_items.filter((i) => i.completed).length
    return { total, completed }
  }

  const checklistProgress = getChecklistProgress()

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-accent ${isSelected ? "bg-accent" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 text-muted-foreground">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{item.title}</h3>
          {item.username && <p className="text-xs text-muted-foreground truncate mt-1">{item.username}</p>}
          {item.website_url && (
            <div className="flex items-center gap-1 mt-1">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">{item.website_url}</p>
            </div>
          )}
          {checklistProgress && (
            <div className="flex items-center gap-1 mt-1">
              <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                {checklistProgress.completed} / {checklistProgress.total} completed
              </p>
            </div>
          )}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
