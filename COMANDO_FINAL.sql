# ⚡ COMANDO FINAL (Copy-Paste)

## 🎯 COPIAR TODO ESTO Y PEGAR EN POSTGRESQL

```sql
ALTER TABLE cotizaciones ALTER COLUMN id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN nombre_material DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN unidad DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN cantidad DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN precio_unitario DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN estado DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN detalles DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN observaciones DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN created_at DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN updated_at DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN projects_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN insumos_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN providers_id DROP NOT NULL;
ALTER TABLE cotizaciones ALTER COLUMN users_id DROP NOT NULL;
```

---

## ✅ VERIFICAR QUE FUNCIONÓ

```sql
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'cotizaciones'
AND is_nullable = 'NO' AND column_default IS NULL;
```

**Si no devuelve nada → ÉXITO ✅**

---

## 🚀 LISTO

1. Ejecuta el SQL anterior
2. Reinicia backend: `npm start`
3. Prueba en frontend

**TODO debería funcionar ahora.**
