<?php

$inData = getRequestInfo();

$text = $inData["Text"];
$rating = $inData["Rating"];
$commentID = $inData["CommentID"];


$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    $stmt = $conn->prepare("UPDATE Comments SET Text = ?, Rating = ? WHERE CommentID=?");
    $stmt->bind_param("sii", $text, $rating,$commentID);
    $stmt->execute();

    $stmt = $conn->prepare("SELECT Timestamp FROM Comments WHERE CommentID = ?");
    $stmt->bind_param("i", $commentID);
    $stmt->execute();
    $result = $stmt->get_result();

    $timestamp = "";
    if ($row = $result->fetch_assoc()) {
        $timestamp = $row["Timestamp"];
    }

    returnWithValue($timestamp, 200); 

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

function returnWithValue($timestamp, $statusCode)
{
    http_response_code($statusCode); 
    $retValue = '{"Timestamp":"' . $timestamp . '"}';
    sendResultInfoAsJson($retValue);
}

?>