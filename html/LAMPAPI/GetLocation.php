<?php

$inData = getRequestInfo();

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error, 500);
}
else
{
    //  Get location by its primary key
	$stmt = $conn->prepare("SELECT * FROM Locations WHERE LocationID=?");
	$stmt->bind_param("s", $inData["locationID"]);
	$stmt->execute();
	$result = $stmt->get_result();

	if($row = $result->fetch_assoc()) 
    {
        returnWithInfo($row['Name'], $row['Longitude'], $row['Latitude']);
    } 
    else 
    {
        returnWithError("No Locations Found", 404);
    }

	$stmt->close();
	$conn->close();
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

function returnWithInfo($locationName, $longitude, $latitude)
{
    $retValue = json_encode([
        "Name" => $locationName,
        "Longitude" => $longitude,
        "Latitude" => $latitude
    ]);
    sendResultInfoAsJson($retValue);
}
	
?>
