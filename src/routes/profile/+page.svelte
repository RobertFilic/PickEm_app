<script>
  import { onMount } from 'svelte';
  import { pb, currentUser } from '$lib/pocketbase';
  import { goto } from '$app/navigation';

  let stats = {
    totalPicks: 0,
    correctPicks: 0,
    score: 0,
  };
  let participatedCompetitions = new Map();
  let isLoading = true;

  onMount(async () => {
    if (!$currentUser) {
      goto('/login'); // Protect the page
      return;
    }

    const predictions = await pb.collection('predictions').getFullList({
      filter: `user = "${$currentUser.id}"`,
      expand: 'game,game.competition', // Also fetch the related game and competition data
    });

    stats.totalPicks = predictions.length;
    stats.correctPicks = predictions.filter(p => p.is_correct).length;
    stats.score = stats.correctPicks; // 1 point per correct pick

    // Group competitions
    predictions.forEach(p => {
        const competition = p.expand.game.expand.competition;
        if (!participatedCompetitions.has(competition.id)) {
            participatedCompetitions.set(competition.id, competition);
        }
    });

    isLoading = false;
  });
</script>

<h2>My Profile</h2>

{#if isLoading}
  <p>Loading your stats...</p>
{:else}
  <div class="stats-grid">
    <div class="stat-card">
      <h4>Total Picks</h4>
      <p>{stats.totalPicks}</p>
    </div>
    <div class="stat-card">
      <h4>Correct Picks</h4>
      <p>{stats.correctPicks}</p>
    </div>
    <div class="stat-card">
      <h4>Total Score</h4>
      <p>{stats.score}</p>
    </div>
  </div>

  <h3 class="competitions-header">My Competitions</h3>
  {#if participatedCompetitions.size > 0}
    <ul>
      {#each Array.from(participatedCompetitions.values()) as competition}
        <li>
          <a href={`/leaderboard/${competition.id}`}>{competition.name} Leaderboard</a>
        </li>
      {/each}
    </ul>
  {:else}
    <p>You haven't participated in any competitions yet.</p>
  {/if}
{/if}

<style>
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .stat-card {
    background-color: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    text-align: center;
  }
  .stat-card h4 {
    margin: 0 0 0.5rem 0;
  }
  .stat-card p {
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }
  .competitions-header {
    margin-top: 2rem;
  }
</style>