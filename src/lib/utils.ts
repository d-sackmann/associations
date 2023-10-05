export function tally<T>(list: T[], predicate: (e: T, i?: number, l?: T[]) => boolean): number {
	return list.reduce((acc, next, i, l) => {
		if (predicate(next, i, l)) return acc + 1;
		return acc;
	}, 0);
}

export function arrayEquals<T extends K, K>(arr1: T[], arr2: K[]): boolean {
	return arr1.length === arr2.length && arr1.every((arr1Val) => arr2.includes(arr1Val));
}

export function delay(time: number) {
	return new Promise<void>((resolve) => setTimeout(() => resolve(), time));
}

export function shuffle(array: number[]) {
	let currentIndex = array.length,
		randomIndex;
	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}
