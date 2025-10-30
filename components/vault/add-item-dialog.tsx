"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
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
      <DialogContent className="max-w-2xl glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add New Item</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a new login, note, or checklist
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground">
              Type
            </Label>
            <Select value={type} onValueChange={(value) => handleTypeChange(value as VaultItemType)}>
              <SelectTrigger className="glass-input border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass border-white/10">
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="checklist">Checklist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type === "login" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getTitlePlaceholder()}
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">
                  Username / Email
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="user@example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password (optional)
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">
                  Website URL
                </Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, personal, important"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}

          {type === "note" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getTitlePlaceholder()}
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your note here..."
                  rows={12}
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">
                  Website URL (optional)
                </Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="work, personal, important"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </>
          )}

          {type === "checklist" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={getTitlePlaceholder()}
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
                <Label htmlFor="website" className="text-foreground">
                  Website URL (optional)
                </Label>
                <Input
                  id="website"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="glass-input border-white/10 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-foreground">
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
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
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
