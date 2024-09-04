import { ethers } from "ethers";
import distributorJson from './Distributors.json';

const contractAddress = "0x7B5B43d1D8a6bF00437C4Aa38E8844655058713e";
let contractABI = distributorJson.abi;

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

//////////////////
// DISTRIBUTORS //
//////////////////

export const initDistributor = async (listed, initialBudget, initialFrequency, postId, description, optionIds, imageUrls) => {
    try {
        const contract = await getContract();
        const tx = await contract.initDistributor(listed, initialBudget, initialFrequency, postId, description, optionIds, imageUrls); // CHECK::> Do we need to convert Budget??
        await tx.wait();
        console.log("Distributor Initialized:", tx);
        return tx;
    } catch (error) {
        console.error("Error in initializing distributor:", error);
    }
};

export const depositETH = async () => {
    try {
        const contract = await getContract();
        const tx = await contract.updateBudget();
        await tx.wait();
        console.log("Budget Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating budget:", error);
    }
};

export const withdrawETH = async (amount) => {
    try {
        const contract = await getContract();
        const tx = await contract.withdrawFromBudget(amount)
        await tx.wait();
        console.log("Amount Withdrawn:", tx);
        return tx;
    } catch (error) {
        console.error("Error in withdrawing from budget:", error);
    }
}

export const addPost = async (postId, description, optionIds, ImageUrls, distributorAddress) => {
    try {
        const contract = await getContract();
        const tx = await contract.addPost(postId, description, optionIds, ImageUrls, distributorAddress);
        await tx.wait();
        console.log("Frequency Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating frequency:", error);
    }
}

//////////////
// UPDATERS //
//////////////

export const updateBudget = async (budget, distributorAddress) => {
    try {
        const contract = await getContract();
        const tx = await contract.updateBudget(budget, distributorAddress);
        await tx.wait();
        console.log("Posts Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating posts:", error);
    }
}

export const updateFrequency = async (frequency, distributorAddress) => {
    try {
        const contract = await getContract();
        const tx = await contract.updateFrequency(frequency, distributorAddress);
        await tx.wait();
        console.log("Description Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating description:", error);
    }
}

export const updateDescription = async (description, postId, distributorAddress) => {
    try {
        const contract = await getContract();
        const tx = await contract.updateDescription(description, postId, distributorAddress);
        await tx.wait();
        console.log("Options Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating options:", error);
    }
}

export const updateVotes = async (votes, optionsIds, postId, distributorAddress) => {
    try {
        const contract = await getContract();
        // if (!Array.isArray(votes) && votes.length !== 3) {
        //     throw new Error("Votes should be an array of Length (3)");
        // }
        const tx = await contract.updateVotes(votes, optionsIds, postId, distributorAddress);
        await tx.wait();
        console.log("Votes Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating votes:", error);
    }
}

export const updateImageUrl = async (url, postId, optionId, distributorAddress) => {
    try {
        const contract = await getContract();
        const tx = await contract.updateImageUrl(url, postId, optionId, distributorAddress);
        await tx.wait();
        console.log("Vote Updated:", tx);
        return tx;
    } catch (error) {
        console.error("Error in updating vote:", error);
    }
}

/////////////
// Getters // 
/////////////

export const getDistributorInfo = async (distributorAddress) => {
    try {
        const contract = await getContract();
        const distributorInfo = await contract.getDistributorInfo(distributorAddress);
        console.log("Distributor Info:", distributorInfo);

        return {
            id: ownerOfDistributor(distributorAddress),
            listed: true,
            posts: getAllPosts(distributorAddress),
            budget: getBudget(distributorAddress),
            frequency: getFrequency(distributorAddress),
        };
    } catch (error) {
        console.error("Error fetching distributor info:", error);
        return null;
    }
};

export const getBudget = async (distributorAddress) => {
    try {
        const contract = await getContract();
        const budget = await contract.getBudget(distributorAddress);
        return ethers.utils.formatEther(budget);
    } catch (error) {
        console.error("Error fetching budget:", error);
        return null;
    }
}

export const getFrequency = async (distributorAddress) => {
    try {
        const contract = await getContract();
        const frequency = await contract.getFrequency(distributorAddress);
        return frequency;
    } catch (error) {
        console.error("Error fetching frequency:", error);
        return null;
    }
}

export const getAllPosts = async (distributorAddress) => {
    try {
        const contract = await getContract();
        const posts = await contract.getAllPosts(distributorAddress);
        return posts;
    } catch (error) {
        console.error("Error fetching posts:", error);
        return null;
    }
}

export const ownerOfDistributor = async (distributorAddress) => {
    try {
        const contract = await getContract();
        const owner = await contract.ownerOfDistributor(distributorAddress);
        return owner;
    } catch (error) {
        console.error("Error fetching owner:", error);
        return null;
    }
}

export const getParticularPost = async (distributorAddress, postId) => {
    try {
        const contract = await getContract();
        const post = await contract.getParticularPost(distributorAddress, postId);
        return post;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

export const getAllOptions = async (postId) => {
    try {
        const contract = await getContract();
        const options = await contract.getAllOptions(postId);
        return options;
    } catch (error) {
        console.error("Error fetching options:", error);
        return null;
    }
}

export const getTotalVotesOnPost = async (postId) => {
    try {
        const contract = await getContract();
        const totalVotes = await contract.getTotalVotesOnPost(postId);
        return totalVotes;
    } catch (error) {
        console.error("Error fetching total votes:", error);
        return null;
    }
}

export const getAllVotesOnPost = async (postId) => {
    try {
        const contract = await getContract();
        const totalVotes = await contract.getAllVotesOnPost(postId);
        return totalVotes;
    } catch (error) {
        console.error("Error fetching total votes:", error);
        return null;
    }
}