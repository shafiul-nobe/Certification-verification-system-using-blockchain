// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @dev Throws an error if the transaction ID value is zero.
error ValueCannotBeZero();

/// @dev Throws an error if the address is invalid.
error InvalidAddress();

/// @dev Throws an error if the caller is not a moderator.
error InvalidModerator();

/// @dev Throws an error if the program ID is invalid.
error InvalidProgram();

/// @dev Throws an error if the institution is invalid.
error InvalidInstitution();

/// @dev Throws an error if the caller is not a secondary verifier.
error InvalidSecondaryVerifier();

/// @dev Throws an error if the caller is not a primary verifier.
error InvalidPrimaryVerifier();

/// @dev Throws an error if the certificate is already secondarily verified.
error AlreadyVerified();

/// @dev Throws an error if the certificate is already primarily verified.
error AlreadyPrimaryVerified();

/// @dev Throws an error if the certificate is not already primarily verified.
error AlreadyNotPrimaryVerified();

/// @dev Throws an error if the certificate ID is invalid.
error InvalidCertificateId();

contract Certificate_Verification is Ownable {
    /// @dev Revert transaction for zero address or the address is this current smart contract
    /// @param _address wallet address to verify
    modifier validAddress(address _address) {
        if (_address == address(0) || _address == address(this)) {
            revert InvalidAddress();
        }
        _;
    }
    /// @dev Revert transaction for zero as input value
    /// @param amount amount to verify

    modifier notZero(uint256 amount) {
        if (amount == 0) {
            revert ValueCannotBeZero();
        }
        _;
    }
    /// @dev Revert transaction if the given institution ID is invalid
    /// @param id Institution ID to verify

    modifier validInstitution(uint256 id) {
        if (id > totalInstitution || id < 1) {
            revert InvalidInstitution();
        }
        _;
    }
    /// @dev Revert transaction if the caller is not a moderator
    /// @param _address Address of the caller to verify

    modifier validModerator(address _address) {
        if (!moderators[_address]) {
            revert InvalidModerator();
        }
        _;
    }
    /// @dev Revert transaction if the caller is not a primary verifier of the specified institution
    /// @param _institutionId Institution ID to verify
    /// @param _address Address of the caller to verify

    modifier validPrimaryVerifier(uint256 _institutionId, address _address) {
        if (!institutions[_institutionId].primaryVerifiers[_address]) {
            revert InvalidPrimaryVerifier();
        }
        _;
    }
    /// @dev Revert transaction if the caller is not a secondary verifier of the specified institution
    /// @param _institutionId Institution ID to verify
    /// @param _address Address of the caller to verify

    modifier validSecondaryVerifier(uint256 _institutionId, address _address) {
        if (!institutions[_institutionId].secondaryVerifiers[_address]) {
            revert InvalidSecondaryVerifier();
        }
        _;
    }

    /// @notice Struct representing a educational program
    struct Program {
        uint256 id; // Unique identifier for the program
        string programType; // Type of the program
        string title; // Title of the program
        string major; // Major or subject area of the program
    }

    /// @notice Struct representing an educational institution
    struct Institution {
        uint256 id; // Unique identifier for the institution
        string name; // Name of the institution
        string location; // Location of the institution
        string country; // Country of the institution
        address payable withdrawalWallet; // Wallet address for withdrawal
        uint256 totalPrograms; // Total number of programs offered by the institution
        mapping(uint256 => Program) programs; // Mapping of program IDs to Program structs
        mapping(address => bool) primaryVerifiers; // Mapping of addresses to indicate primary verifiers
        mapping(address => bool) secondaryVerifiers; // Mapping of addresses to indicate secondary verifiers
    }

    /// @notice Struct representing a simplified view of an institution
    struct InstitutionDto {
        uint256 id; // Unique identifier for the institution
        string name; // Name of the institution
        string location; // Location of the institution
        string country; // Country of the institution
        address payable withdrawalWallet; // Wallet address for withdrawal
        uint256 totalPrograms; // Total number of programs offered by the institution
        Program[20] programs; // Array containing up to 100 programs offered by the institution
    }

    /// @notice Struct representing an educational certificate
    struct Certificate {
        uint256 id; // Unique identifier for the certificate
        string serialnumber; // Serial number of the certificate
        string studentName; // Name of the student
        string studentId; // ID of the student
        string graduationDate; // Date of graduation
        string dateOfBirth; // Date of birth of the student
        uint256 programId; // ID of the program associated with the certificate
        uint256 institutionId; // ID of the institution issuing the certificate
        string ipfsUrl; // IPFS URL for additional information
        address applicant; // Address of the applicant
        bool primaryVerified; // Indicates whether the certificate is primary verified
        bool verified; // Indicates whether the certificate is verified
    }

    uint256 public totalCertificate = 0; // Total number of certificates issued
    uint256 public totalVerified = 0; // Total number of certificates verified
    uint256 public totalInstitution = 0; // Total number of institutions registered
    address payable public withdrawalWallet; // Wallet address for withdrawal
    mapping(address => bool) public moderators; // Mapping of moderator addresses
    mapping(uint256 => Institution) public institutions; // Mapping of institution IDs to Institution structs
    mapping(uint256 => Certificate) public certificates; // Mapping of certificate IDs to Certificate structs
    uint256 public constant APPLICATION_FEE = 0.0006 ether; // Application fee for certificate issuance

    /// @param id Unique identifier for the certificate
    /// @param serialnumber Serial number of the certificate
    /// @param studentName Name of the student
    /// @param studentId ID of the student
    /// @param graduationDate Date of graduation
    /// @param dateOfBirth Date of birth of the student
    /// @param programId ID of the program associated with the certificate
    /// @param institutionId ID of the institution issuing the certificate
    /// @param ipfsUrl IPFS URL of uploaded certificate
    /// @param applicant Address of the applicant
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

    /// @param certificate Certificate struct representing the verified certificate
    /// @param verificationType Type of verification (primary or secondary)
    event Verified(Certificate certificate, string verificationType);

    /// @notice Constructor function to initialize the contract with the owner's address
    /// @dev The owner is set as the initial withdrawal wallet address
    constructor() Ownable(msg.sender) {
        withdrawalWallet = payable(msg.sender);
    }

    /// @notice Function to withdraw all Ether balance from the contract
    /// @dev Only the owner of the contract can call this function
    function withdrawETH() external onlyOwner {
        withdrawalWallet.transfer(address(this).balance);
    }

    /// @notice Function to set the withdrawal wallet address
    /// @dev Only the owner of the contract can call this function
    /// @param _wallet The new withdrawal wallet address to be set
    function setWithdrawWallet(
        address _wallet
    ) external onlyOwner validAddress(_wallet) {
        withdrawalWallet = payable(_wallet);
    }

    /// @notice Function to set or remove a moderator
    /// @dev Only the owner of the contract can call this function
    /// @param _moderator The address of the moderator to be set or removed
    /// @param _flag Boolean flag indicating whether to set or remove the moderator (true for set, false for remove)
    function setModerator(
        address _moderator,
        bool _flag
    ) external onlyOwner validAddress(_moderator) {
        moderators[_moderator] = _flag;
    }

    /// @notice Function to add a new educational institution
    /// @dev Only a moderator can call this function
    /// @param _name Name of the institution
    /// @param _location Location of the institution
    /// @param _country Country of the institution
    /// @param _withdrawalWallet Wallet address for withdrawal of funds
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

    /// @notice Function to set the withdrawal wallet address for an institution
    /// @dev Only a moderator can call this function
    /// @param _institutionId ID of the institution
    /// @param _wallet New withdrawal wallet address to be set
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

    /// @notice Function to set or remove a primary verifier for an institution
    /// @dev Only a moderator can call this function
    /// @param _institutionId ID of the institution
    /// @param _wallet Address of the primary verifier to be set or removed
    /// @param _flag Boolean flag indicating whether to set or remove the primary verifier (true for set, false for remove)
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

    /// @notice Function to set or remove a secondary verifier for an institution
    /// @dev Only a moderator can call this function
    /// @param _institutionId ID of the institution
    /// @param _wallet Address of the secondary verifier to be set or removed
    /// @param _flag Boolean flag indicating whether to set or remove the secondary verifier (true for set, false for remove)
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

    /// @notice Function to add a new educational program to an institution
    /// @dev Only a moderator can call this function
    /// @param _institutionId ID of the institution
    /// @param _programType Type of the program
    /// @param _title Title of the program
    /// @param _major Major or subject area of the program
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

    /// @dev Function to allow a user to apply for certificate verification.
    /// @param _serialNumber Serial number of the certificate.
    /// @param _studentName Name of the student.
    /// @param _studentId ID of the student.
    /// @param _graduationDate Graduation date of the student.
    /// @param _dateOfBirth Date of birth of the student.
    /// @param _institutionId ID of the institution.
    /// @param _programId ID of the program.
    /// @param _ipfsUrl IPFS URL for additional information.
    function applyForVerification(
        string memory _serialNumber,
        string memory _studentName,
        string memory _studentId,
        string memory _graduationDate,
        string memory _dateOfBirth,
        uint256 _institutionId,
        uint256 _programId,
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

    /// @dev Function for primary verification of a certificate by a primary verifier.
    /// @param _certificateId ID of the certificate.
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
        emit Verified(certificates[_certificateId], "primary");
    }

    /// @dev Function for secondary verification of a certificate by a secondary verifier.
    /// @param _certificateId ID of the certificate.
    function verify(
        uint256 _certificateId
    )
        external
        validSecondaryVerifier(
            certificates[_certificateId].institutionId,
            msg.sender
        )
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
        emit Verified(certificates[_certificateId], "secondary");
    }

    /// @dev Function to retrieve certificates by applicant address.
    /// @param _address Address of the applicant.
    function getCertificatesByApplicant(
        address _address
    ) public view returns (Certificate[] memory data) {
        Certificate[] memory tmp = new Certificate[](totalCertificate);

        uint256 count = 0;
        for (uint256 i = 1; i <= totalCertificate; i++) {
            Certificate memory certificate = certificates[i];
            if (certificate.applicant == _address) {
                tmp[count] = certificate;
                count += 1;
            }
        }
        data = new Certificate[](count);
        for (uint256 i = 0; i < count; i++) {
            data[i] = tmp[i];
        }
        return data;
    }

    /// @dev Function to retrieve certificates by institution ID.
    /// @param _institutionId ID of the institution.
    function getCertificatesByInstitutionId(
        uint256 _institutionId
    ) public view returns (Certificate[] memory data) {
        Certificate[] memory tmp = new Certificate[](totalCertificate);

        uint256 count = 0;
        for (uint256 i = 1; i <= totalCertificate; i++) {
            Certificate memory certificate = certificates[i];
            if (certificate.institutionId == _institutionId) {
                tmp[count] = certificate;
                count += 1;
            }
        }
        data = new Certificate[](count);
        for (uint256 i = 0; i < count; i++) {
            data[i] = tmp[i];
        }
        return data;
    }

    /// @dev Function to retrieve institutions.
    function getinstitutions()
        public
        view
        returns (InstitutionDto[] memory datas)
    {
        datas = new InstitutionDto[](totalInstitution);

        for (uint256 i = 1; i <= totalInstitution; i++) {
            Institution storage institution = institutions[i];
            InstitutionDto memory institutionDto;

            institutionDto.id = institution.id;
            institutionDto.name = institution.name;
            institutionDto.location = institution.location;
            institutionDto.country = institution.country;
            institutionDto.withdrawalWallet = institution.withdrawalWallet;
            institutionDto.totalPrograms = institution.totalPrograms;

            for (uint256 j = 0; j < institution.totalPrograms; j++) {
                institutionDto.programs[j] = institution.programs[j + 1];
            }

            datas[i - 1] = institutionDto;
        }
        return datas;
    }

    /// @dev Function to retrieve institutions by primary verifier.
    /// @param wallet Address of the primary verifier.
    function getInstitutionsByPrimaryVerifier(
        address wallet
    ) public view returns (uint256[] memory datas) {
        uint256 count = 0;
        for (uint256 i = 1; i <= totalInstitution; i++) {
            Institution storage institution = institutions[i];
            if (institution.primaryVerifiers[wallet]) {
                count++;
            }
        }
        datas = new uint256[](count);
        count = 0;
        for (uint256 i = 1; i <= totalInstitution; i++) {
            Institution storage institution = institutions[i];
            if (institution.primaryVerifiers[wallet]) {
                datas[count] = institution.id;
                count++;
            }
        }
        return datas;
    }

    /// @dev Function to retrieve institutions by secondary verifier.
    /// @param wallet Address of the secondary verifier.
    function getInstitutionsBySecondaryVerifier(
        address wallet
    ) public view returns (uint256[] memory datas) {
        uint256 count = 0;
        for (uint256 i = 1; i <= totalInstitution; i++) {
            Institution storage institution = institutions[i];
            if (institution.secondaryVerifiers[wallet]) {
                count++;
            }
        }
        datas = new uint256[](count);
        count = 0;
        for (uint256 i = 1; i <= totalInstitution; i++) {
            Institution storage institution = institutions[i];
            if (institution.secondaryVerifiers[wallet]) {
                datas[count] = institution.id;
                count++;
            }
        }
        return datas;
    }
}
