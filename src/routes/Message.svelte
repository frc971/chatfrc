<script lang="ts">
	import { ChatHistoryType } from '$lib/history';

	export let content = '';
	export let type = '';
</script>

{#if type == ChatHistoryType.AI}
	<div class="message bg-gray-100">
		<p>🤖</p>

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
