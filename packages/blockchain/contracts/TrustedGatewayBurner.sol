// SPDX-License-Identifier: MIT
pragma solidity 0.8.35;

import "./IRupiahToken.sol";

/**
 * @title TrustedGatewayBurner
 * @notice Third-party bank gateway. PIC deposits e-IDR tokens here to redeem for
 *         physical Rupiah. This contract burns the deposited tokens, removing them
 *         from circulation, and emits an event the bank teller acts on.
 * @dev Token is fungible, so this contract cannot reliably tie a burn to a specific
 *      program. The 72-hour clawback window is enforced at the Web2/application layer
 *      (frontend blocks the redeem action until the window passes). On-chain, this
 *      contract only executes the burn after the PIC approves the transfer.
 */
contract TrustedGatewayBurner {

    /// @notice Reference to the e-IDR Rupiah token contract.
    IRupiahToken public rupiahToken;

    /// @notice The gateway operator (deployer) — for reference/admin display.
    address public gatewayOwner;

    constructor(address _rupiahTokenAddress) {
        gatewayOwner = msg.sender;
        rupiahToken = IRupiahToken(_rupiahTokenAddress);
    }

    event ExchangeTokenToFiat(address indexed picWallet, uint256 amount);
    
    /**
     * @notice Deposits e-IDR tokens and burns them in exchange for physical Rupiah.
     * @dev PIC must call approve(gatewayAddress, amount) on the token contract first.
     *      This contract pulls the tokens via transferFrom, then burns them.
     *      The emitted event signals the bank teller to disburse physical cash.
     * @param amount Amount of e-IDR to redeem, in Wei (18 decimals).
     */
    function depositAndBurnToken(uint256 amount) external {
        require(amount > 0, "Gateway: Redemption amount must be greater than zero");
        require(rupiahToken.balanceOf(msg.sender) >= amount, "Gateway: Insufficient e-IDR balance");

        rupiahToken.transferFrom(msg.sender, address(this), amount);

        rupiahToken.burn(amount);

        emit ExchangeTokenToFiat(msg.sender, amount);
    }
}