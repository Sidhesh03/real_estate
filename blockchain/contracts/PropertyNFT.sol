// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin v4 imports (compatible with Ganache 2.7.1 / London EVM)
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PropertyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct Property {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool isForSale;
    }

    mapping(uint256 => Property) public properties;

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event PropertyListed(uint256 indexed tokenId, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed oldOwner, address indexed newOwner, uint256 price);

    // OZ v4 Ownable: no constructor argument needed
    constructor() ERC721("RealEstateNFT", "RENFT") {}

    /**
     * @dev Mints a new Property NFT.
     */
    function mintProperty(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _mint(to, tokenId);
        _setTokenURI(tokenId, uri);

        properties[tokenId] = Property({
            tokenId: tokenId,
            owner: to,
            price: 0,
            isForSale: false
        });

        emit PropertyMinted(tokenId, to, uri);
        return tokenId;
    }

    /**
     * @dev Lists a property for sale.
     */
    function listProperty(uint256 tokenId, uint256 price) public {
        require(ownerOf(tokenId) == msg.sender, "Only the owner can list this property");
        require(price > 0, "Price must be greater than zero");

        properties[tokenId].isForSale = true;
        properties[tokenId].price = price;

        emit PropertyListed(tokenId, price);
    }

    /**
     * @dev Buys a listed property.
     */
    function buyProperty(uint256 tokenId) public payable {
        Property storage property = properties[tokenId];

        require(property.isForSale, "Property is not for sale");
        require(msg.value >= property.price, "Insufficient funds sent");
        require(msg.sender != property.owner, "Owner cannot buy their own property");

        address seller = property.owner;
        uint256 salePrice = property.price;

        property.owner = msg.sender;
        property.isForSale = false;

        _transfer(seller, msg.sender, tokenId);

        (bool success, ) = payable(seller).call{value: salePrice}("");
        require(success, "ETH transfer failed");

        if (msg.value > salePrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - salePrice}("");
            require(refundSuccess, "ETH refund failed");
        }

        emit PropertySold(tokenId, seller, msg.sender, salePrice);
    }

    /**
     * @dev Gets a single property's details.
     */
    function getProperty(uint256 tokenId) public view returns (Property memory) {
        require(_exists(tokenId), "Property does not exist");
        return properties[tokenId];
    }

    /**
     * @dev Gets all properties.
     */
    function getAllProperties() public view returns (Property[] memory) {
        uint256 total = _tokenIdCounter.current();
        Property[] memory allProperties = new Property[](total);
        for (uint256 i = 0; i < total; i++) {
            allProperties[i] = properties[i];
        }
        return allProperties;
    }
}
