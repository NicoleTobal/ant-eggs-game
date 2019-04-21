pragma solidity >=0.4.21 <0.6.0;
import "./EggToken.sol";
import "./AntToken.sol";


contract AntEggsGame is EggToken, AntToken {

    event CreateAnt(address from, uint totalEggsAvailable, uint percentageOfDying);
    event CreateEggFromAnt(address from, uint antIndex, uint totalEggsAvailable);

    constructor() public {}

    function createNewAnt () public {
        decreaseEggs();
        (uint totalEggsAvailable, uint percentageOfDying) = createAnt();
        emit CreateAnt(msg.sender, totalEggsAvailable, percentageOfDying);
    }

    function createEggFromAnt (uint antIndex) public {
        (bool antWasReproduced, uint totalEggsAvailable) = reproduceAnt(antIndex);
        require(antWasReproduced, "The ant died");
        increaseEggs();
        emit CreateEggFromAnt(msg.sender, antIndex, totalEggsAvailable);
    }

}
