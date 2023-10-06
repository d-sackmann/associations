<script lang="ts">
	import colors from '$lib/colors';
	import { GROUP_SIZE, type GameState, type WordId } from '$lib/game';
	import { getContext } from 'svelte';
	import type { Readable } from 'svelte/store';

	export let store: Readable<GameState>;
	export let show: boolean;

	const flashMessage = getContext<(s: string) => void>('popover');

	$: guesses = $store.guesses.filter(({ userSubmitted }) => userSubmitted);

	function getGroupIdxForWordId(wordId: WordId) {
		return Math.floor((wordId - 1) / GROUP_SIZE);
	}
	function handleShareClick() {
		navigator.clipboard.writeText(
			guesses
				.map((guess) =>
					guess.words
						.map(getGroupIdxForWordId)
						.map((groupIdx) => colors[groupIdx].icon)
						.join('')
				)
				.join('\n')
		);
		flashMessage('Copied to clipboard');
	}
</script>

{#if show}
	<div id="results-container">
		<div id="results">
			<div class="container right">
				<button class="game-button" id="close-button" on:click={() => (show = false)}>X</button>
			</div>
			<div class="container center">
				<div id="guesses">
					{#each guesses as guess}
						<div class="row">
							{#each guess.words as wordId}
								<div
									class="block"
									style={`background-color: ${colors[getGroupIdxForWordId(wordId)].solvedColor}`}
								/>
							{/each}
						</div>
					{/each}
				</div>
			</div>

			<div class="container center">
				<button id="share-button" class="game-button" on:click={() => handleShareClick()}
					>Share</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	#results-container {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		/* opacity: 0.3; */
		background-color: transparent;
		display: flex;
		align-items: top;
		justify-content: center;
	}

	#results {
		opacity: 1;
		background-color: white;
		height: 99%;
		width: 99%;
		border-radius: 4px;
		display: flex;
		flex-direction: column;
	}

	#guesses {
		margin-top: 10%;
	}

	.block {
		height: 40px;
		width: 40px;
		border-radius: 5px;
		display: inline-block;
	}
</style>
