import PocketBase from 'pocketbase';
import { writable } from 'svelte/store';

// Make sure 'export' is here
export const pb = new PocketBase('http://127.0.0.1:8090');

// And make sure 'export' is here
export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange(() => {
	currentUser.set(pb.authStore.model);
});