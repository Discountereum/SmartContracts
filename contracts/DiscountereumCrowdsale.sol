pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';

import './DiscountereumToken.sol';

contract DiscountereumCrowdsale is CappedCrowdsale, MintedCrowdsale, TimedCrowdsale {
  DiscountereumToken public token;
  uint256 public constant _rate = 10000; // 1 ETH = 10 000 DSCT
  uint256 public constant _cap = (380000000 / _rate) * 1 ether; // 380 000 000 DSCT

  // time calc in http://www.onlineconversion.com/unix_time.htm
  function DiscountereumCrowdsale(address _wallet, DiscountereumToken _token, uint256 _openingTime, uint256 _closingTime) public 
    Crowdsale(_rate, _wallet, _token)
    CappedCrowdsale(_cap)
    TimedCrowdsale(_openingTime, _closingTime)
  {
    token = _token;
  }

}