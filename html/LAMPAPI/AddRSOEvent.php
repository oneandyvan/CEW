<?php
$inData = getRequestInfo();

$locationID = $inData["LocationID"];
$eventName = $inData["EventName"];
$time = $inData["Time"];
$phone = $inData["Phone"];
$email = $inData["Email"];
$rsoName = $inData["RSOName"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error, 500);
} 
else 
{
    //  Unique time and location
    $stmt = $conn->prepare("SELECT EventName FROM Events WHERE LocationID = ? AND Time = ?");
    $stmt->bind_param("is", $locationID, $time);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // An event with the same time and location already exists
        $row = $result->fetch_assoc();  
        $conflictEvent = $row['EventName'];
        returnWithError("Event ($conflictEvent) has the same time and location!", 409);
        return;
    }
    else
    {
        // Insert into Events
        $stmt = $conn->prepare("INSERT INTO Events (EventName, Time, LocationID, Phone, Email) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssiss", $eventName, $time, $locationID, $phone, $email);
        
        if (!$stmt->execute()) {
            returnWithError("Error inserting into Events: " . $stmt->error, 500);
            return;
        }

        $eventID = $stmt->insert_id; // Get auto-generated EventID

        // Insert into RSO_Events table
        $stmt = $conn->prepare("INSERT INTO RSO_Events (RSOName, EventID) VALUES (?, ?)");
        $stmt->bind_param("si", $rsoName, $eventID);
        
        if (!$stmt->execute()) {
            returnWithError("Error inserting into RSO_Events: " . $stmt->error, 500);
            return;
        }

        // Return the Event ID as part of the response
        $stmt->close();
        returnWithResult($eventID);
    }

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

function returnWithResult($eventID)
{
    $retValue = '{"EventID":"' . $eventID . '","error":""}';
    sendResultInfoAsJson($retValue);
}
?>