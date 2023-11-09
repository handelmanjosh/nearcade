const CONTRACT_ADDRESS = "ENTER HERE";

export async function createGame(callMethod, url, img_url, name, description, challenges, leaderboardRewards, challengeRewards) {
    try {
        const response = await callMethod(CONTRACT_ADDRESS, "createGame", {url, img_url, name, description, challenges, leaderboardRewards, challengeRewards})
        console.log(response);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
export async function playGame(callMethod, game_id) {
    try {
        const response = await callMethod(CONTRACT_ADDRESS, "playGame", { game_id })
        console.log(response);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
export async function endGame(callMethod, game_id, challenge_data, new_score, ticket_reward) {
    try {
        const response = await callMethod(CONTRACT_ADDRESS, "endGame", { game_id, challenge_data, new_score, ticket_reward})
        console.log(response);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
export async function checkIfPlaying(viewMethod, game_id, player_id) {
    try {
        const playing = await viewMethod(CONTRACT_ADDRESS, "getPlaying", {game_id, player_id})
        if (playing) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error(e);
        return false;
    }
}
export async function fundGame(callMethod, name, amount) {
    try {
        const response = await callMethod(CONTRACT_ADDRESS, "fundGame", {name, amount})
        console.log(response);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}
export async function issueTickets(callMethod, game_id, amount) {
    try {
        const response = await callMethod(CONTRACT_ADDRESS, "issueTickets", {game_id, amount})
        console.log(response);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}