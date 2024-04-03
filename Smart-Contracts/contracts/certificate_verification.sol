// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

error ValueCanNotBeZero();
error InvalidAddress();
error InvalidModerator();
error InvalidProgram();
error InvalidInstituition();
error InvalidVerifier();
error InvalidPrimaryVerifier();
error AlreadyVerified();
error AlreadyPrimaryVerified();
error AlreadyNotPrimaryVerified();
error InvalidCertificateId();

contract Certificate_Verification is Ownable {
    modifier validAddress(address _address) {
        if (_address == address(0) || _address == address(this)) {
            revert InvalidAddress();
        }
        _;
    }

    modifier notZero(uint256 amount) {
        if (amount == 0) {
            revert ValueCanNotBeZero();
        }
        _;
    }

    modifier validInstitution(uint256 id) {
        if (id > totalInstitution || id < 1) {
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

    modifier validPrimaryVerifier(uint256 _institutionId, address _address) {
        if (!institutions[_institutionId].primaryVerifiers[_address]) {
            revert InvalidPrimaryVerifier();
        }
        _;
    }

    modifier validVerifier(uint256 _institutionId, address _address) {
        if (!institutions[_institutionId].secondaryVerifiers[_address]) {
            revert InvalidVerifier();
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
        address payable withdrawalWallet;
        uint256 totalPrograms;
        mapping(uint256 => Program) programs;
        mapping(address => bool) primaryVerifiers;
        mapping(address => bool) secondaryVerifiers;
    }

    struct Certificate {
        uint256 id;
        string serialnumber;
        string studentName;
        string studentId;
        string graduationDate;
        string dateOfBirth;
        uint256 programId;
        uint256 institutionId;
        string ipfsUrl;
        address applicant;
        bool primaryVerified;
        bool verified;
    }

    uint256 public totalCertificate = 0;
    uint256 public totalVerified = 0;
    uint256 public totalInstitution = 0;
    address payable public withdrawalWallet;
    mapping(address => bool) public moderators;
    mapping(uint256 => Institution) public institutions;
    mapping(uint256 => Certificate) public certificates;
    uint256 public constant APPLICATION_FEE = 0.0006 ether;

    event CertificateCreated(
        uint256 id,
        string serialnumber,
        string studentName,
        string studentId,
        string graduationDate,
        string dateOfBirth,
        uint256 programId,
        uint256 institutionId,
        string ipfsUrl,
        address applicant
    );

    event Verified(uint256 certificateId, string verificationType);

    constructor() Ownable(msg.sender) {
        withdrawalWallet = payable(msg.sender);
    }

    function withdrawETH() external onlyOwner {
        withdrawalWallet.transfer(address(this).balance);
    }

    function setWithdrawWallet(
        address _wallet
    ) external onlyOwner validAddress(_wallet) {
        withdrawalWallet = payable(_wallet);
    }

    function setModerator(
        address _moderator,
        bool _flag
    ) external onlyOwner validAddress(_moderator) {
        moderators[_moderator] = _flag;
    }

    function addInstitution(
        string memory _name,
        string memory _location,
        string memory _country,
        address _withdrawalWallet
    ) external validModerator(msg.sender) validAddress(_withdrawalWallet) {
        unchecked {
            totalInstitution++;
        }
        Institution storage newInstitution = institutions[totalInstitution];
        newInstitution.id = totalInstitution;
        newInstitution.name = _name;
        newInstitution.location = _location;
        newInstitution.country = _country;
        newInstitution.withdrawalWallet = payable(_withdrawalWallet);
        newInstitution.totalPrograms = 0;
    }

    function setInstitutiontWithdrawalWallet(
        uint256 _institutionId,
        address _wallet
    )
        external
        validModerator(msg.sender)
        validAddress(_wallet)
        validInstitution(_institutionId)
    {
        institutions[_institutionId].withdrawalWallet = payable(_wallet);
    }

    function setPrimaryVerifier(
        uint256 _institutionId,
        address _wallet,
        bool _flag
    )
        external
        validModerator(msg.sender)
        validAddress(_wallet)
        validInstitution(_institutionId)
    {
        institutions[_institutionId].primaryVerifiers[_wallet] = _flag;
    }

    function setSecondaryVerifier(
        uint256 _institutionId,
        address _wallet,
        bool _flag
    )
        external
        validModerator(msg.sender)
        validAddress(_wallet)
        validInstitution(_institutionId)
    {
        institutions[_institutionId].secondaryVerifiers[_wallet] = _flag;
    }

    function addPrograms(
        uint256 _institutionId,
        string memory _programType,
        string memory _title,
        string memory _major
    ) external validModerator(msg.sender) validInstitution(_institutionId) {
        unchecked {
            institutions[_institutionId].totalPrograms++;
        }
        institutions[_institutionId].programs[
            institutions[_institutionId].totalPrograms
        ] = Program(
            institutions[_institutionId].totalPrograms,
            _programType,
            _title,
            _major
        );
    }

    function applyForVerification(
        string memory _serialNumber,
        string memory _studentName,
        string memory _studentId,
        string memory _graduationDate,
        string memory _dateOfBirth,
        uint256 _programId,
        uint256 _institutionId,
        string memory _ipfsUrl
    ) external payable validInstitution(_institutionId) {
        if (
            _programId < 1 ||
            _programId > institutions[_institutionId].totalPrograms
        ) {
            revert InvalidProgram();
        }
        require(
            msg.value == APPLICATION_FEE,
            "insufficient or excess ETH provided."
        );

        unchecked {
            totalCertificate++;
        }
        certificates[totalCertificate] = Certificate(
            totalCertificate,
            _serialNumber,
            _studentName,
            _studentId,
            _graduationDate,
            _dateOfBirth,
            _programId,
            _institutionId,
            _ipfsUrl,
            msg.sender,
            false,
            false
        );

        emit CertificateCreated(
            totalCertificate,
            _serialNumber,
            _studentName,
            _studentId,
            _graduationDate,
            _dateOfBirth,
            _programId,
            _institutionId,
            _ipfsUrl,
            msg.sender
        );
    }

    function primaryVerify(
        uint256 _certificateId
    )
        external
        validPrimaryVerifier(
            certificates[_certificateId].institutionId,
            msg.sender
        )
    {
        if (_certificateId < 1 || _certificateId > totalCertificate) {
            revert InvalidCertificateId();
        }
        if (certificates[_certificateId].primaryVerified) {
            revert AlreadyPrimaryVerified();
        }
        certificates[_certificateId].primaryVerified = true;
        emit Verified(_certificateId, "primary");
    }

    function verify(
        uint256 _certificateId
    )
        external
        validVerifier(certificates[_certificateId].institutionId, msg.sender)
    {
        if (_certificateId < 1 || _certificateId > totalCertificate) {
            revert InvalidCertificateId();
        }
        if (certificates[_certificateId].verified) {
            revert AlreadyVerified();
        }
        if (!certificates[_certificateId].primaryVerified) {
            revert AlreadyNotPrimaryVerified();
        }
        certificates[_certificateId].verified = true;
        institutions[certificates[_certificateId].institutionId]
            .withdrawalWallet
            .transfer((APPLICATION_FEE * 4) / 5);
        withdrawalWallet.transfer((APPLICATION_FEE / 5));
        emit Verified(_certificateId, "secondary");
    }
}
