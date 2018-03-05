pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';

import './DiscountereumToken.sol';

contract DiscountereumCrowdsale is CappedCrowdsale, MintedCrowdsale {
  DiscountereumToken public token;
  uint256 public constant _rate = 10000; // 1 ETH = 10 000 DSCT
  uint256 public constant _cap = 380000000 * 10000 * 1 ether; // 380 000 000 DSCT

  function DiscountereumCrowdsale(address _wallet, DiscountereumToken _token) public 
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
  {
    token = _token;
  }

}