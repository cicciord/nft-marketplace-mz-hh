// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AIOBlockchainLabMarketplace is ReentrancyGuard {
    //////////////////////
    // TYPE DEFINITIONS //
    //////////////////////

    struct Listing {
        address nftAddress;
        uint256 tokenId;
        uint256 price;
        address seller;
    }

    /////////////////////
    // STATE VARIABLES //
    /////////////////////

    Listing[] private listings;

    mapping(address => uint256) private sellerToProceeds;

    ////////////////////////
    // EVENT DECLARATIONS //
    ////////////////////////

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ListingCancelled(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    constructor() {}

    ///////////////
    // MODIFIERS //
    ///////////////

    modifier notListed(address nftAddress, uint256 tokenId) {
        for (uint256 i = 0; i < listings.length; i++) {
            require(
                !(listings[i].nftAddress == nftAddress &&
                    listings[i].tokenId == tokenId),
                "item listed"
            );
        }
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == spender, "not owner");
        _;
    }

    ////////////////////////
    // EXTERNAL FUNCTIONS //
    ////////////////////////

    /**
     * @notice user must approve this contract before calling the listItem function
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        IERC721 nft = IERC721(nftAddress);

        require(price > 0, "price cannot be zero");
        require(nft.getApproved(tokenId) != address(this), "not approved");

        Listing memory listing = Listing(
            nftAddress,
            tokenId,
            price,
            msg.sender
        );
        listings.push(listing);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function buyItem(address nftAddress, uint256 tokenId) external payable {
        buyItemFor(nftAddress, tokenId, msg.sender);
    }

    /**
     * @notice user must clear approval for this contract after cancelling the listing
     */
    function buyItemFor(
        address nftAddress,
        uint256 tokenId,
        address buyer
    ) public payable nonReentrant {
        (Listing memory listing, uint256 index) = _getListing(
            nftAddress,
            tokenId
        );
        require(listing.nftAddress != address(0), "not listed");
        require(msg.value < listing.price, "not enough eth");

        sellerToProceeds[listing.seller] += msg.value;

        _cancelListing(index);

        IERC721(nftAddress).safeTransferFrom(listing.seller, buyer, tokenId);
        emit ItemBought(buyer, nftAddress, tokenId, listing.price);
    }

    /**
     * @notice user must clear approval for this contract after cancelling the listing
     * (call approve for the null address)
     */
    function cancelListing(
        address nftAddress,
        uint256 tokenId
    ) external isOwner(nftAddress, tokenId, msg.sender) {
        (Listing memory listing, uint256 index) = _getListing(
            nftAddress,
            tokenId
        );
        require(listing.nftAddress != address(0), "not listed");

        _cancelListing(index);
        emit ListingCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external isOwner(nftAddress, tokenId, msg.sender) {
        (Listing memory listing, uint256 index) = _getListing(
            nftAddress,
            tokenId
        );
        require(listing.nftAddress != address(0), "not listed");

        listings[index].price = price;
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function withdrawProceeds() external {
        uint256 proceeds = sellerToProceeds[msg.sender];
        require(proceeds > 0, "no proceeds");

        sellerToProceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        require(success, "transfer failed");
    }

    //////////////////////
    // GETTER FUNCTIONS //
    //////////////////////
    function getListings() external view returns (Listing[] memory) {
        return listings;
    }

    function getProceedsOf(address seller) external view returns (uint256) {
        return sellerToProceeds[seller];
    }

    ////////////////////////
    // INTERNAL FUNCTIONS //
    ////////////////////////

    function _cancelListing(uint256 index) private {
        for (uint256 i = index; i < listings.length - 1; i++) {
            listings[i] = listings[i + 1];
        }
        listings.pop();
    }

    function _getListing(
        address nftAddress,
        uint256 tokenId
    ) private view returns (Listing memory listing, uint256 index) {
        listing = Listing(address(0), 0, 0, address(0));
        index = 0;
        for (uint256 i = 0; i < listings.length; i++) {
            if (
                listings[i].nftAddress == nftAddress &&
                listings[i].tokenId == tokenId
            ) {
                listing = listings[i];
                index = i;
                break;
            }
        }
    }
}
