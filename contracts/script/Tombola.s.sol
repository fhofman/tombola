pragma solidity ^0.8.4;

import "forge-std/Script.sol";
import "../src/Tombola.sol";

contract TombolaScript is Script {
    function setUp() public {}

    function run() public {
        //! alternativa con mnemonica
        // string memory seedPhrase = vm.readFile(".secret");
        // uint256 deployer = vm.deriveKey(seedPhrase, 0);

        //! alternativa con private key
        uint privateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(privateKey);

        vm.startBroadcast(deployer);
        Tombola tombola = new Tombola(10, 100, 1 ether);
        vm.stopBroadcast();
    }
}
