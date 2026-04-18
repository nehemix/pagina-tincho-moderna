<script lang="ts">
  import type { PageData } from './$types';
  import { galleryConfig } from '$lib/config/gallery';
  import { Toaster, toast } from 'svelte-sonner';
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // Los datos ahora vienen del loader (+page.ts)
  let { data }: { data: PageData & { error?: string, images?: string[] } } = $props();

  // Cargamos las imágenes iniciales
  // allImages se actualiza con refreshImages, por lo que debe ser un estado.
  // svelte-ignore state_referenced_locally
  let allImages = $state(data.images || []);

  // Estados de la interfaz
  let activeTab = $state<'normales' | '360' | 'videos' | 'inicio'>('normales');
  let isUploading = $state(false);
  let selectedExistingFolder = $state('__NEW__'); // Selector de carpetas, por defecto Nueva Carpeta
  let newFolderName = $state(''); // Nombre para nueva carpeta
  let expandedFolders = $state<Record<string, boolean>>({}); // Control de los acordeones
  let isDraggingOver = $state(false); // Estado visual para el Drag & Drop
  let fileInput = $state<HTMLInputElement | null>(null);
  let selectedImages = $state<string[]>([]);
  
  let allVideos = $state<{id: string, url: string}[]>([]);
  let videoUrl = $state('');
  let draggedImage = $state<string | null>(null);

  // Forzamos la carga de imágenes si al iniciar el panel la lista está vacía
  onMount(() => {
    if (allImages.length === 0) {
      refreshImages();
    }
    refreshVideos();
  });

  // Lógica de Agrupación Dinámica
  function groupImagesByFolder(imagesList: string[], prefix: string = '') {
    const groups: Record<string, string[]> = {};
    for (const img of imagesList) {
      let relPath = img.replace('/images/', '');
      if (prefix && relPath.startsWith(prefix)) relPath = relPath.replace(prefix, '');
      
      const parts = relPath.split('/');
      parts.pop(); // Quitamos el nombre del archivo
      const folder = parts.length > 0 ? parts.join('/') : 'Raíz'; // Si no tiene carpeta, va a 'Raíz'
      
      if (!groups[folder]) groups[folder] = [];
      groups[folder].push(img);
    }
    // Ordenamos alfabéticamente los nombres de carpetas
    return Object.keys(groups).sort().reduce((acc, key) => { acc[key] = groups[key]; return acc; }, {} as Record<string, string[]>);
  }

  let normalGroups = $derived(groupImagesByFolder(allImages.filter(img => !img.includes('/360/') && !img.includes('/inicio/'))));
  let threeSixtyGroups = $derived(groupImagesByFolder(allImages.filter(img => img.includes('/360/')), '360/'));
  let inicioImages = $derived(allImages.filter(img => img.includes('/inicio/')));
  let folderOptions = $derived(Object.keys(activeTab === 'normales' ? normalGroups : activeTab === '360' ? threeSixtyGroups : {}).filter(f => f !== 'Raíz'));

  function switchTab(tab: 'normales' | '360' | 'videos' | 'inicio') {
    activeTab = tab;
    selectedImages = []; // Limpia la selección al cambiar de pestaña
    selectedExistingFolder = '__NEW__'; 
    newFolderName = '';
  }

  // Refrescar videos
  async function refreshVideos(showToast = false) {
    try {
      const res = await fetch('/api/videos');
      if (res.ok) {
        const data = await res.json();
        allVideos = data.videos || [];
        if (showToast) toast.success('Lista de videos actualizada.');
      }
    } catch (err) {
      console.error('Error al refrescar videos:', err);
    }
  }

  // Función para refrescar la lista de imágenes desde el servidor
  async function refreshImages(showToast = false) {
    try {
      const res = await fetch('/api/images');
      if (!res.ok) {
        throw new Error('No se pudo obtener la lista de imágenes.');
      }
      const { images } = await res.json();
      allImages = images;
      if (showToast) {
        toast.success('Lista de imágenes actualizada.');
      }
    } catch (err) {
      console.error('Error al refrescar las imágenes:', err);
      if (err instanceof Error) {
        toast.error(`Error al refrescar: ${err.message}`);
      }
    }
  }

  // Manejador Drag & Drop
  function handleDrop(e: DragEvent) {
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      if (fileInput) fileInput.files = e.dataTransfer.files;
      toast.success(`${e.dataTransfer.files.length} archivo(s) agregados. Especifica la carpeta y haz clic en Subir.`);
    }
  }

  // Función para subir una imagen
  async function uploadImage(e: Event) {
    e.preventDefault();
    
    if (!fileInput?.files || fileInput.files.length === 0) return toast.warning('Por favor, selecciona al menos un archivo.');
    const allFiles = Array.from(fileInput.files);

    let targetFolder = '';
    if (activeTab === 'inicio') {
      targetFolder = 'inicio';
    } else {
      targetFolder = selectedExistingFolder === '__NEW__' ? newFolderName.trim() : selectedExistingFolder;
      if (!targetFolder) return toast.warning('Por favor, selecciona o ingresa el nombre de la carpeta.');
      
      if (activeTab === '360') targetFolder = `360/${targetFolder}`;
    }

    isUploading = true;
    try {
      const formData = new FormData();
      for (const file of allFiles) {
        formData.append('files', file);
        // Pasamos la ruta relativa estructurada de la carpeta si existe
        formData.append('paths', file.webkitRelativePath || file.name);
      }
      formData.append('folder', targetFolder);

      const res = await fetch('/api/images', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        await refreshImages();
        if (fileInput) fileInput.value = '';
        selectedExistingFolder = '__NEW__';
        newFolderName = '';
        
        // Expandir la carpeta automáticamente tras subir
        if (targetFolder) expandedFolders[targetFolder.replace('360/', '')] = true;
        toast.success(data.message || 'Imágenes subidas con éxito!');
      } else {
        toast.error(`Error al subir: ${data.error}`);
      }
    } catch (err) {
      console.error('Excepción al subir imágenes:', err);
      toast.error('Error de conexión o archivo demasiado grande.');
    } finally {
      // Esto garantiza que el botón siempre vuelva a su estado original aunque falle la petición
      isUploading = false; 
    }
  }

  // Funciones para gestionar Videos
  async function addVideo(e: Event) {
    e.preventDefault();
    if (!videoUrl) return toast.warning('Por favor, ingresa un enlace de YouTube.');
    
    isUploading = true;
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message);
        videoUrl = ''; // Limpia el input
        await refreshVideos();
      } else {
        toast.error(`Error al agregar: ${data.error || 'Respuesta inválida del servidor'}`);
      }
    } catch (err: any) {
      console.error('Error al procesar el video:', err);
      toast.error('Error de conexión o el servidor no respondió correctamente.');
    } finally {
      isUploading = false;
    }
  }

  async function deleteVideo(id: string) {
    if (!confirm('¿Seguro que deseas eliminar este video?')) return;
    const res = await fetch('/api/videos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      toast.success(data.message);
      await refreshVideos();
    } else {
      toast.error(`Error al borrar: ${data.error}`);
    }
  }

  // Gestión Estructural de Carpetas
  async function deleteFolder(folderName: string, is360: boolean) {
    if (!confirm(`¿Eliminar la carpeta "${folderName}" y TODAS sus imágenes? Esta acción NO se puede deshacer.`)) return;
    
    const folderPath = is360 ? `360/${folderName}` : folderName;
    const res = await fetch('/api/images', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folderPath }) });
    const data = await res.json();
    
    if (data.success) {
      toast.success(data.message);
      selectedImages = [];
      await refreshImages();
    } else {
      toast.error(`Error: ${data.error}`);
    }
  }

  async function renameFolder(oldName: string, is360: boolean) {
    const newName = prompt(`Nuevo nombre para "${oldName}":`, oldName);
    if (!newName || newName.trim() === '' || newName === oldName) return;

    const oldFolder = is360 ? `360/${oldName}` : oldName;
    const newFolder = is360 ? `360/${newName.trim()}` : newName.trim();

    const res = await fetch('/api/images', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ oldFolder, newFolder }) });
    const data = await res.json();
    
    if (data.success) {
      toast.success(data.message);
      expandedFolders[newName.trim()] = expandedFolders[oldName]; // Mantiene el estado de apertura
      await refreshImages();
    } else {
      toast.error(`Error: ${data.error}`);
    }
  }

  // Funciones de selección y borrado múltiple
  function toggleSelection(img: string) {
    if (selectedImages.includes(img)) {
      selectedImages = selectedImages.filter(i => i !== img);
    } else {
      selectedImages = [...selectedImages, img];
    }
  }

  async function deleteSelectedImages() {
    if (selectedImages.length === 0) return;
    if (!confirm(`¿Eliminar ${selectedImages.length} imagen(es) de forma permanente?`)) return;

    const res = await fetch('/api/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imagePaths: selectedImages })
    });
    
    const data = await res.json();
    if (data.success) {
      toast.success(data.message || 'Imágenes eliminadas.');
      selectedImages = []; // Resetea la selección
      await refreshImages();
    } else {
      toast.error(`Error al borrar: ${data.error}`);
    }
  }

  // Drag and Drop (Arrastrar y Soltar)
  function handleDragStart(e: DragEvent, img: string) {
    draggedImage = img;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', img);
    }
  }

  function handleDropImage(e: DragEvent, targetImg: string) {
    e.preventDefault();
    if (!draggedImage || draggedImage === targetImg) {
      draggedImage = null;
      return;
    }

    const fromIndex = allImages.indexOf(draggedImage);
    const toIndex = allImages.indexOf(targetImg);

    if (fromIndex > -1 && toIndex > -1) {
      const newImages = [...allImages];
      const [moved] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, moved);
      allImages = newImages; // Al actualizar allImages, Svelte re-calcula derivados y gatilla animaciones
      
      // Guardamos en segundo plano
      fetch('/api/images', { method: 'PATCH', body: JSON.stringify({ order: allImages }) })
        .catch(err => console.error("Error guardando orden:", err));
    }
    draggedImage = null;
  }
