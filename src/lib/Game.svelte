<script lang="ts">
	import Results from './Results.svelte';

	import colors from '$lib/colors';
	import {
		GROUP_COUNT,
		GROUP_SIZE,
		getNumGroupsSolved,
		MISTAKES_ALLOWED,
		getNumMistakesMade,
		type WordGroup,
		type GameStore
	} from '$lib/game';
	import { arrayEquals } from '$lib/utils';
	import { getContext } from 'svelte';

	export let game: GameStore;

	let gameComplete = false;
	let showResults = false;
	$: solvedGroups = $game.guesses
		.filter(({ correct }) => correct)
		.map(({ words }) =>
			$game.groups.find((group) =>
				arrayEquals(
					group.words.map(({ id }) => id),
					words
				)
			)
		)
		.filter((x) => x) as WordGroup[];

	game.subscribe(async (gameState) => {
		if (gameComplete) {
			return;
		}

		gameComplete =
			getNumGroupsSolved(gameState) === GROUP_COUNT ||
			getNumMistakesMade(gameState) === MISTAKES_ALLOWED;

		if (gameComplete) {
			await game.solveRemaining();
			showResults = true;
		}
	});
	const flashMessage = getContext<(s: string) => void>('popover');

	function handleSubmit() {
		flashMessage('');
		const { alreadyGuessed, offBy } = game.submitGuess();

		if (alreadyGuessed) {
			flashMessage('Already Guessed!');
		}

		if (offBy === 1) {
			flashMessage('One away!');
		}
	}

	function getColorForGroup(group: WordGroup) {
		const groupIdx = Math.floor((group.words[0].id - 1) / GROUP_SIZE);
		return colors[groupIdx];
	}
</script>

<div id="game">
	<div id="board">
		{#each solvedGroups as solvedGroup}
			<div
				class="solved-group"
				style={`background-color: ${getColorForGroup(solvedGroup).solvedColor}`}
			>
				<div class="group-label">
					{solvedGroup.label}
				</div>

				<div class="group-words">{solvedGroup.words.map((s) => s.value).join(', ')}</div>
			</div>
		{/each}
		{#each $game.positions as wordIdAtPosition, position}
			{@const firstIndexUnsolved = solvedGroups.length * GROUP_SIZE}
			{@const word = $game.groups
				.flatMap((group) => group.words)
				.find(({ id }) => id === wordIdAtPosition)?.value}

			{#if position >= firstIndexUnsolved}
				<button
					class={`item ${$game.selections.includes(wordIdAtPosition) ? 'selected' : 'unselected'}`}
					id={`item-${wordIdAtPosition}`}
					on:click={() => game.selectTile(position)}
					>{word}
				</button>
			{/if}
		{/each}
	</div>
	{#if gameComplete}
		<button class="game-button" on:click={() => (showResults = true)}>Show Results</button>
	{:else}
		<div id="mistake-counter">
			<span class="mistake-label">Mistakes remaining:</span>
			<span class="counter-container">
				{#each { length: MISTAKES_ALLOWED } as _, i}
					{@const mistakesMade = getNumMistakesMade($game)}
					<span class={`counter ${MISTAKES_ALLOWED - mistakesMade > i ? 'shown' : 'hidden'}`}
						>*</span
					>
				{/each}
			</span>
		</div>
		<div id="controls">
			<button class="game-button" on:click={() => game.shuffleTiles()}>Shuffle</button>
			<button class="game-button" on:click={() => game.deselectAll()}>De-select All</button>
			<button
				class="game-button"
				on:click={() => handleSubmit()}
				disabled={$game.selections.length !== GROUP_SIZE}>Submit</button
			>
		</div>
	{/if}
</div>

<Results store={game} bind:show={showResults} />

<style>
	#game {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		box-sizing: border-box;
		width: calc((4 * var(--tile-size)) + 3 * var(--gutter-size));

		min-width: 385px;
		--gutter-size: 15px;
		--tile-size: 90px;
	}

	#board {
		width: 100%;
		height: calc((4 * var(--tile-size)) + 3 * var(--gutter-size));
		display: flex;
		flex-wrap: wrap;
	}

	.item {
		text-align: center;
		text-transform: uppercase;
		border-radius: 3px;
		background-color: lightgray;
		color: black;
		width: var(--tile-size);
		height: var(--tile-size);
		margin: 3px;

		display: flex;
		justify-content: center;
		align-items: center;
		flex: var(--tile-size);
	}

	.item.selected {
		background-color: gray;
		color: white;
	}

	.solved-group {
		font-family: sans-serif;
		width: 100%;
		text-transform: uppercase;
		height: calc(var(--tile-size));
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		border-radius: 3px;
	}

	.group-label {
		width: 100%;
		display: flex;
		justify-content: center;
		font-weight: bold;
	}

	.group-words {
		font-size: small;
	}

	#mistake-counter {
		display: flex;
		width: 100%;
		justify-content: center;
	}

	.counter {
		margin-left: 0.5rem;
		margin-right: 0.5rem;
	}

	.counter.hidden {
		opacity: 0;
	}
</style>
