const { network, ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("AIOBlockchainLabMarketplace Unit Tests", async function () {
      let AIOBlockchainLabNFTs,
        userConnectedNFTsContract,
        AIOBlockchainLabMarketplace,
        userConnectedMarketplaceContract,
        owner,
        user;
      async function deployAIOBlockchainLabNFTsFixture() {
        const AIOBlockchainLabNFTsFactory = await ethers.getContractFactory("AIOBlockchainLabNFTs");
        const AIOBlockchainLabNFTs = await AIOBlockchainLabNFTsFactory.deploy();

        return { AIOBlockchainLabNFTs };
      }

      async function deployAIOBlockchainLabMarketplaceFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, user] = await ethers.getSigners();

        const AIOBlockchainLabMarketplaceFactory = await ethers.getContractFactory(
          "AIOBlockchainLabMarketplace"
        );
        const AIOBlockchainLabMarketplace = await AIOBlockchainLabMarketplaceFactory.deploy();

        return { AIOBlockchainLabNFTs, AIOBlockchainLabMarketplace, owner, user };
      }

      beforeEach(async function () {
        ({ AIOBlockchainLabMarketplace, owner, user } = await loadFixture(
          deployAIOBlockchainLabMarketplaceFixture
        ));
        userConnectedMarketplaceContract = await AIOBlockchainLabMarketplace.connect(user);
        ({ AIOBlockchainLabNFTs } = await loadFixture(deployAIOBlockchainLabNFTsFixture));
        userConnectedNFTsContract = await AIOBlockchainLabNFTs.connect(user);
      });

      describe("#listItem", function () {
        it("Should list the item", async function () {
          const uri = "sampleuri";
          const mintTx = await userConnectedNFTsContract.mint(uri);
          await mintTx.wait();

          const approveTx = await userConnectedNFTsContract.approve(
            AIOBlockchainLabMarketplace.target,
            0
          );
          await approveTx.wait(1);

          const price = ethers.parseEther("1");
          const listTx = await userConnectedMarketplaceContract.listItem(
            AIOBlockchainLabNFTs.target,
            0,
            price
          );
          await listTx.wait(1);

          const [itemListed] = await AIOBlockchainLabMarketplace.getListings();
          expect(itemListed.nftAddress).to.be.equal(AIOBlockchainLabNFTs.target);
          expect(itemListed.tokenId.toString()).to.be.equal("0");
          expect(ethers.formatEther(itemListed.price)).to.be.equal(ethers.formatEther(price));
          expect(itemListed.seller).to.be.equal(user.address);
        });
      });
    });
