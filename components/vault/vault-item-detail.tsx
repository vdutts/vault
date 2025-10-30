"use client"

import { useState } from "react"
import type { VaultItem } from "./vault-layout"
import { Button } from "@/components/ui/button"
import { X, Copy, Eye, EyeOff, Pencil, Trash2, Check, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { EditItemDialog } from "./edit-item-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface VaultItemDetailProps {
  item: VaultItem
  onClose: () => void
  onUpdate: () => void
  onDelete: () => void
}

export function VaultItemDetail({ item, onClose, onUpdate, onDelete }: VaultItemDetailProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newChecklistItem, setNewChecklistItem] = useState("")

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("vault_items").delete().eq("id", item.id)

    if (error) {
      console.error("[v0] Error deleting item:", error)
      alert("Failed to delete item")
    } else {
      onDelete()
    }
    setIsDeleting(false)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    onUpdate()
  }

  const handleChecklistToggle = async (index: number) => {
    const supabase = createClient()
    const checklistItems = item.checklist_items || []
    const updatedItems = [...checklistItems]
    updatedItems[index] = { ...updatedItems[index], completed: !updatedItems[index].completed }

    const { error } = await supabase.from("vault_items").update({ checklist_items: updatedItems }).eq("id", item.id)

    if (error) {
      console.error("[v0] Error updating checklist:", error)
    } else {
      onUpdate()
    }
  }

  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim()) return

    const supabase = createClient()
    const checklistItems = item.checklist_items || []
    const updatedItems = [...checklistItems, { text: newChecklistItem.trim(), completed: false }]

    const { error } = await supabase.from("vault_items").update({ checklist_items: updatedItems }).eq("id", item.id)

    if (error) {
      console.error("[v0] Error adding checklist item:", error)
    } else {
      setNewChecklistItem("")
      onUpdate()
    }
  }

  const handleDeleteChecklistItem = async (index: number) => {
    const supabase = createClient()
    const checklistItems = item.checklist_items || []
    const updatedItems = checklistItems.filter((_, i) => i !== index)

    const { error } = await supabase.from("vault_items").update({ checklist_items: updatedItems }).eq("id", item.id)

    if (error) {
      console.error("[v0] Error deleting checklist item:", error)
    } else {
      onUpdate()
    }
  }

  return (
    <>
      <div className="w-96 border-l border-border bg-card p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Details</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowEditDialog(true)} title="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting} title="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
            <p className="text-sm">{item.title}</p>
          </div>

          {item.username && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Username</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(item.username!, "username")}
                >
                  {copiedField === "username" ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm font-mono">{item.username}</p>
            </div>
          )}

          {item.password && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Password</p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(item.password!, "password")}
                  >
                    {copiedField === "password" ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-sm font-mono">{showPassword ? item.password : "••••••••••••"}</p>
            </div>
          )}

          {item.website_url && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(item.website_url!, "website")}
                >
                  {copiedField === "website" ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <a
                href={item.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {item.website_url}
              </a>
            </div>
          )}

          {item.type === "checklist" && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Checklist</p>
              <div className="space-y-2">
                {item.checklist_items?.map((checklistItem, index) => (
                  <div key={index} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={checklistItem.completed}
                      onCheckedChange={() => handleChecklistToggle(index)}
                      id={`checklist-${index}`}
                    />
                    <label
                      htmlFor={`checklist-${index}`}
                      className={`flex-1 text-sm cursor-pointer ${checklistItem.completed ? "line-through text-muted-foreground" : ""}`}
                    >
                      {checklistItem.text}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteChecklistItem(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-3">
                  <Input
                    placeholder="Add new item..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddChecklistItem()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddChecklistItem} disabled={!newChecklistItem.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {item.notes && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(item.notes!, "notes")}
                >
                  {copiedField === "notes" ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
            </div>
          )}

          {item.tags && item.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Tags</p>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md bg-secondary text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Last updated: {new Date(item.updated_at).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Created: {new Date(item.created_at).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <EditItemDialog
        item={item}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}
