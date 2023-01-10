// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

//yarn add --dev @chainlink/contracts
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
//we were importing ERC720.sol before but in order to set the tokenURI this way, we decided to use an extension of the ERC721 (which inherits ERC721.sol)
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//import "@openzeppelin/contracts/access/Ownable.sol";
//Patrick imported this Ownable.sol to create the onlyOwner() modifier: I didnt want to use it but was just following here. But it also started giving problems in the tests.
//Since this is such an important part of security, i'd rather just create my own onlyOwner() modifier and stick to simplicity. Thus, I'm not importing nor inheriting this Ownable.sol for it.

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__WrongAmountETHSent();
error RandomIpfsNft__TransferFailed();
error RandomIpfsNft__NotOwner();

//Plan:
//when we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
//using that number we will get a random NFT, which can be a Pug (super rare), Shiba Inu (rare), St.Bernard (common)
//users have to pay to mint an NFT
//the owner of the contract can withdraw the ETH

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage {
    //when we add a new inherited contract, remember to look at its constructor to add it to our constructor (even of the contracts that are inherited by the contract we inherited like ERC721.sol)

    //Type Declaration
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    //variables for the vrf request.
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    address private immutable i_owner;

    // VRF Helpers
    mapping(uint256 => address) public s_requestIdToSender; //we should make it private but we'll make it public

    // NFT Variables
    uint256 public s_tokenCounter; //again we're just making it public to make it easy, we should make it private with a get
    uint256 internal constant MAX_CHANCE_VALUE = 100;
    string[] internal s_dogTokenUris;
    uint256 internal immutable i_mintFee;

    //Events
    event NftRequested(uint256 indexed requestId, address requester);
    event NftMinted(Breed dogBreed, address minter);

    //Modifiers
    //Double check this onlyOwner() code from other sources as this is super important, this is according to fundme.sol. Tests are okay but nothing wrong in double checking
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert RandomIpfsNft__NotOwner();
        _;
    }

    //Functions (order: constructor -> receive -> fallback -> external -> public -> internal -> private -> view/pure)

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        string[3] memory dogTokenUris,
        uint256 mintFee
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
        //even tho we are inheriting ERC721URIStorage,we initiate ERC721 in the constructor bcuz ERC721URIStorage is inheriting ERC721 which is the one that needs to be initiated.
        i_owner = msg.sender;
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_subscriptionId = subscriptionId;
        i_gasLane = gasLane;
        i_callbackGasLimit = callbackGasLimit;
        s_dogTokenUris = dogTokenUris;
        i_mintFee = mintFee;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (msg.value != i_mintFee) {
            //patrick had "if (msg.value < i_mintFee) {"" but imo this is better because if the user sends > i_mintFee the money would be trapped and he wouldnt get any benefit.
            revert RandomIpfsNft__WrongAmountETHSent();
        }
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        s_requestIdToSender[requestId] = msg.sender;
        //the thing here is that fulfillRandomWords() will be where the nfts will be minted, so we have to have a way to know the address of who's calling requestNft().
        //we'll do that with a mapping of requestId -> address, so that in fulfillRandomWords() when it receives a requestId, we can query the address of who requested it.

        emit NftRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(
        //just to remember myself from the last time I used vrf, we call the coordinator, which will end up calling a function on our inherited contract, that will verify that
        //its the coordinator that is calling it (thats why we add the coordinator address in its constructor), and that function from the inherited will be the one calling
        //this fulfillRandomWords() thats why this is internal, and this way there's no way for someone to sneak a fake random number
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 newTokenId = s_tokenCounter;

        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        //this will produce a number between 0-99, so since it includes the 0, the 10% should be between 0-9, the 30% should be 10-39, and 60% between 40-99

        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        s_tokenCounter = s_tokenCounter + 1;
        _safeMint(dogOwner, newTokenId);
        //now we can set the respective tokenURI in some different ways. the one we'll be using is to call a function called setTokenUri() that instead of using the ERC721.sol,
        //like we were using, uses an extension from the openzeppelin code called ERC721URIStorage.sol. We changed from importing the ERC721.sol to import the ERC721UIStorage.sol,
        //and in this new code we dont create our own tokenURI function() (ERC721 we create this tokenURI() ourselves), but we call a new function called setTokenUri().
        //patrick says tho that setTokenURI() isn't the most gas efficient operation. we are using it because it does have the most customization.
        //patrick says we could also create a mapping between the dog breed and the token URI and have it refleted in tokenURI(), instead of using ERC721UIStorage.sol.
        _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
        //super inteligent way to add the index of the dogBreed we wanted: we did uint256(dogBreed) which returns 0, 1 or 2.
        //because we can either call enums by Breed.PUG or Breed(0), by its name or by its index.

        emit NftMinted(dogBreed, dogOwner);
    }

    function withdraw() public onlyOwner {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(i_owner).call{value: amount}("");
        if (!success) {
            revert RandomIpfsNft__TransferFailed();
        }
    }

    function getBreedFromModdedRng(uint256 moddedRng) public pure returns (Breed) {
        uint256 cumulativeSum = 0;
        uint256[3] memory chanceArray = getChanceArray();
        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cumulativeSum && moddedRng < chanceArray[i]) {
                return Breed(i);
                //nice how we can call enums with the index aswell. I see that enums can either by called by .name or by its index
            }
            cumulativeSum = chanceArray[i];
        }
        revert RandomIpfsNft__RangeOutOfBounds(); //if for some weird reason you dont return anything after the 3 loops, revert.
    }

    function getChanceArray() public pure returns (uint256[3] memory) {
        //array of uint256 of size 3 in memory
        //this will be 10%, 30%, 60% chances
        return [10, 40, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUris(uint256 index) public view returns (string memory) {
        return s_dogTokenUris[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
