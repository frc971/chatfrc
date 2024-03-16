<script lang="ts">
	import { cookies_accepted } from '$lib/cookies';

	let visible = true;

	$: cookies_accepted.subscribe((value) => {
		if (visible) {
			visible = !value;
		}
	});
</script>

{#if visible}
	<div class="absolute bg-black text-white bottom-1 p-4 rounded-xl w-2/3">
		<h1 class="font-bold text-lg">Cookie Consent Banner</h1>
		<p>We use your cookies with Google Analytics to gauge our overall usage worldwide.</p>
		<br />
		<div class="flex space-x-8">
			<button
				class="bg-green-600 p-2 rounded-md"
				on:click={() => {
					visible = false;
					cookies_accepted.set(true);
				}}>Accept</button
			>
			<button
				class="bg-red-600 p-2 rounded-md"
				on:click={() => {
					visible = false;
				}}>Deny</button
			>
		</div>
	</div>
{/if}
