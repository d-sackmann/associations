<script lang="ts">
	import { goto } from '$app/navigation';
	import Game from '$lib/Game.svelte';
	import { storeFromGroups } from '$lib/game';
	import { deserialize } from '$lib/gameStringUtils';
	import { onMount } from 'svelte';

	const game = storeFromGroups([
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', ''],
		['', '', '', '', '']
	]);

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);

		const gameStr = searchParams.get('g');

		if (gameStr === null) {
			goto('/featured');
		} else {
			try {
				game.setFromGroups(deserialize(gameStr));
			} catch (e) {
				goto('/featured');
			}
		}
	});
</script>

<Game {game} />
