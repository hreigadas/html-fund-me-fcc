import { ethers } from '../lib/ethers-5.6.esm.min.js';
import { abi, contractAddress } from '../lib/constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const balanceButton = document.getElementById('balanceButton');
const withdrawButton = document.getElementById('withdrawButton');

connectButton.addEventListener('click', connect);
fundButton.addEventListener('click', fund);
balanceButton.addEventListener('click', getBalance);
withdrawButton.addEventListener('click', withdraw);

async function connect() {
	if (typeof window.ethereum !== 'undefined') {
		await window.ethereum.request({ method: 'eth_requestAccounts' });
		connectButton.innerHTML = 'Connected';
	} else {
		fundButton.innerHTML = 'Please install metamask';
	}
}

async function fund() {
	let ethAmount = document.getElementById('ethAmount').value;
	console.log(`Funding with ${ethAmount}`);
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const transactionResponse = await contract.fund({
				value: ethers.utils.parseEther(ethAmount),
			});
			await listenForTransactionMine(transactionResponse, provider);
			console.log('Done');
		} catch (error) {
			console.error(error);
		}
	}
}

async function getBalance() {
	if (typeof window.ethereum !== 'undefined') {
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const balance = await provider.getBalance(contractAddress);
		console.log(ethers.utils.formatEther(balance));
	}
}

async function withdraw() {
	if (typeof window.ethereum !== 'undefined') {
		console.log('Withdrawing');
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		const signer = provider.getSigner();
		const contract = new ethers.Contract(contractAddress, abi, signer);
		try {
			const transactionResponse = await contract.withdraw();
			await listenForTransactionMine(transactionResponse, provider);
		} catch (error) {
			console.error(error);
		}
	}
}

function listenForTransactionMine(transactionResponse, provider) {
	console.log(`Mining ${transactionResponse.hash}`);

	return new Promise((resolve, reject) => {
		provider.once(transactionResponse.hash, (transactionReceipt) => {
			console.log(
				`Completed with ${transactionReceipt.confirmations} confirmations`
			);
			resolve();
		});
	});
}
