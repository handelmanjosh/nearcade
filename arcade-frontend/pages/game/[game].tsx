import ChallengeProgressBar from "@/components/Challenge";
import { CONTRACT_ADDRESS } from "@/components/utils";
import { useWallet } from "@/wallets/wallet-selector";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";


export default function Game() {
    const router = useRouter();
    const { signedAccountId, viewMethod, callMethod }: any = useWallet();
    const [gameInfo, setGameInfo] = useState<any>();
    const [gameBalance, setGameBalance] = useState<number>(0);
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [fundAmount, setFundAmount] = useState<number>(0);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [item, setItem] = useState<any>({
        name: '',
        description: '',
        price: 0,
        type: '',
        img_src: '',
    });
    useEffect(() => {
        if (router.isReady) {
            const game = router.query.game;
            const p1 = viewMethod(CONTRACT_ADDRESS, "getGame", { name: game }).then((gameInfo: any) => {
                setGameInfo(gameInfo);
            });
            const p2 = viewMethod(CONTRACT_ADDRESS, "getMyTickets", { player_id: game }).then((balance: number) => {
                setGameBalance(balance);
            });
            const p3 = viewMethod(CONTRACT_ADDRESS, "getMyTickets", { player_id: signedAccountId }).then((balance: number) => {
                setBalance(balance);
            });
            const p4 = viewMethod(CONTRACT_ADDRESS, "getGameLeaderboard", { game_id: game }).then((leaderboard: any) => [
                setLeaderboard(leaderboard),
            ]);
            Promise.all([p1, p2, p3, p4]).then(() => setLoading(false));
        }
    }, [router.isReady]);
    const fundGame = async (e: any) => {
        // Implementation of funding the game (requires backend logic)
        e.preventDefault();
        await callMethod(CONTRACT_ADDRESS, "fundGame", { name: gameInfo.name, amount: fundAmount });

    };
    const handleBuy = (listing: any) => {
        // Implement the buy functionality here
        callMethod(CONTRACT_ADDRESS, "buyFromGameShop", { game_id: gameInfo.name, name: listing.name }).then(() => {
            console.log("bought");
        });
    };
    const addItemToShop = async (e: any) => {
        // Implementation of adding item to the shop (requires backend logic)
        e.preventDefault();
        await callMethod(CONTRACT_ADDRESS, "addToGameShop", {
            game_id: gameInfo.name,
            name: item.name,
            description: item.description,
            price: item.price,
            type: item.type,
            img_src: item.img_src
        });
        console.log("added");
    };
    const handleListingClick = (listing: any) => {
        setSelectedListing(listing);
    };
    const closePopup = () => {
        setSelectedListing(null);
    };
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center">
                <p>Loading...</p>
            </div>
        );
    } else {
        return (
            <div className="flex flex-col justify-center items-center p-4 gap-2">
                <div className="flex flex-row justify-start items-center gap-4">
                    <p className="text-xl font-bold">{gameInfo.name}</p>
                </div>
                <div className="flex flex-row justify-start w-full items-center gap-4">
                    <p className="py-2 px-4 bg-yellow-400 rounded-md">Game Balance: {gameBalance} ARC</p>
                    <p className="py-2 px-4 bg-yellow-400 rounded-md">My Balance: {balance} ARC</p>
                </div>
                <div className="flex items-center justify-center w-[50%] bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto my-8 overflow-hidden">
                        <div className="px-6 py-4">
                            <h3 className="text-xl font-medium text-gray-900">Leaderboard for {gameInfo.name}</h3>
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
                    </div>
                </div>
                {gameInfo.challenges.length > 0 &&
                    <>
                        <p>Challenges</p>
                        <div className="flex flex-row justify-center items-center gap-4">
                            {gameInfo.challenges.map((challenge: any, index: any) => (
                                <ChallengeProgressBar currentValue={0} {...challenge} key={index} />
                            ))}
                        </div>
                    </>
                }
                {gameInfo.shop.length > 0 &&
                    <>
                        <p>Shop</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {gameInfo.shop?.map((listing: any) => (
                                <div
                                    key={listing.id}
                                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                                    onClick={() => handleListingClick(listing)}
                                >
                                    <img src={listing.img_src} alt={listing.type} className="w-full h-36 object-fit" />
                                    <div className="p-4">
                                        <div className="font-semibold">Price: {listing.price} ARC</div>
                                        <div className="text-sm text-gray-600">Seller: {gameInfo.name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                }

                {/* Popup for listing details */}
                {selectedListing && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
                        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md mx-auto">
                            <div className="mb-4">
                                <img src={selectedListing.img_src} alt={selectedListing.type} className="w-full h-64 object-fit rounded-lg" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">{selectedListing.type}</h3>
                            <p className="text-lg text-gray-600 mb-2">Price: {selectedListing.price} ETH</p>
                            <p className="text-md text-gray-500 mb-6">Seller: {selectedListing.seller}</p>
                            <div className="flex justify-center gap-4">
                                <button
                                    className="bg-blue-500 text-white text-lg font-medium py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                                    onClick={() => handleBuy(selectedListing)}
                                >
                                    Buy
                                </button>
                                <button
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-lg font-medium py-2 px-6 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
                                    onClick={closePopup}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {gameInfo.admin === signedAccountId &&
                    <div className="flex flex-row justify-center items-center gap-4">
                        <div className="flex flex-col justify-center items-center gap-2">
                            <p className="text-lg font-bold">Add Item to Shop</p>
                            <form onSubmit={addItemToShop}>
                                <div className="flex flex-col justify-center items-center gap-2">
                                    <input onChange={(e) => setItem({ ...item, name: e.target.value })} type="text" name="name" placeholder="Item Name" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                                    <input onChange={(e) => setItem({ ...item, description: e.target.value })} type="text" name="description" placeholder="Item Description" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                                    <input onChange={(e) => setItem({ ...item, price: Number(e.target.value) })} type="number" name="price" placeholder="Item Price" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                                    <input onChange={(e) => setItem({ ...item, type: e.target.value })} type="text" name="type" placeholder="Item Type" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                                    <input onChange={(e) => setItem({ ...item, img_src: e.target.value })} type="text" name="img_src" placeholder="Item Image URL" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                                    <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out">Add Item</button>
                                </div>
                            </form>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-2">
                            <p className="text-lg font-bold">Fund game: {"1 Near = 1000 ARC"}</p>
                            <form onSubmit={fundGame} className="flex flex-col justify-center items-center gap-2">
                                <input
                                    onChange={(e) => setFundAmount(Number(e.target.value))}
                                    type="number"
                                    name="fund"
                                    placeholder="Amount to fund"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
                                    required
                                />
                                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200 ease-in-out">Fund</button>
                            </form>
                        </div>
                    </div>
                }
            </div>
        );
    }
}