const { network } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { developmentChains } = require("../../helper-hardhat-config");
const { assert, expect } = require("chai");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("AIOBlockchainLabNFTs Unit Tests", async function () {
      async function deployAIOBlockchainLabNFTsFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, user] = await ethers.getSigners();

        const AIOBlockchainLabNFTsFactory = await ethers.getContractFactory("AIOBlockchainLabNFTs");
        const AIOBlockchainLabNFTs = await AIOBlockchainLabNFTsFactory.deploy();

        return { AIOBlockchainLabNFTs, owner, user };
      }

      describe("#mint", function () {
        it("should mint an NFT and set it's uri", async function () {
          const uri = "uristorage";

          const { AIOBlockchainLabNFTs, user, owner } = await loadFixture(
            deployAIOBlockchainLabNFTsFixture
          );
          const userConnectedContract = AIOBlockchainLabNFTs.connect(user);

          const tx = await userConnectedContract.mint(uri);
          console.log(await tx.wait(1));

          const baseURI = await AIOBlockchainLabNFTs.baseURI();
          const tokenURI = await AIOBlockchainLabNFTs.tokenURI(0);

          expect(user.address).to.be.equal(await AIOBlockchainLabNFTs.ownerOf(0));
          expect(tokenURI).to.be.equal(baseURI + uri);
        });
      });
    });
