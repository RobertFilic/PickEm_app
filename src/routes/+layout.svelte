<script>
  import { currentUser, pb } from '$lib/pocketbase';
  import "./styles.css";

  function logout() {
    pb.authStore.clear();
  }
</script>

<div class="app-container">
  <header>
    <h1>Pick'em App</h1>
    <nav>
      <a href="/">Home</a>
      {#if $currentUser}
        <a href="/profile">My Profile</a>
        <span>Logged in as: {$currentUser.email}</span>
        <button on:click={logout}>Logout</button>
      {:else}
        <a href="/login">Login</a>
        <a href="/register">Register</a>
      {/if}
    </nav>
  </header>

  <main>
    <slot />
  </main>
</div>

<style>
    .app-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 1rem;
        font-family: sans-serif;
    }
    header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #ccc;
        padding-bottom: 1rem;
    }
    nav {
        display: flex;
        gap: 1rem;
        align-items: center;
    }
</style>