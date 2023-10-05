<script lang="ts">
	import Game from '$lib/Game.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<Game game={data.game} />