</script>

<svelte:head>
  <!-- Toaster para notificaciones no-bloqueantes. Idealmente, esto va en el layout principal. -->
  <Toaster richColors position="top-center" />
  <title>Admin - Tincho Moderna</title>
</svelte:head>

{#if data.error}
  <div class="admin-container" style="text-align: center; color: #ff5252;">
    <h2>Error al cargar el panel</h2>
    <p>{data.error}</p>
  </div>
{:else}
  <div class="admin-container">
    <div class="header">
      <h1>Panel de Administración</h1>
      <p>Gestiona las fotos de tu portafolio. Los cambios se verán reflejados en el sitio.</p>
    </div>

    <!-- Controles de Subida -->
    <div class="upload-panel">
      <div class="tabs">
        <button class="btn-refresh" onclick={() => activeTab === 'videos' ? refreshVideos(true) : refreshImages(true)}>🔄 Refrescar</button>
        <button class:active={activeTab === 'inicio'} onclick={() => switchTab('inicio')}>Inicio (Slider)</button>
        <button class:active={activeTab === 'normales'} onclick={() => switchTab('normales')}>Imágenes Normales</button>
        <button class:active={activeTab === '360'} onclick={() => switchTab('360')}>Imágenes 360°</button>
        <button class:active={activeTab === 'videos'} onclick={() => switchTab('videos')}>Videos</button>
      </div>

      {#if activeTab === 'videos'}
        <form onsubmit={addVideo} class="upload-form">
          <div class="input-group">
            <label for="videoUrl">Enlace de YouTube:</label>
            <input type="url" id="videoUrl" bind:value={videoUrl} required />
          </div>
          <button type="submit" class="btn-upload" disabled={isUploading}>
            {isUploading ? 'Procesando...' : 'Agregar Video'}
          </button>
        </form>
      {:else}
        <form onsubmit={uploadImage} class="upload-form">
          {#if activeTab !== 'inicio'}
            <div class="input-group">
              <label for="existingFolder">Seleccionar o crear carpeta:</label>
              <select id="existingFolder" bind:value={selectedExistingFolder} class="folder-select">
                {#each folderOptions as folder}
                  <option value={folder}>📁 {folder}</option>
                {/each}
                <option value="__NEW__">➕ Crear nueva carpeta...</option>
              </select>
            </div>
            
            {#if selectedExistingFolder === '__NEW__'}
              <div class="input-group" transition:slide={{duration: 200}}>
                <label for="newFolder">Nombre de la nueva carpeta:</label>
                <input type="text" id="newFolder" bind:value={newFolderName}  required />
              </div>
            {/if}
          {/if}
          
          <div class="input-group drop-zone {isDraggingOver ? 'dragging' : ''}"
               ondragover={(e) => { e.preventDefault(); isDraggingOver = true; }}
               ondragleave={() => isDraggingOver = false}
               ondrop={(e) => { e.preventDefault(); isDraggingOver = false; handleDrop(e); }}>
            <label for="file">Elegir o arrastrar archivo(s) aquí:</label>
            <input type="file" id="file" name="files" bind:this={fileInput} accept="image/avif" multiple class="file-input" />
          </div>

          <button type="submit" class="btn-upload" disabled={isUploading}>
            {isUploading ? 'Subiendo...' : 'Subir Imagen(es)'}
          </button>
        </form>
      {/if}
    </div>

    <!-- Galería Administrativa -->
    <h2 class="gallery-title">
      {activeTab === 'normales' ? 'Tus Fotografías' : activeTab === '360' ? 'Tus Fotogramas 360°' : activeTab === 'videos' ? 'Tus Videos (YouTube)' : 'Fotos del Slider de Inicio'}
    </h2>

    <!-- Panel de acciones en lote -->
    {#if selectedImages.length > 0}
      <div class="selection-panel">
        <span>{selectedImages.length} imagen(es) seleccionada(s)</span>
        <button class="btn-delete" onclick={deleteSelectedImages}>🗑️ Borrar Seleccionadas</button>
        <button class="btn-cancel" onclick={() => selectedImages = []}>Cancelar</button>
      </div>
    {/if}
    
    <!-- Snippet solo para el contenido interno. Esto permite que animate:flip actúe sobre el wrapper <div> externo de forma segura -->
    {#snippet imageCardInner(img: string)}
      <img src={img} alt="Miniatura" loading="lazy" draggable="false" />
      {#if selectedImages.includes(img)}
        <div class="checkmark">✓</div>
      {/if}
      <div class="image-overlay">
        <p class="img-path">{img.split('/').pop()}</p>
      </div>
    {/snippet}

    <!-- Nuevo Snippet para la estructura de Carpeta / Acordeón -->
    {#snippet folderAccordion(folderName: string, images: string[], is360: boolean)}
      <div class="folder-container">
        <div class="folder-header" onclick={() => expandedFolders[folderName] = !expandedFolders[folderName]} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && (expandedFolders[folderName] = !expandedFolders[folderName])}>
          <div class="folder-info">
            <span class="folder-icon">{expandedFolders[folderName] ? '📂' : '📁'}</span>
            <h3>{folderName}</h3>
            <span class="image-count">({images.length} imgs)</span>
          </div>
          <div class="folder-actions" onclick={(e) => e.stopPropagation()} role="presentation" onkeydown={(e) => e.stopPropagation()}>
            {#if folderName !== 'Raíz'}
              <button class="btn-icon" onclick={() => renameFolder(folderName, is360)} title="Renombrar Carpeta">✏️</button>
              <button class="btn-icon danger" onclick={() => deleteFolder(folderName, is360)} title="Eliminar Carpeta y su contenido">🗑️</button>
            {/if}
            <span class="chevron" style="transform: {expandedFolders[folderName] ? 'rotate(180deg)' : 'rotate(0)'}">▼</span>
          </div>
        </div>
        {#if expandedFolders[folderName]}
          <div class="folder-content" transition:slide={{ duration: 300 }}>
            <div class="admin-gallery">
              {#each images as img (img)}
                <div
                  animate:flip={{duration: 300}}
                  draggable="true"
                  ondragstart={(e) => handleDragStart(e, img)}
                  ondragover={(e) => e.preventDefault()}
                  ondrop={(e) => handleDropImage(e, img)}
                  class="image-card {selectedImages.includes(img) ? 'selected' : ''} {draggedImage === img ? 'dragging' : ''}"
                  onclick={() => toggleSelection(img)}
                  onkeydown={(e) => e.key === 'Enter' && toggleSelection(img)}
                  role="button" tabindex="0" aria-label="Seleccionar imagen"
                >
                  {@render imageCardInner(img)}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/snippet}

    <!-- Renderizamos las imágenes utilizando el diseño de acordeón dinámico -->
    {#if activeTab === 'normales'}
      {#each Object.entries(normalGroups) as [folderName, images]}
        {@render folderAccordion(folderName, images, false)}
      {/each}
    {:else if activeTab === 'inicio'}
      <div class="admin-gallery">
        {#each inicioImages as img (img)}
          <div
            animate:flip={{duration: 300}}
            draggable="true"
            ondragstart={(e) => handleDragStart(e, img)}
            ondragover={(e) => e.preventDefault()}
            ondrop={(e) => handleDropImage(e, img)}
            class="image-card {selectedImages.includes(img) ? 'selected' : ''} {draggedImage === img ? 'dragging' : ''}"
            onclick={() => toggleSelection(img)}
            onkeydown={(e) => e.key === 'Enter' && toggleSelection(img)}
            role="button" tabindex="0" aria-label="Seleccionar imagen"
          >
            {@render imageCardInner(img)}
          </div>
        {/each}
      </div>
    {:else if activeTab === 'videos'}
      <div class="admin-gallery">
        {#each allVideos as video (video.id)}
          <div class="image-card" style="border: 1px solid #444;">
            <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt="Video Miniatura" loading="lazy" />
            <div class="image-overlay" style="opacity: 1; background: transparent; justify-content: flex-end; padding-bottom: 10px;">
              <!-- Overlay siempre visible en videos para el botón borrar -->
              <button type="button" class="btn-delete" style="box-shadow: 0 4px 6px rgba(0,0,0,0.8);" onclick={() => deleteVideo(video.id)}>🗑️ Borrar</button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      {#each Object.entries(threeSixtyGroups) as [folderName, images]}
        {@render folderAccordion(folderName, images, true)}
      {/each}
    {/if}
  </div>
{/if}

<style>
  .admin-container { max-width: 1200px; margin: 100px auto 40px; padding: 0 20px; }
  .header h1 { font-size: 2.5rem; color: var(--primary-green); margin-bottom: 5px; }
  .header p { color: #aaa; margin-bottom: 30px; }
  .upload-panel { background: #1e1e1e; border-radius: 12px; padding: 25px; margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
  .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 15px;}
  .btn-refresh {
    margin-right: auto;
    background-color: #333;
    color: white;
    border: 1px solid #555;
    border-radius: 5px;
  }
  .tabs button { background: transparent; border: none; color: #888; font-size: 1.1rem; cursor: pointer; padding: 5px 10px; transition: color 0.3s; }
  .tabs button.active { color: white; border-bottom: 2px solid var(--primary-green); font-weight: bold; }
  .tabs button:hover { color: white; }
  .upload-form { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; }
  .input-group { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 200px; }
  .input-group label { font-size: 0.9rem; color: #ccc; }
  .input-group input { background: #2b2b2b; color: white; border: 1px solid #444; padding: 10px; border-radius: 6px; outline: none; transition: border-color 0.3s; }
  .input-group input:focus { border-color: var(--primary-green); }
  .folder-select { background: #2b2b2b; color: white; border: 1px solid #444; padding: 10px; border-radius: 6px; outline: none; transition: border-color 0.3s; appearance: auto; cursor: pointer; }
  .folder-select:focus { border-color: var(--primary-green); }
  .btn-upload { background: var(--primary-green); color: white; border: none; padding: 12px 25px; border-radius: 6px; font-weight: bold; cursor: pointer; transition: background 0.3s; }
  .btn-upload:hover:not(:disabled) { background: #0a4f1a; }

  .drop-zone { border: 2px dashed #444; padding: 10px; border-radius: 8px; transition: border-color 0.3s, background 0.3s; }
  .drop-zone.dragging { border-color: var(--primary-green); background: rgba(76, 175, 80, 0.1); }
  .file-input { cursor: pointer; }
  
  .selection-panel { background: #333; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
  .selection-panel span { font-weight: bold; color: white; margin-right: auto; }
  .btn-cancel { background: transparent; color: #ccc; border: 1px solid #555; padding: 8px 15px; border-radius: 4px; cursor: pointer; transition: background 0.3s; }
  .btn-cancel:hover { background: #444; color: white; }

  .gallery-title { border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
  
  .folder-container { background: #1a1a1a; border-radius: 8px; margin-bottom: 15px; overflow: hidden; border: 1px solid #333; }
  .folder-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; cursor: pointer; background: #222; transition: background 0.2s; user-select: none; }
  .folder-header:hover { background: #2a2a2a; }
  .folder-info { display: flex; align-items: center; gap: 10px; }
  .folder-info h3 { margin: 0; font-size: 1.1rem; color: #fff; text-transform: capitalize;}
  .image-count { color: #888; font-size: 0.9rem; }
  .folder-actions { display: flex; align-items: center; gap: 10px; }
  .btn-icon { background: none; border: none; font-size: 1.2rem; cursor: pointer; padding: 5px; border-radius: 4px; transition: background 0.2s; display: flex; align-items: center; justify-content: center;}
  .btn-icon:hover { background: #444; }
  .btn-icon.danger:hover { background: #d32f2f; }
  .chevron { margin-left: 10px; color: #888; font-size: 0.9rem; transition: transform 0.3s ease; display: inline-block; }
  .folder-content { padding: 20px; border-top: 1px solid #333; }
  
  .admin-gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
  .image-card { position: relative; border-radius: 8px; overflow: hidden; aspect-ratio: 1; background: #111; cursor: pointer; transition: transform 0.2s, border 0.2s; border: 2px solid transparent; }
  .image-card.selected { border-color: var(--primary-green); transform: scale(0.95); }
  .image-card.dragging { opacity: 0.4; transform: scale(0.95); border-color: var(--primary-green); box-shadow: 0 0 15px var(--primary-green); z-index: 10; }
  .image-card:focus-visible { outline: 2px solid var(--primary-green); outline-offset: 2px; }
  .checkmark { position: absolute; top: 10px; right: 10px; width: 24px; height: 24px; background: var(--primary-green); color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.5); }
  .image-card img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .image-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.8); display: flex; flex-direction: column; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s ease; padding: 15px; }
  .image-card:hover .image-overlay { opacity: 1; }
  .img-path { color: #ccc; font-size: 0.8rem; text-align: center; margin-bottom: 15px; word-break: break-all; }
  .btn-delete { background: #d32f2f; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; }
  .btn-delete:hover { background: #b71c1c; }
</style>
