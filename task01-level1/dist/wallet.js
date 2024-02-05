"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const fs = __importStar(require("fs"));
const web3 = __importStar(require("@solana/web3.js"));
class Wallet {
    constructor(publicKey, privateKey, balance) {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.balance = balance;
    }
    saveToFile() {
        const walletData = {
            publicKey: this.publicKey.toBase58(),
            privateKey: Buffer.from(this.privateKey).toString('base64'),
            balance: this.balance,
        };
        fs.writeFileSync('wallet.json', JSON.stringify(walletData, null, 2));
    }
    async airdrop(amount = 1) {
        const from = web3.Keypair.fromSecretKey(this.privateKey);
        const to = this.publicKey;
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
        const airdropSignature = await connection.requestAirdrop(to, web3.LAMPORTS_PER_SOL * amount);
        await connection.confirmTransaction(airdropSignature);
        this.balance += amount;
        this.saveToFile();
        console.log(`Airdrop successful. New balance: ${this.balance} SOL`);
    }
    async checkBalance() {
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
        const balance = await connection.getBalance(this.publicKey);
        console.log(`Balance for ${this.publicKey.toBase58()}: ${balance / web3.LAMPORTS_PER_SOL} SOL`);
    }
    async transfer(toPublicKeyStr, amount) {
        const from = web3.Keypair.fromSecretKey(this.privateKey);
        const to = new web3.PublicKey(toPublicKeyStr);
        const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
        const recentBlockhash = await connection.getRecentBlockhash();
        const transaction = new web3.Transaction().add(web3.SystemProgram.transfer({
            fromPubkey: this.publicKey,
            toPubkey: to,
            lamports: web3.LAMPORTS_PER_SOL * amount,
        }));
        transaction.recentBlockhash = recentBlockhash.blockhash;
        transaction.sign(from);
        const serializedTransaction = transaction.serialize();
        const signature = await connection.sendRawTransaction(serializedTransaction);
        await connection.confirmTransaction(signature);
        this.balance -= amount;
        this.saveToFile();
        console.log(`Transfer successful. New balance: ${this.balance} SOL`);
    }
}
exports.Wallet = Wallet;
async function createWallet() {
    const keypair = web3.Keypair.generate();
    const wallet = new Wallet(keypair.publicKey, keypair.secretKey, 0);
    wallet.saveToFile();
    console.log(`New wallet created. Public Key: ${wallet.publicKey.toBase58()}`);
}
async function main() {
    const args = process.argv.slice(2);
    if (args[0] === 'new') {
        await createWallet();
    }
    else {
        const walletData = JSON.parse(fs.readFileSync('wallet.json', 'utf-8'));
        const wallet = new Wallet(new web3.PublicKey(walletData.publicKey), Uint8Array.from(Buffer.from(walletData.privateKey, 'base64')), walletData.balance);
        if (args[0] === 'airdrop') {
            const amount = args[1] ? parseFloat(args[1]) : 1;
            await wallet.airdrop(amount);
        }
        else if (args[0] === 'balance') {
            await wallet.checkBalance();
        }
        else if (args[0] === 'transfer') {
            const toPublicKey = args[1];
            const amount = parseFloat(args[2]);
            await wallet.transfer(toPublicKey, amount);
        }
        else {
            console.error('Invalid command');
        }
    }
}
main();
