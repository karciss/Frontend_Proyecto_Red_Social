# Guía de Configuración y Despliegue

## ✅ Cambios Realizados

### Frontend
- ✅ Actualizada URL del backend a: `https://backend-social-f3ob.onrender.com/api/v1`
- ✅ Creado `.env.production` con configuración de producción
- ✅ Creado `.env.local` con configuración de desarrollo
- ✅ URL de Supabase configurada

### Backend
- ✅ CORS actualizado para permitir solicitudes desde cualquier origen (temporal)
- ✅ Backend desplegado en: `https://backend-social-f3ob.onrender.com`

## 🚀 Pasos para Ejecutar

### Desarrollo Local (Frontend)

```powershell
cd "d:\Carolina-II 2025\proyecto red social\Prueba Backend 2\Red_Social-main\frontend"
npm install
npm start
```

El frontend arrancará en `http://localhost:3000` y se conectará automáticamente al backend desplegado.

### Producción (Frontend)

```powershell
cd "d:\Carolina-II 2025\proyecto red social\Prueba Backend 2\Red_Social-main\frontend"
npm install
npm run build
```

Luego sube la carpeta `build/` a tu servicio de hosting (Netlify, Vercel, etc.).

### Backend en Render

El backend ya está desplegado en: `https://backend-social-f3ob.onrender.com`

**Variables de entorno que deben estar configuradas en Render:**
- `SUPABASE_URL`
- `SUPABASE_KEY` o `SUPABASE_ANON_KEY`
- `SECRET_KEY` (para JWT)
- `SUPABASE_SERVICE_KEY` (opcional, para operaciones administrativas)

## 🧪 Probar la Conexión

### 1. Probar el backend directamente:
```powershell
curl -i "https://backend-social-f3ob.onrender.com/api/v1/publicaciones?skip=0&limit=1"
```

Deberías recibir un código 200 o 401 (si requiere autenticación).

### 2. Probar login desde PowerShell:
```powershell
$body = @{
    username = "tu_usuario"
    password = "tu_password"
} | ConvertTo-Json

curl -X POST "https://backend-social-f3ob.onrender.com/api/v1/auth/login" `
  -H "Content-Type: application/json" `
  -d $body
```

### 3. Probar desde el navegador:
1. Abre DevTools (F12) → pestaña Network
2. Recarga la página
3. Verifica que las peticiones van a `https://backend-social-f3ob.onrender.com/api/v1/...`
4. Si ves errores CORS, verifica la configuración del backend en Render

## ⚠️ Problemas Comunes

### Error CORS
**Síntoma:** "Access to fetch... has been blocked by CORS policy"
**Solución:** 
- Verifica que el backend en Render tenga `BACKEND_CORS_ORIGINS` configurado correctamente
- O temporalmente usa `"*"` para permitir todos los orígenes (solo para pruebas)

### Error 401 Unauthorized
**Síntoma:** Todas las peticiones devuelven 401
**Solución:**
- Haz login nuevamente
- Verifica que el token se guarde en `localStorage` con la clave `user-token`
- Verifica que `SECRET_KEY` en Render sea la misma que usaste localmente

### Error 500 Internal Server Error
**Síntoma:** El servidor responde con error 500
**Solución:**
- Revisa los logs en la consola de Render
- Verifica que todas las variables de entorno estén configuradas
- Verifica que la base de datos Supabase esté accesible

### Timeout / Respuestas lentas
**Síntoma:** Las peticiones tardan mucho o dan timeout
**Solución:**
- Render en plan gratuito puede tener cold starts (primer request tarda ~30s)
- Considera aumentar el timeout en `frontend/src/services/api.js` (actualmente 30s)
- Verifica el plan de Render y considera upgrade si es necesario

## 📝 Próximos Pasos

1. **Configurar dominio personalizado** (opcional):
   - En Render: Settings → Custom Domain
   - Actualiza `REACT_APP_API_URL` en `.env.production` con el nuevo dominio

2. **Securizar CORS**:
   - Una vez que tengas el dominio del frontend, reemplaza `"*"` en `BACKEND_CORS_ORIGINS` con el dominio exacto

3. **Variables de entorno en hosting del frontend**:
   - Si usas Netlify/Vercel, configura las variables de entorno allí también
   - `REACT_APP_API_URL=https://backend-social-f3ob.onrender.com/api/v1`
   - `REACT_APP_SUPABASE_URL=...`
   - `REACT_APP_SUPABASE_ANON_KEY=...`

4. **Agregar columna faltante en la BD** (si aún no está):
   ```sql
   ALTER TABLE pasajeroruta ADD COLUMN ubicacion_recogida VARCHAR(200);
   ```
   Ejecuta esto en el SQL Editor de Supabase Dashboard.

## 🔒 Seguridad

**IMPORTANTE:** Antes de producción:
- Cambia `SECRET_KEY` a un valor fuerte y único
- Remueve `"*"` de `BACKEND_CORS_ORIGINS`
- No expongas `SUPABASE_SERVICE_KEY` en el frontend
- Usa solo `SUPABASE_ANON_KEY` en el frontend
- Configura políticas RLS (Row Level Security) en Supabase

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en Render: Dashboard → tu servicio → Logs
2. Revisa la consola del navegador (F12)
3. Verifica las peticiones en Network tab
4. Comprueba que las variables de entorno estén configuradas correctamente
