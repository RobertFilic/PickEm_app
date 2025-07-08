<script>
  import { onMount } from 'svelte';
  import { pb } from '$lib/pocketbase';

  let competitions = [];

  onMount(async () => {
    // This logic is unchanged
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
        {#if competition.group_stage_deadline}
          <p>Picks locked on: {new Date(competition.group_stage_deadline).toLocaleString()}</p>
        {/if}
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