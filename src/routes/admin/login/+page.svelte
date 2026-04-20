<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
	let showPassword = $state(false);
</script>

<svelte:head>
	<title>Login | Panel de Administración</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-[#2b2b2b] text-white px-4">
	<div class="max-w-md w-full bg-[#1a1a1a] p-8 rounded-2xl shadow-2xl border border-zinc-800">
		<div class="text-center mb-8">
			<h1 class="text-3xl font-bold tracking-tight">Acceso Restringido</h1>
			<p class="text-sm text-zinc-400 mt-2">Panel de Administración</p>
		</div>

		<!-- Mensajes de error genéricos para evitar fugas de información -->
		{#if form?.error}
			<div class="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6 text-sm text-center border border-red-500/20" role="alert">
				{form.error}
			</div>
		{/if}

		<form method="POST" action="?/login" class="space-y-5" use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				await update();
				loading = false;
			};
		}}>
			<div>
				<label for="text" class="block text-sm font-medium text-zinc-300 mb-1.5">Usuario</label>
				<input id="text" name="usuario" type="text" required autocomplete="username" disabled={loading} class="w-full bg-[#2b2b2b] border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors disabled:opacity-50" />
			</div>
			
			<div>
				<label for="password" class="block text-sm font-medium text-zinc-300 mb-1.5">Contraseña</label>
				<div class="relative">
					<input id="password" name="password" type={showPassword ? "text" : "password"} required autocomplete="current-password" disabled={loading} class="w-full bg-[#2b2b2b] border border-zinc-700 rounded-lg px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors disabled:opacity-50" />
					<button type="button" class="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-200 focus:outline-none transition-colors" onclick={() => showPassword = !showPassword}>
						{#if showPassword}
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
							</svg>
						{:else}
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
								<path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
								<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						{/if}
					</button>
				</div>
			</div>

			<button type="submit" disabled={loading} class="w-full bg-[rgba(11,102,35,1)] hover:bg-green-800 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center mt-6">
				{#if loading}
					<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
				{:else}
					Iniciar Sesión
				{/if}
			</button>
		</form>
	</div>
</div>