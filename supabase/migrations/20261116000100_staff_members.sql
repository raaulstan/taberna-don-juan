-- Base de autorización. Las altas/cambios se realizan desde un entorno SQL de confianza.
begin;

create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'employee')),
  created_at timestamptz not null default now()
);

comment on table public.staff_members is
  'Membresías del equipo. No usar user_metadata para autorizar operaciones.';

alter table public.staff_members enable row level security;

revoke all on table public.staff_members from anon, authenticated;
grant select on table public.staff_members to authenticated;

create policy "staff_members_read_self"
on public.staff_members
for select
to authenticated
using ((select auth.uid()) = user_id);

-- No hay políticas INSERT/UPDATE/DELETE para clientes, tampoco para owner.
-- La PK cubre el filtro user_id del guard sin un índice redundante.

commit;
