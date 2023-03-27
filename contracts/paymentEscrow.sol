// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// errors
error PaymentEscrow__NotArbiter();
error PaymentEscrow__TransactionUnsuccesful();

/**@title A Payment Escrow Contract
 * @author Ejim favour
 * @notice This contract ensures secure and credible payment for goods and services.
 */

contract PaymentEscrow {
    // state variables
    address public s_arbiter;
    address public s_beneficiary;
    address public s_payer;
    bool public s_isApproved;

    // events
    event Approved(
        address indexed payer,
        address indexed beneficiary,
        uint amount
    );

    // modifiers
    modifier onlyArbiter() {
        if (msg.sender != s_arbiter) {
            revert PaymentEscrow__NotArbiter();
        }
        _;
    }

    // functions

    receive() external payable {}

    function pay(address _beneficiary, address _arbiter) external payable {
        s_payer = msg.sender;
        s_beneficiary = _beneficiary;
        s_arbiter = _arbiter;
        (bool callSuccess, ) = address(this).call{value: msg.value}("");

        if (!callSuccess) revert PaymentEscrow__TransactionUnsuccesful();
    }

    function approve() external onlyArbiter {
        uint balance = address(this).balance;

        uint payedAmount = balance - (address(this).balance / 1000) * 5;

        (bool callSuccess, ) = s_beneficiary.call{value: payedAmount}("");

        if (!callSuccess) revert PaymentEscrow__TransactionUnsuccesful();

        emit Approved(s_payer, s_beneficiary, payedAmount);

        s_isApproved = true;
    }

    // function revertTransaction() external {}
}
