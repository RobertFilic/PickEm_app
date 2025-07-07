<script>
  import { onMount } from 'svelte';
  import { pb } from '$lib/pocketbase';

  let competitions = [];

  onMount(async () => {
    competitions = await pb.collection('competitions').getFullList({
      sort: '-created',
    });
  });
</script>

<h2>Active Competitions</h2>

{#if competitions.length > 0}
  <div class="competitions-list">
    {#each competitions as competition}
      <a href={`/competitions/${competition.id}`} class="competition-item">
        <h3>{competition.name}</h3>
        <p>Picks locked on: {new Date(competition.prediction_deadline).toLocaleString()}</p>
      </a>
    {/each}
  </div>
{:else}
  <p>No active competitions right now. Check back later!</p>
{/if}

<style>
    .competitions-list {
        margin-top: 1.5rem;
    }
    .competition-item {
        display: block;
        padding: 1rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 1rem;
        text-decoration: none;
        color: inherit;
        transition: background-color 0.2s;
    }
    .competition-item:hover {
        background-color: #f8f9fa;
    }
</style>