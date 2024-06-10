// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

//import "solady/src/auth/Ownable.sol";
import {VRFConsumerBaseV2Plus} from "@chainlink/contracts@1.1.1/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts@1.1.1/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

/**
 * @title Tombola
 * @dev A contract for a lottery game where users can play by choosing a number and the winner is chosen randomly.
 */
//VRFV2PlusWrapperConsumerBase(0xc8F13422c49909F4Ec24BF65EDFBEbe410BB9D7c),
//0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1
contract Tombola is VRFConsumerBaseV2Plus {
    /**
     * @notice Mapping of the plays made by the players. The key is the day, the second key is the number played and the third key is the index of the play.
     * @dev format: day -> number chosen -> index -> user address
     */
    mapping(uint256 => mapping(uint256 => mapping(uint256 => address)))
        public plays;

    /**
     * @notice Mapping of the number of plays made by the players in a specific day and number. The key is the day and the second key is the number played.
     * @dev format: day -> number chosen -> number of plays
     */
    mapping(uint256 => mapping(uint256 => uint256)) public nPlaysNumberDay;

    /**
     * @notice Mapping of the draws made by the contract. The key is the index of the draw.
     * @dev format: day -> random number
     */
    mapping(uint256 => uint256) public draws;

    /**
     * @notice This keep the user amount to claim.
     * @dev format: address -> claim
     */
    mapping(address => uint256) public userClaim;

    // The income amount of the round day -> accumulated amount x round 
    mapping(uint256 => uint256) public incomeRoundAmount;

    /**
     * @notice The address of the automation.
     */
    address public automationAddress;

    /**
     * @notice The commission percentage charged by the contract.
     */
    uint64 public commission;

    /**
     * @dev The range of numbers that can be played in the contract.
     */
    uint64 public drawNumbersRange;

    /**
     * @dev The cost of a play in the contract.
     */
    uint128 public playCost;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Test and adjust
    // this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in the fulfillRandomWords()
    // function.
    uint32 callbackGasLimit = 400000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // For this example, retrieve 2 random values in one request.
    // Cannot exceed VRFV2Wrapper.getConfig().maxNumWords.
    uint32 numWords = 1;

    // The commission amount accumulated  
    uint256 public commissionAmount;

    uint256 private randomNumber;

    modifier onlyOwnerOrAutomationForward() {
        require(
            msg.sender == owner() || msg.sender == automationAddress,
            "Only owner or automation forward"
        );
        _;
    }

    //uint256 private requestId;

    event RegisteredPlay(
        uint256 indexed currentDay,
        uint256 indexed number,
        address indexed user
    );
    event WinnerWinnerChickenDinner(
        address indexed user,
        uint256 indexed amount
    );
    event NoWinnersToday(uint256 indexed currentDay);
    event RandomNumber(uint256 indexed randomNumber);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);
    event Received(address, uint256);

    struct RequestStatus {
        bool fulfilled; // whether the request has been successfully fulfilled
        bool exists; // whether a requestId exists
        uint256[] randomWords;
    }
    mapping(uint256 => RequestStatus)
        public s_requests; /* requestId --> requestStatus */

    // Your subscription ID.
    uint256 public s_subscriptionId;

    // Past request IDs.
    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // For a list of available gas lanes on each network,
    // see https://docs.chain.link/docs/vrf/v2-5/supported-networks
    bytes32 public keyHash =
        0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae; // sepolia
    //bytes32 public keyHash =
    //0xc799bd1e3bd4d1a41cd4968997a4e03dfd2a3c7c04b695881138580163f42887; // fuji
    //bytes32 public keyHash = 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899; // Amoy

    error ErrorCommissionHigherThanExpected();
    error ErrorDrawAlreadyDone();
    error ErrorNotEnoughFundsToPlay();
    error ErrorNothingToClaim();
    error ErrorNoWinnersToday();
    error ErrorNumberAlreadyChosen(uint256 number, address user);
    error ErrorZeroCommission();
    error ErrorZeroDrawNumbersRange();
    error ErrorZeroPlayCost();

    address public constant wrapperAddress =
        0x195f15F2d49d693cE265b4fB0fdDbE15b1850Cc1;
    /**
     * @dev Constructor function for the Tombola contract.
     * @param _commission The commission percentage to be charged on each play.
     * @param _drawNumbersRange The range of numbers from which the winner will be chosen.
     * @param _playCost The cost of each play.
     */
    constructor(
        uint64 _commission,
        uint64 _drawNumbersRange,
        uint128 _playCost,
        uint256 _subscriptionId
    )
        //ConfirmedOwner(msg.sender)
        VRFConsumerBaseV2Plus(0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B) // Sepolia
    //VRFConsumerBaseV2Plus(0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE) // Fuji
    //VRFConsumerBaseV2Plus(0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2) //Amoy
    {
        //_initializeOwner(msg.sender);
        if (_commission > 25) revert ErrorCommissionHigherThanExpected();
        commission = _commission;
        if (_drawNumbersRange == 0) revert ErrorZeroDrawNumbersRange();
        drawNumbersRange = _drawNumbersRange;
        if (_playCost == 0) revert ErrorZeroPlayCost();
        playCost = _playCost;
        s_subscriptionId = _subscriptionId;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /**
     * @dev Function for users to play the Tombola game.
     * @param number The number chosen by the user.
     */
    function play(uint256 number) public payable {
        if (msg.value < playCost) revert ErrorNotEnoughFundsToPlay();
        uint256 currentDay = getDayByBlockNumber();
        uint256 currentPlay = nPlaysNumberDay[currentDay][number];
        for (uint256 i = 0; i < currentPlay; ) {
            if (plays[currentDay][number][i] == msg.sender)
                revert ErrorNumberAlreadyChosen(number, msg.sender);
            unchecked {
                i++;
            }
        }
        nPlaysNumberDay[currentDay][number]++;
        plays[currentDay][number][currentPlay] = msg.sender;
        emit RegisteredPlay(currentDay, number, msg.sender);
        incomeRoundAmount[currentDay] += msg.value;
    }

    /**
     * @dev Function for the owner to draw the winner of the Tombola game.
     * https://www.rareskills.io/post/smart-contract-security (why casting to uint256)
     * Solidity does not upcast to the final uint size
     */
    //TODO dejarla internal luego de la prueba
    function distribute() internal {
        uint256 currentDay = (block.timestamp - 1 days) / 1 days;
        //TEST
        //uint256 currentDay = (block.timestamp) / 1 days;
        uint256 guessNumber = draws[currentDay];
        if (nPlaysNumberDay[currentDay][guessNumber] == 0) {
            emit NoWinnersToday(currentDay);
            return;
        }
        uint256 balanceWithoutCommissionRound = (incomeRoundAmount[currentDay] *
            (uint256(100)) - uint256(commission))) / uint256(100);
        uint256 amountToDistributeFinal = (balanceWithoutCommissionRound  /
            nPlaysNumberDay[currentDay][guessNumber];
        for (uint256 i = 0; i < nPlaysNumberDay[currentDay][guessNumber]; ) {
            userClaim[
                plays[currentDay][guessNumber][i]
            ] += amountToDistributeFinal;
            unchecked {
                i++;
            }
        }
        commisionAmount += incomeRoundAmount[currentDay] - balanceWithoutCommissionRound;
        incomeRoundAmount[currentDay] = 0;

    }

    function claim() public payable {
        if (userClaim[msg.sender] == 0) {
            revert ErrorNothingToClaim();
        }
        uint256 amount = userClaim[msg.sender];
        userClaim[msg.sender] = 0;
        emit WinnerWinnerChickenDinner(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    /**
     * @dev Function for the owner to withdraw the balance of the Tombola contract.
     */
    function withdraw() external onlyOwner {
        payable(msg.sender).transfer(commisionAmount);
    }

    /**
     * @dev Function for the owner to withdraw the balance of the Tombola contract to a specific address.
     * @param _address The address to which the balance will be transferred.
     */
    function withdrawTo(address _address) external onlyOwner {
        payable(_address).transfer(commisionAmount);
    }

    /**
     * @dev Function for the owner to set the cost of each play.
     * @param _playCost The new cost of each play.
     */

    function setPlayCost(uint128 _playCost) external onlyOwner {
        if (_playCost == 0) revert ErrorZeroPlayCost();
        playCost = _playCost;
    }

    /**
     * @dev Function for the owner to set the range of numbers from which the winner will be chosen.
     * @param _drawNumbersRange The new range of numbers.
     */
    function setDrawNumbersRange(uint64 _drawNumbersRange) external onlyOwner {
        if (_drawNumbersRange == 0) revert ErrorZeroDrawNumbersRange();
        drawNumbersRange = _drawNumbersRange;
    }

    /**
     * @dev Function for the owner to set the commission percentage to be charged on each play.
     * @param _commission The new commission percentage.
     */
    function setCommission(uint64 _commission) external onlyOwner {
        if (_commission > 25) revert ErrorCommissionHigherThanExpected();
        if (_commission == 0) revert ErrorZeroCommission();
        commission = _commission;
    }

    /**
     * @dev Function to get the list of users who played a specific number on a specific day.
     * @param timestamp The timestamp of the day for which to get the list of users.
     * @param number The number for which to get the list of users.
     * @return An array of addresses representing the users who played the specified number on the specified day.
     */
    function getUsers(
        uint256 timestamp,
        uint256 number
    ) public view returns (address[] memory) {
        uint256 _day = getDayByTimestamp(timestamp);
        uint256 _nPlaysNumberDay = nPlaysNumberDay[_day][number];
        address[] memory users = new address[](_nPlaysNumberDay);
        for (uint256 i = 0; i < _nPlaysNumberDay; ) {
            users[i] = plays[_day][number][i];
            unchecked {
                i++;
            }
        }
        return users;
    }

    /**
     * @dev Function to get the current day based on the current block timestamp.
     * @return The current day.
     */
    function getDayByBlockNumber() public view returns (uint256) {
        return block.timestamp / 1 days;
    }

    /**
     * @dev Function to get the day based on a given timestamp.
     * @param timestamp The timestamp for which to get the day.
     * @return The day corresponding to the given timestamp.
     */
    function getDayByTimestamp(
        uint256 timestamp
    ) public pure returns (uint256) {
        return timestamp / 1 days;
    }

    /**
     * @dev Function to generate a pseudo-random number based on the previous block's random value and the current timestamp.
     */
    function generatePseudoRandom(
        bool enableNativePayment
    ) external onlyOwnerOrAutomationForward returns (uint256 requestId) {
        //TODO: UNCOMMENT FOR PRODUCTION
        uint256 currentDay = (block.timestamp - 1 days) / 1 days;
        //TODO
        //uint256 currentDay = (block.timestamp) / 1 days;
        if (draws[currentDay] != 0) revert ErrorDrawAlreadyDone();
        // Will revert if subscription is not set and funded.
        requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: s_subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callbackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(
                    VRFV2PlusClient.ExtraArgsV1({
                        nativePayment: enableNativePayment
                    })
                )
            })
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] calldata _randomWords
    ) internal override {
        randomNumber = (_randomWords[0] % drawNumbersRange) + 1;
        emit RandomNumber(randomNumber);
        uint256 currentDay = (block.timestamp - 1 days) / 1 days;
        //TEST
        //uint256 currentDay = (block.timestamp) / 1 days;
        if (draws[currentDay] != 0) revert ErrorDrawAlreadyDone();
        draws[currentDay] = randomNumber;
        distribute();
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    function setAutomationAddress(address _automationAddress) public onlyOwner {
        automationAddress = _automationAddress;
    }

    function setCallbackGasLimit(uint32 _callbackGasLimit) public onlyOwner {
        callbackGasLimit = _callbackGasLimit;
    }
}
