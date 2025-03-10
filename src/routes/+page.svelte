<script lang="ts">
	import Message from '$lib/components/Message.svelte';
	import Warning from '$lib/components/Warning.svelte';

	import { ChatHistoryType } from '$lib/history';
	import type { ChatHistory } from '$lib/history';
	import { CompletionState } from '$lib/state';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { PaperAirplane, Trash } from '@steeze-ui/heroicons';

	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import CookieConsentBanner from '$lib/components/CookieConsentBanner.svelte';

	let history: ChatHistory[] = [];

	let userInput = '';

	let completionState = writable<CompletionState>(CompletionState.Completed);

	let loading = false;

	setContext('completionState', completionState);

	async function send() {
		if ($completionState == CompletionState.Loading) {
			return;
		}

		completionState.set(CompletionState.Loading);

		history = [
			...history,
			{
				type: ChatHistoryType.Human,
				content: userInput
			}
		];

		loading = true;

		const response = await fetch('api/completion', {
			method: 'POST',
			body: JSON.stringify({
				chatHistory: history,
				input: userInput
			}),
			headers: {
				'content-type': 'application/json'
			}
		});

		loading = false;

		userInput = '';

		history = [
			...history,
			{
				type: ChatHistoryType.AI,
				content: ''
			}
		];
		const data = await response.json();
		let message = data;

		history[history.length - 1].content = message;

		completionState.set(CompletionState.Completed);
	}

	const reset_chat = async () => {
		history = [];
	};
</script>

<div class="flex flex-col flex-1 justify-between items-center w-full h-full overflow-x-clip">
	<div class="mt-10 w-full overflow-y-auto">
		{#each history as { type, content }}
			<Message {type} {content} />
		{/each}
		{#if loading == true}
			<div class="flex justify-center items-center">
				<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
			</div>
		{/if}
	</div>

	{#if history.length == 0}
		<Warning />
	{/if}

	<form
		class="shadow-2xl border-2 focus:border-gray-950 rounded-3xl flex flex-row md:w-2/3 sm:w-full space-x-2 m-4 p-2"
	>
		<input
			bind:value={userInput}
			on:submit={send}
			placeholder="Enter your message..."
			class="m-auto outline-none active:border-none rounded-md p-2 flex-1"
		/>
		<button on:click={send}>
			<Icon src={PaperAirplane} class="w-6 h-6 text-gray-500 hover:text-gray-950" />
		</button>

		<button on:click={reset_chat}>
			<Icon src={Trash} class="w-6 h-6 text-gray-500 hover:text-gray-950" />
		</button>
	</form>

	<CookieConsentBanner />
</div>

<style lang="postcss">
	::-webkit-scrollbar {
		@apply w-2;
	}

	::-webkit-scrollbar-track {
		@apply bg-gray-300;
	}

	::-webkit-scrollbar-thumb {
		@apply bg-gray-500 rounded-md;
	}
</style>
