<br/>
<p align="center">
<a href="https://www.masterzblockchain.com/" target="_blank">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./masterZ-logo-white.svg">
  <img alt="masterz logo" src="./masterZ-logo-black.svg" width="225">
</picture>
</a>
</p>
<br/>

# AIO Blockchain Lab NFTs Marketplace
Smartcontract implementation of an NFT Marketplace for MasterZ project work.

- [Smartcontracts](#smartcontracts)
    - [AIOBlockchainLabNFTs](#aioblockchainlabnfts)
        - [State variables](#state-variables)
        - [Functions](#functions)
    - [AIOBlockchainLabMarketplace](#aioblockchainlabmarketplace)
        - [State variables](#state-variables-1)
        - [Functions](#functions-1)
- [Interface](#interface)
    - [Enabling web3](#enabling-web3)
    - [Main functionalities](#main-functionalities)
        - [Create an NFT](#create-an-nft)
        - [Show user owned NFTs](#show-user-owned-nfts)
        - [Show listed NFTs](#show-listed-nfts)
        - [List, update listing, cancel listing and withdraw earnings](#list-update-listing-cancel-listing-and-withdraw-earnings)
        - [Buy NFT](#buy-nft)
    

## Smartcontracts
There are implemented two smartcontracts in this project. One is used to allow users to create NFTs and the other is the Marketplace smartcontract.

### AIOBlockchainLabNFTs
This contract is a ERC721 contract which allow users to mint their own NFTs.

#### State variables
- `baseURI`: this is the prefix of the tokenURI of each NFT. It is set to be `https://gateway.ipfscdn.io/ipfs/`. Since the `tokenURI` of each NFT is the **CID** of the NFT *metadata* on IPFS, doing so will create a gateway on IPFS that returns the NFT *metadata*

#### Functions
- `safeMint(address to, string memory uri)`: this function mints an NFT to an address (`to`) and sets the `tokenURI` of that NFT as `uri`. The function is available as *public*, though it is only used to mint an NFT to someone else (which rarely happens). To mint an NFT it is suggested to use the `mint` function.
- `mint(string memory uri)`: this function mints an NFT to the account who calls the function and sets the `tokenURI` of that NFT as `uri`.
- `updateBaseURI(string calldata uri)`: this function update the value of the [baseURI](#state-variables)

### AIOBlockchainLabMarketplace
This contract is the implementation of the marketplace.

Notice that this marketplace accepts all NFTs, not only the [AIOBlockchainLabNFTs](#aioblockchainlabnfts).

Also the marketplace accepts payments only in *native currency*. The FIAT payment is handled offchain obviously.

#### State variables
- `listings`: this variable holds all listings in an array. Each listing has the following fields: `nftAddress`, `tokenId`, `price`, `seller`.
- `sellerToProceeds`: this variable is a mapping from each *seller* address to a number indicating his earnings from NFT sale.

#### Functions
- `listItem(address nftAddress, uint256 tokenId, uint256 price)`: this function allow a user to list one of his NFTs. Notice that before calling the function the user has to call the `approve` function in the NFT contract in order to allow the marketplace to transfer his assets. This will be done automatically in the platform interface.
- `buyItemFor(address nftAddress, uint256 tokenId, address buyer)`: this function allow to buy an NFT to an account. This is the function called from the AIOBlockchainLab wallet in the case of a FIAT payment.
- `buyItem(address nftAddress, uint256 tokenId)`: this function allow to buy an NFT to the coller account.
- `cancelListing(address nftAddress, uint256 tokenId)`: this function allows to unlist an NFT. Remember it is a best practice to also remove the allowance. This is done automatically in the frontend.
- `updateListing(address nftAddress, uint256 tokenId, uint256 price)`: this function allow to update the price of a listed NFT.
- `withdrawProceeds()`: this function withdraw the earnings of a *seller*.

## Interface (not in this repository)
The interface is realized as a React application.

### Enabling web3
The website has to interact with the blockchain to call smartcontracts functions. In order to do so [Wagmi](https://wagmi.sh/) and [RainbowKit](https://www.rainbowkit.com/) are used.

[Wagmi](https://wagmi.sh/) provides a set of react hooks to easly interact with smartcontracts and [RainbowKit](https://www.rainbowkit.com/) provides a ready-to-go component to connect the user wallet to the website.

### Main functionalities

#### Create an NFT
The process to create the NFT is the following:
- The user has to connect the wallet to the website to begin.
- The user has to fill a form including: image, NFT name, NFT description.
- The image is uploaded to IPFS, it can be easly done using [third-web/storage](https://blog.thirdweb.com/guides/how-to-upload-and-pin-files-to-ipfs-using-storage/).
- After the image is uploaded the NFT metadata are saved in a `json` file including field: name, description and image. The field image is the url to the image on IPFS.
- The metadata are uploaded on IPFS, the *CID* of the metadata will be the NFT tokenURI.
- A transaction to the blockchain is sent, calling the `mint` function of the [AIOBlockchainLabNFTs](#aioblockchainlabnfts) smartcontract. The tokenURI is passed as parameter.

#### Show user owned NFTs
To show all the NFTs a user has created the following methods on [AIOBlockchainLabNFTs](#aioblockchainlabnfts) smartcontract has to be called:
- `balanceOf`: returns the number of tokens owned by the owner.
- `tokenOfOwnerByIndex`: returns the tokenId of each token owned.
- `tokenURI`: returns the tokenURI of the NFT.
This way the tokenURIs of the user are available, thus getting access to their metadata.

### Show listed NFTs
To show all listed NFT, the list af all the listings from the smartcontract by calling the `getListings` method. From the list it is possible to access the address of the contract of the NFT and the tokenId, which is everything needed to call the `tokenURI` function.

### List, update listing, cancel listing and withdraw earnings
All this commands are easly done by calling the relative function on the [AIOBlockchainLabNFTs](#aioblockchainlabnfts) contract.

### Buy NFT
The sale of one NFT might happen by crypto payment, simply by calling the `buyItem` function, or by FIAT payment. In the latter case the process is the following:
- User sends a payment towards *AIO Blockchain Lab*. This is done through a payment platform as [Stripe](https://stripe.com/). The amount payed will include all additional fees.
- AIO Blockchain Lab buy the NFT for the user by calling the function `buyItemFor` and passing the address of the buyer as parameter.


