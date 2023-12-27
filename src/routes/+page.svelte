<script lang="ts">
	import Message from './Message.svelte';

	import { ChatHistoryType } from '$lib/history';
	import { streamAsyncIterator } from '$lib/iterable_stream';

	import { Icon } from '@steeze-ui/svelte-icon';
	import { PaperAirplane, Trash } from '@steeze-ui/heroicons';

	import { writable } from 'svelte/store';
	import type { ChatHistory } from '$lib/history';
	import markdownit from 'markdown-it';

	export const historyStore = writable<ChatHistory[]>([]);

	let userInput = '';

	async function send() {
		$historyStore = [
			...$historyStore,
			{
				type: ChatHistoryType.Human,
				content: userInput
			}
		];

		userInput = '';

		const response = await fetch('api/completion', {
			method: 'POST',
			body: JSON.stringify({
				chatHistory: $historyStore
			}),
			headers: {
				'content-type': 'application/json'
			}
		});

		const stream = response.body;

		$historyStore = [
			...$historyStore,
			{
				type: ChatHistoryType.AI,
				content: ''
			}
		];

		const decoder = new TextDecoder('utf-8');

		for await (const chunk of streamAsyncIterator(stream!)) {
			console.log(decoder.decode(chunk));
			$historyStore[$historyStore.length - 1].content += decoder.decode(chunk);
		}
		const md = markdownit('commonmark')
		$historyStore[$historyStore.length - 1].content = md.render($historyStore[$historyStore.length - 1].content)
	}

	const reset_chat = async () => historyStore.set([]);
</script>

<div
	class="flex flex-col-reverse flex-1 justify-between items-center w-full h-full overflow-x-clip"
>
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

	<div class="w-full overflow-y-auto">
		{#each $historyStore as { type, content }}
			<Message {type} {content} />
		{/each}
	</div>
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
