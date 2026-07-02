<script lang="ts">
  $effect(() => {
    document.body.classList.add('transparent-nav-page');
    
    return () => { 
      document.body.classList.remove('transparent-nav-page');
    };
  });
</script>

<section class="contact-section">
  <div class="container">
    <div class="header-text">
      <h2 class="section-title">Contacto</h2>
      <p class="subtitle">¿Tenés algún proyecto en mente o consulta? Escribime.</p>
    </div>
    
    <div class="contact-info">
      <!-- Tarjeta 1: Dirección -->
      <div class="contact-card">
        <div class="icon-wrapper">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <h4>Dirección</h4>
        <p>Buenos Aires, Argentina</p>
      </div>
      
      <!-- Tarjeta 2: Teléfono -->
      <div class="contact-card">
        <div class="icon-wrapper">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
        </div>
        <h4>Teléfono</h4>
        <p><a href="tel:+541159264895">1159264895</a></p>
      </div>
      
      <!-- Tarjeta 3: Email -->
      <div class="contact-card email-card">
        <div class="icon-wrapper">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h4>E-mail</h4>
        <p><a href="mailto:info@martinmangudo.com.ar">info@martinmangudo.com.ar</a></p>
      </div>

      <!-- Tarjeta 4: Instagram -->
      <a href="https://www.instagram.com/mmangudofotografo/" target="_blank" rel="noopener noreferrer" class="contact-card instagram-card">
          <div class="icon-wrapper">
            <!-- Icono de Instagram -->
            <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-linecap="round"></line></svg>
          </div>
          <h4>Instagram</h4>
          <p>@mmangudofotografo</p>
      </a>
    </div>

    <!-- Recomendación PixelSite -->
    <div class="recommendation">
      <h4>¿Necesitás una página web profesional?</h4>
      <p>
        PixelSite se especializa en crear sitios web a medida, rápidos y modernos.
      </p>
      <a href="https://pixelsite.com.ar/" target="_blank" rel="noopener noreferrer" class="cta-button">
        Visitar PixelSite
      </a>
    </div>
  </div>
</section>

<style>
  /* Hace transparente el navbar cuando esta página está activa */
  :global(.transparent-nav-page nav),
  :global(.transparent-nav-page header),
  :global(.transparent-nav-page .navbar),
  :global(.transparent-nav-page #navbar) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    backdrop-filter: none !important;
  }

  /* Sección de contacto */
  .contact-section {
    background: radial-gradient(circle at top center, #2a2a2a 0%, #111 100%);
    padding: 100px 20px 20px 20px; /* Unificado con la distancia de galerías */
    text-align: center;
    font-family: 'Arial', sans-serif;
    color: white;
    
    /* Fija el tamaño exacto de la pantalla y oculta cualquier desborde */
    height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: center; /* Alinea el contenido al medio verticalmente */
    align-items: center;

    animation: slideInFromTop 1s ease-out forwards;
    opacity: 0;
    transform: translateY(-50px);
  }

  /* Ajuste para Tablet: El navbar apilado ocupa más espacio, bajamos el contenido interno */
  @media (min-width: 768px) and (max-width: 1199px) {
    .contact-section {
      padding-top: 160px;
    }
  }

  /* Animación de deslizamiento desde arriba */
  @keyframes slideInFromTop {
    0% {
      opacity: 0;
      transform: translateY(-50px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .header-text {
    margin-bottom: 30px;
  }

  .section-title {
    font-size: 2rem;
    color: var(--primary-green);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 1rem;
    color: #aaa;
  }

  .container {
    width: 100%;
    max-width: 1100px; /* Ensanchado para que entre el mail en una línea en PC */
    margin: 0 auto;
  }

  .contact-info {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    width: 100%;
  }

  /* Diseño de las tarjetas */
  .contact-card {
    width: calc(50% - 7.5px); /* 2 tarjetas por fila en móviles */
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 15px; /* Reducido para que las tarjetas sean más bajas en móviles */
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .contact-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
    border-color: rgba(11, 102, 35, 0.5); /* Verde primario con opacidad */
  }

  .email-card,
  .instagram-card {
    width: 100%;
  }

  @media (min-width: 850px) {
    .contact-info { gap: 20px; }
    .contact-card {
      width: calc(25% - 15px); /* 4 tarjetas por fila en PC */
      max-width: none;
      padding: 25px 15px; /* Restaura el padding original en PC/Tablets */
    }

    /* En escritorio, las tarjetas de email e instagram también ocupan su espacio normal */
    .email-card, .instagram-card {
      width: calc(25% - 15px);
    }
  }

  .icon-wrapper {
    width: 40px; /* Reducido ligeramente */
    height: 40px; /* Reducido ligeramente */
    background: rgba(11, 102, 35, 0.1);
    color: var(--primary-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px; /* Reducido para menor altura de tarjeta */
  }

  .icon-wrapper svg {
    width: 24px;
    height: 24px;
  }

  .contact-card h4 {
    font-size: 1.1rem;
    color: #fff;
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .contact-card p {
    font-size: 0.95rem;
    color: #bbb;
    margin: 0;
    word-break: break-word; /* Permite que el texto largo se divida en varias líneas */
  }

  .contact-card a {
    text-decoration: none;
  }

  .contact-card p a {
    color: #90ee90;
    font-weight: bold;
    transition: color 0.3s;
  }

  .contact-card p a:hover {
    color: #fff;
  }
  .instagram-card p {
    color: #90ee90; /* Mantiene el color del enlace original */
  }

  /* Sección de recomendación */
  .recommendation {
    margin-top: 40px;
    padding: 20px;
    background: rgba(11, 102, 35, 0.1);
    border: 1px solid rgba(11, 102, 35, 0.2);
    border-radius: 16px;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    backdrop-filter: blur(5px);
  }

  .recommendation h4 {
    font-size: 1.1rem;
    color: #fff;
    margin: 0 0 8px 0;
  }

  .recommendation p {
    margin: 0;
    color: #bbb;
    font-size: 0.95rem;
  }

  .cta-button {
    display: inline-block;
    margin-top: 15px;
    padding: 12px 30px;
    background-color: var(--primary-green);
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s ease, transform 0.3s ease;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .cta-button:hover {
    background-color: #0f8a2e; /* Un verde ligeramente más brillante */
    transform: translateY(-2px);
  }
</style>