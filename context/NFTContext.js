import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { NFTStorage } from 'nft.storage';
import { ethers } from 'ethers';
import axios from 'axios';

const client = new NFTStorage({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdFYkE3ODVCOTFCMTYwNjFGNDA5MTEzNzc3OUY0MjFFY2RiNTk2MDciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MjY0NjcyMTU3MCwibmFtZSI6Ik5GVCBTdG9yYWdlIn0.vQRU-vilejQgQ-3YE0Ym5Zm_bKNuB86PbKxvKdRblH8' });
export const NFTContext = React.createContext();
export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const nftCurrency = 'ETH';

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No Accounts Found');
    }
    console.log(accounts);
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setCurrentAccount(accounts[0]);
    window.location.reload();
  };
  const uploadToIPFS = async (file) => {
    try {
      const metadata = await client.store({
        name: 'Cryptokart Storage NFTs',
        description: 'Test ERC-1155 compatible.',
        image: file,
      });
      return metadata.data.image.href;
    } catch (error) {
      console.log('Error Uploading file to IPFS:');
      console.log(error);
    }
  };
  return (
    <NFTContext.Provider value={{ nftCurrency, connectWallet, currentAccount, uploadToIPFS }}>
      {children}
    </NFTContext.Provider>
  );
};
