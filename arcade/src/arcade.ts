// Find all our documentation at https://docs.near.org
import { NearBindgen, near, call, view, LookupMap, UnorderedMap, assert, UnorderedSet, Vector, AccountId, NearPromise, initialize, ONE_YOCTO, ONE_NEAR } from 'near-sdk-js';
import { Game, GameChallengeMetadata, Listing, Play, Stat, generateRandomUUID } from './utils';


class PhysicalPrize {
  id: string;
  tracking_num: string;
  player_id: string;
  ticket_reward: number
  constructor({id, tracking_num, player_id, ticket_reward}: {id: string, tracking_num: string, player_id: string, ticket_reward: number}) {
    this.id = id;
    this.tracking_num = tracking_num;
    this.player_id = player_id;
    this.ticket_reward = ticket_reward
  }
}

@NearBindgen({})
class Arcade {
  games: UnorderedMap<Game>
  plays: LookupMap<Play>
  ticketBalances: LookupMap<number>    
  listings: UnorderedMap<Listing>
  playerStats: UnorderedMap<Stat[]>
  ticketLeaderboard: UnorderedMap<number>
  physicalPrizes: UnorderedMap<PhysicalPrize>
  constructor() {
    this.games = new UnorderedMap<Game>("games");
    this.plays = new LookupMap<Play>("plays");
    this.ticketBalances = new LookupMap<number>("ticket_balances");
    this.listings = new UnorderedMap<Listing>("listings");
    this.playerStats = new UnorderedMap<Stat[]>("player_stats");
    this.ticketLeaderboard = new UnorderedMap<number>("ticket_leaderboard");
    this.physicalPrizes = new UnorderedMap<PhysicalPrize>("physical_prizes");
  }
  @initialize({})
  init() {
    this.ticketBalances.set("ARCADE", 1000000000000000)
  }
  @call({})
  takeDownListing({ id } : { id: string }) {
    assert(this.listings.get(id), "Listing does not exist");
    this.listings.remove(id);
  }
  @call({})
  claimPhysicalPrizeTicketReward({ id }: {id: string}) {
    const prize = this.physicalPrizes.get(id);
    assert(prize, "Prize does not exist");
    assert(prize.player_id === near.predecessorAccountId(), "You do not own this prize");
    // check to see if prize has been delivered
    // if so, then give player the ticket reward
    this.ticketBalances.set(near.predecessorAccountId(), (this.ticketBalances.get(near.predecessorAccountId()) || 0) + prize.ticket_reward);
  }
  @call({})
  updatePhysicalPrizeTrackingInfo({tracking_num, id}: {tracking_num: string, id: string}) {
    const prize = this.physicalPrizes.get(id);
    assert(prize, "Prize does not exist");
    assert(prize.player_id === near.predecessorAccountId(), "You do not own this prize");
    prize.tracking_num = tracking_num;
    this.physicalPrizes.set(id, prize);
  }
  @call({})
  createListing({ id, price, type, contract_id, img_src }: { id: string, price: number, type: string, contract_id: string, img_src: string }) {
      assert(!this.listings.get(id), "Listing already exists");
      const listing = new Listing({ id, seller: near.predecessorAccountId(), price, type, contract_id, img_src });
      this.listings.set(id, listing);
      // const promise = near.promiseBatchCreate(contract_id);
      // if (type === "nft") {
      //     near.promiseBatchActionFunctionCall(
      //         promise,
      //         "nft_transfer",
      //         JSON.stringify({
      //             receiver_id: contract_id,
      //             token_id: id,
      //             approval_id: null,
      //             memo: null
      //         }),
      //         1,
      //         GAS_FOR_NFT_TRANSFER
      //     )
      // } else if (type === "coin") {
      //     near.promiseBatchActionFunctionCall(
      //         promise,
      //         "ft_transfer",
      //         JSON.stringify({
      //             receiver_id: "xeony.testnet",
      //             amount: price,
      //             memo: null
      //         }),
      //         1,
      //         GAS_FOR_NFT_TRANSFER
      //     )
      // }
  }
  @call({})
  buyListing({ id }) {
    const listing = this.listings.get(id);
    assert(listing, "Listing does not exist");
    const buyerTickets = this.ticketBalances.get(near.predecessorAccountId()) || 0;
    if (buyerTickets >= BigInt(listing.price)) {
      if (listing.type === "physical") {
        const physicalPrize = new PhysicalPrize({id, tracking_num: "", player_id: listing.seller, ticket_reward: listing.price});
        this.physicalPrizes.set(id, physicalPrize);
      } else {
        this.ticketBalances.set(listing.seller, (this.ticketBalances.get(listing.seller) || 0 + listing.price));
      }
      this.ticketBalances.set(near.predecessorAccountId(), buyerTickets - listing.price);
      this.listings.remove(id);
    }
  }
  @view({})
  getListings() {
    return this.listings.toArray().map(data => data[1]);
  }
  @view({})
  getMyListings({ account_id }: { account_id: string }) {
    return this.listings.toArray().filter(data => data[1].seller === account_id).map(data => data[1])
  }
  @call({})
  buyFromGameShop({game_id, name}: {game_id: string, name: string}) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    const listing = game.shop.find(listing => listing.name === name);
    assert(listing, "Listing does not exist");
    const buyerTickets = this.ticketBalances.get(near.predecessorAccountId()) || 0;
    assert(buyerTickets >= listing.price, "Not enough tickets to buy this item");
    this.ticketBalances.set(near.predecessorAccountId(), buyerTickets - listing.price);
    this.ticketBalances.set(game.admin, (this.ticketBalances.get(game.admin) || 0) + listing.price);

