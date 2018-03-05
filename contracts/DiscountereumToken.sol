pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Claimable.sol';
import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract DiscountereumSaleAgent is MintableToken {
  address public saleAgent;

  function setSaleAgent(address newSaleAgnet) public {
    require(msg.sender == saleAgent || msg.sender == owner);
    saleAgent = newSaleAgnet;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) canMint public returns (bool) {
    require(msg.sender == saleAgent || msg.sender == owner);
    totalSupply_ = totalSupply_.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() canMint public returns (bool) {
    require(msg.sender == saleAgent || msg.sender == owner);
    mintingFinished = true;
    MintFinished();
    return true;
  }
}

contract DiscountereumWhitelistedAccount is PausableToken {
  mapping(address => bool) public whitelistAccounts; // not blocked accounts when paused

  /**
   * @dev Check address in whitelist
   * @param _addr Address to be checked in whitelist
   * @return True if address is whitelist.
   */
  function isWhitelistedAccount(address _addr) public view returns (bool) {
    return whitelistAccounts[_addr];
  }

  /**
   * @dev Adds single address to whitelist.
   * @param _addr Address to be added to the whitelist
   */
  function addToWhitelistAccount(address _addr) public onlyOwner {
    whitelistAccounts[_addr] = true;
  }

  /**
   * @dev Removes single address from whitelist. 
   * @param _addr Address to be removed to the whitelist
   */
  function removeFromWhitelistAccount(address _addr) public onlyOwner {
    whitelistAccounts[_addr] = false;
  }

  /**
   * @dev Check for now address is pause
   * @return True if for address pause
   */
  function getPaused() public view returns (bool) {
    if (isWhitelistedAccount(msg.sender)) {
      return false;
    } else {
      return paused;
    }
  }

  /**
   * @dev Modifier to make a function callable only when the contract is not paused.
   */
  modifier whenNotPaused() {
    require(!getPaused());
    _;
  }

  /**
   * @dev Modifier to make a function callable only when the contract is paused.
   */
  modifier whenPaused() {
    require(paused);    //paused, because the owner will fall into the trap and will not be able to switch the flag
    _;
  }
}


/**
 * @title DiscountereumToken
 */
contract DiscountereumToken is CappedToken, Claimable, DiscountereumSaleAgent, DiscountereumWhitelistedAccount {

  string public constant name = "Discountereum Token";
  string public constant symbol = "DSCT";
  uint8 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 40000000 * (10 ** uint256(decimals));
  uint256 public constant _cap = 800000000 * (10 ** uint256(decimals));

  function DiscountereumToken() public
    CappedToken(_cap)
  {
    addToWhitelistAccount(msg.sender);

    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }
}