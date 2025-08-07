<?php

$inData = getRequestInfo();

$universityName = $inData["universityName"];
$numStudents = $inData["numStudents"];
$domain = $inData["domain"];
$description = $inData["description"];
$locationID = $inData["locationID"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    $stmt = $conn->prepare("UPDATE Universities SET NumStudents=?, Domain=?, Description=?, LocationID=? WHERE UniversityName=?");
    $stmt->bind_param("issis", $numStudents,$domain,$description,$locationID,$universityName);
    $stmt->execute();
    $stmt->close();
    $conn->close();
    returnWithError("", 200); 
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

?>