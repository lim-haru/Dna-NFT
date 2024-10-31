// SPDX-License-Identifier: MIT

pragma solidity ^0.8.27;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DnaNFT is VRFConsumerBaseV2Plus, ERC721URIStorage {
  uint256 immutable subscriptionId;
  bytes32 immutable keyHash;
  uint32 immutable callbackGasLimit;
  uint16 immutable requestConfirmations;
  uint32 immutable numWords;
  uint256 public immutable mintPrice;
  uint256 public immutable maxSupply;

  uint256 public tokenCounter;
  uint256 public lastArticleId;
  uint256 private _articleRequest;

  mapping(uint256 => address) private _requestToSender;
  mapping(address => mapping(uint256 => uint256)) private _userTokenIds;
  mapping(uint256 => string) private _articleURIs;

  event RandomWord(uint256 indexed requestId, address indexed sender);
  event MintedNFT(address indexed owner, uint256 indexed id);
  event ArticlePublished(uint256 indexed articleId, string indexed tokenURI);

  constructor(
    address vrfCoordinator,
    uint256 _subscriptionId,
    bytes32 _keyHash,
    uint32 _callbackGasLimit,
    uint16 _requestConfirmations,
    uint32 _numWords,
    uint256 _mintPrice,
    uint256 _maxSupply
  ) VRFConsumerBaseV2Plus(vrfCoordinator) ERC721("Dna NFT", "DNA") {
    subscriptionId = _subscriptionId;
    keyHash = _keyHash;
    callbackGasLimit = _callbackGasLimit;
    requestConfirmations = _requestConfirmations;
    numWords = _numWords;
    mintPrice = _mintPrice;
    maxSupply = _maxSupply;
  }

  function createNFT(uint256 _articleId) external payable {
    require(tokenCounter < maxSupply, "Max supply reached");
    require(_articleId <= lastArticleId, "The article does not exist");
    require(_userTokenIds[msg.sender][_articleId] == 0, "You can only mint once for article");
    require(msg.value >= mintPrice, "Insufficient funds");
    uint256 excess = msg.value - mintPrice;
    if (excess > 0) {
      payable(msg.sender).transfer(excess);
    }

    _articleRequest = _articleId;
    requestRandomWords();
  }

  function requestRandomWords() private returns (uint256 requestId) {
    requestId = s_vrfCoordinator.requestRandomWords(
      VRFV2PlusClient.RandomWordsRequest({
        keyHash: keyHash,
        subId: subscriptionId,
        requestConfirmations: requestConfirmations,
        callbackGasLimit: callbackGasLimit,
        numWords: numWords,
        extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
      })
    );

    _requestToSender[requestId] = msg.sender;
    emit RandomWord(requestId, msg.sender);
  }

  function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
    address nftOwner = _requestToSender[requestId];
    uint256 tokenId = (randomWords[0] % 20) + 1;
    _userTokenIds[nftOwner][_articleRequest] = tokenId;
    tokenCounter++;
    _safeMint(nftOwner, tokenId);

    string memory tokenURI = _articleURIs[_articleRequest];
    _setTokenURI(tokenId, tokenURI);

    emit MintedNFT(nftOwner, tokenId);
  }

  function addNewArticle(string memory _tokenURI) external onlyOwner {
    lastArticleId++;
    _articleURIs[lastArticleId] = _tokenURI;

    emit ArticlePublished(lastArticleId, _tokenURI);
  }

  function getArticle(uint256 _articleId) external view returns (string memory) {
    return _articleURIs[_articleId];
  }

  function getNftId(uint256 _articleId) external view returns (uint256) {
    uint256 nftId = _userTokenIds[msg.sender][_articleId];
    require(nftId != 0, "You do not own any NFT for this article");
    return nftId;
  }

  function getNftTokenURI(uint256 nftId) external view returns (string memory) {
    require(ownerOf(nftId) != address(0), "Token ID not valid");
    return tokenURI(nftId);
  }

  function withdraw() external onlyOwner {
    require(owner() != address(0), "Invalid owner address");
    uint256 balance = address(this).balance;
    payable(owner()).transfer(balance);
  }
}
 