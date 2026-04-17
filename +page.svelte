<script lang="ts">
  import { autoLoadImages } from '$lib/config/loader';
  import { galleryConfig } from '$lib/config/gallery';

  // Cargamos las imágenes iniciales
  let allImages = $state(autoLoadImages());
  
  // Estados de la interfaz
  let activeTab = $state<'normales' | '360'>('normales');
  let isUploading = $state(false);
  let selectedFolder = $state(galleryConfig.categories[0].id);
  let fileInput = $state<HTMLInputElement | null>(null);

  // Filtramos dinámicamente según la pestaña seleccionada
  let normalImages = $derived(allImages.filter(img => !img.includes('/360/')));
  let threeSixtyImages = $derived(allImages.filter(img => img.includes('/360/')));
  
  // Opciones del selector de carpetas dependiendo de la pestaña
  let folderOptions = $derived(
    activeTab === 'normales' 
      ? galleryConfig.categories.map(c => ({ value: c.id, label: `Galería: ${c.title}` }))
      : galleryConfig.threeSixtySpins.map(s => ({ value: `360/${s.id}`, label: `360: ${s.title}` }))
  );

  // Cambiar pestaña actualiza el folder seleccionado por defecto
  function switchTab(tab: 'normales' | '360') {
    activeTab = tab;
    selectedFolder = folderOptions[0].value;
  }

  // Función para subir una imagen
  async function uploadImage(e: Event) {
    e.preventDefault();
    if (!fileInput?.files || fileInput.files.length === 0) return alert('Selecciona una imagen primero');

    isUploading = true;
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('folder', selectedFolder);

    const res = await fetch('/api/images', { method: 'POST', body: formData });
    const data = await res.json();

    if (data.success) {
      allImages = [...allImages, data.path]; // Actualiza la vista al instante
      fileInput.value = ''; // Resetea el input
      alert('Imagen subida con éxito!');
    } else {
      alert('Error al subir: ' + data.error);
    }
    isUploading = false;
  }

  // Función para borrar una imagen
  async function deleteImage(imagePath: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen de forma permanente?')) return;

    const res = await fetch('/api/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePath })
    });
    
    const data = await res.json();
    if (data.success) {
      allImages = allImages.filter(img => img !== imagePath); // Quita la imagen de la vista
    } else {
      alert('Error al borrar: ' + data.error);
    }
  }
</script>

<svelte:head>
  <title>Admin - Tincho Moderna</title>
</svelte:head>

<div class="admin-container">
  <div class="header">
    <h1>Panel de Administración</h1>
    <p>Gestiona las fotos de tu portafolio en tiempo real.</p>
  </div>

  <!-- Controles de Subida -->
  <div class="upload-panel">
    <div class="tabs">
      <button class:active={activeTab === 'normales'} onclick={() => switchTab('normales')}>Imágenes Normales</button>
      <button class:active={activeTab === '360'} onclick={() => switchTab('360')}>Imágenes 360°</button>
    </div>

    <form onsubmit={uploadImage} class="upload-form">
      <div class="input-group">
        <label for="folder">Seleccionar Carpeta Destino:</label>
        <select id="folder" bind:value={selectedFolder}>
          {#each folderOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div class="input-group">
        <label for="file">Elegir Archivo:</label>
        <input type="file" id="file" bind:this={fileInput} accept="image/webp, image/jpeg, image/png" />
      </div>

      <button type="submit" class="btn-upload" disabled={isUploading}>
        {isUploading ? 'Subiendo archivo...' : 'Subir Imagen'}
      </button>
    </form>
  </div>

  <!-- Galería Administrativa -->
  <h2 class="gallery-title">
    {activeTab === 'normales' ? 'Tus Fotografías' : 'Tus Fotogramas 360°'}
  </h2>
  
  <div class="admin-gallery">
    {#each activeTab === 'normales' ? normalImages : threeSixtyImages as img}
      <div class="image-card">
        <img src={img} alt="Miniatura" loading="lazy" />
        <div class="image-overlay">
          <p class="img-path">{img.split('/').pop()}</p>
          <button class="btn-delete" onclick={() => deleteImage(img)} aria-label="Borrar imagen">
            🗑️ Eliminar
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .admin-container {
    max-width: 1200px;
    margin: 100px auto 40px;
    padding: 0 20px;
  }
  .header h1 {
    font-size: 2.5rem;
    color: var(--primary-green);
    margin-bottom: 5px;
  }
  .header p { color: #aaa; margin-bottom: 30px; }

  .upload-panel {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 40px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 15px;}
  .tabs button {
    background: transparent; border: none; color: #888; font-size: 1.1rem; cursor: pointer; padding: 5px 10px; transition: color 0.3s;
  }
  .tabs button.active { color: white; border-bottom: 2px solid var(--primary-green); font-weight: bold; }
  .tabs button:hover { color: white; }

  .upload-form { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; }
  .input-group { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px; }
  .input-group label { font-size: 0.9rem; color: #ccc; }
  .input-group select, .input-group input {
    background: #2b2b2b; color: white; border: 1px solid #444; padding: 10px; border-radius: 6px; outline: none;
  }
  .btn-upload {
    background: var(--primary-green); color: white; border: none; padding: 12px 25px; border-radius: 6px;
    font-weight: bold; cursor: pointer; transition: background 0.3s;
  }
  .btn-upload:hover:not(:disabled) { background: #0a4f1a; }
  .btn-upload:disabled { opacity: 0.6; cursor: not-allowed; }

  .gallery-title { border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
  .admin-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
  .image-card {
    position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #111;
  }
  .image-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .image-overlay {
    position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; flex-direction: column;
    justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease; padding: 15px;
  }
  .image-card:hover .image-overlay { opacity: 1; }
  .img-path { color: #ccc; font-size: 0.8rem; text-align: center; margin-bottom: 15px; word-break: break-all; }
  .btn-delete {
    background: #d32f2f; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;
  }
  .btn-delete:hover { background: #b71c1c; }
</style>
