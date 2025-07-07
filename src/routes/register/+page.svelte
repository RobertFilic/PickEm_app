<script>
    import { pb } from '$lib/pocketbase';
    import { goto } from '$app/navigation';

    let email = '';
    let password = '';
    let passwordConfirm = '';
    let name = '';
    let isLoading = false;

    async function register() {
        isLoading = true;
        try {
            await pb.collection('users').create({
                email,
                password,
                passwordConfirm,
                name,
            });
            // After successful registration, log the user in
            await pb.collection('users').authWithPassword(email, password);
            goto('/'); // Redirect to home page
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            isLoading = false;
        }
    }
</script>

<h2>Register New Account</h2>
<form on:submit|preventDefault={register}>
    <div class="form-group">
        <label for="name">Name</label>
        <input id="name" type="text" bind:value={name} required>
    </div>
    <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" bind:value={email} required>
    </div>
    <div class="form-group">
        <label for="password">Password</label>
        <input id="password" type="password" bind:value={password} required>
        <!-- THIS IS THE NEW LINE -->
        <small>Password must be at least 8 characters long.</small>
    </div>
    <div class="form-group">
        <label for="passwordConfirm">Confirm Password</label>
        <input id="passwordConfirm" type="password" bind:value={passwordConfirm} required>
    </div>
    <button type="submit" disabled={isLoading}>
        {#if isLoading}Registering...{:else}Register{/if}
    </button>
</form>

<style>
    .form-group { margin-bottom: 1rem; }
    label { display: block; }
    small { 
        display: block;
        margin-top: 0.25rem;
        color: #6c757d;
    }
</style>