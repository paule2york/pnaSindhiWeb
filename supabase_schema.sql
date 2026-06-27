-- Run this in the Supabase SQL editor to create the CMS table.
create table if not exists posts (
  id bigint generated always as identity primary key,
  title text not null,
  body text not null,
  city text not null,
  category text not null,
  published boolean default true,
  created_at timestamptz default now()
);

alter table posts enable row level security;

create policy "public read published" on posts
  for select using (published = true);
