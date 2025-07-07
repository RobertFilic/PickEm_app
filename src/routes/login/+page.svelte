<script>
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let isLoading = false;

    async function login() {
        isLoading = true;
        try {
            await pb.collection('users').authWithPassword(email, password);
            goto('/'); // Redirect to home page
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            isLoading = false;
        }
    }
</script>

<h2>Login</h2>
<form on:submit|preventDefault={login}>
    <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={email} required>
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input id="password" type="password" bind:value={password} required>
    </div>
    <button type="submit" disabled={isLoading}>
        {#if isLoading}Logging in...{:else}Login{/if}
    </button>
</form>

<style>
    .form-group { margin-bottom: 1rem; }
    label { display: block; }
</style>