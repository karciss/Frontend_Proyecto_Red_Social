# Deploy en Render (Static Site) - Instrucciones rápidas

1. Entra a Render Dashboard → New → Static Site.
2. Conecta tu repositorio: `https://github.com/karciss/Front_Proyecto_red.git`.
3. Selecciona la rama: `main` (o la rama que prefieras usar para producción).
4. Build command (recommended):

```
npm ci && npm run build
```

If you experience peer dependency installation issues, use this variation:

```
npm ci --legacy-peer-deps && npm run build
```

5. Publish directory: `build`

6. Environment variables (very important): añade en Render → Environment

- `REACT_APP_API_URL` = https://backend-social-f3ob.onrender.com/api/v1
- `REACT_APP_SUPABASE_URL` = https://embbopesdstaivgnecpe.supabase.co
- `REACT_APP_SUPABASE_ANON_KEY` = (tu clave ANON de Supabase)

Nota: Create React App inyecta variables `REACT_APP_*` durante la build. Si agregas o cambias variables después de la primera compilación, haz un redeploy.

Recomendaciones:
- Habilita Auto Deploys para la rama `main` para builds automáticos en cada push.
- Si necesitas una versión concreta de Node, añade en `frontend/package.json`:

```json
"engines": { "node": "18.x" }
```

- No subas el archivo `.env` con claves reales al repositorio; usa `frontend/.env.example` como plantilla.
