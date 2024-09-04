import { ethers } from "ethers";
import dalleJson from './Dalle.json';

const contractAddress = "0x5a76D8a2BAD252fe57fb5281029a46C65d96aF52";
let contractABI = dalleJson.abi;
console.log(contractABI);

const getContract = async () => {
    if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    } else {
        throw new Error("Ethereum object not found, install MetaMask.");
    }
};

// Do we need Default??
export const mintAndFetchTokenData = async (prompt) => {
    try {
        // Call initializeMint with the prompt message
        const dalleNftContract = await getContract();
        const tx = await dalleNftContract.initializeMint(prompt);
        console.log("Minting initiated, waiting for confirmation...");

        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        const mintEvent = receipt.events.find(event => event.event === "MintInputCreated");
        const tokenId = mintEvent.args.chatId.toNumber();

        console.log(`MintInputCreated event detected. TokenId: ${tokenId}`);

        return new Promise((resolve, reject) => {
            // Listen for the MetadataUpdate event for this tokenId
            dalleNftContract.once("MetadataUpdate", async (_tokenId) => {
                if (_tokenId.toNumber() === tokenId) {
                    console.log(`MetadataUpdate event detected for tokenId: ${tokenId}`);

                    try {
                        // Fetch the tokenURI and owner
                        const tokenUri = await dalleNftContract.tokenURI(tokenId);
                        const owner = await dalleNftContract.ownerOf(tokenId);

                        console.log(`Token Id: ${tokenId}`);
                        console.log(`Token URI: ${tokenUri}`);
                        console.log(`Token Owner: ${owner}`);

                        // Return the token data
                        resolve({
                            tokenId,
                            tokenUri,
                            owner
                        });
                    } catch (fetchError) {
                        reject(fetchError);
                    }
                }
            });

            console.log(`Listening for MetadataUpdate event for tokenId: ${tokenId}...`);
        });
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}