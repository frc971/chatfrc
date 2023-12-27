<script lang="ts">
	export let content = '';
	export let type = '';

	import { ChatHistoryType } from '$lib/history';
	import { CompletionState } from '$lib/state';
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	import Spinner from './Spinner.svelte';

	const completionStateStore = getContext<Writable<CompletionState>>('completionState');

	let completionState = $completionStateStore;

	$: if ($completionStateStore == CompletionState.Completed) {
		completionState = CompletionState.Completed;
	}

	$: console.log(completionState);
</script>

{#if type == ChatHistoryType.AI}
	<div class="message bg-gray-100">
		{#if completionState == CompletionState.Loading}
			<p><Spinner /></p>
		{:else}
			<p>🤖</p>
		{/if}

		<p>{@html content}</p>
	</div>
{:else}
	<div class="message">
		<p>🙇</p>

		<p>{content}</p>
	</div>
{/if}

<style lang="postcss">
	.message {
		@apply border-2 flex flex-row space-x-4 p-4 m-auto mt-4 mb-4 w-11/12 shadow-lg rounded-xl whitespace-pre-line;
	}
</style>
