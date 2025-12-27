import { createCanvas, loadImage } from 'canvas';
import lighthouse from '@lighthouse-web3/sdk';
import { ethers } from 'ethers';
import 'dotenv/config';

export const generateAndUploadCertificate = async (donorName) => {
    // 1. Create Canvas Image
    const width = 1200;
    const height = 800;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Load your high-quality Rednova template
    const template = await loadImage('./assets/certificate-template.png'); 
    ctx.drawImage(template, 0, 0, width, height);

    // Style the Donor Name (Cosmic Purple/Pink)
    ctx.font = 'bold 60pt Arial';
    ctx.fillStyle = '#C084FC'; // Purple glow color
    ctx.textAlign = 'center';
    ctx.fillText(donorName, width / 2, height / 2);

    // 2. Upload to Lighthouse
    const buffer = canvas.toBuffer('image/png');
    const uploadResponse = await lighthouse.uploadBuffer(buffer, process.env.LIGHTHOUSE_API_KEY);
    
    return uploadResponse.data.Hash; // This is the CID
};

export const mintOnPolygon = async (walletAddress, cid) => {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    // Minimal ABI for a mint function
    const abi = ["function safeMint(address to, string memory uri) public"];
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

    const tx = await contract.safeMint(walletAddress, `ipfs://${cid}`);
    await tx.wait();
    return tx.hash;
};