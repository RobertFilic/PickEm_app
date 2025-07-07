<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { pb } from '$lib/pocketbase';

    let competitionName = '';
    let leaderboard = [];
    let isLoading = true;

    onMount(async () => {
        const competitionId = $page.params.id;

        // Fetch all predictions for this competition, and expand the user data for each
        const predictions = await pb.collection('predictions').getFullList({
            filter: `game.competition = "${competitionId}"`,
            expand: 'user,game',
        });

        if (predictions.length > 0) {
            // Set competition name from the first prediction
            competitionName = predictions[0].expand.game.competition;
        }

        // Process the data on the client-side to build the leaderboard
        const scores = new Map();
        for (const prediction of predictions) {
            const user = prediction.expand.user;
            if (!scores.has(user.id)) {
                scores.set(user.id, {
                    name: user.name,
                    totalPicks: 0,
                    correctPicks: 0,
                });
            }

            const userData = scores.get(user.id);
            userData.totalPicks += 1;
            if (prediction.is_correct) {
                userData.correctPicks += 1;
            }
        }

        // Convert map to array, calculate score and win %, then sort
        leaderboard = Array.from(scores.values()).map(data => ({
            ...data,
            score: data.correctPicks, // 1 point per correct pick
            winPercentage: data.totalPicks > 0 ? ((data.correctPicks / data.totalPicks) * 100).toFixed(1) : 0,
        })).sort((a, b) => b.score - a.score); // Sort descending by score

        isLoading = false;
    });
</script>

{#if isLoading}
    <p>Loading leaderboard...</p>
{:else}
    <h2>Leaderboard</h2>
    <table class="leaderboard-table">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Win %</th>
            </tr>
        </thead>
        <tbody>
            {#each leaderboard as player, index}
                <tr>
                    <td>{index + 1}</td>
                    <td>{player.name}</td>
                    <td>{player.score}</td>
                    <td>{player.winPercentage}%</td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    .leaderboard-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1.5rem;
    }
    .leaderboard-table th, .leaderboard-table td {
        border: 1px solid #ddd;
        padding: 0.75rem;
        text-align: left;
    }
    .leaderboard-table th {
        background-color: #f8f9fa;
    }
    .leaderboard-table tbody tr:nth-child(even) {
        background-color: #f8f9fa;
    }
</style>