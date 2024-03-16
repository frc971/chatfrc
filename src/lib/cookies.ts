import { browser } from "$app/environment";
import { writable } from "svelte/store";

export const cookies_accepted = writable<boolean>((browser && localStorage.cookies_accepted == 'true') || false);

cookies_accepted.subscribe((value: boolean) => {
    if (!browser) return;

    localStorage.cookies_accepted = JSON.stringify(value);
})
