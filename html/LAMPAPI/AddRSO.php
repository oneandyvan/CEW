<?php
$inData = getRequestInfo();

$rsoName = $inData["RSOName"];
$universityName = $inData["UniversityName"];
$adminID = $inData["AdminID"];
$description = $inData["Description"];
$members = $inData["Members"];
$status = 'inactive'; //    Set to 'inactive' by default, triggers handle it

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    //  Unique name for RSO
    $stmt = $conn->prepare("SELECT RSOName FROM RSOs WHERE RSOName = ?");
    $stmt->bind_param("s", $rsoName);
    $stmt->execute();
    $result = $stmt->get_result();


    if ($result->num_rows > 0) {
        // A RSO with the same name already exists
        returnWithError("Duplicate RSO Name.", 409);
        return;
    } 
    else
    {
        // Insert the new RSO into RSOs
        $stmt = $conn->prepare("INSERT into RSOs (RSOName, UniversityName, AdminID, Status, Description) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiss", $rsoName, $universityName, $adminID, $status, $description);
        $result = $stmt->execute();

        // Retrieve UserID's from members' emails and insert them into Students_RSOs table
        $stmt = $conn->prepare("SELECT UserID FROM Users WHERE Email = ?");
        $insertStmt = $conn->prepare("INSERT INTO Students_RSOs (RSOName, UserID) VALUES (?, ?)");

        // Insert the Admin into Students_RSOs
        $insertStmt->bind_param("si", $rsoName, $adminID);
        $insertStmt->execute();

        // Insert the each member into Students_RSOs
        foreach ($members as $email) {
            // Get the UserID for each member email
            $stmt->bind_param("s", $email);
            $stmt->execute();
            $stmt->store_result();
            $stmt->bind_result($userID);

            if ($stmt->fetch()) {
                $insertStmt->bind_param("si", $rsoName, $userID);
                $insertStmt->execute();
            } else if($email != ""){
                returnWithError("Member with email $email not found.", 404);
                return;
            }
        }

        $insertStmt->close();
        $stmt->close();
        $conn->close();

        // Return the RSOName as part of the response
        returnWithResult($rsoName);
    }
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

function returnWithResult($rsoName)
{
    $retValue = '{"RSOName":"' . $rsoName . '","error":""}';
    sendResultInfoAsJson($retValue);
}
?>