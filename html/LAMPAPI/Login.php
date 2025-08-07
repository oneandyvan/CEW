<?php

$inData = getRequestInfo();

$userID = 0;
$name = "";
$universityName = "";
$role = "user";

$conn = new mysqli("db", "root", "root_password4710", "cop4710_db"); 	

if($conn->connect_error)
{
	returnWithError( $conn->connect_error );
}
else
{
	$stmt = $conn->prepare("SELECT UserID, Name, UniversityName FROM Users WHERE Email=? AND Password =?");
	$stmt->bind_param("ss", $inData["email"], $inData["password"]);
	$stmt->execute();
	$result = $stmt->get_result();

	if( $row = $result->fetch_assoc()  )
	{
		// Check if user is an admin or superadmin
		$stmt = $conn->prepare("SELECT UserID FROM Admins WHERE UserID=?");
		$stmt->bind_param("i", $row['UserID']);
		$stmt->execute();
		$result = $stmt->get_result();

		// User is an Admin
		if($result->num_rows > 0) {
			$role = "admin";
		} 
		else 
		{
			$stmt = $conn->prepare("SELECT UserID FROM SuperAdmins WHERE UserID=?");
			$stmt->bind_param("i", $row['UserID']);
			$stmt->execute();
			$result = $stmt->get_result();

			// User is a SuperAdmin
			if($result->num_rows > 0) {
				$role = "superadmin";
			}
		}

		returnWithInfo( $row['UserID'], $row['Name'], $row['UniversityName'], $role);
	}
	else
	{
		returnWithError("No Records Found");
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

function returnWithError($err)
{
	$retValue = '{"userID":0,"name":"","universityName":"","role":"","error":"' . $err . '"}';
	sendResultInfoAsJson( $retValue );
}

function returnWithInfo($userID, $name, $universityName, $role )
{
	$retValue = '{"userID":' . $userID . ',"name":"' . $name . '","universityName":"' . $universityName . '","role":"' . $role . '","error":""}';
	sendResultInfoAsJson( $retValue );
}
	
?>
