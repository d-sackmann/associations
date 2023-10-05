import { deserialize } from '$lib/gameStringUtils';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = (event) => {
	const gameStr = event.url.searchParams.get('g');

	if (!gameStr) {
		throw redirect(302, '/featured');
	}

	const game = deserialize(gameStr);
	return { game };
};
