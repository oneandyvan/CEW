<?php
$inData = getRequestInfo();

$locationID = $inData["LocationID"];
$eventName = $inData["EventName"];
$time = $inData["Time"];
$phone = $inData["Phone"];
$email = $inData["Email"];
$universityName = $inData["UniversityName"];
$userID = $inData["UserID"];
$role = $inData["Role"];

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

        // Insert into Private_Events table
        if($role == "admin")
        {
            $stmt = $conn->prepare("INSERT INTO Private_Events (UniversityName, EventID, AdminID) VALUES (?, ?, ?)");
            $stmt->bind_param("sii", $universityName, $eventID, $userID);
        }
        else
        {
            $stmt = $conn->prepare("INSERT INTO Private_Events (UniversityName, EventID, SuperAdminID) VALUES (?, ?, ?)");
            $stmt->bind_param("sii", $universityName, $eventID, $userID);
        }
        
        if (!$stmt->execute()) {
            returnWithError("Error inserting into Private_Events: " . $stmt->error, 500);
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