// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @title ModelRegistry - Registry for AI models with metadata on-chain and model storage in Walrus
/// @notice Anyone can upload a model record, storing metadata + Walrus references
contract ModelRegistry {
    struct Model {
        address uploader;       // uploader address
        uint256 uploadedAt;     // unix timestamp
        string name;            // model name
        string description;     // model description
        string blobId;          // walrus blob id (client-generated unique identifier)
        string objectId;        // walrus object id (returned by walrus storage)
        bool exists;            // existence flag
    }

    // blobId -> Model mapping
    mapping(string => Model) private models;

    // list of all blobIds
    string[] private blobIds;

    // helper: blobId -> index+1
    mapping(string => uint256) private blobIndexPlusOne;

    /// @notice emitted when a new model is uploaded
    event ModelUploaded(
        string indexed blobId,
        address indexed uploader,
        uint256 uploadedAt,
        string name,
        string description,
        string objectId
    );

    /// @notice emitted when metadata is updated
    event ModelUpdated(
        string indexed blobId,
        string name,
        string description,
        string objectId
    );

    /// @notice upload a new model record
    /// @param blobId unique identifier generated client-side
    /// @param objectId identifier returned from Walrus storage
    /// @param name human-readable model name
    /// @param description short description
    function uploadModel(
        string calldata blobId,
        string calldata objectId,
        string calldata name,
        string calldata description
    ) external {
        require(bytes(blobId).length > 0, "blobId empty");
        require(bytes(objectId).length > 0, "objectId empty");
        require(!models[blobId].exists, "blobId already exists");

        models[blobId] = Model({
            uploader: msg.sender,
            uploadedAt: block.timestamp,
            name: name,
            description: description,
            blobId: blobId,
            objectId: objectId,
            exists: true
        });

        blobIds.push(blobId);
        blobIndexPlusOne[blobId] = blobIds.length;

        emit ModelUploaded(blobId, msg.sender, block.timestamp, name, description, objectId);
    }

    /// @notice get full metadata by blobId
    function getMetadata(string calldata blobId)
        external
        view
        returns (
            address uploader,
            uint256 uploadedAt,
            string memory name,
            string memory description,
            string memory modelBlobId,
            string memory objectId
        )
    {
        Model storage m = models[blobId];
        require(m.exists, "not found");
        return (m.uploader, m.uploadedAt, m.name, m.description, m.blobId, m.objectId);
    }

    /// @notice get all blobIds
    function getAllBlobIds() external view returns (string[] memory) {
        return blobIds;
    }

    /// @notice check if a blobId exists
    function exists(string calldata blobId) external view returns (bool) {
        return models[blobId].exists;
    }

    /// @notice get total number of models stored
    function totalModels() external view returns (uint256) {
        return blobIds.length;
    }

    /// @notice update metadata for an existing model (only uploader can do this)
    function updateMetadata(
        string calldata blobId,
        string calldata newName,
        string calldata newDescription,
        string calldata newObjectId
    ) external {
        Model storage m = models[blobId];
        require(m.exists, "not found");
        require(m.uploader == msg.sender, "only uploader");

        m.name = newName;
        m.description = newDescription;
        m.objectId = newObjectId;

        emit ModelUpdated(blobId, newName, newDescription, newObjectId);
    }
}
