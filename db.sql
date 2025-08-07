CREATE TABLE Locations (
	LocationID INT AUTO_INCREMENT,
	Name CHAR(50),
	Longitude REAL,
	Latitude REAL,
	PRIMARY KEY (LocationID));

CREATE TABLE Universities (
	UniversityName CHAR(50),
	NumStudents INT,
	Domain CHAR(30),
	Description TEXT,
	LocationID INT NOT NULL,
	PRIMARY KEY (UniversityName),
    FOREIGN KEY (LocationID) REFERENCES Locations(LocationID));

CREATE TABLE Users (
	UserID INT AUTO_INCREMENT,
	UniversityName CHAR(50) NOT NULL,
    Name CHAR(50),
    Email CHAR(50),
    Password CHAR(32),
    UNIQUE (Email),
    PRIMARY KEY (UserID),
    FOREIGN KEY (UniversityName) REFERENCES Universities(UniversityName));

CREATE TABLE Admins (
	UserID INT,
	PRIMARY KEY (UserID),
	FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE);

CREATE TABLE SuperAdmins (
	UserID INT,
	PRIMARY KEY (UserID),
	FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE);

CREATE TABLE Events (
	EventID INT AUTO_INCREMENT,
	LocationID INT NOT NULL,
	EventName CHAR(50),
	Time DATETIME,
	Phone CHAR(15),
	Email CHAR(50),
	PRIMARY KEY (EventID),
	UNIQUE (LocationID, Time),
	FOREIGN KEY (LocationID) REFERENCES Locations(LocationID));

CREATE TABLE RSO_Events (
	EventID INT,
	RSOName CHAR(50) NOT NULL,
	PRIMARY KEY (EventID),
	FOREIGN KEY (RSOName) REFERENCES RSOs(RSOName) ON DELETE CASCADE,
FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE);

CREATE TABLE Private_Events (
	EventID INT,
	AdminID INT,
	SuperAdminID INT,
	UniversityName CHAR(50),
	PRIMARY KEY (EventID),
	FOREIGN KEY (AdminID) REFERENCES Admins(UserID),
	FOREIGN KEY (SuperAdminID) REFERENCES SuperAdmins(UserID),
	FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
	CHECK (
    	(AdminID IS NOT NULL AND SuperAdminID IS NULL) OR
    	(AdminID IS NULL AND SuperAdminID IS NOT NULL)
	));

CREATE TABLE Public_Events (
	EventID INT,
	AdminID INT,
	SuperAdminID INT,
	PRIMARY KEY (EventID),
	FOREIGN KEY (AdminID) REFERENCES Admins(UserID),
	FOREIGN KEY (SuperAdminID) REFERENCES SuperAdmins(UserID),
	FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
	CHECK (
    	(AdminID IS NOT NULL AND SuperAdminID IS NULL) OR
    	(AdminID IS NULL AND SuperAdminID IS NOT NULL)
	));

CREATE TABLE Comments (
	CommentID INT AUTO_INCREMENT,
    EventID INT,
	UserID INT,
	Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	Text TEXT,
	Rating INT,
	PRIMARY KEY (CommentID),
	FOREIGN KEY (EventID) REFERENCES Events(EventID) ON DELETE CASCADE,
	FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CHECK (Rating BETWEEN 1 AND 5));

CREATE TABLE RSOs (
	RSOName CHAR(50),
	UniversityName CHAR(50) NOT NULL,
	AdminID INT NOT NULL,
	Status	CHAR(10),
	Description TEXT,
	PRIMARY KEY (RSOName),
	FOREIGN KEY (UniversityName) REFERENCES Universities(UniversityName),
	FOREIGN KEY (AdminID) REFERENCES Admins(UserID));

CREATE TABLE Students_RSOs (
	RSOName CHAR(50),
	UserID INT,
	PRIMARY KEY (RSOName, UserID),
	FOREIGN KEY (RSOName) REFERENCES RSOs(RSOName) ON DELETE CASCADE,
	FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE);

DELIMITER $$

	CREATE TRIGGER RSOStatusActive
	AFTER INSERT ON Students_RSOs
	FOR EACH ROW BEGIN
		IF((SELECT COUNT(*) FROM Students_RSOs M where M.RSOName = NEW.RSOName) > 4)
			THEN
				UPDATE RSOs
				SET Status = 'active'
				WHERE RSOName = NEW.RSOName;
		END IF;
	END$$

	CREATE TRIGGER RSOStatusInactive
	AFTER DELETE ON Students_RSOs
	FOR EACH ROW BEGIN
		IF((SELECT COUNT(*) FROM Students_RSOs M where M.RSOName = OLD.RSOName) < 5)
			THEN
				UPDATE RSOs
				SET Status = 'inactive'
				WHERE RSOName = OLD.RSOName;
		END IF;
	END$$

	CREATE TRIGGER UpdateUserEmailDomain
	AFTER UPDATE ON Universities
	FOR EACH ROW BEGIN
		IF OLD.Domain != NEW.Domain THEN
			UPDATE Users
			SET Email = CONCAT(SUBSTRING_INDEX(Email, '@', 1), '@', NEW.Domain)
			WHERE UniversityName = NEW.UniversityName;
		END IF;
	END$$

DELIMITER ;