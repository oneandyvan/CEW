<?php

$inData = getRequestInfo();

$name = $inData["name"];
$universityName = $inData["universityName"];
$email = $inData["email"];
$password = $inData["password"];
$role = $inData["role"];

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if ($conn->connect_error) 
{
    returnWithError($conn->connect_error);
} 
else 
{
    // Check if email domain is the university's domain
    $universityDomain = getUniversityDomain($universityName, $conn);
    $emailDomain = substr(strrchr($email, "@"), 1);
    if($emailDomain != $universityDomain)
    {
        returnWithError("Please use domain: " . $universityDomain, 400);
        return;
    }

    // Check if the login already exists
    $stmt = $conn->prepare("SELECT UserID FROM Users WHERE Email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($result->num_rows > 0)
    {
        returnWithError("Email already exists", 409);
        return;
    } 
    else 
    {
        // Insert new user into the Users table
        $stmt = $conn->prepare("INSERT INTO Users (Name, UniversityName, Email, Password) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("ssss", $name, $universityName, $email, $password);
        $stmt->execute();

        // Retrieve the ID of the newly registered user
        $stmt = $conn->prepare("SELECT UserID FROM Users WHERE Email=?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            $userID = $row['UserID'];

            //  Add to subtables if necessary
            if ($role === "admin") {
                $stmt = $conn->prepare("INSERT INTO Admins (UserID) VALUES (?)");
                $stmt->bind_param("i", $userID);
                $stmt->execute();
            } else if ($role === "superadmin") {
                $stmt = $conn->prepare("INSERT INTO SuperAdmins (UserID) VALUES (?)");
                $stmt->bind_param("i", $userID);
                $stmt->execute();
            }

            returnWithInfo($userID, $name, $universityName, $role);
        } else {
            returnWithError("Error retrieving new user ID");
        }
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
    $retValue = '{"userID":0,"name":"","universityName":"","role":"","error":"' . $err . '"}';
    sendResultInfoAsJson($retValue);
}

function returnWithInfo($userID, $name, $universityName, $role )
{
    $retValue = '{"userID":' . $userID . ',"name":"' . $name . '","universityName":"' . $universityName . '","role":"' . $role . '","error":""}';
    sendResultInfoAsJson($retValue);
}

function getUniversityDomain($universityName, $conn)
{
    $stmt = $conn->prepare("SELECT Domain FROM Universities WHERE UniversityName = ?");
    $stmt->bind_param("s", $universityName);
    $stmt->execute();

    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        return $row['Domain']; 
    } else {
        // If no domain is found for the university, return an empty string
        return "";
    }
}

?>