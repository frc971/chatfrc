<script lang="ts">
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ExclamationCircle } from '@steeze-ui/heroicons';
</script>

<div class="inline-flex space-x-10 text-gray-500 items-center m-10">
	<Icon src={ExclamationCircle} class="w-8 h-8" />
	<span>
		<h2 class="font-bold">Warning:</h2>
		<p>ChatFRC is still a work in progress and some responses may be inaccurate.</p>
	</span>
</div>
