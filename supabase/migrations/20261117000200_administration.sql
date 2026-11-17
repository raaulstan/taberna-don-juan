-- Requiere la migración inicial y los esquemas Auth/Storage de Supabase.
-- No contiene reservas, clientes, mesas ni datos de demostración.
begin;

alter table public.staff_members add column display_name text not null default '';
alter table public.staff_members add column active boolean not null default true;
alter table public.staff_members drop constraint staff_members_role_check;
alter table public.staff_members add constraint staff_members_role_check
  check (role in ('owner','manager','waiter','kitchen','employee'));
alter table public.staff_members add constraint staff_name_length check (length(display_name) <= 120);

create function public.restaurant_staff(roles text[]) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.staff_members
    where user_id = (select auth.uid()) and active and role = any(roles));
$$;
revoke all on function public.restaurant_staff(text[]) from public;
grant execute on function public.restaurant_staff(text[]) to anon, authenticated;

create table public.admin_records (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('category','product','content')),
  parent_id uuid references public.admin_records(id) on delete restrict,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  published boolean not null default false,
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
create index admin_records_kind_updated on public.admin_records(kind, updated_at desc);
create index admin_records_parent on public.admin_records(parent_id);
create index admin_records_public on public.admin_records(kind) where published;
create unique index admin_content_singleton on public.admin_records(kind) where kind = 'content';
create unique index admin_category_slug on public.admin_records((payload->>'slug')) where kind='category';

create table public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  entity text not null,
  record_id text not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE','UPLOAD')),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_created on public.admin_audit(created_at desc);
create index admin_audit_actor on public.admin_audit(actor_id, created_at desc);

create table public.admin_write_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  started_at timestamptz not null,
  attempts integer not null
);
alter table public.admin_write_limits enable row level security;
revoke all on public.admin_write_limits from anon, authenticated;

create function public.admin_write_limit() returns void
language plpgsql security definer set search_path = '' as $$
declare n integer;
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  insert into public.admin_write_limits values(auth.uid(), now(), 1)
  on conflict (user_id) do update set
    attempts = case when admin_write_limits.started_at < now() - interval '1 minute' then 1 else admin_write_limits.attempts + 1 end,
    started_at = case when admin_write_limits.started_at < now() - interval '1 minute' then now() else admin_write_limits.started_at end
  returning attempts into n;
  if n > 60 then raise exception 'write_rate_limit' using errcode = 'P0001'; end if;
end;
$$;
revoke all on function public.admin_write_limit() from public, anon, authenticated;

