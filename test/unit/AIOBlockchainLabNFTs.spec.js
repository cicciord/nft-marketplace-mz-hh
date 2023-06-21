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

      describe("#updateBaseURI", function () {
        it("should update baseURI", async function () {
          const uri = "http://newbaseuri/";

          const { AIOBlockchainLabNFTs } = await loadFixture(deployAIOBlockchainLabNFTsFixture);

          const tx = await AIOBlockchainLabNFTs.updateBaseURI(uri);
          await tx.wait(1);

          const baseURI = await AIOBlockchainLabNFTs.baseURI();

          expect(baseURI).to.be.equal(uri);
        });
      });

      describe("#mint", function () {
        it("should mint an NFT and set it's uri", async function () {
          const uri = "tokenuri";

          const { AIOBlockchainLabNFTs, user } = await loadFixture(
            deployAIOBlockchainLabNFTsFixture
          );
          const userConnectedContract = AIOBlockchainLabNFTs.connect(user);

          const tx = await userConnectedContract.mint(uri);
          await tx.wait(1);

          const baseURI = await AIOBlockchainLabNFTs.baseURI();
          const tokenURI = await AIOBlockchainLabNFTs.tokenURI(0);

          expect(user.address).to.be.equal(await AIOBlockchainLabNFTs.ownerOf(0));
          expect(tokenURI).to.be.equal(baseURI + uri);
        });
      });
    });
