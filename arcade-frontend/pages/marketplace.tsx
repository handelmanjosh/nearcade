import React, { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS } from '@/components/utils';
import { useWallet } from '@/wallets/wallet-selector';
// Listing class

// Marketplace component

const Marketplace = () => {
    const { signedAccountId, viewMethod, callMethod }: any = useWallet();
    // State for the listings and the selected listing
    const [listings, setListings] = useState<any[]>([]);
    const [selectedListing, setSelectedListing] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newListing, setNewListing] = useState({
        id: '',
        seller: '',
        price: '',
        contract_id: '',
        type: '',
        img_src: '',
    });
    const [balance, setBalance] = useState<number>(0);

    // Function to handle input changes
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setNewListing((prevListing) => ({
            ...prevListing,
            [name]: value,
        }));
    };
    useEffect(() => {
        if (signedAccountId && viewMethod) {
            viewMethod(CONTRACT_ADDRESS, "getListings", {}).then((listings: any) => {
                console.log({ listings });
                setListings(listings);
                setLoading(false);
            });
            viewMethod(CONTRACT_ADDRESS, "getMyTickets", { player_id: signedAccountId }).then((tickets: number) => {
                console.log(tickets);
                setBalance(tickets);
            });
        }
        // get ARC ticket balance
    }, [signedAccountId, viewMethod]);
    // Handle click to open details popup
    const handleListingClick = (listing: any) => {
        setSelectedListing(listing);
    };

    // Handle buy action
    const handleBuy = (listing: any) => {
        // Implement the buy functionality here
        callMethod(CONTRACT_ADDRESS, "buyListing", { id: listing.id }).then(() => {
            console.log("bought");
        });
    };
    const submitListing = (e: any) => {
        e.preventDefault();
        callMethod(CONTRACT_ADDRESS, "createListing", newListing).then(() => {
            console.log("created");
        });
    };
    // Close the popup
    const closePopup = () => {
        setSelectedListing(null);
    };

    // Initial listings fetch
    if (loading) {
        return (
            <div className="flex flex-row justify-center items-center w-screen">
                <p>Loading...</p>
            </div>
        );
    } else {
        return (
            <div className="bg-gray-100 min-h-screen">
                <div className="max-w-7xl mx-auto p-4">
                    <div className="flex justify-between items-center py-4">
                        <div className="text-lg font-semibold bg-yellow-400 py-2 px-4 rounded-md">{balance} ARC</div>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
                            onClick={() => setShowCreateModal(true)}
                        >
                            Create Listing
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {listings.map((listing) => (
                            <div
                                key={listing.id}
                                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer"
                                onClick={() => handleListingClick(listing)}
                            >
                                <img src={listing.img_src} alt={listing.type} className="w-full h-64 object-fit" />
                                <div className="p-4">
                                    <div className="font-semibold">Price: {listing.price} ARC</div>
                                    <div className="text-sm text-gray-600">Seller: {listing.seller}</div>
                                </div>
                            </div>
                        ))}
                    </div>

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

                    {showCreateModal && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
                            <div className="bg-white p-5 rounded-lg shadow-lg text-center">
                                <h3 className="text-lg font-bold mb-4">Create New Listing</h3>
                                <form onSubmit={submitListing}>
                                    <input
                                        type="text"
                                        name="id"
                                        placeholder="ID"
                                        onChange={handleInputChange}
                                        value={newListing.id}
                                        required
                                        className="w-full mb-2 p-2 border rounded text-black"
                                    />
                                    <input
                                        type="number"
                                        name="price"
                                        placeholder="Price"
                                        onChange={handleInputChange}
                                        value={newListing.price}
                                        required
                                        className="w-full mb-2 p-2 border rounded text-black"
                                    />
                                    <input
                                        type="text"
                                        name="contract_id"
                                        placeholder="Contract ID"
                                        onChange={handleInputChange}
                                        value={newListing.contract_id}
                                        required
                                        className="w-full mb-2 p-2 border rounded text-black"
                                    />
                                    <select
                                        name="type"
                                        onChange={handleInputChange}
                                        value={newListing.type}
                                        required
                                        className="w-full mb-2 p-2 border rounded text-black"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="coin">Coin</option>
                                        <option value="nft">NFT</option>
                                        <option value="giftcard">Gift Card</option>
                                        <option value="physical">Physical Item</option>
                                    </select>
                                    <input
                                        type="text"
                                        name="img_src"
                                        placeholder="Image Source URL"
                                        onChange={handleInputChange}
                                        value={newListing.img_src}
                                        required
                                        className="w-full mb-4 p-2 border rounded text-black"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => setShowCreateModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
};

export default Marketplace;