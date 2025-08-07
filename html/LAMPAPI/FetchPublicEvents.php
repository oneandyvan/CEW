<?php
$inData = getRequestInfo();

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    $stmt = $conn->prepare("
            SELECT PUE.EventID, E.LocationID, E.EventName, E.Time, E.Phone, E.Email
            FROM Public_Events PUE
            JOIN Events E ON PUE.EventID = E.EventID
    ");

	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
        $publicEventList = [];
        while ($row = $result->fetch_assoc()) {
            $publicEventDetails = [
                'EventID' => $row['EventID'],
                'LocationID' => $row['LocationID'],
                'EventName' => $row['EventName'],
                'Time' => $row['Time'],
                'Phone' => $row['Phone'],
                'Email' => $row['Email']
            ];

            // Add the RSO Event and its members to the final list
            $publicEventList[] = $publicEventDetails;
        }
        returnWithInfo($publicEventList);
    } else {
        returnWithError("No Public Events found for the given university", 404);
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

function returnWithInfo($publicEventList) {
    $retValue = json_encode(['Public_Events' => $publicEventList, 'error' => '']);
    sendResultInfoAsJson($retValue);
}
	
?>