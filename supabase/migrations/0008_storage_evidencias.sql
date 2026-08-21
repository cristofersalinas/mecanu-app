-- Storage: evidencias de inspección (fotos, vídeo, firmas).
-- Retención: sin borrado automático (revisar si hay obligación legal distinta).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidencias',
  'evidencias',
  false,
  52428800, -- 50 MB
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm',
    'image/svg+xml'
  ]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Path: {taller_id}/{ruta_id}/{filename}
drop policy if exists evidencias_select on storage.objects;
drop policy if exists evidencias_insert on storage.objects;
drop policy if exists evidencias_update on storage.objects;
drop policy if exists evidencias_delete on storage.objects;

create policy evidencias_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'evidencias'
    and (
      public.es_dueno_o_ops()
      or (storage.foldername(name))[1] = public.jwt_taller_id()
    )
  );

create policy evidencias_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'evidencias'
    and (
      public.es_dueno_o_ops()
      or (storage.foldername(name))[1] = public.jwt_taller_id()
    )
  );

create policy evidencias_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'evidencias'
    and (
      public.es_dueno_o_ops()
      or (storage.foldername(name))[1] = public.jwt_taller_id()
    )
  )
  with check (
    bucket_id = 'evidencias'
    and (
      public.es_dueno_o_ops()
      or (storage.foldername(name))[1] = public.jwt_taller_id()
    )
  );

create policy evidencias_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'evidencias'
    and public.es_dueno_o_ops()
  );
