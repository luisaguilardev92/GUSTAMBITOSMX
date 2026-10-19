-- Actualiza solo estos códigos; no borra progreso ni marcas de uso por usuario.
insert into public.fortnite_codes (code, reward, active) values
  ('VeryScaryPumpkin', '3 Snack-O’-Lantern', true),
  ('DOOR2DOOR4CANDY', '2 Aceleradores de Extracción', true),
  ('runSystemOverride', '5,000 Polvo de Espíritus · Requiere completar la parte 2 de la historia de Geno', true),
  ('ImTheRealEdgelord', '5,000 Polvo de Espíritus · Requiere completar la parte 2 de la historia de Wrixel', true),
  ('MagicIsReal', '5,000 Polvo de Espíritus · Requiere completar la historia de Bastian', true),
  ('S7H-50P-R03', 'Glitch del lobby · Requiere registrar 3 códigos de hack en la historia de Geno', true)
on conflict (code) do update
set reward = excluded.reward, active = excluded.active, updated_at = now();

