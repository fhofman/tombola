# Tombola Game

# general summary

Welcome to Tombola game
What we develop is a Lottery game. The idea is to guess a number between 1 and 5 (for example). Obviously this is set when deploying the contract, apart from this value you also enter the cost of playing on WEI, the commission that the platform receives and the ID of the CHAINLINK VRF subscription.
The game works as follows. The player connects with an address with metamask or some supported wallet. Then enter a number from 1 to 5 (in this case). Then accept the transaction. The user can play other numbers if they wish but cannot play again with the same address on the same number on the same day. The round of the game is repeated daily so that the number generated is obtained from the next day. If there are several winners who have selected the winning number, the prize is distributed among the winners.
```
Example :
5 people played and 2 won (the value of playing is 10 wei).
The value raised in the round is 50 wei
The winners would get:
50 wei - 10% (commission) = 45 wei
Each player would receive 22 wei.
The platform would receive 5 wei
``` 
It should be noted that the user must go and claim his winnings.

# deploy the contract

you have to : 

- Create the subscription (https://vrf.chain.link/)
- Deploy the contract on sepolia or polygon amoy ( constructor params : commission in percentage, draw number range (recomended between 1 and 10), play cost (in wei), subscription id )
- Add the consumer with the contract address on the subscription 
- you can play

# frontend run: 

## setting 

- set the CONTRACT_ADDRESS, NETWORK and NEXT variables.

## run dev

```
npm run dev
```

## run build

```
npm run build
```


