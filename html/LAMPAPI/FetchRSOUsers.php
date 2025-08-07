<?php
$inData = getRequestInfo();

$rsoName = $inData["RSOName"];
$userCount = 0;


$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    //  Get list of associated users to RSOs
	$stmt = $conn->prepare("SELECT u.Email, u.Name FROM Students_RSOs s
                            JOIN Users u ON s.UserID = u.UserID
                            WHERE s.RSOName = ?");
    $stmt->bind_param("s", $rsoName);
	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
        $memberList = [];
        while ($row = $result->fetch_assoc()) {
            $memberDetails = [
                'Name' => $row['Name'],
                'Email' => $row['Email']
            ];

            // Add its members to the final list
            $memberList[] = $memberDetails;
            $userCount++;
        }
        returnWithInfo($memberList, $userCount);
    } else {
        returnWithError("No members found for RSO", 404);
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

function returnWithInfo($memberList, $userCount) {
    $retValue = json_encode(['Members' => $memberList, 'count' => $userCount, 'error' => '']);
    sendResultInfoAsJson($retValue);
}
	
?>