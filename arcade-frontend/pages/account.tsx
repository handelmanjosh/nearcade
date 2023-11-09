import ChallengeProgressBar from "@/components/Challenge";
import GameModal from "@/components/Game";
import { CONTRACT_ADDRESS } from "@/components/utils";
import { useWallet } from "@/wallets/wallet-selector";
import { useEffect, useState } from 'react';

export default function Account() {

    const { signedAccountId, viewMethod }: any = useWallet();
    const [games, setGames] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);
    const [listings, setListings] = useState<any[]>([]);
    const [balance, setBalance] = useState<number>(0);
    useEffect(() => {
        if (signedAccountId && viewMethod) {
            viewMethod(CONTRACT_ADDRESS, "getGames", {}).then((games: any) => {
                setGames(games);
            });
            viewMethod(CONTRACT_ADDRESS, "getStatsForPlayer", { player_id: signedAccountId }).then((stats: any) => {
                setStats(stats);
            });
            viewMethod(CONTRACT_ADDRESS, "getMyListings", { account_id: signedAccountId }).then((listings: any) => {
                setListings(listings);
            });
            viewMethod(CONTRACT_ADDRESS, "getMyTickets", { player_id: signedAccountId }).then((balance: any) => { setBalance(balance); });
        }
    }, [signedAccountId, viewMethod]);
    // user can view their listings, challenges, etc
    return (
        <div className="flex flex-col justify-center items-center w-screen">
            <p className="font-bold text-xl">Account: {signedAccountId}</p>
            <p>Your Balance: {balance} ARC</p>
            {games && games.length > 0 &&
                <>
                    <p>Your games</p>
                    <div className="flex flex-row justify-center items-center gap-2">
                        {games.map((game, i) => {
                            return (
                                <GameModal game={game} key={i} />
                            );
                        })}
                    </div>
                </>
            }
            <p> Your challenge progress </p>
            <div className="flex flex-col justify-center items-center gap-2">
                {games.map((game: any, i: number) => {
                    if (game.challenges.length === 0) {
                        return (
                            <></>
                        );
                    } else {
                        return (
                            <div className="flex flex-col justify-center items-center" key={i}>
                                <p>{game.name}</p>
                                <div className="flex flex-row justify-center items-center gap-2" >
                                    {game.challenges.map((metadata: any, ii: number) => {
                                        const stat = stats.find((stat) => stat.game_id === game.name);
                                        return (
                                            <ChallengeProgressBar
                                                key={ii}
                                                currentValue={stat ? stat.value : 0}
                                                thresholds={metadata.thresholds}
                                                name={metadata.name}
                                                description={metadata.description}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    }
                })}
            </div>
            <p>Your listings</p>
            <div className="flex flex-row justify-center items-center gap-2">
                {listings.map((listing: any, i: number) => (
                    <div
                        key={listing.id}
                        className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                    >
                        <img src={listing.img_src} alt={listing.type} className="w-full h-36 object-fit" />
                        <div className="p-4">
                            <div className="font-semibold">Price: {listing.price} ARC</div>
                            <div className="text-sm text-gray-600">Seller: {listing.seller}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div >
    );
}

const Stat = ({ stat, statsmetadata }: { stat: any, statsmetadata: any; }) => {
    // You can use the stat and statsmetadata to render the component as needed
    return (
        <div className="border p-4 rounded shadow-md">
            <h3 className="text-lg font-bold">Player Stat</h3>
            <div className="mt-2">
                <p>Player ID: {stat.player_id}</p>
                <p>Game ID: {stat.game_id}</p>
                <p>Score: {stat.score}</p>
                <div>
                    <h4 className="font-bold">Challenges:</h4>
                    {statsmetadata.map((meta: any, index: number) => (
                        <div key={index} className="mt-1">
                            <p className="font-semibold">{meta.name}:</p>
                            <p>Description: {meta.description}</p>
                            {/* Additional rendering based on the challenge data */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};