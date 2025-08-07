<?php
$inData = getRequestInfo();

$locationName = $inData["locationName"];
$longitude = $inData["longitude"];
$latitude = $inData["latitude"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) {
    returnWithError($conn->connect_error, 500);
} else {
    $longitude = round($longitude, 6);
    $latitude = round($latitude, 6);

    // Check if a location with the same information already exists
    $stmt = $conn->prepare("SELECT * FROM Locations WHERE Name = ? AND Longitude = ? AND Latitude = ?");
    $stmt->bind_param("sdd", $locationName, $longitude, $latitude);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // A location with the same information already exists
        returnWithError("Duplicate location information.", 409);
        return;
    } else {
        // Insert the new location
        $stmt = $conn->prepare("INSERT into Locations (Name, Longitude, Latitude) VALUES (?, ?, ?)");
        $stmt->bind_param("sdd", $locationName, $longitude, $latitude);
        $stmt->execute();
        $locationID = $stmt->insert_id; 
        $stmt->close();
        $conn->close();

        // Return the new Location ID as part of the response
        returnWithResult($locationID);
    }
}

function getRequestInfo()
{
    return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
    header('Content-type: application/json');
    echo $obj;
}

function returnWithError($err, $statusCode)
{
    http_response_code($statusCode); 
    $retValue = '{"error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithResult($locationID)
{
    $retValue = '{"LocationID":"' . $locationID . '","error":""}';
    sendResultInfoAsJson($retValue);
}
?>