create function public.admin_validate_record() returns trigger
language plpgsql set search_path = '' as $$
declare parent public.admin_records; code text; entry jsonb; item jsonb;
begin
  if new.kind in ('category','product') then
    if not (new.payload ?& array['name_es','name_en','catalog'])
       or jsonb_typeof(new.payload->'name_es') <> 'string'
       or length(btrim(new.payload->>'name_es')) not between 1 and 180
       or length(new.payload->>'name_en') > 180
       or coalesce(new.payload->>'catalog','') not in ('food','drink') then
      raise check_violation using message = 'Invalid catalogue record';
    end if;
  end if;
  if new.parent_id is not null then
    select * into parent from public.admin_records where id = new.parent_id;
    if parent.id is null or parent.kind <> 'category' or new.parent_id = new.id
       or parent.payload->>'catalog' <> new.payload->>'catalog'
       or (new.kind = 'category' and parent.parent_id is not null) then
      raise check_violation using message = 'Invalid category hierarchy';
    end if;
  end if;
  if new.kind = 'category' then
    if coalesce(new.payload->>'slug','') !~ '^[a-z][a-z0-9-]{0,79}$' then raise check_violation; end if;
    if (new.payload - array['name_es','name_en','catalog','slug','order']) <> '{}'::jsonb
       or jsonb_typeof(new.payload->'name_en') is distinct from 'string'
       or jsonb_typeof(new.payload->'order') is distinct from 'number'
       or coalesce(new.payload->>'order','') !~ '^[0-9]{1,4}$' then raise check_violation; end if;
    if exists(select 1 from public.admin_records c where c.parent_id = new.id and
      (c.payload->>'catalog' <> new.payload->>'catalog' or (c.kind='category' and new.parent_id is not null))) then
      raise check_violation using message = 'Category has incompatible children';
    end if;
  elsif new.kind = 'product' then
    if (new.payload - array['name_es','name_en','catalog','description_es','description_en','price_cents','availability','allergens','ingredients_es','ingredients_en','image_path','featured','additional_es','additional_en']) <> '{}'::jsonb then raise check_violation; end if;
    foreach code in array array['name_en','description_es','description_en','ingredients_es','ingredients_en','image_path','additional_es','additional_en'] loop
      if jsonb_typeof(new.payload->code) is distinct from 'string' or length(new.payload->>code)>5000 then raise check_violation; end if;
    end loop;
    if jsonb_typeof(new.payload->'featured') is distinct from 'boolean'
       or coalesce(new.payload->>'image_path','') !~ '^$|^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif)$' then raise check_violation; end if;
    if new.parent_id is null or not (new.payload ?& array['description_es','price_cents','availability','allergens'])
       or jsonb_typeof(new.payload->'description_es') <> 'string'
       or length(new.payload->>'description_es') > 5000
       or coalesce(new.payload->>'availability','') not in ('unknown','available','unavailable')
       or jsonb_typeof(new.payload->'price_cents') <> 'number' then
      raise check_violation using message = 'Invalid product';
    end if;
    if (new.payload->>'price_cents')::numeric not between 0 and 9999999
       or (new.payload->>'price_cents')::numeric <> trunc((new.payload->>'price_cents')::numeric) then
      raise check_violation using message = 'Invalid price';
    end if;
    if new.payload->'allergens' <> 'null'::jsonb then
      if jsonb_typeof(new.payload->'allergens') <> 'array' or jsonb_array_length(new.payload->'allergens') = 0 then
        raise check_violation using message = 'Unknown allergens must be null';
      end if;
      for code in select jsonb_array_elements_text(new.payload->'allergens') loop
        if code <> all(array['gluten','shellfish','eggs','fish','peanuts','soy','milk','nuts','celery','mustard','sesame','sulphites','lupin','molluscs']) then
          raise check_violation using message = 'Invalid allergen';
        end if;
      end loop;
    end if;
  elsif new.kind = 'content' then
    if new.parent_id is not null or jsonb_typeof(new.payload->'contact') is distinct from 'object'
       or jsonb_typeof(new.payload->'texts') is distinct from 'object' then
      raise check_violation using message = 'Invalid site document';
    end if;
    if (new.payload - array['contact','texts','hero_path','story_path','image_caption_es','image_caption_en']) <> '{}'::jsonb then raise check_violation; end if;
    entry = new.payload->'contact';
    if (entry - array['address','mobile','landline','email','instagram','facebook','hours_es','hours_en','closures']) <> '{}'::jsonb
      or length(coalesce(entry->>'address','')) not between 1 and 300
      or coalesce(entry->>'mobile','') !~ '^\+[0-9]{8,15}$'
      or coalesce(entry->>'landline','') !~ '^$|^\+[0-9]{8,15}$'
      or jsonb_typeof(entry->'closures') is distinct from 'array' then raise check_violation; end if;
    foreach code in array array['address','mobile','landline','email','instagram','facebook','hours_es','hours_en'] loop
      if jsonb_typeof(entry->code) is distinct from 'string' or length(entry->>code)>500 then raise check_violation; end if;
    end loop;
    if (entry->>'instagram'<>'' and entry->>'instagram' !~ '^https://(www\.)?instagram\.com/[^/].*')
      or (entry->>'facebook'<>'' and entry->>'facebook' !~ '^https://(www\.)?facebook\.com/[^/].*') then raise check_violation; end if;
    if jsonb_array_length(entry->'closures')>100 then raise check_violation; end if;
    for item in select jsonb_array_elements(entry->'closures') loop
      if jsonb_typeof(item) <> 'object' or (item-array['date','label'])<>'{}'::jsonb
        or coalesce(item->>'date','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
        or length(coalesce(item->>'label','')) not between 1 and 160 then raise check_violation; end if;
      perform (item->>'date')::date;
    end loop;
    if ((new.payload->'texts') - array['title','heroLine','description','storyLead','storyDescription','contactDescription']) <> '{}'::jsonb then raise check_violation; end if;
    foreach code in array array['title','heroLine','description','storyLead','storyDescription','contactDescription'] loop
      item = new.payload->'texts'->code;
      if jsonb_typeof(item) is distinct from 'object' or (item-array['es','en'])<>'{}'::jsonb
        or jsonb_typeof(item->'es') is distinct from 'string' or jsonb_typeof(item->'en') is distinct from 'string'
        or length(item->>'es')>1200 or length(item->>'en')>1200
        or item->>'es' ~ '[{}<>]' or item->>'en' ~ '[{}<>]' then raise check_violation; end if;
    end loop;
    foreach code in array array['hero_path','story_path'] loop
      if jsonb_typeof(new.payload->code) is distinct from 'string'
        or new.payload->>code !~ '^$|^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp|avif)$' then raise check_violation; end if;
    end loop;
    foreach code in array array['image_caption_es','image_caption_en'] loop
      if jsonb_typeof(new.payload->code) is distinct from 'string' or length(new.payload->>code)>500 then raise check_violation; end if;
    end loop;
    if (new.payload->>'hero_path'<>'' or new.payload->>'story_path'<>'') and
      (length(btrim(new.payload->>'image_caption_es'))=0 or length(btrim(new.payload->>'image_caption_en'))=0) then raise check_violation; end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;
create trigger admin_validate_record before insert or update on public.admin_records
for each row execute function public.admin_validate_record();
revoke all on function public.admin_validate_record() from public, anon, authenticated;

create function public.admin_audit_change() returns trigger
language plpgsql security definer set search_path = '' as $$
declare old_data jsonb; new_data jsonb;
begin
  if tg_op <> 'INSERT' then old_data = to_jsonb(old); end if;
  if tg_op <> 'DELETE' then new_data = to_jsonb(new); end if;
  insert into public.admin_audit(actor_id,entity,record_id,action,before_data,after_data)
  values(auth.uid(),tg_table_name,coalesce(new_data->>'id',old_data->>'id',new_data->>'user_id',old_data->>'user_id'),tg_op,old_data,new_data);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.admin_audit_change() from public, anon, authenticated;
create trigger audit_records after insert or update or delete on public.admin_records for each row execute function public.admin_audit_change();
create trigger audit_staff after insert or update or delete on public.staff_members for each row execute function public.admin_audit_change();

create function public.restaurant_parent_public(p_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select p_id is null or exists(select 1 from public.admin_records p where p.id=p_id and p.published
    and (p.parent_id is null or exists(select 1 from public.admin_records r where r.id=p.parent_id and r.published)));
$$;
revoke all on function public.restaurant_parent_public(uuid) from public;
grant execute on function public.restaurant_parent_public(uuid) to anon, authenticated;

alter table public.admin_records enable row level security;
alter table public.admin_audit enable row level security;
revoke all on public.admin_records, public.admin_audit from anon, authenticated;
grant select on public.admin_records to anon, authenticated;
grant select on public.admin_audit to authenticated;
create policy records_read_published on public.admin_records for select to anon, authenticated
using (published and public.restaurant_parent_public(parent_id));
create policy records_read_management on public.admin_records for select to authenticated
using (public.restaurant_staff(array['owner','manager']));
create policy audit_read_owner on public.admin_audit for select to authenticated
using (public.restaurant_staff(array['owner']));
create policy staff_read_owner on public.staff_members for select to authenticated
using (public.restaurant_staff(array['owner']));

create function public.admin_save_record(p_id uuid, p_kind text, p_parent_id uuid, p_payload jsonb, p_published boolean, p_version integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare current_row public.admin_records;
begin
  if not public.restaurant_staff(array['owner','manager']) then raise insufficient_privilege; end if;
  if p_version is null or p_version < 0 then raise check_violation; end if;
  perform public.admin_write_limit();
  select * into current_row from public.admin_records where id=p_id for update;
  if current_row.id is null then
    if p_version <> 0 then raise serialization_failure; end if;
    insert into public.admin_records(id,kind,parent_id,payload,published) values(p_id,p_kind,p_parent_id,p_payload,p_published);
  else
    if current_row.version <> p_version or current_row.kind <> p_kind then raise serialization_failure; end if;
    update public.admin_records set parent_id=p_parent_id,payload=p_payload,published=p_published,version=version+1 where id=p_id;
  end if;
  return p_id;
end;
$$;
revoke all on function public.admin_save_record(uuid,text,uuid,jsonb,boolean,integer) from public, anon;
grant execute on function public.admin_save_record(uuid,text,uuid,jsonb,boolean,integer) to authenticated;

create function public.admin_delete_record(p_id uuid, p_version integer) returns void
language plpgsql security definer set search_path = '' as $$
declare current_version integer;
begin
  if not public.restaurant_staff(array['owner','manager']) then raise insufficient_privilege; end if;
  if p_version is null or p_version < 1 then raise check_violation; end if;
  perform public.admin_write_limit();
  select version into current_version from public.admin_records where id=p_id for update;
  if current_version is null or current_version <> p_version then raise serialization_failure; end if;
  delete from public.admin_records where id=p_id;
end;
$$;
revoke all on function public.admin_delete_record(uuid,integer) from public, anon;
grant execute on function public.admin_delete_record(uuid,integer) to authenticated;

create function public.admin_list_staff() returns table(user_id uuid, email text, display_name text, role text, active boolean, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
  if not public.restaurant_staff(array['owner']) then raise insufficient_privilege; end if;
  return query select s.user_id,u.email::text,s.display_name,s.role,s.active,s.created_at
    from public.staff_members s join auth.users u on u.id=s.user_id order by s.created_at;
end;
$$;
revoke all on function public.admin_list_staff() from public, anon;
grant execute on function public.admin_list_staff() to authenticated;

create function public.admin_set_staff(p_email text, p_name text, p_role text, p_active boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare target uuid; previous public.staff_members;
begin
  if not public.restaurant_staff(array['owner']) then raise insufficient_privilege; end if;
  perform public.admin_write_limit();
  perform pg_advisory_xact_lock(7192026);
  if p_role not in ('owner','manager','waiter','kitchen') or length(p_name) > 120 or length(p_email)>254 then
    raise check_violation;
  end if;
  select id into target from auth.users where lower(email)=lower(btrim(p_email));
  if target is null then raise exception 'auth_user_missing'; end if;
  select * into previous from public.staff_members where staff_members.user_id=target for update;
  if previous.role='owner' and previous.active and (p_role<>'owner' or not p_active)
     and (select count(*) from public.staff_members where role='owner' and active) <= 1 then
    raise exception 'last_owner';
  end if;
  insert into public.staff_members(user_id,display_name,role,active) values(target,btrim(p_name),p_role,p_active)
    on conflict(user_id) do update set display_name=excluded.display_name,role=excluded.role,active=excluded.active;
end;
$$;
revoke all on function public.admin_set_staff(text,text,text,boolean) from public, anon;
grant execute on function public.admin_set_staff(text,text,text,boolean) to authenticated;

-- Solo fotografías públicas de la web, no documentos privados ni datos de clientes.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('restaurant-media','restaurant-media',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']);
create policy restaurant_media_insert on storage.objects for insert to authenticated
with check(bucket_id='restaurant-media' and (storage.foldername(name))[1]=(select auth.uid())::text
  and public.restaurant_staff(array['owner','manager']));
create policy restaurant_media_read_management on storage.objects for select to authenticated
using(bucket_id='restaurant-media' and public.restaurant_staff(array['owner','manager']));
create policy restaurant_media_delete on storage.objects for delete to authenticated
using(bucket_id='restaurant-media' and public.restaurant_staff(array['owner','manager'])
  and ((storage.foldername(name))[1]=(select auth.uid())::text or public.restaurant_staff(array['owner'])));

create function public.admin_log_upload(p_path text, p_size integer, p_mime text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.restaurant_staff(array['owner','manager']) or split_part(p_path,'/',1)<>auth.uid()::text
     or not exists(select 1 from storage.objects where bucket_id='restaurant-media' and name=p_path) then
    raise insufficient_privilege;
  end if;
  perform public.admin_write_limit();
  insert into public.admin_audit(actor_id,entity,record_id,action,after_data)
    values(auth.uid(),'media',p_path,'UPLOAD',jsonb_build_object('size',p_size,'mime',p_mime));
end;
$$;
revoke all on function public.admin_log_upload(text,integer,text) from public, anon;
grant execute on function public.admin_log_upload(text,integer,text) to authenticated;

commit;
