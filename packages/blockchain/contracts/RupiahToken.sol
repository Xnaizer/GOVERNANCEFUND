// SPDX-License-Identifier: MIT
pragma solidity 0.8.35;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IRupiahToken.sol";

contract RupiahToken is ERC20, IRupiahToken {

    /**
     * @notice Address of the Web3Governance contract.
     * Only this address can call mint().
     */
    address public governanceContract;

    /**
     * @notice Address of TrustedGateway contract.
     * Only this address can call burn().
     */
    address public gatewayContract;

    /**
     * @notice Address of the deployer of the smart contract.
     * Only used to call setGovernance() and setGateway() once after deploy.
     */
    address public immutable deployer;

    /**
     * @notice Tracks whether governance address has been set.
     * Prevents setGovernance() from being called more than once.
     */
    bool public governanceSet;

    /**
     * @notice Tracks whether gateway address has been set.
     * Prevents setGatewa() from being called more than once.
     */
    bool public gatewaySet;

    /**
     * @notice Deploys the RupiahToken with zero initial supply.
     * @dev governanceContract and gatewayContract are NOT set here because
     *      those contracts don't exist yet at deploy time.
     *      Call setGovernance() and setGateway() after all contracts are deployed.
     */
    constructor() ERC20("e-IDR Rupiah Token", "eIDR") {
        deployer = msg.sender;
    }

    /**
     * @notice Restricts setGovernance() and setGateway() to deployer only.
     */
    modifier onlyDeployer() {
        require(msg.sender == deployer, "RupiahToken: Caller is not deployer");
        _;
    }

    /**
     * @notice Restricts mint() to Governance contract only.
     * @dev msg.sender must exactly match the stored governanceContract address.
     *      If a regular wallet, an admin, or any other contract calls mint(),
     *      the transaction reverts immediatly no tokens are created.
     */
    modifier onlyGovernance() {
        require(msg.sender == governanceContract, "RupiahToken: Caller is not the governance contract");
        _;
    }

    /**
     * @notice Restricts burn() to gateway contract only.
     * @dev msg.sender must exaclty match the stored gatewayContract addresses.
     *      if a regular wallet, an admin, or any other contract calls burn(),
     *      the transaction reverts immediatly no tokens are burned.
     */
    modifier onlyGateway() {
        require(msg.sender == gatewayContract, "RupiahToken: Caller is not the gateway contract");
        _;
    }

    /**
     * @notice Sets the Web3Governance contract address.
     * @dev Can only be called once by the deployer.
     *      After address set, mint() permanently locked to address that already assigned.
     * @param _governanceContract Address of deployed Web3Governance contract.
     */
    function setGovernace(address _governanceContract) external onlyDeployer {
        require(!governanceSet, "RupiahToken: Governance address already set");
        require(_governanceContract != address(0), "RupiahToken: Invalid governance address");

        governanceContract = _governanceContract;
        governanceSet = true;
    }

    /**
     * @notice Sets the TrustedGateway contract address.
     * @dev Can only be called once by the developer.
     *      After address set, burn() permanently locked to address that already assigned.
     * @param _gatewayContract Address of deployed TrustedGateway contract.
     */
    function setGateway(address _gatewayContract) external onlyDeployer {
        require(!gatewaySet, "RupiahToken: Gateway address already set");
        require(_gatewayContract != address(0), "RupiahToken: Invalid gateway address");

        gatewayContract = _gatewayContract;
        gatewaySet = true;
    }

    /**
     * @notice Mints e-IDR tokens to a PIC Wallet.
     * @dev Only callable by Web3Governance contract.
     *      Triggered inside executePicWithdrawal() after
     *      milestone state is confirmed DRAWABLE.
     * @param to PIC wallet address.
     * @param amount Amount in Wei (18 decimals).
     */
    function mint(address to, uint256 amount) external override onlyGovernance {
        require(to != address(0), "RupiahToken: Mint to zero address");
        require(amount > 0, "RupiahToken: Mint amount must be greater than zero");

        _mint(to, amount);

        emit TokenMinted(to, amount);
    }

    /**
     * @notice Burns e-IDR tokens from a PIC Wallet.
     * @dev Only callable by TrustedGovernance contract.
     *      Triggered inside depositAndBurnToken() after PIC transfers
     *      tokens to the gateway via transferFrom().
     * @param amount Amount in Wei (18 decimals).
     */

    function burn(uint256 amount) external override onlyGateway {
        require(amount > 0, "RupiahToken: burn amount must be greater that a zero");
        
        _burn(msg.sender, amount);

        emit TokenBurned(msg.sender, amount);
    }
    

}