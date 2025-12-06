# Configuración de Supabase Storage

## Pasos para crear el bucket de almacenamiento

1. **Ir al Dashboard de Supabase**
   - Visita: https://app.supabase.com/
   - Selecciona tu proyecto: `embbopesdstaivgnecpe`

2. **Crear el Bucket "publicaciones"**
   - En el menú lateral, haz clic en "Storage"
   - Clic en "Create a new bucket"
   - Nombre del bucket: `publicaciones`
   - **IMPORTANTE**: Marca como "Public bucket" ✅
   - Clic en "Create bucket"

3. **Configurar Políticas de Seguridad (Policies)**
   
   El bucket público ya permite lecturas, pero necesitas permitir subidas autenticadas:
   
   - Haz clic en el bucket "publicaciones"
   - Ve a la pestaña "Policies"
   - Clic en "New Policy"
   - Selecciona "For full customization"
   
   **Policy 1: Permitir subida de archivos (INSERT)**
   ```sql
   CREATE POLICY "Usuarios autenticados pueden subir archivos"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'publicaciones');
   ```
   
   **Policy 2: Permitir actualización (UPDATE)**
   ```sql
   CREATE POLICY "Usuarios pueden actualizar sus archivos"
   ON storage.objects
   FOR UPDATE
   TO authenticated
   USING (bucket_id = 'publicaciones');
   ```
   
   **Policy 3: Permitir eliminación (DELETE)**
   ```sql
   CREATE POLICY "Usuarios pueden eliminar sus archivos"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (bucket_id = 'publicaciones');
   ```

4. **Verificar Configuración**
   - Ve a "Settings" del bucket
   - Verifica que "Public" esté activado
   - La URL pública será: `https://embbopesdstaivgnecpe.supabase.co/storage/v1/object/public/publicaciones/`

## Estructura de Archivos

Los archivos se guardarán con esta estructura:
```
publicaciones/
  ├── media/
  │   ├── 1234567890-abc123.jpg
  │   ├── 1234567891-def456.mp4
  │   └── 1234567892-ghi789.pdf
```

## URL de Ejemplo

Cuando subes un archivo, la URL pública será:
```
https://embbopesdstaivgnecpe.supabase.co/storage/v1/object/public/publicaciones/media/1234567890-abc123.jpg
```

## Tipos de Archivos Permitidos

El servicio actual permite:
- **Imágenes**: jpg, jpeg, png, gif, webp
- **Videos**: mp4, webm, mov
- **Audio**: mp3, wav, ogg
- **Documentos**: pdf, doc, docx

Tamaño máximo: 10MB por archivo

## Troubleshooting

### Error: "new row violates row-level security policy"
- Verifica que las policies estén creadas correctamente
- Asegúrate de que el usuario esté autenticado (JWT token válido)

### Error: "Bucket not found"
- Verifica que el bucket se llame exactamente "publicaciones"
- Verifica que esté en el proyecto correcto

### Las imágenes no se muestran
- Verifica que el bucket sea público
- Verifica la URL en el navegador directamente
- Revisa la consola del navegador para errores CORS

## Alternativa: Usar Cloudinary

Si prefieres usar Cloudinary en lugar de Supabase Storage:

1. Crea cuenta en https://cloudinary.com/
2. Obtén tu Cloud Name, API Key y API Secret
3. Actualiza `uploadService.js` para usar la API de Cloudinary
4. Ejemplo de configuración en `.env`:
   ```
   REACT_APP_CLOUDINARY_CLOUD_NAME=tu-cloud-name
   REACT_APP_CLOUDINARY_UPLOAD_PRESET=tu-preset
   ```
