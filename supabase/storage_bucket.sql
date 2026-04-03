-- Create research exports storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'research-exports',
  'research-exports',
  false,
  52428800, -- 50MB
  array[
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/markdown',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- Allow authenticated users to upload their own files
create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'research-exports' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
create policy "Users can read own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'research-exports' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'research-exports' 
  and (storage.foldername(name))[1] = auth.uid()::text
);
