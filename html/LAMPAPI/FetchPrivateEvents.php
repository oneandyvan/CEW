<?php
$inData = getRequestInfo();

$universityName = $inData["UniversityName"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    $stmt = $conn->prepare("
            SELECT PRE.EventID, E.LocationID, E.EventName, E.Time, E.Phone, E.Email
            FROM Private_Events PRE
            JOIN Events E ON PRE.EventID = E.EventID
            WHERE PRE.UniversityName = ?
    ");
    $stmt->bind_param("s", $universityName);

	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
        $privateEventList = [];
        while ($row = $result->fetch_assoc()) {
            $privateEventDetails = [
                'EventID' => $row['EventID'],
                'LocationID' => $row['LocationID'],
                'EventName' => $row['EventName'],
                'Time' => $row['Time'],
                'Phone' => $row['Phone'],
                'Email' => $row['Email']
            ];

            // Add the RSO Event and its members to the final list
            $privateEventList[] = $privateEventDetails;
        }
        returnWithInfo($privateEventList);
    } else {
        returnWithError("No Private Events found for the given university", 404);
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

function returnWithInfo($privateEventList) {
    $retValue = json_encode(['Private_Events' => $privateEventList, 'error' => '']);
    sendResultInfoAsJson($retValue);
}
	
?>