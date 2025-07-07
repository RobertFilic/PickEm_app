<script>
  import { onMount } from 'svelte';

  export let game;
  export let onSelect;
  export let existingPick = null;
  export let isPastDeadline = false; // New: Master lock switch

  let selectedWinner = null;

  onMount(() => {
    if (existingPick) {
      selectedWinner = existingPick.predicted_winner;
    }
  });

  function select(winner) {
    if (isPastDeadline) return; // Don't allow changes if locked
    selectedWinner = winner;
    onSelect(game.id, winner);
  }
</script>

<div class="game-card" class:locked={isPastDeadline}>
  <div class="team" on:click={() => select('home')} class:selected={selectedWinner === 'home'}>
    <span>{game.home_team}</span>
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
    <span>{game.away_team}</span>
  </div>
</div>

<style>
  /* Styles are the same as the last version, but are included for completeness */
  .game-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #ccc;
    border-radius: 8px;
    margin-bottom: 1rem;
    background-color: white;
  }
  .team {
    flex: 1;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .team:first-child {
    border-right: 1px solid #eee;
    border-radius: 8px 0 0 8px;
  }
  .team:last-child {
    border-left: 1px solid #eee;
    border-radius: 0 8px 8px 0;
  }
  .team.selected {
    background-color: #007bff;
    color: white;
    font-weight: bold;
  }
  .details {
    text-align: center;
    color: #6c757d;
  }
  .game-card.locked {
    background-color: #f8f9fa;
    opacity: 0.7;
  }
  .game-card.locked .team {
    cursor: not-allowed;
  }
  .locked-text {
    font-weight: bold;
    color: #dc3545;
  }
</style>