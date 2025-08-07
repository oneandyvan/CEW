# College Event Website (CEW)
Full-stack (LAMP) project made for COP 4710, demonstrating understanding of relational database design with SQL. The website is a CRUD program that deals with events for a college with attributes such as location and time. Access levels are considered between the Student user, Admin user, and Superadmin user.

## Design Report
The **COP4710_ProjectReport.pdf** file breaks down the specifications of the project, including the Entity-Relation Model and the implementation of constraints.

## Docker Build Instructions
This application was hosted locally on a M1 MacBook Air, using Docker to set up the LAMP stack. 

In the repo directory is the source code and installation files:

Docker Compose file, "docker-compose.yml" inside contains information for the database to create container with prerequisite technologies and set up pathing. This includes Apache, MySQL database, and phpMyAdmin images to be installed for the container.

Dockerfile is included in same directory that builds with MySQLi extension 

To build the container:
docker-compose build


To start the container:
docker-compose up -d

db.sql file is the schema that can be imported
