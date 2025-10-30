"use client"

import type { VaultItem } from "./vault-layout"
import { Card } from "@/components/ui/card"
import { Key, FileText, ListChecks, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

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

  const getFaviconUrl = (url: string | null) => {
    if (!url) return null
    try {
      const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(item.website_url)

  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-accent ${isSelected ? "bg-accent" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {faviconUrl ? (
          <div className="mt-1 w-4 h-4 relative flex-shrink-0">
            <Image
              src={faviconUrl || "/placeholder.svg"}
              alt=""
              width={16}
              height={16}
              className="rounded-sm"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          </div>
        ) : (
          <div className="mt-1 text-muted-foreground">{getIcon()}</div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{item.title}</h3>
          {item.username && <p className="text-xs text-muted-foreground truncate mt-1">{item.username}</p>}
          {item.website_url && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {item.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </p>
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
