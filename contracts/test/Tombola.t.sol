// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {Test, console2} from "forge-std/Test.sol";
import {Tombola} from "../src/Tombola.sol";

contract TombolaTest is Test {
    Tombola public tombola;
    address public fede;
    address public carlos;
    address public uri;

    uint256 userPlayAmount;
    uint256 initialBalanceUser;
    uint256 guessNumber;

    receive() external payable {}

    function setUp() public {
        tombola = new Tombola(10, 100, 1 ether);
        fede = makeAddr("fede");
        carlos = makeAddr("carlos");
        uri = makeAddr("uri");

        vm.warp(block.timestamp + 30 days);

        userPlayAmount = 5 ether;
        initialBalanceUser = 10 ether;

        vm.deal(fede, initialBalanceUser);
        vm.deal(carlos, initialBalanceUser);
        vm.deal(uri, initialBalanceUser);

        vm.warp(block.timestamp + 1 days);

        guessNumber =
            uint256(
                keccak256(abi.encodePacked(block.prevrandao, block.timestamp))
            ) %
            100;
    }

    function testPlay() public {
        // fede plays
        vm.startPrank(fede);
        tombola.play{value: 5 ether}(guessNumber);
        vm.stopPrank();

        // carlos plays
        vm.startPrank(carlos);
        tombola.play{value: 5 ether}(guessNumber);
        vm.stopPrank();

        // when duplicated revert
        vm.startPrank(carlos);
        vm.expectRevert(
            abi.encodeWithSelector(
                Tombola.ErrorNumberAlreadyChosen.selector,
                guessNumber,
                carlos
            )
        );
        tombola.play{value: 5 ether}(guessNumber);
        vm.stopPrank();

        // vm.expectRevert(bytes4(keccak256("ErrorNoWinnersToday()")));
        // vm.expectEmit();
        tombola.draw();
    }

    function testWinPlay() public {
        vm.warp(block.timestamp - 1 days);

        // fede plays
        vm.startPrank(fede);
        tombola.play{value: userPlayAmount}(guessNumber);
        vm.stopPrank();

        // uri plays
        vm.startPrank(uri);
        tombola.play{value: userPlayAmount}(1);
        vm.stopPrank();

        // carlos plays
        vm.startPrank(carlos);
        tombola.play{value: userPlayAmount}(guessNumber);
        vm.stopPrank();

        // when duplicated revert
        vm.startPrank(carlos);
        vm.expectRevert();
        tombola.play{value: userPlayAmount}(guessNumber);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 days);
        tombola.draw();

        uint256 participants = 3;
        uint256 winners = tombola.nPlaysNumberDay(
            (block.timestamp - 1 days) / 1 days,
            guessNumber
        );
        uint256 commision = (userPlayAmount * participants) / 10;
        uint256 profitWinner = (userPlayAmount * participants - (commision)) /
            winners;
        uint256 expectedBalanceWinner = (initialBalanceUser - userPlayAmount) +
            profitWinner;

        assertEq(address(carlos).balance, expectedBalanceWinner);
        assertEq(address(fede).balance, expectedBalanceWinner);
        assertEq(address(uri).balance, initialBalanceUser - userPlayAmount);

        assertEq(address(tombola).balance, commision);

        vm.startPrank(fede);
        vm.expectRevert();
        tombola.withdraw();
        vm.stopPrank();

        console2.log(msg.sender);
        tombola.withdraw();

        assertEq(address(tombola).balance, 0);
    }

    function testNoWinnerPlay() public {
        vm.warp(block.timestamp - 1 days);

        uint256 contractInitialBalance = address(tombola).balance;

        // fede plays
        vm.startPrank(fede);
        // vm.expectEmit(guessNumber+1, address(fede));
        tombola.play{value: userPlayAmount}(guessNumber + 1);
        vm.stopPrank();

        // carlos plays
        vm.startPrank(carlos);
        //vm.expectEmit(guessNumber+1, address(carlos));
        tombola.play{value: userPlayAmount}(guessNumber + 1);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 days);
        // vm.expectRevert();
        tombola.draw();

        assertEq(
            address(tombola).balance,
            contractInitialBalance + (userPlayAmount * 2)
        );
    }

    // function test_Increment() public {
    //     assertEq(1, 1);
    // }

    // function testFuzz_SetNumber(uint256 x) public {
    //     counter.setNumber(x);
    //     assertEq(counter.number(), x);
    // }
}
