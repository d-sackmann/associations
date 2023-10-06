<script lang="ts">
	import { setContext } from 'svelte';
	import { fade } from 'svelte/transition';

	let popover = '';
	setContext('popover', (val: string) => {
		popover = val;

		setTimeout(() => (popover = ''), 2000);
	});
</script>

<main>
	<slot />
</main>

<footer class="container center">
	<a href="/create">Create your own puzzle</a>
	<a href="/featured">Featured Puzzle</a>
	<a href="/about">About</a>
</footer>

<div id="popover-frame">
	{#if popover}
		<div id="popover" transition:fade>{popover}</div>
	{/if}
</div>

<style>
	:global(.container) {
		display: flex;
		flex-wrap: wrap;
		box-sizing: border-box;
		width: 100%;
		height: fit-content;
	}

	:global(.container.center) {
		justify-content: center;
	}

	:global(.container.right) {
		justify-content: right;
	}
	:global(.game-button) {
		border-radius: 40px;
		padding: 15px;
	}
	main {
		margin-bottom: 5rem;
		display: flex;
		justify-content: center;
	}
	footer {
		background-color: beige;
		margin: auto;
		padding: 1.5rem;
	}

	footer > a {
		margin: 8px;
	}

	#popover-frame {
		position: absolute;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		pointer-events: none;
		display: flex;
		justify-content: center;
	}

	#popover {
		color: whitesmoke;
		background-color: black;
		height: fit-content;
		font-family: sans-serif;
		margin-top: 5%;
		padding: 0.5rem;
		border-radius: 3px;
	}
</style>
