// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title The Basin — Catapoolt creator fee sink (pons v2, Robinhood Chain 4663)
/// @notice Holds creator fees claimed from the pons fee escrow.
///         No holder distribution, no merkle, no keeper. ops withdraws.
/// @dev    Deploy BEFORE the launch, but hand the creator-fee role over only
///         AFTER a live claim has been proven with an EOA recipient.

interface IFeeEscrow {
    function claim() external;
    function claimToken(address token) external;
    function balanceOf(address recipient) external view returns (uint256);
    function balanceOfToken(address recipient, address token) external view returns (uint256);
}

interface ICurve {
    function sweepFees(uint256 minBuybackTokensOut) external;
}

interface IPonsFactory {
    function transferCreatorFeeRecipient(address token, address newRecipient) external;
}

interface IBuybackVault {
    function release(address token) external returns (uint256 released);
    function totalLocked(address token) external view returns (uint256);
    function releasable(address token) external view returns (uint256);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Basin {
    string public constant NAME    = "Catapoolt";
    string public constant TICKER  = "POOLT";
    string public constant LINE    = "The curve is the catapult.";
    string public constant DESCRIPTION =
        "Every buy winds the catapult. When the curve sells out the cat flies into a locked pool. Game engine by glebv (js13k, MIT).";
    string public constant WEBSITE = "https://www.catapoolt.xyz";
    string public constant TWITTER = "https://x.com/catapooltXYZ";
    string public constant GITHUB  = "https://github.com/catapooltXYZ/catapoolt";

    IFeeEscrow    public constant ESCROW  = IFeeEscrow(0xd3AFEB2a57f70eF218Aa82451c51B2fb0416Ac9e);
    IPonsFactory  public constant FACTORY = IPonsFactory(0x7eD598BcEf8bd9Edd8C97A195C6d13f40801EC7e);
    IBuybackVault public constant BUYBACK = IBuybackVault(0x42df2a798f82289E177311362e8f5ccC45c1219c);

    address public immutable ops;
    address public token;   // one-shot
    address public curve;   // one-shot
    uint256 public totalReceived;
    uint256 public totalPulled;

    error OnlyOps();
    error AlreadySet();
    error NotSet();
    error SendFailed();

    event Received(address indexed from, uint256 amount);
    event Harvested(uint256 ethIn);
    event HarvestedToken(address indexed asset, uint256 amountIn);
    event Pulled(address indexed to, uint256 amount);
    event HandedOver(address indexed newRecipient);
    event TokenSet(address token);
    event CurveSet(address curve);

    constructor(address ops_) {
        require(ops_ != address(0), "ops");
        ops = ops_;
    }

    modifier onlyOps() {
        if (msg.sender != ops) revert OnlyOps();
        _;
    }

    receive() external payable {
        totalReceived += msg.value;
        emit Received(msg.sender, msg.value);
    }

    // --- one-shot wiring. onlyOps: permissionless set is a front-run lock ---

    function setToken(address t) external onlyOps {
        if (token != address(0)) revert AlreadySet();
        require(t != address(0), "zero");
        token = t;
        emit TokenSet(t);
    }

    function setCurve(address c) external onlyOps {
        if (curve != address(0)) revert AlreadySet();
        require(c != address(0), "zero");
        curve = c;
        emit CurveSet(c);
    }


    // --- fees ---

    /// @notice Anyone may call. Sweeps the curve if it can, then claims ETH
    ///         from the escrow into this contract. Caller gets nothing but gas cost.
    /// @dev    sweepFees reverts with InternalSwapRequiresOperator while buybacks
    ///         are enabled; that is expected and swallowed so the claim still runs.
    function harvest() external {
        if (curve != address(0)) {
            try ICurve(curve).sweepFees(0) {} catch {}
        }
        uint256 before = address(this).balance;
        if (ESCROW.balanceOf(address(this)) > 0) {
            ESCROW.claim();
        }
        emit Harvested(address(this).balance - before);
    }

    /// @notice Releases any vested buyback supply and claims ERC-20 balances
    ///         (buyback token, or a non-ETH quote asset) out of the escrow.
    function harvestToken(address asset) external {
        if (token != address(0)) {
            try BUYBACK.release(token) {} catch {}
        }
        uint256 owed = ESCROW.balanceOfToken(address(this), asset);
        if (owed > 0) {
            ESCROW.claimToken(asset);
            emit HarvestedToken(asset, owed);
        }
    }

    // --- ops ---

    function pull(address to, uint256 amount) external onlyOps {
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert SendFailed();
        totalPulled += amount;
        emit Pulled(to, amount);
    }

    function pullToken(address asset, address to, uint256 amount) external onlyOps {
        IERC20(asset).transfer(to, amount);
    }

    /// @notice INSURANCE. Moves the pons creator-fee role somewhere else.
    ///         Without this, a bug in this contract would strand the fee stream
    ///         forever, because pons only lets the current recipient reassign it.
    ///         Claim outstanding escrow balances first: handing over does not
    ///         move already-credited balances.
    function handOver(address newRecipient) external onlyOps {
        if (token == address(0)) revert NotSet();
        require(newRecipient != address(0), "zero");
        FACTORY.transferCreatorFeeRecipient(token, newRecipient);
        emit HandedOver(newRecipient);
    }

    // --- views ---

    /// @notice Unclaimed ETH sitting in the escrow for this contract.
    function pendingEscrow() external view returns (uint256) {
        return ESCROW.balanceOf(address(this));
    }

    /// @notice How big the cat is: buyback supply locked in the pons vault.
    function hoard() external view returns (uint256 locked, uint256 releasable) {
        if (token == address(0)) return (0, 0);
        return (BUYBACK.totalLocked(token), BUYBACK.releasable(token));
    }

    function socials() external pure returns (string memory, string memory, string memory) {
        return (WEBSITE, TWITTER, GITHUB);
    }
}
