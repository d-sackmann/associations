<script lang="ts">
	import { goto } from '$app/navigation';
	import colors from '$lib/colors';
	import { serialize } from '$lib/gameStringUtils';

	const groups = [[], [], [], []];
	function handleSubmit() {
		const gameStr = serialize(groups);

		goto('/?g=' + gameStr);
	}

	let form: HTMLFormElement;
</script>

<p>Make your own puzzle! For each color, enter 4 words, and the Category those words belong to.</p>
<form bind:this={form} on:submit={() => handleSubmit()}>
	{#each colors as color, groupIdx}
		<div class="group" style={`background-color: ${color.solvedColor}`}>
			<fieldset>
				<legend>Words</legend>
				{#each { length: colors.length } as _, wordIdx}
					<input
						class="word-input"
						required
						id={`word-${groupIdx}-${wordIdx}`}
						type="text"
						bind:value={groups[groupIdx][wordIdx]}
					/>
				{/each}
			</fieldset>

			<div>
				<label for={`label-${groupIdx}`}>Category</label>
				<input required type="text" id={`label-${groupIdx}`} bind:value={groups[groupIdx][4]} />
			</div>
		</div>
	{/each}

	<button type="submit" disabled={!form || !form.checkValidity()}>View Puzzle</button>
</form>

<style>
	p,
	form {
		font-family: sans-serif;
	}
	.group {
		margin: 8px;
	}

	.word-input {
		display: block;
	}
</style>
