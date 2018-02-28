pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/ownership/Claimable.sol';
import 'zeppelin-solidity/contracts/token/ERC20/PausableToken.sol';
import 'zeppelin-solidity/contracts/token/ERC20/CappedToken.sol';

/**
 * @title DiscountereumToken
 */
contract DiscountereumToken is CappedToken, PausableToken, Claimable {

  string public constant name = "Discountereum Token";
  string public constant symbol = "DSCT";
  uint8 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 40000000 * (10 ** uint256(decimals));
  uint256 public constant _cap = 800000000 * (10 ** uint256(decimals));

  mapping(address => bool) public whitelistAccounts; // not blocked accounts when paused

  function DiscountereumToken() public
    CappedToken(_cap)
  {
    addToWhitelistAccount(msg.sender);

    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
    Transfer(0x0, msg.sender, INITIAL_SUPPLY);
  }

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