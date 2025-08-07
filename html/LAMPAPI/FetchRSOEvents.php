<?php
$inData = getRequestInfo();

$userID = $inData["UserID"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    $stmt = $conn->prepare("
            SELECT RE.EventID, RE.RSOName, E.LocationID, E.EventName, E.Time, E.Phone, E.Email
            FROM Students_RSOs SR
            JOIN RSO_Events RE ON SR.RSOName = RE.RSOName
            JOIN Events E ON RE.EventID = E.EventID
            WHERE SR.UserID = ?
    ");
    $stmt->bind_param("i", $userID);
    

	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
        $rsoEventList = [];
        while ($row = $result->fetch_assoc()) {
            $rsoEventDetails = [
                'EventID' => $row['EventID'],
                'LocationID' => $row['LocationID'],
                'RSOName' => $row['RSOName'],
                'EventName' => $row['EventName'],
                'Time' => $row['Time'],
                'Phone' => $row['Phone'],
                'Email' => $row['Email']
            ];

            // Add the RSO Event and its members to the final list
            $rsoEventList[] = $rsoEventDetails;
        }
        returnWithInfo($rsoEventList);
    } else {
        returnWithError("No RSO Events found for the given UserID", 404);
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

function returnWithInfo($rsoEventList) {
    $retValue = json_encode(['RSO_Events' => $rsoEventList, 'error' => '']);
    sendResultInfoAsJson($retValue);
}
	
?>