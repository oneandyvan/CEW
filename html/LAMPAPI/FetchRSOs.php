<?php
$inData = getRequestInfo();

$universityName = $inData["UniversityName"];
$userID = $inData["UserID"];
$type = $inData["Type"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
    $stmt;
    if($type == "user")
    {
        //  Get list of associated RSOs to the user
        $stmt = $conn->prepare("SELECT RSOName, Status, Description
                                FROM RSOs
                                WHERE RSOName IN (
                                    SELECT RSOName FROM Students_RSOs WHERE UserID = ?
                                )");
        $stmt->bind_param("i", $userID);
    }
    else if($type == "university")
    {
        //  Get list of associated RSOs to the university
        $stmt = $conn->prepare("SELECT RSOName, Status, Description
                                FROM RSOs
                                WHERE UniversityName = ?");
        $stmt->bind_param("s", $universityName);
    }
    

	$stmt->execute();
	$result = $stmt->get_result();

	if ($result->num_rows > 0) {
        $rsoList = [];
        while ($row = $result->fetch_assoc()) {
            $rsoDetails = [
                'RSOName' => $row['RSOName'],
                'Status' => $row['Status'],
                'Description' => $row['Description'],
            ];

            // Add the RSO and its members to the final list
            $rsoList[] = $rsoDetails;
        }
        returnWithInfo($rsoList);
    } else {
        returnWithError("No RSOs found for the given UserID and University.", 404);
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

function returnWithInfo($rsoList) {
    $retValue = json_encode(['RSOs' => $rsoList, 'error' => '']);
    sendResultInfoAsJson($retValue);
}
	
?>