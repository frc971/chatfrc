<!-- TODO(max): Add functionality to report more things to gtag like user reports or other misc info. -->

<script lang="ts">
	import { page } from '$app/stores';

	export let id = import.meta.env.VITE_MEASUREMENT_ID;

	$: {
		if (
			typeof gtag !== 'undefined' &&
			typeof window !== 'undefined' &&
			import.meta.env.PROD == true
		) {
			window.dataLayer = window.dataLayer || [];

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const gtag: any = function () {
				window.dataLayer.push(arguments);
			};

			gtag('js', new Date());
			gtag('config', id, {
				page_title: document.title,
				page_path: $page.url.pathname
			});
		}
	}
</script>

<svelte:head>
	<script async src={'https://www.googletagmanager.com/gtag/js?id=' + id}></script>
</svelte:head>
