<script lang="ts">
	import Game from '$lib/Game.svelte';
	import featuredGames from '$lib/featuredGames';

	const game = featuredGames[0];
</script>

<Game {game} />
