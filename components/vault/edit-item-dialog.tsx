"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import type { VaultItem } from "./vault-layout"

interface EditItemDialogProps {
  item: VaultItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditItemDialog({ item, open, onOpenChange, onSuccess }: EditItemDialogProps) {
  const [title, setTitle] = useState(item.title)
  const [username, setUsername] = useState(item.username || "")
  const [password, setPassword] = useState(item.password || "")
  const [websiteUrl, setWebsiteUrl] = useState(item.website_url || "")
  const [notes, setNotes] = useState(item.notes || "")
  const [tags, setTags] = useState(item.tags?.join(", ") || "")
  const [checklistItems, setChecklistItems] = useState<{ text: string; completed: boolean }[]>(
    item.checklist_items || [],
  )
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(item.title)
    setUsername(item.username || "")
    setPassword(item.password || "")
    setWebsiteUrl(item.website_url || "")
    setNotes(item.notes || "")
    setTags(item.tags?.join(", ") || "")
    setChecklistItems(item.checklist_items || [])
  }, [item])

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, { text: newChecklistItem.trim(), completed: false }])
      setNewChecklistItem("")
    }
  }

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  const handleToggleChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const updateData: Record<string, unknown> = {
      title,
      website_url: websiteUrl || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
    }

    if (item.type === "login") {
      updateData.username = username || null
      updateData.password = password || null
    }

    if (item.type === "note") {
      updateData.notes = notes || null
    }

    if (item.type === "checklist") {
      updateData.checklist_items = checklistItems
    }

    const { error: updateError } = await supabase.from("vault_items").update(updateData).eq("id", item.id)

    if (updateError) {
      console.error("[v0] Error updating item:", updateError)
      setError(updateError.message)
    } else {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Item</DialogTitle>
          <DialogDescription className="text-muted-foreground">Update your {item.type} details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {item.type === "login" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Gmail Account"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-username" className="text-foreground">
                  Username / Email
                </Label>
                <Input
                  id="edit-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user@example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password" className="text-foreground">
                  Password (optional)
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-website" className="text-foreground">
                  Website URL
                </Label>
                <Input
                  id="edit-website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags" className="text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="edit-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, personal, important"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}

          {item.type === "note" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="New note"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes" className="text-foreground">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your note here..."
                  rows={12}
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-website" className="text-foreground">
                  Website URL (optional)
                </Label>
                <Input
                  id="edit-website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags" className="text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="edit-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, personal, important"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}

          {item.type === "checklist" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="New checklist"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Checklist Items</Label>
                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 glass-input border-white/10 p-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklistItem(index)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-primary"
                      />
                      <span className={`flex-1 text-foreground ${item.completed ? "line-through opacity-50" : ""}`}>
                        {item.text}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveChecklistItem(index)}
                        className="h-6 w-6 p-0 hover:bg-destructive/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newChecklistItem}
                      onChange={(e) => setNewChecklistItem(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddChecklistItem()
                        }
                      }}
                      placeholder="Add new item..."
                      className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                    />
                    <Button
                      type="button"
                      onClick={handleAddChecklistItem}
                      size="sm"
                      className="bg-primary hover:bg-primary/80"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-website" className="text-foreground">
                  Website URL (optional)
                </Label>
                <Input
                  id="edit-website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags" className="text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="edit-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, personal, important"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 glass-input border-white/10 hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/80">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
