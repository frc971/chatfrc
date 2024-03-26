// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	declare interface Window {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		dataLayer: any;
	}
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
