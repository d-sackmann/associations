export function serialize(groups: string[][]) {
	const tsvStr = groups.reduce((tsv, nextGroup, i) => {
		return tsv + nextGroup.join('\t') + (i === groups.length - 1 ? '' : '\n');
	}, '');

	return btoa(tsvStr);
}

export function deserialize(b64Str: string) {
	return atob(b64Str)
		.split('\n')
		.map((r) => r.split('\t'));
}
