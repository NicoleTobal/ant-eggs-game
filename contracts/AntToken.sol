pragma solidity >=0.4.21 <0.6.0;


contract AntToken {

    address public owner;
    uint public timeOfEggCreation;

    struct Ant {
        uint antId;
        uint timeOfLastEgg;
        uint totalEggsAvailable;
        uint percentageOfDying;
    }

    Ant[] public ants;
    mapping (address => uint[]) public antsOwner;

    event TransferAnt(address from, address to, uint antId);

    constructor() public {
        timeOfEggCreation = 600;
        owner = msg.sender;
    }

    modifier checkAntIndex(uint antIndex) {
        require(antsOwner[msg.sender].length > antIndex, "Not enough ants");
        require(getAntId(antIndex, msg.sender) != 0, "Ant no longer exists");
        _;
    }

    function transferAnt (uint antIndex, address to) external checkAntIndex(antIndex) {
        uint antId = getAntId(antIndex, msg.sender);
        antsOwner[to].push(antId);
        killAnt(antIndex, msg.sender);
        emit TransferAnt(msg.sender, to, antId);
    }

    function createAnt () internal returns (uint, uint) {
        uint totalEggsAvailable = randomEggs();
        uint percentageOfDying = randomPercentage();
        Ant memory ant = Ant(
            ants.length + 1,
            now - timeOfEggCreation,
            totalEggsAvailable,
            percentageOfDying
        );
        ants.push(ant);
        antsOwner[msg.sender].push(ant.antId);
        return (totalEggsAvailable, percentageOfDying);
    }

    function reproduceAnt (uint antIndex) internal checkAntIndex(antIndex)
        returns (bool, uint) {
            Ant storage ant = getAnt(antIndex, msg.sender);
            require(ant.totalEggsAvailable != 0, "Ant cannot produce any more eggs");
            require((now - ant.timeOfLastEgg) >= timeOfEggCreation, "Not ready to reproduce again");
            if (ant.percentageOfDying < randomPercentage()) {
                ant.totalEggsAvailable--;
                ant.timeOfLastEgg = now;
                return (true, ant.totalEggsAvailable);
            } else {
                killAnt(antIndex, msg.sender);
                return (false, 0);
            }
        }

    function killAnt (uint antIndex, address to) private {
        delete antsOwner[to][antIndex];
    }

    function getAnt (uint antIndex, address to) private view returns (Ant storage) {
        return ants[getAntId(antIndex, to) - 1];
    }
    
    function getAntId(uint antIndex, address to) private view returns (uint) {
        return antsOwner[to][antIndex];
    }

    function randomEggs() private view returns (uint8) {
        return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty)))%251);
    }

    function randomPercentage() private view returns (uint) {
        return uint(blockhash(block.number-1))%100 + 1;
    }

}
