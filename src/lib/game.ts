import { type Subscriber, writable } from 'svelte/store';
import { arrayEquals, delay, shuffle, tally } from './utils';

type WordId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;
type Word = {
	id: WordId;
	value: string;
};

export type WordGroup = {
	solved: boolean;
	words: Word[];
	label: string;
};

type Guess = {
	correct: boolean;
	userSubmitted: boolean;
	words: WordId[];
};
export type GameState = {
	groups: WordGroup[];

	positions: WordId[];

	selections: WordId[];

	guesses: Guess[];
};
export const GROUP_COUNT = 4;
export const GROUP_SIZE = 4;
export const MISTAKES_ALLOWED = 4;
function idFromCoords(x: number, y: number) {
	return 1 + GROUP_SIZE * x + y;
}
export const storeFromGroups = (groupStrings: string[][]) => {
	if (groupStrings.length !== GROUP_COUNT) {
		throw new Error('Must have 4 groups');
	}

	if (!groupStrings.every((group) => group.length === GROUP_SIZE + 1)) {
		throw new Error('Each group must contain 4 words and a label');
	}

	const initialPositions = Array.from({ length: GROUP_COUNT * GROUP_SIZE }).map(
		(_, idx) => idx + 1
	) as WordId[];
	shuffle(initialPositions);

	const groups = groupStrings.map((g, i) => {
		const label = g[g.length - 1];

		return {
			label,
			solved: false,
			words: g
				.slice(0, g.length - 1)
				.map((value, j) => ({ value, id: idFromCoords(i, j) as WordId }))
		};
	});
	return gameStore({
		guesses: [] as Guess[],
		selections: [],
		positions: initialPositions,
		groups
	});
};

export function getNumMistakesMade(state: GameState) {
	return tally(state.guesses, ({ correct }) => !correct);
}
export function getNumGroupsSolved(state: GameState) {
	return tally(state.groups, ({ solved }) => solved);
}

function getIndexOfFirstUnsolvedWord(state: GameState) {
	return getNumGroupsSolved(state) * GROUP_SIZE;
}

const gameStore = (gameState: GameState) => {
	const store = writable(gameState);
	return {
		subscribe(cb: Subscriber<GameState>) {
			return store.subscribe(cb);
		},

		selectTile(position: number) {
			store.update((state) => {
				const selectedWordId = state.positions[position];
				if (!selectedWordId) {
					return state;
				}

				if (state.selections.includes(selectedWordId)) {
					return {
						...state,
						selections: state.selections.filter((s) => s !== selectedWordId)
					};
				}

				if (state.selections.length >= GROUP_SIZE) {
					return state;
				}

				return {
					...state,
					selections: state.selections.concat([selectedWordId])
				};
			});
		},

		shuffleTiles() {
			store.update((state) => {
				const slicePt = getIndexOfFirstUnsolvedWord(state);
				const solvedSection = state.positions.slice(0, slicePt);
				const unsolvedSection = state.positions.slice(slicePt);
				shuffle(unsolvedSection);
				return {
					...state,
					positions: solvedSection.concat(unsolvedSection)
				};
			});
		},

		deselectAll() {
			store.update((state) => {
				return {
					...state,
					selections: []
				};
			});
		},

		async solveRemaining() {
			this.deselectAll();
			let numGroupsSolved = 4;
			store.update((state) => {
				numGroupsSolved = getNumGroupsSolved(state);
				const slicePt = getIndexOfFirstUnsolvedWord(state);
				const solvedSection = state.positions.slice(0, slicePt);
				const unsolvedSection = state.positions.slice(slicePt);
				unsolvedSection.sort((a, b) => a - b);

				return {
					...state,
					positions: solvedSection.concat(unsolvedSection)
				};
			});

			await delay(1000);

			for (let i = numGroupsSolved; i < GROUP_COUNT; i++) {
				for (let j = 0; j < GROUP_SIZE; j++) {
					store.update((state) => {
						return {
							...state,
							selections: state.selections.concat(state.positions[i * GROUP_SIZE + j])
						};
					});

					await delay(500);
				}

				this.submitGuess(false);
				await delay(1500);
			}
		},

		submitGuess(isUserSubmitted = true) {
			let numberCorrect = 0;
			let alreadyGuessed = false;
			store.update((state) => {
				alreadyGuessed = state.guesses.some((oldGuess) =>
					arrayEquals(oldGuess.words, state.selections)
				);

				if (
					state.selections.length !== GROUP_SIZE ||
					(getNumMistakesMade(state) >= MISTAKES_ALLOWED && isUserSubmitted) ||
					alreadyGuessed
				) {
					return state;
				}

				const hitCounts = state.groups.map((group) => {
					const wordIds = group.words.map(({ id }) => id);
					return tally(state.selections, (selectedWordId) => wordIds.includes(selectedWordId));
				});

				const indexOfHighestHitCount = hitCounts.reduce(
					(indexOfMaxSoFar, next, i, array) =>
						next > array[indexOfMaxSoFar] ? i : indexOfMaxSoFar,
					0
				);
				numberCorrect = hitCounts[indexOfHighestHitCount];

				if (numberCorrect === GROUP_SIZE) {
					for (let i = 0; i < GROUP_SIZE; i++) {
						const indexOfWordToMove = getIndexOfFirstUnsolvedWord(state) + i;
						const wordToMove = state.positions[indexOfWordToMove];
						const dest = state.positions.indexOf(state.selections[i]);
						state.positions[indexOfWordToMove] = state.selections[i];
						state.positions[dest] = wordToMove;
					}

					state.groups[indexOfHighestHitCount] = {
						...state.groups[indexOfHighestHitCount],
						solved: true
					};

					return {
						...state,
						guesses: state.guesses.concat([
							{ words: state.selections, correct: true, userSubmitted: isUserSubmitted }
						]),
						groups: [...state.groups],
						positions: [...state.positions],
						selections: []
					};
				} else {
					return {
						...state,
						guesses: state.guesses.concat([
							{ words: state.selections, correct: false, userSubmitted: isUserSubmitted }
						])
					};
				}
			});

			return {
				offBy: GROUP_SIZE - numberCorrect,
				alreadyGuessed
			};
		}
	};
};
