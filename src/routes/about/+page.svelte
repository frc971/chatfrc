<script lang="ts">
	import about_text from '$lib/about_text';
</script>

<div class="m-auto justify-center w-2/3 h-full mt-20">
	<h1 class="text-3xl font-bold">About</h1>
	{#each about_text.split('\n') as line}
		<br />
		<p>{line}</p>
	{/each}
</div>
