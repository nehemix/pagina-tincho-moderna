<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let loading = $state(false);
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
				<input id="password" name="password" type="password" required autocomplete="current-password" disabled={loading} class="w-full bg-[#2b2b2b] border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 transition-colors disabled:opacity-50" />
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