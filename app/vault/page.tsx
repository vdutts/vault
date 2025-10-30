import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { VaultLayout } from "@/components/vault/vault-layout"

export default async function VaultPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <VaultLayout user={data.user} />
}
