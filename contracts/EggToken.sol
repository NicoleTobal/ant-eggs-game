pragma solidity >=0.4.21 <0.6.0;
import "./SafeMath.sol";


contract EggToken {

    using SafeMath for uint;

    address public owner;
    uint public price;
    mapping (address => uint) public eggsOwner;

    event BuyEgg(address from, uint value, uint amount);
    event SellEgg(address from, uint value, uint amount);
    event TransferEgg(address from, address to, uint amount);

    constructor() public {
        price = 10000000000000000;
        owner = msg.sender;
    }

    modifier checkEggAmount(uint amount) {
        require(amount <= eggsOwner[msg.sender], "Not enough eggs");
        _;
    }

    function buyEggs () external payable {
        require(msg.value >= price, "Not enough ethers");
        uint amount = msg.value.div(price);
        eggsOwner[msg.sender] = eggsOwner[msg.sender].add(amount);
        emit BuyEgg(msg.sender, msg.value, amount);
    }

    function sellEggs(uint amount) external checkEggAmount(amount) returns (uint value) {
        eggsOwner[msg.sender] = eggsOwner[msg.sender].sub(amount);
        value = amount * price;
        require(msg.sender.send(value), "Value could not be returned");
        emit SellEgg(msg.sender, value, amount);
        return value;
    }

    function transferEggs (uint amount, address to) external checkEggAmount(amount) {
        eggsOwner[to] = eggsOwner[to].add(amount);
        eggsOwner[msg.sender] = eggsOwner[msg.sender].sub(amount);
        emit TransferEgg(msg.sender, to, amount);
    }

    function decreaseEggs () internal {
        require(eggsOwner[msg.sender] != 0, "Not enough eggs");
        eggsOwner[msg.sender] = eggsOwner[msg.sender].sub(1);
    }

    function increaseEggs () internal {
        eggsOwner[msg.sender] = eggsOwner[msg.sender].add(1);
    }

}
