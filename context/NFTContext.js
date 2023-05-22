import React, { useState, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { NFTStorage } from 'nft.storage';
import { ethers } from 'ethers';
import axios from 'axios';
import { MarketAddress, MarketAddressABI } from './constants';

const client = new NFTStorage({
  token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdFYkE3ODVCOTFCMTYwNjFGNDA5MTEzNzc3OUY0MjFFY2RiNTk2MDciLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2MjY0NjcyMTU3MCwibmFtZSI6Ik5GVCBTdG9yYWdlIn0.vQRU-vilejQgQ-3YE0Ym5Zm_bKNuB86PbKxvKdRblH8',
});

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(MarketAddress, MarketAddressABI, signerOrProvider);

export const NFTContext = React.createContext();
export const NFTProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const nftCurrency = 'ETH';

  const createSale = async (url, formInputPrice, isReselling, id) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const price = ethers.utils.parseUnits(formInputPrice, 'ether');

    const contract = fetchContract(signer);
    const listingPrice = await contract.getListingPrice();

    const transaction = !isReselling
      ? await contract.createToken(url, price, {
          value: listingPrice.toString(),
        })
      : await contract.resellToken(id, price, {
          value: listingPrice.toString(),
        });
    await transaction.wait();
  };

  const fetchNFTs = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.ALCHEMY_URL
    );
    // const provider = new ethers.providers.JsonRpcProvider(
    //   process.env.ALCHEMY_URL
    // );
    const contract = fetchContract(provider);
    const data = await contract.fetchMarketItems();
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          'ether'
        );
        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );
    return items;
  };

  const fetchMyNFTsOrListedNFTs = async (type) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const data =
      type === 'fetchItemsListed'
        ? await contract.fetchitemsListed()
        : await contract.fetchMyNFTs();
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
        const tokenURI = await contract.tokenURI(tokenId);
        const {
          data: { image, name, description },
        } = await axios.get(tokenURI);
        const price = ethers.utils.formatUnits(
          unformattedPrice.toString(),
          'ether'
        );
        return {
          price,
          tokenId: tokenId.toNumber(),
          seller,
          owner,
          image,
          name,
          description,
          tokenURI,
        };
      })
    );
    return items;
  };

  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      setCurrentAccount(accounts[0]);
    } else {
      console.log('No Accounts Found');
    }
  };
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return alert('Please install MetaMask');
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
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
      const url = metadata.data.image.href;
      /* https://nft.storage/files/ */
      return url;
    } catch (error) {
      console.log('Error Uploading file to IPFS:');
      console.log(error);
    }
  };
  const createNFT = async (formInput, fileUrl, router) => {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    const data = JSON.stringify({ name, description, image: fileUrl });
    try {
      const metadata = new Blob([data]);
      const cid = await client.storeBlob(metadata);
      const url = `https://ipfs.io/ipfs/${cid}`;
      await createSale(url, price);
      router.push('/');
    } catch (error) {
      console.log('Error Uploading file to IPFS:');
      console.log(error);
    }
  };

  const buyNFT = async (nft) => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const contract = fetchContract(signer);
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
  };

  return (
    <NFTContext.Provider
      value={{
        nftCurrency,
        connectWallet,
        currentAccount,
        uploadToIPFS,
        createNFT,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        createSale,
      }}
    >
      {children}
    </NFTContext.Provider>
  );
};
