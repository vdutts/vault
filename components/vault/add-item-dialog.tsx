"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, ChevronDown, ChevronRight } from "lucide-react"
import type { VaultItemType } from "./vault-layout"

interface AddItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddItemDialog({ open, onOpenChange, onSuccess }: AddItemDialogProps) {
  const [type, setType] = useState<VaultItemType>("login")
  const [title, setTitle] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState("")
  const [checklistItems, setChecklistItems] = useState<{ text: string; completed: boolean }[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleTypeChange = (newType: VaultItemType) => {
    setType(newType)
    setTitle("")
    setUsername("")
    setPassword("")
    setWebsiteUrl("")
    setNotes("")
    setTags("")
    setChecklistItems([])
    setNewChecklistItem("")
  }

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError("You must be logged in")
      setIsLoading(false)
      return
    }

    const tagsArray = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const { error: insertError } = await supabase.from("vault_items").insert({
      user_id: user.id,
      type,
      title,
      username: type === "login" ? username || null : null,
      password: type === "login" ? password || null : null,
      website_url: websiteUrl || null,
      notes: type === "note" ? notes || null : null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      checklist_items: type === "checklist" ? checklistItems : null,
    })

    if (insertError) {
      console.error("[v0] Error creating item:", insertError)
      setError(insertError.message)
    } else {
      setTitle("")
      setUsername("")
      setPassword("")
      setWebsiteUrl("")
      setNotes("")
      setTags("")
      setChecklistItems([])
      setNewChecklistItem("")
      onSuccess()
    }

    setIsLoading(false)
  }

  const getTitlePlaceholder = () => {
    switch (type) {
      case "login":
        return "e.g., Gmail Account"
      case "note":
        return "New note"
      case "checklist":
        return "New checklist"
      default:
        return "Enter title"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg glass border-border/50 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg">Add New Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "login" ? "default" : "outline"}
              className={`flex-1 ${type === "login" ? "bg-primary text-primary-foreground" : "glass-input border-border/50"}`}
              onClick={() => handleTypeChange("login")}
            >
              Login
            </Button>
            <Button
              type="button"
              variant={type === "note" ? "default" : "outline"}
              className={`flex-1 ${type === "note" ? "bg-primary text-primary-foreground" : "glass-input border-border/50"}`}
              onClick={() => handleTypeChange("note")}
            >
              Note
            </Button>
            <Button
              type="button"
              variant={type === "checklist" ? "default" : "outline"}
              className={`flex-1 ${type === "checklist" ? "bg-primary text-primary-foreground" : "glass-input border-border/50"}`}
              onClick={() => handleTypeChange("checklist")}
            >
              Checklist
            </Button>
          </div>

          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getTitlePlaceholder()}
              className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground text-base h-11"
              required
              autoFocus
            />
          </div>

          {type === "login" && (
            <>
              <div>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or email"
                  className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (optional)"
                  className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                More options
              </button>

              {showAdvanced && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Website URL"
                      className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {type === "note" && (
            <>
              <div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Start writing..."
                  rows={10}
                  className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                More options
              </button>

              {showAdvanced && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Website URL (optional)"
                      className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {type === "checklist" && (
            <>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 glass-input border-border/50 p-2 rounded-lg group"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklistItem(index)}
                      className="w-4 h-4 rounded border-border bg-input checked:bg-primary transition-all"
                    />
                    <span className={`flex-1 text-foreground ${item.completed ? "line-through opacity-50" : ""}`}>
                      {item.text}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveChecklistItem(index)}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                    >
                      <X className="h-3 w-3" />
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
                    placeholder="Add item..."
                    className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    type="button"
                    onClick={handleAddChecklistItem}
                    size="icon"
                    className="bg-primary hover:bg-primary/90 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                More options
              </button>

              {showAdvanced && (
                <div className="space-y-3 animate-fade-in">
                  <div>
                    <Input
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Website URL (optional)"
                      className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      className="glass-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 glass-input border-border/50 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
