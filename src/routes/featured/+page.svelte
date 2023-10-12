<script lang="ts">
	import Game from '$lib/Game.svelte';
	import featuredGames from '$lib/featuredGames';
	import { storeFromGroups } from '$lib/game';

	const game = storeFromGroups(featuredGames[featuredGames.length - 1]);
</script>

<Game {game} />
