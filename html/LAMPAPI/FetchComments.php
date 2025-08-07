<?php
$inData = getRequestInfo();

$eventID = $inData["EventID"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    $stmt = $conn->prepare("SELECT * FROM Comments WHERE EventID = ?");
    $stmt->bind_param("i", $eventID);

	$stmt->execute();
	$result = $stmt->get_result();

    $commentList = [];
    while ($row = $result->fetch_assoc()) {
        $commentDetails = [
            'CommentID' => $row['CommentID'],
            'EventID' => $row['EventID'],
            'UserID' => $row['UserID'],
            'Timestamp' => $row['Timestamp'],
            'Text' => $row['Text'],
            'Rating' => $row['Rating']
        ];

        // Add the comment and its members to the final list
        $commentList[] = $commentDetails;
    }
    returnWithInfo($commentList);

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

function returnWithInfo($commentList) {
    $retValue = json_encode(['Comments' => $commentList, 'error' => '']);
    sendResultInfoAsJson($retValue);
}
	
?>