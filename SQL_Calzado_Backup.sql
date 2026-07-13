-- ======================================================================
--  CALZADO MULTI-INQUILINO — Copias de seguridad / Rollback · idempotente
--  Base compartida: pcxlhgdpxfuybzfsquem · prefijo CALZ-...
--  Tabla de datos: calzado_backups (columna jsonb "datos").
--  Correlo COMPLETO en el SQL Editor de Supabase (se puede repetir).
--
--  Qué hace:
--   · Antes de pisar los datos del local (update en calzado_backups),
--     archiva una copia en calzado_backups_hist.
--   · Conserva las últimas 10 copias por licencia (al llegar a 11 se
--     borra la más vieja).
--   · El dueño puede LISTAR y RESTAURAR cualquiera desde el panel.
--   · Restaurar también queda respaldado (siempre se puede volver atrás).
-- ======================================================================

-- 1) Historial ---------------------------------------------------------
create table if not exists public.calzado_backups_hist (
  id        bigserial primary key,
  tenant_id text        not null,
  datos     jsonb       not null,
  guardado  timestamptz not null default now()
);
create index if not exists calzado_hist_tenant_idx on public.calzado_backups_hist (tenant_id, guardado desc);

alter table public.calzado_backups_hist enable row level security;
revoke all on public.calzado_backups_hist from anon, authenticated;

-- 2) Trigger: archivar la versión anterior antes de sobrescribir --------
create or replace function public.calzado_hist_guardar()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if OLD.datos is not null
     and OLD.datos <> '{}'::jsonb
     and OLD.datos is distinct from NEW.datos then
    insert into public.calzado_backups_hist (tenant_id, datos, guardado)
      values (OLD.tenant_id, OLD.datos, now());
    -- conservar solo las últimas 10 por licencia
    delete from public.calzado_backups_hist
      where id in (
        select id from public.calzado_backups_hist
         where tenant_id = OLD.tenant_id
         order by guardado desc
         offset 10
      );
  end if;
  return NEW;
end $$;

drop trigger if exists calzado_hist_trg on public.calzado_backups;
create trigger calzado_hist_trg
  before update on public.calzado_backups
  for each row execute function public.calzado_hist_guardar();

-- 3) Listar copias (solo el dueño/miembro): fecha + resumen ------------
create or replace function public.calzado_hist_listar(p_codigo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare arr jsonb;
begin
  if auth.uid() is null then return '[]'::jsonb; end if;
  if not exists (select 1 from public.tl_miembros where user_id = auth.uid() and tenant_id = p_codigo) then
    return '[]'::jsonb;
  end if;
  select coalesce(jsonb_agg(x order by (x->>'guardado') desc), '[]'::jsonb) into arr
  from (
    select jsonb_build_object(
      'id', id,
      'guardado', guardado,
      'productos', coalesce(jsonb_array_length(datos->'products'), 0),
      'pedidos', coalesce(jsonb_array_length(datos->'orders'), 0),
      'colaboradores', coalesce(jsonb_array_length(datos->'collaborators'), 0)
    ) as x
    from public.calzado_backups_hist
    where tenant_id = p_codigo
    order by guardado desc
    limit 10
  ) s;
  return arr;
end $$;
grant execute on function public.calzado_hist_listar(text) to authenticated;

-- 4) Restaurar una copia (solo el dueño/miembro) -----------------------
create or replace function public.calzado_hist_restaurar(p_codigo text, p_id bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d jsonb;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'sesion'); end if;
  if not exists (select 1 from public.tl_miembros where user_id = auth.uid() and tenant_id = p_codigo) then
    return jsonb_build_object('ok', false, 'error', 'no_miembro');
  end if;
  select datos into d from public.calzado_backups_hist
    where id = p_id and tenant_id = p_codigo limit 1;
  if d is null then return jsonb_build_object('ok', false, 'error', 'sin_copia'); end if;
  update public.calzado_backups set datos = d, updated_at = now() where tenant_id = p_codigo;
  return jsonb_build_object('ok', true, 'datos', d);
end $$;
grant execute on function public.calzado_hist_restaurar(text, bigint) to authenticated;

-- 6) Guardar copia a mano (snapshot on-demand desde el panel) -----------
--    Copia el estado ACTUAL de calzado_backups al historial, sin depender
--    de que haya un cambio. Respeta el límite de 10.
create or replace function public.calzado_hist_snapshot(p_codigo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare d jsonb; tot int;
begin
  if auth.uid() is null then return jsonb_build_object('ok', false, 'error', 'sesion'); end if;
  if not exists (select 1 from public.tl_miembros where user_id = auth.uid() and tenant_id = p_codigo) then
    return jsonb_build_object('ok', false, 'error', 'no_miembro');
  end if;
  select datos into d from public.calzado_backups where tenant_id = p_codigo limit 1;
  if d is null or d = '{}'::jsonb then return jsonb_build_object('ok', false, 'error', 'sin_datos'); end if;
  insert into public.calzado_backups_hist (tenant_id, datos, guardado) values (p_codigo, d, now());
  delete from public.calzado_backups_hist
    where id in (
      select id from public.calzado_backups_hist
       where tenant_id = p_codigo
       order by guardado desc
       offset 10
    );
  select count(*) into tot from public.calzado_backups_hist where tenant_id = p_codigo;
  return jsonb_build_object('ok', true, 'total', tot);
end $$;
grant execute on function public.calzado_hist_snapshot(text) to authenticated;
