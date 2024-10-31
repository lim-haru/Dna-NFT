import { expect } from "chai";
import hre from "hardhat";
import { parseUnits } from "ethers";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("DnaNFT", function () {
  async function deploy() {
    const [owner, addr1, addr2] = await hre.ethers.getSigners();

    const VRF = await hre.ethers.getContractFactory("VRFCoordinatorV2_5Mock");
    const VRFmock = await VRF.deploy(parseUnits("0.1", "ether"), parseUnits("1", "gwei"), parseUnits("4592450657599932", "wei"));

    //VRFmock create subscription
    const vrfCoordinator = await VRFmock.getAddress();
    const txResponse = await VRFmock.createSubscription();
    const txReceipt: any = await txResponse.wait(1);
    const subscriptionId = txReceipt.logs[0].args.subId.toString();
    await VRFmock.fundSubscription(subscriptionId, parseUnits("100", "ether"));

    const keyHash = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
    const callbackGasLimit = 300000;
    const requestConfirmations = 3;
    const numWords = 1;
    const mintPrice = parseUnits("0.0001", "ether");
    const maxSupply = 1000;

    const NFT = await hre.ethers.getContractFactory("DnaNFT");
    const dnaNFT = await NFT.deploy(
      vrfCoordinator,
      subscriptionId,
      keyHash,
      callbackGasLimit,
      requestConfirmations,
      numWords,
      mintPrice,
      maxSupply
    );

    //VRFmock add customer
    await VRFmock.addConsumer(subscriptionId, dnaNFT.getAddress());

    const articleURI = "ipfs://uri-example/1.json";

    return { dnaNFT, VRFmock, owner, addr1, addr2, mintPrice, articleURI };
  }

  async function createNFT() {
    const { dnaNFT, VRFmock, owner, addr1, mintPrice, articleURI } = await loadFixture(deploy);

    await dnaNFT.connect(owner).addNewArticle(articleURI);

    const tx = await dnaNFT.connect(addr1).createNFT(1, { value: mintPrice });
    const txReceipt: any = await tx.wait(1);
    const requestId = txReceipt.logs[1].args.requestId;

    return await VRFmock.fulfillRandomWords(requestId, dnaNFT.getAddress());
  }

  it("Dovrebbe permettere di creare un nft", async function () {
    const { dnaNFT, addr1 } = await loadFixture(deploy);

    await expect(createNFT()).to.emit(dnaNFT, "MintedNFT");
    expect(await dnaNFT.connect(addr1).getNftId(1)).to.be.revertedWith("You do not own any NFT for this article");
  });

  it("Dovrebbe fallire se i fondi sono insufficienti", async function () {
    const { dnaNFT, owner, addr1, articleURI } = await loadFixture(deploy);

    await dnaNFT.connect(owner).addNewArticle(articleURI);

    await expect(dnaNFT.connect(addr1).createNFT(1, { value: parseUnits("1", "gwei") })).to.be.revertedWith("Insufficient funds");
  });

  it("Dovrebbe fallire se l'utente possiede già un nft per quel articolo", async function () {
    const { dnaNFT, addr1, mintPrice } = await loadFixture(deploy);

    await createNFT();

    await expect(dnaNFT.connect(addr1).createNFT(1, { value: mintPrice })).to.be.revertedWith(
      "You can only mint once for article"
    );
  });

  it("Dovrebbe permette al proprietario di prelevare i fondi", async function () {
    const { dnaNFT, owner, mintPrice } = await loadFixture(deploy);

    await createNFT();

    await expect(dnaNFT.connect(owner).withdraw()).to.changeEtherBalances(
      [await dnaNFT.getAddress(), owner],
      [-mintPrice, mintPrice]
    );
  });

  it("Dovrebbe permette di aggiungere un nuovo articolo", async function () {
    const { dnaNFT, owner, articleURI } = await loadFixture(deploy);

    await expect(dnaNFT.connect(owner).addNewArticle(articleURI)).to.emit(dnaNFT, "ArticlePublished").withArgs(1, articleURI);
  });

  it("Dovrebbe permette di creare due nft di due articolo diversi", async function () {
    const { dnaNFT, VRFmock, owner, addr1, mintPrice } = await loadFixture(deploy);

    await createNFT();

    await dnaNFT.connect(owner).addNewArticle("ipfs://uri-example/2.json");

    const tx = await dnaNFT.connect(addr1).createNFT(2, { value: mintPrice });
    const txReceipt: any = await tx.wait(1);
    const requestId = txReceipt.logs[1].args.requestId;

    await expect(VRFmock.fulfillRandomWords(requestId, dnaNFT.getAddress())).to.emit(dnaNFT, "MintedNFT");
    expect(await dnaNFT.connect(addr1).getNftId(2)).to.be.revertedWith("You do not own any NFT for this article");
  });

  it("Dovrebbe permette di ottenere il tokenURI del nft", async function () {
    const { dnaNFT, addr1, articleURI } = await loadFixture(deploy);

    await createNFT();

    const tokenId = await dnaNFT.connect(addr1).getNftId(1);
    const tokenURI = await dnaNFT.getNftTokenURI(tokenId);

    expect(tokenURI).to.equal(articleURI);
  });
});
