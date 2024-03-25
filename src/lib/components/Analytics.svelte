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
	<meta property="id" content={import.meta.env.VITE_MEASUREMENT_ID} />
	<script async src={'https://www.googletagmanager.com/gtag/js?id='+id}></script>
	<script>
		//https://stackoverflow.com/questions/10668292/is-there-a-setting-on-google-analytics-to-suppress-use-of-cookies-for-users-who

		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}

		if(localStorage.cookies_accepted != 'true'){
			console.log("Consent NOT Granted")
            gtag('consent', 'default', {
                'ad_storage': 'denied',
                'analytics_storage': 'denied',
                'personalization_storage': 'denied',
                'functionality_storage': 'denied',
                'security_storage': 'denied',
            });
        } else {
			console.log("Consent Granted")
			gtag('consent', 'default', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted',
                'personalization_storage': 'granted',
                'functionality_storage': 'granted',
                'security_storage': 'granted',
            });
        }

		gtag('js', new Date());
		gtag('config', document.head.querySelector("[property~=id][content]").content);
	  </script>
</svelte:head>
