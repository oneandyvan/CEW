<?php

$inData = getRequestInfo();

$locationResults = "";
$locationCount = 0;

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    //  Get list of Locations
	$stmt = $conn->prepare("SELECT * FROM Locations LIMIT ?");
	$stmt->bind_param("i", $inData["limit"]);
	$stmt->execute();
	$result = $stmt->get_result();

	while ($row = $result->fetch_assoc()) {
        if ($locationCount > 0) {
            $locationResults .= ",";
        }
        $locationCount++;
        $locationResults .= '{"LocationID":"' . $row["LocationID"] . '","Name":"' . $row["Name"] . '","Longitude":"' . $row["Longitude"] . '","Latitude":"' . $row["Latitude"] . '"}';
    }

    if ($locationCount == 0) {
        returnWithError("No Records Found", 404);
    } else {
        returnWithInfo($locationResults, $locationCount);
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

function returnWithInfo($locationResults, $totalResults)
{
    $retValue = '{"results":[' . $locationResults . '], "totalResults":' . $totalResults . ',"error":""}';
    sendResultInfoAsJson($retValue);
}
	
?>
