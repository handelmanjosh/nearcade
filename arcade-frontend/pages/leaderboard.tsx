import { CONTRACT_ADDRESS } from "@/components/utils";
import { useWallet } from "@/wallets/wallet-selector";
import { useEffect, useState } from "react";



type LeaderboardEntry = {
    player_id: string;
    score: number;
    // add other leaderboard entry properties here
};

export default function Leaderboard() {
    const { signedAccountId, viewMethod }: any = useWallet();
    const [games, setGames] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

    // Fetch games when component mounts or the signedAccountId changes
    useEffect(() => {
        if (signedAccountId && viewMethod) {
            viewMethod(CONTRACT_ADDRESS, "getGames", {}).then((fetchedGames: any[]) => {
                console.log(fetchedGames);
                setGames(fetchedGames);
            });
        }
    }, [signedAccountId, viewMethod]);

    const openLeaderboard = (gameId: string) => {
        setSelectedGameId(gameId);
        viewMethod(CONTRACT_ADDRESS, "getGameLeaderboard", { game_id: gameId }).then((fetchedLeaderboard: LeaderboardEntry[]) => {
            console.log(fetchedLeaderboard);
            setLeaderboard(fetchedLeaderboard);
        });
    };

    return (
        <div className="flex flex-col items-center w-screen p-4 bg-white">
            <h1 className="text-2xl font-semibold text-gray-800 mb-5">Leaderboards</h1>
            <div className="space-y-2 w-full max-w-md">
                {games.map((game, i) => (
                    <button
                        key={i}
                        onClick={() => openLeaderboard(game.name)}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out"
                    >
                        {game.name}
                    </button>
                ))}
            </div>
            {selectedGameId && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-8 overflow-hidden">
                        <div className="px-6 py-4">
                            <h3 className="text-xl font-medium text-gray-900">Leaderboard for {selectedGameId}</h3>
                            <div className="mt-2 overflow-auto max-h-96">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="pb-2 border-b-2 border-gray-200 text-sm font-semibold text-gray-600">Player</th>
                                            <th className="pb-2 border-b-2 border-gray-200 text-sm font-semibold text-gray-600">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {leaderboard.map((entry, index) => (
                                            <tr key={index} className="hover:bg-gray-100">
                                                <td className="py-3 px-2 text-sm text-gray-700">{entry.player_id}</td>
                                                <td className="py-3 px-2 text-sm text-gray-700">{entry.score}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setSelectedGameId(null)}
                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md transition duration-200 ease-in-out"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}