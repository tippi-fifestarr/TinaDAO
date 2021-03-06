//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2; // required to accept structs as function parameters

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "erc721a/contracts/ERC721A.sol";

//////////////////////////////////////////////////////
//                                                  //
// Hi I'm @tinaaaaalee                              //
// See my modeling works at                         //
// https://www.instagram.com/tinaaaaalee/           //
// and open source code at                          //
// https://github.com/tina1998612                   //
//                                                  //
//////////////////////////////////////////////////////

/**
 @title TinaDAO NFT 
 @author Lee Ting Ting
 */
contract TinaDAO is Ownable, ERC721A, EIP712 {
    using Address for address;

    // Stage info (packed)
    struct StageInfo {
        uint8 stageId;
        uint16 maxSupply;
        uint32 startTime;
        uint32 endTime;
        uint160 mintPrice;
    }
    StageInfo public stageInfo;

    // Maximum limit of tokens that can ever exist
    uint16 private constant MAX_SUPPLY = 5;

    // Stage ID at public stage
    uint8 private constant PUBLIC_STAGE_ID = 2;

    // The base link that leads to the image / video of the token
    string private baseTokenURI;

    string private _contractURI = "https://arweave.net/VF34QWIaINKcTeNXutDK-NBkNBqVj5o5qelc6EQ3GaQ";

    struct MinterInfo {
        uint8 stageId;
        uint8 maxMintCount;
    }

    // Stage ID check
    mapping(address => MinterInfo) private _whitelistInfo;

    mapping(address => uint256) public _mintedCounts;

    // voucher for user to redeem
    struct NFTVoucher {
        address redeemer; // specify user to redeem this voucher
        uint8 stageId; // ID to check if voucher has been redeemed
        uint8 amount; // max amount to mint in stage
    }

    constructor(
        string memory _name,
        string memory _symbol,
        StageInfo memory _initStageInfo,
        string memory _baseTokenURI
    ) ERC721A(_name, _symbol) EIP712(_name, "1") { // version 1
        stageInfo = _initStageInfo;
        baseTokenURI = _baseTokenURI;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function setNewContractURI(string memory _newURI) external onlyOwner {
        _contractURI = _newURI;
    }

    /// @notice Whitelist mint using the voucher
    function whitelistMint(
        NFTVoucher calldata voucher,
        bytes calldata signature,
        uint8 amount
    ) external payable {
        MinterInfo storage minterInfo = _whitelistInfo[_msgSender()];
        // if haven't redeemed then redeem first
        if (minterInfo.stageId <= stageInfo.stageId) {
            // make sure that the signer is authorized to mint NFTs
            _verify(voucher, signature);
            // check current stage
            require(voucher.stageId == stageInfo.stageId, "Wrong stage");
            // update minter info
            minterInfo.stageId = voucher.stageId;
            minterInfo.maxMintCount = voucher.amount;
        }

        // check time
        require(block.timestamp >= stageInfo.startTime, "Sale not started");
        require(block.timestamp <= stageInfo.endTime, "Sale already ended");
        // check if enough maxMintCount
        require(amount <= minterInfo.maxMintCount - _mintedCounts[_msgSender()], "Not enough maxMintCount");
        // check if exceed
        require(totalSupply() + amount <= stageInfo.maxSupply, "Exceed stage max supply");
        // check fund
        require(msg.value >= stageInfo.mintPrice * amount, "Not enough fund");
        super._safeMint(_msgSender(), amount);
        _mintedCounts[_msgSender()] += amount;
    }

    /// @notice Public mint
    function publicMint(uint8 amount) external payable {
        // check public mint stage
        require(stageInfo.stageId == PUBLIC_STAGE_ID, "Public mint not started");
        // check time
        require(block.timestamp >= stageInfo.startTime, "Sale not started");
        require(block.timestamp <= stageInfo.endTime, "Sale already ended");
        // check if exceed total supply
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceed total supply");
        // check fund
        require(msg.value >= stageInfo.mintPrice * amount, "Not enough fund to mint NFT");
        // batch mint
        super._safeMint(_msgSender(), amount);
    }

    /// @dev Verify voucher
    function _verify(NFTVoucher calldata voucher, bytes calldata signature) private view {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("NFTVoucher(address redeemer,uint8 stageId,uint8 amount)"),
                    _msgSender(),
                    voucher.stageId,
                    voucher.amount
                )
            )
        );
        require(owner() == ECDSA.recover(digest, signature), "Signature invalid or unauthorized");
    }

    /// @dev Reserve NFT. The contract owner can mint NFTs regardless of the minting start and end time.
    function reserve(address to, uint256 amount) external onlyOwner {
        require(totalSupply() + amount <= MAX_SUPPLY, "Exceed total supply");
        super._safeMint(to, amount);
    }

    /// @dev Go to next stage. The contract owner can set the NFT stage from whitelist mint (stage 1) to public mint (stage 2).
    function nextStage(StageInfo memory _stageInfo) external onlyOwner {
        require(_stageInfo.stageId >= stageInfo.stageId, "Cannot set to previous stage");
        require(_stageInfo.maxSupply <= MAX_SUPPLY, "Set exceed max supply");
        require(_stageInfo.stageId <= PUBLIC_STAGE_ID, "Public is final stage");
        stageInfo = _stageInfo;
    }

    /// @dev Withdraw. The contract owner can withdraw all ETH from the NFT sale
    function withdraw() external onlyOwner {
        Address.sendValue(payable(owner()), address(this).balance);
    }

    /// @dev Set new baseURI
    function setBaseURI(string memory baseURI) external onlyOwner {
        baseTokenURI = baseURI;
    }

    /// @dev override _baseURI()
    function _baseURI() internal view override returns (string memory) {
        return baseTokenURI;
    }
}