    // todo: send item to player

  }
  @call({})
  addToGameShop({game_id, name, description, price, type, img_src}: {game_id: string, name: string, price: number, description: string, type: string, img_src: string}) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    assert(game.admin === near.predecessorAccountId(), "You are not the admin of this game"); 
    // todo: take iten fron uploader
    const listing = {name, description, price, type, img_src};
    game.shop.push(listing);
    this.games.set(game_id, game);
  }
  @call({})
  removeFromGameShop({game_id, name}: {game_id: string, name: string}) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    assert(game.admin === near.predecessorAccountId(), "You are not the admin of this game");
    game.shop = game.shop.filter(listing => listing.name !== name);
    this.games.set(game_id, game);
  }
  @view({})
  getGameShop({game_id}: {game_id: string}) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    return game.shop;
  }
  @call({})
  createGame({
    url,
    name,
    description,
    challenges,
    cost_to_play,
    img_url,
    leaderboardRewards,
    challengeRewards
  }: {
    url: string,
    name: string,
    description: string,
    challenges: {name: string, description: string, value: number, thresholds: number[]}[],
    cost_to_play: number,
    img_url: string,
    leaderboardRewards: number[],
    challengeRewards: number[]
  }) {
    // get user to pay for storage
    assert(!this.games.toArray().map(data => data[0]).includes(name), "Game already exists")
   // NearPromise.new("xeony.testnet").transfer(BigInt(1) * ONE_NEAR)
    let challengeMap = challenges.map(challenge => new GameChallengeMetadata(challenge));
    const game = new Game({admin: near.predecessorAccountId(), url, name, description, challenges: challengeMap, img_url, cost_to_play, leaderboardRewards, challengeRewards});
    this.games.set(name, game);
  }
  @call({})
  fundGame({name, amount}:{name: string, amount: number}) {
    // transfer some near out of the callers account to the contract
   // NearPromise.new("xeony.testnet").transfer(BigInt(amount) * ONE_NEAR)
    const game = this.games.get(name);
    assert(game, "Game does not exist")
    const currentGameBalance = this.ticketBalances.get(name) || 0;
    this.ticketBalances.set(name, currentGameBalance + amount * 1000);
    this.ticketBalances.set("ARCADE", this.ticketBalances.get("ARCADE") - amount * 1000);
  }
  @call({})
  playGame({ gameId }: { gameId: string }) {
    const playerId = near.predecessorAccountId();
    const game = this.games.get(gameId);
    assert(game, "Game does not exist")
    // game.cost_to_play near withdrawn from player account and sent to game admin
    const play = new Play({player: playerId, gameId});
    // need to get player account
    // need to assert player called the playgame function
    this.plays.set(`${gameId}-${playerId}`, play);
  }
  @call({})
  endGame({ gameId, challenge_data, new_score, ticket_reward }: { gameId: string, challenge_data: {name: string, value: number}[], new_score: number, ticket_reward: number}) {
    const playerId = near.predecessorAccountId();
    const playKey = `${gameId}-${playerId}`;
    assert(this.plays.containsKey(playKey), "Player has not played this game")
    assert(this.games.get(gameId), "Game does not exist")
        // need to assert that the game creator is the account that called this function
    // then update player progress on challenges
    const stats = this.playerStats.get(playerId)?.find(stat => stat.game_id === gameId)
    if (stats) {
      near.log(stats);
      for (const data of challenge_data) {
        const challenge = stats.challengeData.find((value) => value.name === data.name);
        if (challenge !== undefined) {
          challenge.value += data.value
        } else {
          stats.challengeData.push(data);
        }
      }
      stats.score += new_score;
      this.playerStats.set(playerId, this.playerStats.get(playerId).map(stat => stat.game_id === gameId ? stats : stat));
      near.log(stats);
    } else {
      const newStat = new Stat({player_id: playerId, game_id: gameId});
      newStat.score = new_score;
      newStat.challengeData = challenge_data;
      const currentStats = this.playerStats.get(playerId) || [];
      currentStats.push(newStat);
      this.playerStats.set(playerId, currentStats)
    }
    // now update tickets
    const currentGameTickets = this.ticketBalances.get(gameId) || 0;
    if (currentGameTickets > ticket_reward) {
      this.ticketBalances.set(gameId, currentGameTickets - ticket_reward);
      this.ticketBalances.set(playerId, (this.ticketBalances.get(playerId) || 0) + ticket_reward);
      this.ticketLeaderboard.set(playerId, (this.ticketLeaderboard.get(playerId) || 0) + ticket_reward);
    } else {
      near.log("Not enough tickets in game account")
    }
  }
  @view({})
  getMyTickets({player_id}: {player_id: string}): number {
    return this.ticketBalances.get(player_id) || 0;
  }
  @view({})
  getGames(): Game[] {
    return this.games.toArray().map(data => data[1])
  }
  @view({})
  getMyGames({account_id}: {account_id: string}): Game[] {
    return this.games.toArray().filter(data => data[1].admin === account_id).map(data => data[1])
  }
  @view({})
  getChallengesForGame({ gameName }: { gameName: string }) {
    return this.games.get(gameName)?.challenges || []
  }
  @view({})
  getGame({name}: {name: string}): Game {
    return this.games.get(name);
  }
  @view({})
  getStat({game_id, player_id}: {game_id: string, player_id: string}): Stat {
    return this.playerStats.get(player_id)?.find(stat => stat.game_id === game_id);
  }
  @view({})
  getStatsForPlayer({player_id}: {player_id: string}) {
    return this.playerStats.get(player_id) || [];
  }
  @view({})
  getGameLeaderboard({game_id}: {game_id: string}) {
    return this.playerStats.toArray().map(data => data[1]).reduce((prev, curr) => {
      prev.push(...curr);
      return prev;
    }, []).filter(stat => stat.game_id === game_id).sort((a, b) => b.score - a.score);
  }
  @view({})
  getGamesPlayed({player_id}: {player_id: string}) {
    return this.playerStats.get(player_id) || [];
  }
  @view({})
  getPlaying({gameId, playerId}: {gameId: string, playerId: string}) {
    return this.plays.get(`${gameId}-${playerId}`) ? true : false;
  }
  @view({})
  getPlays() {
    return this.plays
  }
  @view({})
  getTicketLeaderboard() {
    return this.ticketLeaderboard.toArray().map(data => data[1]).sort((a, b) => b - a).splice(0, 10);
  }
  @view({})
  getMyPhysicalPrizes({player_id}: {player_id: string}) {
    return this.physicalPrizes.toArray().map(data => data[1]).filter(prize => prize.player_id === player_id);
  }
  @call({})
  claimLeaderboardReward({player_id, game_id}: {player_id: string, game_id: string}) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    const leaderboard = this.getGameLeaderboard({game_id});
    let playerIndex = -1
    for (let i = 0; i < leaderboard.length; i++) {
      if (leaderboard[i].player_id === player_id) {
        playerIndex = i;
        break;
      }
    }
    if (playerIndex !== -1 && playerIndex < game.leaderboardRewards.length) {
      const currentGameTickets = this.ticketBalances.get(game.name) || 0;
      const ticket_reward = game.leaderboardRewards[playerIndex];
      if (currentGameTickets > ticket_reward) {
        this.ticketBalances.set(game.name, currentGameTickets - ticket_reward);
        this.ticketBalances.set(player_id, (this.ticketBalances.get(player_id) || 0) + ticket_reward);
        this.ticketLeaderboard.set(player_id, (this.ticketLeaderboard.get(player_id) || 0) + ticket_reward);
      }
    }
  } 
  @call({})
  claimChallengeReward({player_id, game_id}: {player_id: string, game_id: string}) {
    const game = this.games.get(game_id);
    assert(game, "Game does not exist");
    const stat = this.getStat({player_id, game_id});
    assert(stat, "Stat does not exist");
    const gameStat = this.getStat({player_id, game_id});
    assert(gameStat, "Game stat does not exist");
    let totalTickets = 0;
    for (const challenge of gameStat.challengeData) {
      const metadata = game.challenges.find(data => data.name === challenge.name);
      if (metadata) {
        let i = 0;
        while (i < metadata.thresholds.length && challenge.value > metadata.thresholds[i]) {
          i++;
        }
        const tickets = i < game.challengeRewards.length ? game.challengeRewards[i] : game.challengeRewards[game.challengeRewards.length - 1];
        totalTickets += tickets;
      }
    }
    const currentGameTickets = this.ticketBalances.get(game.name) || 0;
    if (currentGameTickets > totalTickets && totalTickets > 0) {
      this.ticketBalances.set(game.name, currentGameTickets - totalTickets);
      this.ticketBalances.set(player_id, (this.ticketBalances.get(player_id) || 0) + totalTickets);
      this.ticketLeaderboard.set(player_id, (this.ticketLeaderboard.get(player_id) || 0) + totalTickets);
    }
  }
}