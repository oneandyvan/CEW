<?php

$inData = getRequestInfo();

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error, 500);
}
else
{
    //  Get university and associated location by its primary key
	$stmt = $conn->prepare("
        SELECT u.NumStudents, u.Domain, u.Description, l.LocationID, l.Name, l.Longitude, l.Latitude
        FROM Universities u
        JOIN Locations l ON u.LocationID = l.LocationID
        WHERE u.UniversityName = ?");
	$stmt->bind_param("s", $inData["universityName"]);
	$stmt->execute();
	$result = $stmt->get_result();

	if($row = $result->fetch_assoc()) 
    {
        returnWithInfo($row);
    } 
    else 
    {
        returnWithError("No Universities Found", 404);
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

function returnWithInfo($row)
{
    $retValue = json_encode([
        "NumStudents" => $row["NumStudents"],
        "Domain" => $row["Domain"],
        "Description" => $row["Description"],
        "Location" => [
            "LocationID" => $row["LocationID"],
            "Name" => $row["Name"],
            "Longitude" => $row["Longitude"],
            "Latitude" => $row["Latitude"]
        ]
    ]);
    sendResultInfoAsJson($retValue);
}
	
?>
