// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage{
    using Counters for Counters.Counter;
    Counters.Counter private_tokenIds;
    Counters.Counter private_itemsSold;
    uint256 listingPrice =0.025 ether;
    address payable owner;
    mapping(uint256 => MarketIem) private idToMarketItem;

    struct MarketItem{
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }
    event MarketItemCreated{
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
    };

    constructor(){
        owner=payable(msg.sender);

    }

    function updateListingPrice(uint _listingPrice) public payable(
        require(owner==msg.sender,"Only marketplace owner can update the listing price");
        listingPrice=_listingPrice;
    )
    function getListingPrice() public view returns(uint 256){
        return listingPrice;
    }
    function createToken(string memory tokenURI,uint256 price)public payable returns(uint){
        _tokenIds.increment();
        uint256 newTokenId=_tokenIds.current();
        _mint(msg.sender,newTokenId)
        _setTokenURI(newTokenId,tokenURI);
        createMarketItem(newTokenId, price);
        return newTokenId;
    }
    function createMarketItem(uint256 tokenId,uint256 price)private{
        require(price>0,"Price must be greater than 0");
        require(msg.value == listingPrice,"Price must be equal to listing price")
        idToMarketItem[tokenId]=MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            false
        );
        _transfer(msg.sender,address(this),tokenId);
        emit MarketItemCreated(tokenId,msg.sender,address(this),price,false)

    }
    function resellToken(uint256 tokenId,uint256 price)public payable{
        require(idToMarketItem[tokenId].owner===msg.sender,"Only the owner of NFT can perform this operation");
        require(msg.value==listingPrice,"Price must be equal to listing price");
        idToMarket.Item[tokenId].sold =false;
        idToMarket.Item[tokenId].price =price;
        idToMarket.Item[tokenId].seller =payable(msg.sender);
        idToMarket.Item[tokenId].owner =(address(this));
        _itemsSold.decrement();
        _transfer(msg.sender,address(this),tokenId);
    }
}