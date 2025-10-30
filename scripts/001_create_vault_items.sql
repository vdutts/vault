-- Create vault_items table to store passwords, notes, and checklists
create table if not exists public.vault_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('login', 'note', 'checklist')),
  title text not null,
  username text,
  password text,
  website_url text,
  notes text,
  tags text[], -- Array of tags
  checklist_items jsonb, -- For checklist type: [{ text: string, completed: boolean }]
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.vault_items enable row level security;

-- RLS Policies
create policy "Users can view their own vault items"
  on public.vault_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own vault items"
  on public.vault_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own vault items"
  on public.vault_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own vault items"
  on public.vault_items for delete
  using (auth.uid() = user_id);

-- Create index for faster queries
create index vault_items_user_id_idx on public.vault_items(user_id);
create index vault_items_updated_at_idx on public.vault_items(updated_at desc);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at
create trigger update_vault_items_updated_at
  before update on public.vault_items
  for each row
  execute function update_updated_at_column();
