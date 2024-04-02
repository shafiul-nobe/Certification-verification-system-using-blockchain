// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/access/Ownable.sol";

error ValueCanNotBeZero();
error InvalidAddress();
error InvalidModerator();
error InvalidProgram();
error InvalidInstituition();
error InvalidVerifier();
error ValueCanNotBeZero();
error AlreadyVerified();

contract certificate_verification is Ownable {
    /// @dev Revert transaction for zero address or the address is this current smart contract
    /// @param _address wallet address to verify
    modifier validAddress(address _address) {
        if (_address == address(0) || _address == address(this)) {
            revert InvalidAddress();
        }
        _;
    }

    /// @dev Revert transaction for zero as input value
    /// @param amount ammount to verify
    modifier notZero(uint256 amount) {
        if (amount == 0) {
            revert ValueCanNotBeZero();
        }
        _;
    }

    modifier validInstitution(uint256 id) {
        if (id <= totalInstitution) {
            revert InvalidInstituition();
        }
        _;
    }

    modifier validModerator(address _address) {
        if (!moderators[_address]) {
            revert InvalidModerator();
        }
        _;
    }

    struct Program {
        uint256 id;
        string programType;
        string title;
        string major;
    }

    struct Institution {
        uint256 id;
        string name;
        string location;
        string country;
        address withdrawalWallet;
        uint256 APPLICATION_FEE;
        uint256 totalPrograms;
        mapping(uint256 => Program) programs;
        mapping(address => bool) primaryVerifiers;
        mapping(address => bool) secondaryVerifiers;
    }

    struct Certificate {
        uint256 id;
        string serialnumber;
        uint256 studentName;
        string studentId;
        string graduationDate;
        string dateOfBirth;
        uint256 programId;
        uint256 institutionId;
        string ipfsUrl;
        address applicant;
    }

    uint256 public totalInstitution = 0;
    address payable public withdrawalWallet;
    mapping(address => bool) public moderators;
    mapping(uint256 => institution) institutions;

    constructor() {
        withdrawalWallet = payable(msg.sender);
    }
    /// @notice Transfer balance on this contract to withdrawal address
    function withdrawETH() external onlyOwner {
        withdrawalWallet.transfer(address(this).balance);
    }

    /// @notice Set wallet address that can withdraw the balance
    /// @dev Only owner of the contract can execute this function.
    ///      The address should not be 0x0 or contract address
    /// @param _wallet Any valid address
    function setWithdrawWallet(
        address _wallet
    ) external onlyOwner validAddress(_wallet) {
        withdrawalWallet = payable(_wallet);
    }

    function addInstitution(
        string _name,
        string _location,
        string _country,
        address _withdrawalWallet,
        uint256 _applicationFee
    ) external validModerator(msg.sender) validAddress(_withdrawalWallet) {
        unchecked {
            totalInstitution++;
        }
        institutions[totalInstitution] = Institution(
            totalInstitution,
            _name,
            _location,
            _country,
            _withdrawalWallet,
            _applicationFee,
            0
        );
    }

    function setInstitutiontWithdrawalWallet(
        uint256 institutionId,
        address _wallet
    )
        external
        validModerator(msg.sender)
        validAddress(_wallet)
        validInstitution(institutionId)
    {
        institutions[institutionId].withdrawalWallet = _wallet;
    }

    function setPrimaryVerifier(
        uint256 instituionId,
        address _wallet,
        bool _flag
    )
        external
        validModerator(msg.sender)
        validAddress(_wallet)
        validInstitution(institutionId)
    {
        institutions[institutionId].primaryVerifiers[_wallet] = _flag;
    }

    function setSecondaryVerifier(
        uint256 instituionId,
        address _wallet,
        bool _flag
    )
        external
        validModerator(msg.sender)
        validAddress(_wallet)
        validInstitution(institutionId)
    {
        institutions[institutionId].secondaryVerifiers[_wallet] = _flag;
    }

    function addPrograms(
        uint256 instituionId,
        string _programType,
        string _title,
        string _major
    ) external validModerator(msg.sender) validInstitution(institutionId) {
        unchecked {
            institutions[institutionId].totalPrograms++;
        }
        institutions[institutionId].programs[institutions[institutionId].totalPrograms] = Program(
            institutions[institutionId].totalPrograms,
            _programType,
            _title,
            _major
        );
    }
}
