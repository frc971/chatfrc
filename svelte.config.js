// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		// CSP Configuration taken from https://kit.svelte.dev/docs/configuration#csp
		csp: {
			mode: 'hash',
			directives: {
				'script-src': ['self', 'https://www.googletagmanager.com', 'sha256-Nu8jSZrWXyeg0ec2AX27S6zlwSHMa7iw1vgkFyCyq/U=']
			}
		}
	}
};

export default config;
