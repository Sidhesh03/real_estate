// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin v4 imports (compatible with Ganache 2.7.1 / London EVM)
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract PropertyNFT is ERC721URIStorage, Ownable, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    bytes32 public constant LISTER_ROLE = keccak256("LISTER_ROLE");

    struct Property {
        uint256 tokenId;
        address owner;
        uint256 price;
        bool isForSale;
    }

    mapping(uint256 => Property) public properties;
    uint256[] public propertyIds; // Track all minted property IDs

    event PropertyMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);
    event PropertyListed(uint256 indexed tokenId, uint256 price);
    event PropertySold(uint256 indexed tokenId, address indexed oldOwner, address indexed newOwner, uint256 price);

    constructor() ERC721("RealEstateNFT", "RENFT") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(LISTER_ROLE, msg.sender); // Admin can also list properties
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Grants the lister role to an address. Only callable by admin.
     */
    function grantLister(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(LISTER_ROLE, account);
    }

    /**
     * @dev Revokes the lister role from an address. Only callable by admin.
     */
    function revokeLister(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(LISTER_ROLE, account);
    }

    /**
     * @dev Mints a new Property NFT.
     */
    function mintProperty(address to, string memory uri) public onlyRole(LISTER_ROLE) returns (uint256) {
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

        propertyIds.push(tokenId); // Add to tracking array

        emit PropertyMinted(tokenId, to, uri);
        return tokenId;
    }

    /**
     * @dev Lists a property for sale.
     */
    function listProperty(uint256 tokenId, uint256 price) public {
        require(_exists(tokenId), "Property does not exist");
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
        require(_exists(tokenId), "Property does not exist");
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
     * @dev Gets all properties using the tracking array.
     */
    function getAllProperties() public view returns (Property[] memory) {
        Property[] memory allProperties = new Property[](propertyIds.length);
        for (uint256 i = 0; i < propertyIds.length; i++) {
            allProperties[i] = properties[propertyIds[i]];
        }
        return allProperties;
    }
}
