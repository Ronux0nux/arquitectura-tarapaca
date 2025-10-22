# ⚡ COMANDO RÁPIDO: PERMITIR NULL

## 🎯 Una línea que lo arregla:

```sql
ALTER TABLE cotizaciones ALTER COLUMN creador_por DROP NOT NULL;
```

Ejecuta esto en PostgreSQL y listo.

---

## 🔄 Si siguen habiendo errores de NOT NULL:

Ejecuta esto para ver TODAS las columnas problemáticas:

```sql
SELECT column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'cotizaciones' 
AND is_nullable = 'NO' AND column_default IS NULL;
```

Comparte el resultado y te digo cuáles más hay que arreglar.

---

## ✅ Resumen:

| Paso | Comando | Resultado |
|------|---------|-----------|
| 1️⃣ | `ALTER TABLE... DROP NOT NULL` | Columna acepta NULL |
| 2️⃣ | Reiniciar backend | Nuevo código carga |
| 3️⃣ | Probar en frontend | Debería funcionar ✅ |

**Próximo error (si hay)**: Compartimos el mensaje aquí y resolvemos.
