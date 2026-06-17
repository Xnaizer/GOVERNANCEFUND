// SPDX-License-Identifier: MIT
pragma solidity 0.8.35;

/**
 * @title IRupiahToken
 * @notice Interface for the e-IDR Rupiah Token.
 * @dev Defines the mint and burn functions that Web3Governance 
 *      and TrustedGatewayBurner will call.
 *      - No fixed supply
 *      - Not publicly tradeable (yet)
 *      - Mint: only callable by Web3Governance contract
 *      - Burn: only callable by TrustedGatewayBurner contract
 */

interface IRupiahToken {
    /**
     * @notice Emitted Event when token are minted to a pic wallet
     * @param to The PIC wallet address receiving the tokens.
     * @param amount The Amount minted in Wei (18 decimals).
     */
    event TokenMinted(address indexed to, uint256 amount);

    /**
     * @notice Emitted when tokens are burned at the trusted gateway.
     * @param from The address whose tokens were burned.
     * @param amount The Amount minted in Wei (18 decimals).
     */
    event TokenBurned(address indexed from, uint256 amount);

    /**
     * @notice Returns the token balance of an account.
     * @param account The wallet address to query.
     * @return balance Token balance in Wei (18 decimals).
     */
    function balanceOf(address account) external view returns (uint256 balance);

    /**
     * @notice Returns the total supply of tokens currently in circulation.
     * @dev Supply fluctuates as tokens are minted and burned.
     * @return Total supply in Wei (18 decimals).
     */
    function totalSupply() external view returns (uint256);

    /**
     * @notice Returns the remaining amount that a spender is allowed
     *         to transfer on behalf of the owner.
     * @param owner The Token owner address.
     * @param spender The spender address (TrustedGatewayBurner contract).
     * @return remaining Allowance amount in Wei (18 decimals).
     */
    function allowance(address owner, address spender) external view returns (uint256 remaining);

    /**
     * @notice Transfers tokens from caller to recipient.
     * @param to Recipient address.
     * @param amount Amount to transfer in Wei (18 decimals).
     * @return success True if transfer succeeded.
     */
    function transfer(address to, uint256 amount) external returns (bool success);

    /**
     * @notice Approves a spender to transfer tokens on behalf of caller.
     * @dev PIC must call this before TrustedGatewayBurner can pull tokens.
     * @param spender The address authorized to spend (TrustedGatewayBurner).
     * @param amount Amount approved in Wei (18 decimals).
     * @return success Return boolean values from approval.
     */
    function approve(address spender, uint256 amount) external returns (bool success);

    /**
     * @notice Transfer tokens from one address to another using allowance. 
     * @dev Used by TrustedGatewayBurner to pull tokens from PIC Wallet.
     * @param from The token owner address.
     * @param to The recipient address.
     * @param amount Amount to transfer in Wei (18 decimals).
     * @return success Return boolean values from TransferFrom.
     */
    function transferFrom(
        address from, 
        address to, 
        uint256 amount 
    ) external returns (bool success);

    /**
     * @notice Mints new e-IDR tokens directly to a PIC wallet.
     * @dev MUST only be callable by the GovernanceAntiCorruption contract.
     *      Called inside DRAWABLE and withdrawal amount is validated.
     *      is confirmed DRAWABLE and Withrawal amount is validated.
     * @param to The PIC wallet address to receive tokens.
     * @param amount Amount to mint in Wei (18 decimals).
     * @custom:security Caller must be Web3Governance contract address.
     *                  Implementing contract enforces this via onlyGovernance modifier. 
     */
    function mint(address to, uint256 amount) external;

    /**
     * @notice Burns e-IDR tokens held by the TrustedGatewayBurner contract.
     * @dev MUST only be callable by the TrustedGatewayBurner contract.
     *      Called after PIC transfers tokens to the gateway via transferForm().
     *      Burning permanently removes tokens from circulations,
     *      triggering physical rupiah payout by the TrustedGateway.
     * @param amount Amount to burn in Wei (18 decimals).
     * @custom:security Caller must be TrustedGatewayBurner contract address.
     *                  Implementing contract enforces this via onlyGateway modifier.
     */
    function burn(uint256 amount) external;

}