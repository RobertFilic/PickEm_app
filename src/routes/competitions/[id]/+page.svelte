<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase';
  import GameCard from '$lib/components/GameCard.svelte';
  import { goto } from '$app/navigation';

  let competition = null;
  let games = [];
  let existingPicks = new Map();
  let predictions = {};
  let isLoading = true;
  let isSubmitting = false;
  let isPastDeadline = false;

  async function fetchData() {
    isLoading = true;
    try {
      const competitionId = $page.params.id;

      competition = await pb.collection('competitions').getOne(competitionId);
      isPastDeadline = new Date(competition.prediction_deadline) < new Date();

      games = await pb.collection('games').getFullList({
        filter: `competition = "${competitionId}"`,
        sort: 'game_time',
      });

      if ($currentUser) {
        const existingPicksResult = await pb.collection('predictions').getFullList({
          filter: `user = "${$currentUser.id}" && game.competition = "${competitionId}"`
        });
        existingPicks.clear();
        existingPicksResult.forEach(pick => {
          existingPicks.set(pick.game, pick);
        });
      }
    } catch (err) {
      console.error('Failed to load competition data:', err);
      alert('Could not load competition data.');
    } finally {
      isLoading = false;
    }
  }

  onMount(fetchData);

  function handleSelect(gameId, winner) {
    predictions[gameId] = winner;
    predictions = predictions;
  }

  async function submitPicks() {
    if (isPastDeadline) {
      alert('The prediction deadline has passed. No more changes can be made.');
      return;
    }
    if (!$currentUser) {
      alert('You must be logged in to submit picks!');
      return;
    }

    isSubmitting = true;
    const promises = [];

    for (const gameId in predictions) {
      const newWinner = predictions[gameId];
      const existingPick = existingPicks.get(gameId);

      if (existingPick) {
        if (existingPick.predicted_winner !== newWinner) {
          promises.push(pb.collection('predictions').update(existingPick.id, { predicted_winner: newWinner }));
        }
      } else {
        promises.push(pb.collection('predictions').create({
          user: $currentUser.id,
          game: gameId,
          predicted_winner: newWinner
        }));
      }
    }

    if (promises.length === 0) {
      alert("You haven't made any new changes to submit.");
      isSubmitting = false;
      return;
    }

    // --- RESTRUCTURED LOGIC ---
    let success = false;
    try {
        // This is the only part that should be in the 'try' block
        await Promise.all(promises);
        success = true;
    } catch (err) {
        console.error('Failed to save picks:', err);
        alert(`An error occurred while saving: ${err.message}`);
    }

    isSubmitting = false;

    // Run success logic ONLY if the submission was successful
    if (success) {
        alert('Your picks have been saved successfully!');
        predictions = {}; // Clear selections
        await fetchData(); // Re-fetch data to show the new state
    }
    // --- END OF RESTRUCTURE ---
  }
</script>

{#if isLoading}
  <p>Loading competition...</p>
{:else if competition}
  <h2>{competition.name}</h2>
  {#if isPastDeadline}
    <p class="deadline-passed">The deadline for this competition has passed. Picks are locked.</p>
  {:else}
    <p>You can change your picks until the deadline: {new Date(competition.prediction_deadline).toLocaleString()}</p>
  {/if}

  <div class="games-list">
    {#each games as game}
      <GameCard {game} {isPastDeadline} onSelect={handleSelect} existingPick={existingPicks.get(game.id)} />
    {/each}
  </div>

  {#if !isPastDeadline}
    <button on:click={submitPicks} class="submit-button" disabled={isSubmitting}>
      {#if isSubmitting}
          Saving...
      {:else}
          Save My Picks
      {/if}
    </button>
  {/if}
{:else}
  <p>Could not load competition.</p>
{/if}

<style>
  .submit-button { width: 100%; padding: 1rem; font-size: 1.2rem; margin-top: 2rem; }
  .submit-button:disabled { background-color: #ccc; cursor: not-allowed; }
  .deadline-passed { text-align: center; font-size: 1.2rem; font-weight: bold; color: #dc3545; margin-top: 1rem; padding: 1rem; background-color: #f8d7da; border-radius: 8px; }
</style>