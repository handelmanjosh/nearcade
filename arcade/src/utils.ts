import { AccountId, LookupMap, UnorderedMap, Vector } from "near-sdk-js";

export function generateRandomUUID(): string {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 32; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
export class Play {
    player: AccountId;
    gameId: string;
    constructor({player, gameId}: {player: AccountId, gameId: string}) {
      this.player = player;
      this.gameId = gameId;
    }
}
export class Stat {
    player_id: string;
    game_id: string
    score: number;
    challengeData: {name: string, value: number}[]
    constructor({ player_id, game_id }: {player_id: string, game_id: string}) {
      this.player_id = player_id
      this.score = 0;
      this.game_id = game_id
      this.challengeData = [];
    }
}
export class Game {
    admin: AccountId
    url: string;
    img_url: string
    name: string;
    description: string;
    challenges: GameChallengeMetadata[]
    leaderboardRewards: number[];
    challengeRewards: number[]
    cost_to_play: number;
    shop: {name: string, description: string, price: number, type: string, img_src: string}[]
    constructor({admin, url, name, challenges, description, img_url, cost_to_play, leaderboardRewards, challengeRewards}: {cost_to_play: number, admin: AccountId, url: string, name: string, description: string, challenges: GameChallengeMetadata[], img_url: string, leaderboardRewards: number[], challengeRewards: number[]}) {
      this.url = url;
      this.name = name;
      this.challenges = challenges;
      this.admin = admin;
      this.description = description;
      this.img_url = img_url;
      this.cost_to_play = cost_to_play;
      this.leaderboardRewards = leaderboardRewards
      this.challengeRewards = challengeRewards
      this.shop = [];
    }
  }
export class GameChallengeMetadata {
    name: string;
    description: string;
    value: number;
    thresholds: number[];
    constructor(metadata: {name: string, description: string, thresholds: number[]}) {
      this.name = metadata.name;
      this.description = metadata.description;
      this.value = 0;
      this.thresholds = metadata.thresholds;
    }
  }

  export class Listing {
    id: string
    seller: string
    price: number
    contract_id: string
    type: string
    img_src: string
    constructor({id, seller, price, type, contract_id, img_src}: {id: string, seller: string, price: number, type: string, contract_id: string, img_src: string}) {
        this.id = id;
        this.seller = seller;
        this.price = price;
        this.type = type
        this.contract_id = contract_id
        this.img_src = img_src
    }
}