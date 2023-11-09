import { useEffect, useState } from "react";
import GameModal from "@/components/Game";
import { CONTRACT_ADDRESS } from "@/components/utils";
import { useWallet } from "@/wallets/wallet-selector";


export default function Arcade() {
  const { signedAccountId, viewMethod, callMethod, logIn }: any = useWallet();
  const [loading, setLoading] = useState<boolean>(true);
  const [games, setGames] = useState<any[]>([]);
  const [gameInfo, setGameInfo] = useState<any>({
    admin: '',
    url: '',
    img_url: '',
    name: '',
    description: '',
    challenges: [],
    leaderboardRewards: [],
    challengeRewards: []
  });
  const [creatingGame, setCreatingGame] = useState<boolean>(false);
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // You would normally handle the game creation logic here
    callMethod(CONTRACT_ADDRESS, "createGame", gameInfo).then(() => {
      console.log("created game");
    });
  };

  // Function to handle adding a new challenge
  const addChallenge = () => {
    const newChallenge = { name: '', description: '', value: 0, thresholds: [] };
    setGameInfo({ ...gameInfo, challenges: [...gameInfo.challenges, newChallenge] });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'leaderboardRewards') {
      setGameInfo({ ...gameInfo, [e.target.name]: e.target.value.split(",").map(n => Number(n)) });
    } else if (e.target.name === 'challengeRewards') {
      console.log(e.target.value);
      setGameInfo({ ...gameInfo, [e.target.name]: e.target.value.split(",").map(n => Number(n)) });
    } else {
      setGameInfo({ ...gameInfo, [e.target.name]: e.target.value });
    }
  };

  // Function to handle input changes for challenges
  const handleChallengeChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.target.name === 'thresholds') {
      const updatedChallenges = gameInfo.challenges.map((challenge: any, i: number) =>
        index === i ? { ...challenge, [e.target.name]: e.target.value.split(",").map(n => Number(n)) } : challenge
      );
      setGameInfo({ ...gameInfo, challenges: updatedChallenges });
    } else {
      const updatedChallenges = gameInfo.challenges.map((challenge: any, i: number) =>
        index === i ? { ...challenge, [e.target.name]: e.target.value } : challenge
      );
      setGameInfo({ ...gameInfo, challenges: updatedChallenges });
    }
  };
  useEffect(() => {
    if (viewMethod) {
      viewMethod(CONTRACT_ADDRESS, "getGames", {}).then((games: any) => {
        console.log(games);
        setGames(games);
        setLoading(false);
        logIn();
      });
    }
  }, [signedAccountId, viewMethod]);
  if (loading) {
    return (
      <div className="flex flex-row justify-center items-center w-screen">
        <p>Loading...</p>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col justify-center items-center w-screen p-4 gap-2">
        <p className="font-bold text-xl">Arcade</p>
        <div className="flex flex-row justify-end items-center gap-2 w-full">
          <button onClick={() => window.location.href = "/leaderboard"} className="text-sm bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded">Leaderboard</button>
          <button onClick={() => window.location.href = "/account"} className="text-sm bg-green-500 hover:bg-green-700 text-white py-1 px-2 rounded">Account</button>
          <button onClick={() => window.location.href = "/marketplace"} className="text-sm bg-yellow-500 hover:bg-yellow-700 text-white py-1 px-2 rounded">Marketplace</button>
          <button onClick={() => setCreatingGame(true)} className="text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded">Create Game</button>
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          {games.map((game, i) => {
            return (
              <GameModal game={game} key={i} />
            );
          })}
        </div>
        {creatingGame &&
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Game</h3>
              <form onSubmit={handleSubmit}>
                {/* Form inputs for game details */}
                <div className="my-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Game Name</label>
                  <input type="text" name="name" value={gameInfo.name} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="my-4">
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700">Game URL</label>
                  <input type="text" name="url" value={gameInfo.url} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="my-4">
                  <label htmlFor="img_url" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input type="text" name="img_url" value={gameInfo.img_url} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="my-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" value={gameInfo.description} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="my-4">
                  <label htmlFor={`leaderboardRewards`} className="block text-sm font-medium text-gray-700">Leaderboard Rewards</label>
                  <input type="text" name="leaderboardRewards" value={gameInfo.leaderboardRewards} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div className="my-4">
                  <label htmlFor={`challengeRewards`} className="block text-sm font-medium text-gray-700">Challenge Rewards</label>
                  <input type="text" name="challengeRewards" value={gameInfo.challengeRewards} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>

                {/* Dynamic form inputs for challenges */}
                {gameInfo.challenges.map((challenge: any, index: any) => (
                  <div key={index} className="mb-4">
                    <h4 className="text-lg font-medium leading-6 text-gray-900">Challenge {index + 1}</h4>
                    <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" value={challenge.name} onChange={(e) => handleChallengeChange(index, e)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                    <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" value={challenge.description} onChange={(e) => handleChallengeChange(index, e)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                    {/* <label htmlFor={`value-${index}`} className="block text-sm font-medium text-gray-700">Value</label>
                    <input type="number" name="value" value={challenge.value} onChange={(e) => handleChallengeChange(index, e)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required /> */}
                    <label htmlFor={`thresholds-${index}`} className="block text-sm font-medium text-gray-700">Thresholds</label>
                    <input type="text" name="thresholds" value={challenge.thresholds} onChange={(e) => handleChallengeChange(index, e)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                  </div>
                ))}
                <div className="flex flex-row justify-center items-center gap-2">
                  <button type="button" onClick={addChallenge} className="text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-2 rounded">
                    Add Challenge
                  </button>
                  <button type="submit" className="bg-green-500 hover:bg-green-700 text-white py-1 px-4 rounded">
                    Create Game {"(Pay 1 Near)"}
                  </button>
                  <button type="button" onClick={() => setCreatingGame(false)} className="bg-red-500 hover:bg-red-700 text-white py-1 px-4 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

        }
      </div>
    );
  }
}
