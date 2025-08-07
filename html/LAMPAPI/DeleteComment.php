<?php
$inData = getRequestInfo();

$commentID = $inData["CommentID"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db");

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    //  Delete Comment using CommentID
    $stmt = $conn->prepare("DELETE FROM Comments WHERE CommentID = ?");
    $stmt->bind_param("i", $commentID);
    $stmt->execute();
    $stmt->store_result();

    returnWithResult();
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