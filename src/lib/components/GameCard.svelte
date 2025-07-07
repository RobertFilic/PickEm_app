<script>
  import { onMount } from 'svelte';

  export let game;
  export let onSelect;
  export let existingPick = null;
  export let isPastDeadline = false;

  let selectedWinner = null;
  // The game object now contains expanded team records
  const homeTeam = game.expand?.home_team_id;
  const awayTeam = game.expand?.away_team_id;

  onMount(() => {
    if (existingPick) {
      selectedWinner = existingPick.predicted_winner;
    }
  });

  function select(winner) {
    if (isPastDeadline) return;
    selectedWinner = winner;
    onSelect(game.id, winner);
  }
</script>

{#if homeTeam && awayTeam}
  <div class="game-card" class:locked={isPastDeadline}>
    <div class="team" on:click={() => select('home')} class:selected={selectedWinner === 'home'}>
      <span>{homeTeam.name}</span>
    </div>
    <div class="details">
      {#if isPastDeadline}
          <span class="locked-text">DEADLINE PASSED</span>
      {:else}
          <span>vs</span>
          <small>{new Date(game.game_time).toLocaleString()}</small>
      {/if}
    </div>
    <div class="team" on:click={() => select('away')} class:selected={selectedWinner === 'away'}>
      <span>{awayTeam.name}</span>
    </div>
  </div>
{/if}

<style>
  /* Styles are unchanged */
  .game-card { display: flex; justify-content: space-between; align-items: center; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 1rem; background-color: white; }
  .team { flex: 1; padding: 1.5rem; text-align: center; cursor: pointer; transition: background-color 0.2s; }
  .team:first-child { border-right: 1px solid #eee; border-radius: 8px 0 0 8px; }
  .team:last-child { border-left: 1px solid #eee; border-radius: 0 8px 8px 0; }
  .team.selected { background-color: #007bff; color: white; font-weight: bold; }
  .details { text-align: center; color: #6c757d; }
  .game-card.locked { background-color: #f8f9fa; opacity: 0.7; }
  .game-card.locked .team { cursor: not-allowed; }
  .locked-text { font-weight: bold; color: #dc3545; }
</style>