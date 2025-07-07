<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase';
  import GameCard from '$lib/components/GameCard.svelte';

  let competition = null;
  let groupStageGames = []; // <<< THIS LINE WAS MISSING
  let groupStandings = [];
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
        isPastDeadline = new Date(competition.group_stage_deadline) < new Date();

        groupStageGames = await pb.collection('games').getFullList({
            filter: `competition = "${competitionId}" && stage = "group"`,
            sort: 'game_time',
            expand: 'home_team_id,away_team_id' 
        });

        groupStandings = await pb.collection('group_standings').getFullList({
            filter: `group.competition = "${competitionId}"`,
            sort: '+group.name, -points, -wins',
            expand: 'group,team'
        });

        if ($currentUser) {
            const existingPicksResult = await pb.collection('predictions').getFullList({
                filter: `user = "${$currentUser.id}" && game.competition = "${competitionId}"`
            });
            existingPicks.clear();
            existingPicksResult.forEach(pick => existingPicks.set(pick.game, pick));
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

    try {
        for (const gameId in predictions) {
            const newWinner = predictions[gameId];
            const existingPick = existingPicks.get(gameId);
            if (existingPick) {
                if (existingPick.predicted_winner !== newWinner) {
                    await pb.collection('predictions').update(existingPick.id, { predicted_winner: newWinner });
                }
            } else {
                await pb.collection('predictions').create({
                    user: $currentUser.id,
                    game: gameId,
                    predicted_winner: newWinner
                });
            }
        }
        alert('Your picks have been saved successfully!');
        predictions = {};
        await fetchData();
    } catch (err) {
        console.error('Failed to save picks:', err);
        alert(`An error occurred while saving: ${err.message}`);
    } finally {
        isSubmitting = false;
    }
  }
</script>

{#if isLoading}
  <p>Loading competition...</p>
{:else if competition}
  <h2>{competition.name}</h2>
  <h3>Group Stage Picks</h3>
  {#if isPastDeadline}
    <p class="deadline-passed">The deadline for this competition has passed. Picks are locked.</p>
  {:else}
    <p>You can change your picks until the deadline: {new Date(competition.group_stage_deadline).toLocaleString()}</p>
  {/if}
  
  <div class="games-list">
    {#each groupStageGames as game}
      <GameCard {game} {isPastDeadline} onSelect={handleSelect} existingPick={existingPicks.get(game.id)} />
    {/each}
  </div>

  {#if !isPastDeadline}
    <button on:click={submitPicks} class="submit-button" disabled={isSubmitting}>
      {#if isSubmitting} Saving... {:else} Save My Picks {/if}
    </button>
  {/if}

  <h3 class="standings-header">Group Standings</h3>
  {#if groupStandings.length > 0}
    <table class="standings-table">
      <thead><tr><th>Group</th><th>Team</th><th>W</th><th>D</th><th>L</th><th>Pts</th></tr></thead>
      <tbody>
        {#each groupStandings as standing}
          <tr>
            <td>{standing.expand.group.name}</td>
            <td>{standing.expand.team.name}</td>
            <td>{standing.wins}</td>
            <td>{standing.draws}</td>
            <td>{standing.losses}</td>
            <td>{standing.points}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <p>Standings are not yet available.</p>
  {/if}
{:else}
  <p>Could not load competition.</p>
{/if}

<style>
  .standings-header { margin-top: 3rem; border-top: 2px solid #eee; padding-top: 2rem; }
  .standings-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
  .standings-table th, .standings-table td { border: 1px solid #ddd; padding: 0.75rem; text-align: left; }
  .standings-table th { background-color: #f8f9fa; }
  .standings-table tbody tr:nth-child(even) { background-color: #f8f9fa; }
  .submit-button { width: 100%; padding: 1rem; font-size: 1.2rem; margin-top: 2rem; }
  .submit-button:disabled { background-color: #ccc; cursor: not-allowed; }
  .deadline-passed { text-align: center; font-size: 1.2rem; font-weight: bold; color: #dc3545; margin-top: 1rem; padding: 1rem; background-color: #f8d7da; border-radius: 8px; }
</style>