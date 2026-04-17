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
      <div class="contact-card">
        <div class="icon-wrapper">
          <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
        </div>
        <h4>E-mail</h4>
        <p><a href="mailto:info@martinmangudo.com.ar">info@martinmangudo.com.ar</a></p>
      </div>
    </div>
  </div>
</section>

<style>
  /* Sección de contacto */
  .contact-section {
    background: radial-gradient(circle at top center, #2a2a2a 0%, #111 100%);
    padding: 80px 20px;
    text-align: center;
    font-family: 'Arial', sans-serif;
    margin-top: 80px; /* Espacio para que no se solape con el navbar */
    color: white;
    
    /* Propiedades para centrar vertical y horizontalmente */
    min-height: calc(100vh - 80px); /* Ocupa todo el alto de la pantalla restante */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    animation: slideInFromTop 1s ease-out forwards;
    opacity: 0;
    transform: translateY(-50px);
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
    margin-bottom: 60px;
  }

  .section-title {
    font-size: 2.5rem;
    color: var(--primary-green);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .subtitle {
    font-size: 1.1rem;
    color: #aaa;
  }

  .container {
    width: 100%;
    max-width: 1000px;
    margin: 0 auto;
  }

  .contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    width: 100%;
  }

  /* Diseño de las tarjetas */
  .contact-card {
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 40px 20px;
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

  .icon-wrapper {
    width: 60px;
    height: 60px;
    background: rgba(11, 102, 35, 0.1);
    color: var(--primary-green);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }

  .icon-wrapper svg {
    width: 30px;
    height: 30px;
  }

  .contact-card h4 {
    font-size: 1.2rem;
    color: #fff;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .contact-card p {
    font-size: 1rem;
    color: #bbb;
    margin: 0;
  }

  .contact-card a {
    color: #90ee90;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s;
  }

  .contact-card a:hover {
    color: #fff;
  }
</style>