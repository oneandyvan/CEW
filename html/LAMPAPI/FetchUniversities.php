<?php

$inData = getRequestInfo();

$universityResults = "";
$universityCount = 0;

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    //  Get list of Universities
	$stmt = $conn->prepare("SELECT * FROM Universities LIMIT ?");
	$stmt->bind_param("i", $inData["limit"]);
	$stmt->execute();
	$result = $stmt->get_result();

	while ($row = $result->fetch_assoc()) {
        if ($universityCount > 0) {
            $universityResults .= ",";
        }
        $universityCount++;
        $universityResults .= '{"UniversityName":"' . $row["UniversityName"] . '","NumStudents":"' . $row["NumStudents"] . '","Domain":"' . $row["Domain"] . '","Description":"' . $row["Description"] . '","LocationID":"' . $row["LocationID"] . '"}';
    }

    if ($universityCount == 0) {
        returnWithError("No Records Found", 404);
    } else {
        returnWithInfo($universityResults, $universityCount);
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

function returnWithInfo($universityResults, $totalResults)
{
    $retValue = '{"results":[' . $universityResults . '], "totalResults":' . $totalResults . ',"error":""}';
    sendResultInfoAsJson($retValue);
}
	
?>
