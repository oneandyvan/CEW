<?php
$inData = getRequestInfo();

$email = $inData["Email"];
$rsoName = $inData["RSOName"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db");

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    //  Get UserID from email
    $stmt = $conn->prepare("SELECT UserID FROM Users WHERE Email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($userID);

    if ($stmt->fetch()) 
    {
        //  Don't delete admin
        $adminStmt = $conn->prepare("SELECT UserID FROM Admins Where UserID = ?");
        $adminStmt->bind_param("i", $userID);
        $adminStmt->execute();
        $result = $adminStmt->get_result();

        if($result->num_rows > 0)
        {
            $adminStmt->close();
            returnWithError("Can't delete admin!", 400);
            return;
        }

        //  Delete User from RSO
        $insertStmt = $conn->prepare("DELETE FROM Students_RSOs WHERE RSOName = ? AND UserID = ?");
        $insertStmt->bind_param("si", $rsoName, $userID);
        $insertStmt->execute();

        returnWithResult();
        $insertStmt->close();
    } 
    else
    {
        returnWithError("User not found", 404);
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

function returnWithResult()
{
    $retValue = '{"error":""}';
    sendResultInfoAsJson($retValue);
}
?>