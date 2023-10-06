<script lang="ts">
	import Game from '$lib/Game.svelte';
	import featuredGames from '$lib/featuredGames';

	const game = featuredGames[featuredGames.length - 1];
</script>

<Game {game} />
