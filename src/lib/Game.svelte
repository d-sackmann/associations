<script lang="ts">
	import colors from '$lib/colors';
	import {
		GROUP_COUNT,
		GROUP_SIZE,
		storeFromGroups,
		getNumGroupsSolved,
		MISTAKES_ALLOWED,
		getNumMistakesMade,
		type WordGroup
	} from '$lib/game';
	import { arrayEquals } from '$lib/utils';

	export let game: string[][];

	const store = storeFromGroups(game);

	let message: string | null = null;
	let gameComplete = false;
	let showResults = false;
	$: solvedGroups = $store.guesses
		.filter(({ correct }) => correct)
		.map(({ words }) =>
			$store.groups.find((group) =>
				arrayEquals(
					group.words.map(({ id }) => id),
					words
				)
			)
		)
		.filter((x) => x) as WordGroup[];

	store.subscribe(async (gameState) => {
		if (gameComplete) {
			return;
		}

		gameComplete =
			getNumGroupsSolved(gameState) === GROUP_COUNT ||
			getNumMistakesMade(gameState) === MISTAKES_ALLOWED;

		if (gameComplete) {
			await store.solveRemaining();
			showResults = true;
		}
	});
	function flashMessage(msg: string) {
		message = msg;

		setTimeout(() => (message = null), 2500);
	}

	function handleSubmit() {
		message = null;
		const { alreadyGuessed, offBy } = store.submitGuess();

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
		{#each $store.positions as wordIdAtPosition, position}
			{@const firstIndexUnsolved = solvedGroups.length * GROUP_SIZE}
			{@const word = $store.groups
				.flatMap((group) => group.words)
				.find(({ id }) => id === wordIdAtPosition)?.value}

			{#if position >= firstIndexUnsolved}
				<button
					class={`item ${$store.selections.includes(wordIdAtPosition) ? 'selected' : 'unselected'}`}
					id={`item-${wordIdAtPosition}`}
					on:click={() => store.selectTile(position)}
					>{word}
				</button>
			{/if}
		{/each}
	</div>
	<div id="mistake-counter">
		<span class="mistake-label">Mistakes remaining:</span>
		<span class="counter-container">
			{#each { length: MISTAKES_ALLOWED } as _, i}
				{@const mistakesMade = getNumMistakesMade($store)}
				<span class={`counter ${MISTAKES_ALLOWED - mistakesMade > i ? 'shown' : 'hidden'}`}>*</span>
			{/each}
		</span>
	</div>
	<div id="controls">
		<button on:click={() => store.shuffleTiles()}>Shuffle</button>
		<button on:click={() => store.deselectAll()}>De-select All</button>
		<button on:click={() => handleSubmit()} disabled={$store.selections.length !== GROUP_SIZE}
			>Submit</button
		>
		<!-- <button on:click={() => store.solveRemaining()}>Solve</button> -->
	</div>
</div>

{#if showResults}
	<button on:click={() => (showResults = false)}>Close results</button>
	<div id="guesses">
		{#each $store.guesses.filter(({ userSubmitted }) => userSubmitted) as guess}
			<div>
				{#each guess.words as wordId}
					{@const groupIdx = Math.floor((wordId - 1) / GROUP_SIZE)}
					<span>{colors[groupIdx].icon}</span>
				{/each}
			</div>
		{/each}
	</div>
{/if}

{#if message}
	<div>{message}</div>
{/if}

<style>
	#game {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		box-sizing: border-box;
		width: calc((4 * var(--tile-size)) + 3 * var(--gutter-size));

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

	button {
		border-radius: 40px;
		padding: 15px;
	}
</style>
