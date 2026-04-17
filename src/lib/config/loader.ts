// src/lib/config/loader.ts

// Esta función escanea todas las carpetas dentro de static y devuelve las rutas
// svelte-ignore a11y_no_static_element_interactions
export const autoLoadImages = () => {
  // Ampliamos los formatos e incluimos mayúsculas por si los archivos se guardaron como .JPG o .PNG
  const modules = import.meta.glob('/static/**/*.{webp,jpg,jpeg,png,svg,gif,avif,WEBP,JPG,JPEG,PNG,SVG,GIF,AVIF}');
  
  // Quitamos "/static" y aplicamos encodeURI para evitar que los espacios en blanco rompan la ruta
  return Object.keys(modules).map((path) => encodeURI(path.replace('/static', '')));
};