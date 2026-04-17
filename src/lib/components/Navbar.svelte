<script lang="ts">
	import { page } from '$app/stores';

	// Estado para el menú mobile en Svelte 5
	let isMenuOpen = $state(false);

	const toggleMenu = () => {
		isMenuOpen = !isMenuOpen;
	};
	const closeMenu = () => {
		isMenuOpen = false;
	};

	const navLinks = [
		{ href: '/producto', label: 'Producto' },
		{ href: '/industria', label: 'Industria' },
		{ href: '/retratos', label: 'Retratos' },
		{ href: '/personales', label: 'Personales' },
		{ href: '/foto-360', label: 'Foto 360' },
		{ href: '/contacto', label: 'Contacto' }
	];

</script>

<nav class="navbar">
	<div class="nav-container">
		<a href="/" class="brand" onclick={closeMenu}>
			<span class="first-name">MARTIN</span>
			<span class="last-name">MANGUDO</span>
		</a>

		<button class="hamburger" onclick={toggleMenu} aria-label="Menu">
			<div class="bar" class:open={isMenuOpen}></div>
		</button>

		<ul class="nav-links" class:mobile-open={isMenuOpen}>
			{#each navLinks as link}
				<li>
					<a href={link.href} class:active={$page.url.pathname === link.href} onclick={closeMenu}>
						{link.label}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</nav>

<style>
	.navbar {
		position: fixed;
		top: 0;
		width: 100%;
		height: 80px;
		background: rgba(0, 0, 0, 0.85);
		backdrop-filter: blur(10px);
		z-index: 3000;
		display: flex;
		align-items: center;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.nav-container {
		width: 100%;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	/* --- BRAND / LOGO --- */
	.brand {
		text-decoration: none;
		font-size: 2rem;
		font-weight: 800;
		letter-spacing: 1px;
		font-family: 'Encode Sans Condensed', sans-serif;
		font-weight: 700;
		font-style: normal;
		letter-spacing: -1px; /* Para que quede más compacto, como en la imagen */
		text-transform: uppercase;
	}
	 {
		color: #1b732a;
		margin-right: 5px;
	} /* Verde de tu captura */
	.last-name {
		color: #ffffff;
	}

	/* --- LINKS (PC por defecto en horizontal) --- */
	.nav-links {
		display: flex;
		gap: 30px;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.nav-links a {
		text-decoration: none;
		color: #bbb;
		font-size: 0.9rem;
		font-weight: 500;
		text-transform: uppercase;
		transition: color 0.3s;
		position: relative;
		padding-bottom: 5px;
	}

	/* Efecto de subrayado animado al pasar el mouse */
	.nav-links a::after {
		content: '';
		position: absolute;
		width: 0;
		height: 2px;
		bottom: 0;
		left: 50%;
		background-color: #1b732a;
		transition: all 0.3s ease-in-out;
		transform: translateX(-50%);
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: #1b732a;
	}
	
	.nav-links a:hover::after,
	.nav-links a.active::after {
		width: 100%;
	}

	/* --- HAMBURGUESA (Oculta en PC) --- */
	.hamburger {
		display: none;
		background: none;
		border: none;
		cursor: pointer;
		padding: 10px;
	}

	.bar {
		width: 25px;
		height: 2px;
		background: white;
		position: relative;
		transition: 0.3s;
	}
	.bar::before,
	.bar::after {
		content: '';
		position: absolute;
		width: 25px;
		height: 2px;
		background: white;
		left: 0;
		transition: 0.3s;
	}
	.bar::before {
		top: -8px;
	}
	.bar::after {
		bottom: -8px;
	}

	/* Animación cruz */
	.bar.open {
		background: transparent;
	}
	.bar.open::before {
		transform: rotate(45deg);
		top: 0;
	}
	.bar.open::after {
		transform: rotate(-45deg);
		bottom: 0;
	}

	/* --- MOBILE STYLES --- */
	@media (max-width: 768px) {
		.hamburger {
			display: block;
			z-index: 3001;
		}

		.nav-links {
			position: fixed;
			top: 0;
			right: -100%;
			width: 80%;
			height: 100vh;
			background: #0a0a0a;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			transition: 0.4s;
		}

		.nav-links.mobile-open {
			right: 0;
		}

		.nav-links a {
			font-size: 1.5rem;
		}
	}
</style>
