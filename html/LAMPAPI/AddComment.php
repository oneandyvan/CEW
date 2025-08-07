<?php
$inData = getRequestInfo();

$eventID = $inData["EventID"];
$userID = $inData["UserID"];
$text = $inData["Text"];
$rating = $inData["Rating"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    // Insert into Events
    $stmt = $conn->prepare("INSERT INTO Comments (EventID, UserID, Text, Rating) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiss", $eventID, $userID, $text, $rating);
    
    if (!$stmt->execute()) {
        returnWithError("Error inserting into Events: " . $stmt->error, 500);
        return;
    }

    $commentID = $stmt->insert_id; // Get auto-generated EventID

    $timestampStmt = $conn->prepare("SELECT Timestamp FROM Comments WHERE CommentID = ?");
    $timestampStmt->bind_param("i", $commentID);
    $timestampStmt->execute();
    $timestampStmt->bind_result($timestamp);
    $timestampStmt->fetch();
    $timestampStmt->close();

    // Return the Comment ID as part of the response and timestamp
    $stmt->close();
    returnWithResult($commentID, $timestamp);

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

function returnWithResult($commentID, $timestamp)
{
    $retValue = json_encode([
        "CommentID" => $commentID,
        "Timestamp" => $timestamp,
        "error" => ""
    ]);    
    sendResultInfoAsJson($retValue);
}
?>