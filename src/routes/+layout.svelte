<script>
	import '../app.css';
	import Analytics from '$lib/components/Analytics.svelte';
</script>

<Analytics />

<nav
	class="absolute top-0 p-2 w-full shadow-lg bg-gray-100 flex flex-1 flex-row space-x-4 justify-between pr-4 pl-4"
>
	<div class="inline-flex space-x-4">
		<enhanced:img alt="FRC971 Spartan Robotics Logo" src="/static/logo.png" class="w-7 h-7" />
		<h1 class="font-bold text-xl">ChatFRC</h1>
	</div>
	<ul class="inline-flex space-x-4">
		<li class="text-gray-600 text-lg hover:text-blue-600">
			<a href="https://www.frc971.org/" target="_blank">Home</a>
		</li>
		<li class="text-gray-600 text-lg hover:text-blue-600">
			<a href="/" target="_blank">Chatbot</a>
		</li>
		<li class="text-gray-600 text-lg hover:text-blue-600">
			<a href="/about" target="_blank">About</a>
		</li>
	</ul>
</nav>

<slot />
