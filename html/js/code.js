const urlBase = 'LAMPAPI';
const extension = 'php';
const DEFAULT_LONGITUDE = 28.6024;
const DEFAULT_LATITUDE = -81.2001;

let userID = 0;
let userName = "";
let universityName = "";
let role = "";
let userEmail = "";
let profileMap;
let addMap;
let addMapMarker;
let rsos;
let currMemberCount = 0;
let ownedRSOs;
let rsoEvents;
let privateEvents;
let publicEvents;
let commentList;

//	Some navbar stuff for scrolling 
window.onscroll = function() {
    const navbar = document.getElementById('nav');
    if(window.scrollY > 100) { 
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

//	Login, register, and logout functions.
function doLogin()
{
	userID = 0;
	userName = "";
	universityName = "";
	role = "";
	
	const email = document.getElementById("loginEmail").value;
	const password = document.getElementById("loginPassword").value;
	const hash = md5(password);
	
	document.getElementById("loginResult").innerHTML = "";

	const tmp = {
		email:email,
		password:hash
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				userID = jsonObject.userID;
		
				if( userID < 1 )
				{		
					document.getElementById("loginResult").innerHTML = "Username/Password combination incorrect";
					document.getElementById("loginResultDiv").style.display = "block";
					return;
				}
		
				userName = jsonObject.name;
				universityName = jsonObject.universityName;
				role = jsonObject.role;
				userEmail = email;

				saveCookie();
	
				// Hide the error message.
				document.getElementById("loginResultDiv").style.display = "none";
				window.location.href = "info.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
}

function doRegister()
{
	const name = document.getElementById("registerName").value;
	const email = document.getElementById("registerEmail").value;
	const password = document.getElementById("registerPassword").value;
	const regUniversityName = document.querySelector('option:checked').value;
	const regRole = document.querySelector('input[type="radio"]:checked').value;

	const hash = md5(password);
	
	document.getElementById("registerResult").innerHTML = "";



	const tmp = {
		name:name,
		universityName:regUniversityName,
		email:email,
		password:hash,
		role:regRole
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/Register.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				
				if(this.status == 200) 
				{
					userID = jsonObject.userID;
					userName = jsonObject.name;
					universityName = jsonObject.universityName;
					role = jsonObject.role;
					userEmail = email;

					saveCookie();
		
					// Hide the error message.
					document.getElementById("registerResultDiv").style.display = "none";
					window.location.href = "info.html";
				}
				else if(this.status == 400 || this.status == 409)
				{
					document.getElementById("registerResultDiv").style.display = "block";
					document.getElementById("registerResult").innerHTML = jsonObject.error;
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log(err);
		document.getElementById("registerResultDiv").style.display = "block";
		document.getElementById("registerResult").innerHTML = err.message;
	}
}

//	"Clears" cookie and return to login
function doLogout()
{
	userID = 0;
	userName = "";
	universityName = "";
	role = "";
	document.cookie = "userName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "login.html";
}

//	Universities
function fetchUniversities(limit)
{
	const tmp = {
		limit:limit
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/FetchUniversities.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					//console.log(jsonObject.totalResults);
					const universityList = jsonObject.results;

					const selectList = document.getElementById("registerUniversity");

					universityList.forEach(university => {
						const option = document.createElement("option");
						option.value = university.UniversityName;
						option.text = university.UniversityName;
						selectList.appendChild(option);
					});
				}	
				else
				{
					console.log("No universities found!");
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("registerResult").innerHTML = err.message;
	}
}

function getUniversity(universityName)
{
	const tmp = {
		universityName:universityName
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/GetUniversity.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					document.getElementById("profileUniversityName").innerHTML = universityName;
					document.getElementById("profileNumStudents").innerHTML = jsonObject.NumStudents;
					document.getElementById("profileDomain").innerHTML = jsonObject.Domain;
					document.getElementById("profileDescription").innerHTML = jsonObject.Description;
					document.getElementById("profileLocationName").innerHTML = jsonObject.Location.Name;
					document.getElementById("profileLocationLongitude").innerHTML = jsonObject.Location.Longitude;
					document.getElementById("profileLocationLatitude").innerHTML = jsonObject.Location.Latitude;

					profileMap = L.map('profileMap').setView([jsonObject.Location.Longitude, jsonObject.Location.Latitude], 13);

					// University Location Tile
					L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; OpenStreetMap'
					}).addTo(profileMap);

					// University Location Tile
					L.marker([jsonObject.Location.Longitude, jsonObject.Location.Latitude]).addTo(profileMap)
					.bindPopup(jsonObject.Location.Name)
					.openPopup();

				}	
				else
				{
					console.log("No university found!");
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("No university found!");
	}
}

//	Pre-set existing information for editing when opening edit profile modal
function prepareEditProfile()
{
	fetchLocations(100, "editProfile");

	document.getElementById("editProfileNum").value = document.getElementById("profileNumStudents").innerHTML;
	document.getElementById("editProfileDomain").value = document.getElementById("profileDomain").innerHTML;
	document.getElementById("editProfileDescription").value = document.getElementById("profileDescription").innerHTML;

	const currentLocationName = document.getElementById("profileLocationName").innerHTML;
	const selectList = document.getElementById("editProfileLocation");
	for (let i = 0; i < selectList.options.length; i++) {
		if (selectList.options[i] === currentLocationName) {
			selectList.selectedIndex = i;
			break;
		}
	}
}

function updateProfile()
{
	const numStudents = document.getElementById("editProfileNum").value;
	const domain = document.getElementById("editProfileDomain").value;
	const description = document.getElementById("editProfileDescription").value;
	const locationID = document.querySelector('#editProfileLocation option:checked').value;

	const tmp = {
		universityName:universityName,
		numStudents:numStudents,
		domain:domain,
		description:description,
		locationID: locationID
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/UpdateUniversity.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					userEmail = userEmail.split('@')[0] + "@" + domain;
					saveCookie();

					document.getElementById("profileNumStudents").innerHTML = document.getElementById("editProfileNum").value;
					document.getElementById("profileDomain").innerHTML = document.getElementById("editProfileDomain").value;
					document.getElementById("profileDescription").innerHTML = document.getElementById("editProfileDescription").value;

					//	Get associated location information for updating
					getLocation(locationID).then(locationInfo => {
						document.getElementById("profileLocationName").innerHTML = locationInfo.Name;
						document.getElementById("profileLocationLongitude").innerHTML = locationInfo.Longitude;
						document.getElementById("profileLocationLatitude").innerHTML = locationInfo.Latitude;

							profileMap.setView([locationInfo.Longitude, locationInfo.Latitude], 13);

						// University Location Tile
						L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '&copy; OpenStreetMap'
						}).addTo(profileMap);

						// University Location Tile
						L.marker([locationInfo.Longitude, locationInfo.Latitude]).addTo(profileMap)
						.bindPopup(locationInfo.Name)
						.openPopup();

						closeModalForm("editProfile");
					});
				}	
				else
				{
					console.log("Trouble updating university!");
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log(err);
	}
}

//	Locations
function fetchLocations(limit, modal)
{
	const tmp = {
		limit:limit
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/FetchLocations.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					//console.log(jsonObject.totalResults);
					const locationList = jsonObject.results;

					const selectLocationList = document.getElementById(`${modal}Location`);

					// Set to keep track of already added LocationIDs
					const existingLocationIDs = new Set();

					selectLocationList.querySelectorAll(`#${modal}Location option`).forEach(option => {
						existingLocationIDs.add(option.value);
					});

					locationList.forEach(location => {
						if (!existingLocationIDs.has(location.LocationID)) {
							const option = document.createElement("option");
							option.value = location.LocationID;
							option.text = location.Name;
							selectLocationList.appendChild(option);
							existingLocationIDs.add(location.LocationID);  // Add to the set to avoid duplicates
						}
					});
					
				}	
				else
				{
					console.log("No locations found!");
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("No locations found!");
	}
}

function getLocation(locationID) {
    return new Promise((resolve, reject) => {
        const tmp = {
            locationID: locationID
        };
        const jsonPayload = JSON.stringify(tmp);

        const url = urlBase + '/GetLocation.' + extension;

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

        try {
            xhr.onreadystatechange = function() {
                if (this.readyState == 4) {
                    const jsonObject = JSON.parse(xhr.responseText);
                    if (this.status == 200) {
                        resolve(jsonObject); 
                    } else {
                        reject("No location found!"); 
                    }
                }
            };
            xhr.send(jsonPayload);
        } catch (err) {
            reject("No location found!"); 
        }
    });
}

function addLocation()
{ 
	document.getElementById("addLocationName").value = "UCF Campus";
	document.getElementById("addLocationLongitude").value = DEFAULT_LONGITUDE;
	document.getElementById("addLocationLatitude").value = DEFAULT_LATITUDE;
    addMap = L.map('addLocationMap').setView([DEFAULT_LONGITUDE, DEFAULT_LATITUDE], 13); 
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(addMap);

    // Add click event to capture latitude and longitude on map click
    addMap.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

		document.getElementById("addLocationLongitude").value = lat;
		document.getElementById("addLocationLatitude").value = lng;
                
        // Create or move the marker to the clicked location
        if (addMapMarker) {
            addMapMarker.setLatLng(e.latlng); 
        } else {
            addMapMarker = L.marker(e.latlng).addTo(addMap);
        }
    });
}

function addLocationSubmit() {
	const locationName = document.getElementById("addLocationName").value;
	const longitude = document.getElementById("addLocationLongitude").value;
	const latitude = document.getElementById("addLocationLatitude").value;

	const tmp = {
		locationName:locationName,
		longitude: longitude,
		latitude:latitude
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/AddLocation.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );

				//console.log(jsonObject.LocationID);
				closeModalForm("addLocation");
			}
			else if(this.readyState == 4 &&this.status == 409)
			{
				alert("Duplicate location details!");
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("Couldn't add location!");
	}
}

//	RSOs
function prepareAddRSO()
{
	document.getElementById("addRSOName").value = "";
	document.getElementById("addRSODescription").value = "";
	document.getElementById("addRSOUniversity").value = universityName;
	document.getElementById("addRSOAdminEmail").value = userEmail;
	document.getElementById("addRSOMembers").value = "";
	document.getElementById("sameDomainFeedback").style.visibility = "hidden";
}

function addRSO()
{
	const rsoName = document.getElementById("addRSOName").value;
	const description = document.getElementById("addRSODescription").value;
	const members_text = document.getElementById("addRSOMembers").value;

	//	Array of cleaned member emails
	const members = members_text.split(",").map(member => member.trim());

	//	Check valid domains
	const universityDomain = userEmail.split("@")[1];
	let domainFlag = false;
	members.forEach(member => {
		if(member.split("@")[1] !== universityDomain)
		{
			domainFlag = true;
		}
	});
	console.log(members);
	if(domainFlag && members.length > 1)
	{
		document.getElementById("sameDomainFeedback").style.visibility = "visible";
		return;
	}
	document.getElementById("sameDomainFeedback").style.visibility = "hidden";	

	const tmp = {
		RSOName: rsoName,
		UniversityName: universityName,
		AdminID: userID,
		Description: description,
		Members: members
	};
	const jsonPayload = JSON.stringify(tmp);

	const url = urlBase + '/AddRSO.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					//	Adjust status on frontend
					const RSOStatus = members.length < 4 ? 'inactive' : 'active';

					// Create the card content
					const card = document.createElement("div");
					card.classList.add("col-md-4", "mb-4");
					card.innerHTML = `
					<div id="${rsoName}Card" class="card">
						<div class="card-header">
							<h5 class="card-title">${rsoName}</h5>
							<h6 class="card-subtitle mb-2 text-muted id="${rsoName}Status"">${RSOStatus}</h6>
						</div>
						<div class="card-body">
							<p class="card-text">${description}</p>
							<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editRSO" onclick="editRSO('${rsoName}')">Change Members</button>
						</div>
					</div>
					`;
				
				// Append the card to the rsoList
				rsoList.appendChild(card);

					closeModalForm("addRSO");
				}
				else if(this.status == 404 && members.length > 1)
				{
					closeModalForm("addRSO");
					alert(jsonObject.error);
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("Couldn't add RSO!");
	}
}

function editRSO(rsoName)
{
	getRSOUsers(rsoName);
	document.getElementById("editRSOAdminEmail").value = userEmail;
	document.getElementById("addUserButton").onclick = () => addUserRSO(rsoName);
	document.getElementById("deleteUserButton").onclick = () => deleteUserRSO(rsoName);
}

function addUserRSO(rsoName)
{
	const email = document.getElementById("editRSOInput").value;

	const tmp = {
		RSOName : rsoName,
		Email : email
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/AddUserRSO.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if(this.readyState == 4)
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					//	Change client-side when 4 -> 5
					if(currMemberCount == 4) 
					{
						document.getElementById(`${rsoName}Status`).innerHTML = 'active'
					}

					closeModalForm("editRSO");
				}
				else
				{
					alert(jsonObject.error);
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("Couldn't add user to RSO!");
	}
}

function deleteUserRSO(rsoName)
{
	const email = document.getElementById("editRSOInput").value;

	const tmp = {
		RSOName : rsoName,
		Email : email
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/DeleteUserRSO.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if(this.readyState == 4)
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					//	Change client-side when 4 -> 5
					if(currMemberCount == 5) 
					{
						document.getElementById(`${rsoName}Status`).innerHTML = 'inactive';
					}

					closeModalForm("editRSO");
				}
				else
				{
					alert(jsonObject.error);
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("Couldn't delete user from RSO!");
	}
}

function fetchRSOs(page, type, callback)
{
	//	Type will determine the query, either get all RSOs from University or all RSOs associated with admin ID
	const tmp = {
		UniversityName : universityName,
		UserID : userID,
		Type : type
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/FetchRSOs.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if(this.status == 200)
				{
					rsos = jsonObject.RSOs;
					
					if(page === 'RSO')
					{
						const rsoList = document.getElementById("rsoList");
		
						rsos.forEach(rso => {
							const card = document.createElement("div");
							card.classList.add("col-md-4", "mb-4");

							// Create the card content
							card.innerHTML = `
								<div class="card">
									<div class="card-header">
										<h5 class="card-title">${rso.RSOName}</h5>
										<h6 class="card-subtitle mb-2 text-muted" id="${rso.RSOName}Status">${rso.Status}</h6>
									</div>
									<div class="card-body">
										<p class="card-text">${rso.Description}</p>
										<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#editRSO" onclick="editRSO('${rso.RSOName}')">Change Members</button>
									</div>
								</div>
							`;
							
							// Append the card to the rsoList
							rsoList.appendChild(card);
						});
					}
					else if(page == 'RSOEvents')
					{
						const selectRSOList = document.getElementById(`addEventRSO`);

						// Set to keep track of already added LocationIDs
						const existingRSONames = new Set();

						selectRSOList.querySelectorAll("#addEventRSO option").forEach(option => {
							existingRSONames.add(option.value);
						});

						rsos.forEach(rso => {
							if (!existingRSONames.has(rso.RSOName)) {
								const option = document.createElement("option");
								option.value = rso.RSOName;
								option.text = rso.RSOName;
								selectRSOList.appendChild(option);
								existingRSONames.add(rso.RSOName);  // Add to the set to avoid duplicates
							}
						});
					}
					else if(page == 'RSOEvents_Add')
					{
						//	Keep track of owned RSOs
						ownedRSOs = new Set();

						rsos.forEach(rso => {
							ownedRSOs.add(rso.RSOName);
						});
						if (callback) callback(); // async
					}
					
				}	
				else
				{
					console.log("No RSOs found!");
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("No RSOs found!");
	}
}

function getRSOUsers(rsoName)
{
	const tmp = {
		RSOName:rsoName
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/FetchRSOUsers.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );

				currMemberCount = jsonObject.count;
				const members = jsonObject.Members;
				const existingMemberEmails = new Set();

				const memberList = document.getElementById("editRSOMemberList");
				memberList.innerHTML = ""; // Clear existing list
    
				members.forEach(member => {
					if(!existingMemberEmails.has(member.Email))
					{
						const memberRow = document.createElement("div");

						// Create the card content
						memberRow.innerHTML = `
							<div class="d-inline-flex pb-1 gap-3">
								<h5>${member.Name}</h5>
								<div>${member.Email}</div>
							</div>
						`;
						
						// Append the card to the rsoList
						memberList.appendChild(memberRow);
						existingMemberEmails.add(member.Email);
					}
				});
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

//	Events
function prepareAddEvent(isRSOEvent)
{
	fetchLocations(100, "addEvent");
	document.getElementById("addEventName").value = "";
	document.getElementById("addEventPhone").value = "";
	document.getElementById("addEventEmail").value = "";
	if(isRSOEvent)
	{
		document.getElementById("ownRSOIssue").style.visibility = "hidden";
	}
	document.getElementById("startHourIssue").style.visibility = "hidden";
}

function addRSOEvent()
{
	fetchRSOs("RSOEvents_Add", "user", () => {
		const locationID = document.getElementById("addEventLocation").value;
		const eventName = document.getElementById("addEventName").value;
		const time = document.getElementById("addEventDateTime").value;
		const contactPhone = document.getElementById("addEventPhone").value;
		const contactEmail = document.getElementById("addEventEmail").value;
		const rsoName = document.getElementById("addEventRSO").value;

		const topHourCheck = time.split(":")[1] === "00";
		const ownRSOCheck = ownedRSOs.has(rsoName);

		document.getElementById("ownRSOIssue").style.visibility = ownRSOCheck ? "hidden" : "visible";
		document.getElementById("startHourIssue").style.visibility = topHourCheck ? "hidden" : "visible";

		if(!topHourCheck || !ownRSOCheck)
		{
			return;
		}
		
		const tmp = {
			LocationID:locationID,
			EventName: eventName,
			Time: time,
			Phone: contactPhone,
			Email: contactEmail,
			RSOName: rsoName
		};

		const jsonPayload = JSON.stringify( tmp );
	
		const url = urlBase + '/AddRSOEvent.' + extension;

		let xhr = new XMLHttpRequest();
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
		try
		{
			xhr.onreadystatechange = function() 
			{
				if(this.readyState == 4)
				{
					const jsonObject = JSON.parse( xhr.responseText );
					if (this.status == 200) 
					{
						eventID = jsonObject.EventID;

						const container = document.getElementById("rso-events-list");

						const card = document.createElement("div");
						card.className = "card mb-2 p-3";

						card.innerHTML = `
							<h3>${eventName}</h3>
							<p><strong>RSO:</strong> ${rsoName}</p>
							<p><strong>Time:</strong> ${time}</p>
							<p><strong>Phone:</strong> ${contactPhone}</p>
							<p><strong>Email:</strong> ${contactEmail}</p>
							<button onclick="viewEvent(${eventID}, ${locationID})" class="btn" data-bs-toggle="modal" data-bs-target="#viewEvent">More Details</button>
						`;

						container.appendChild(card);
						closeModalForm("addEvent");
					}
					else if(this.status == 409)
					{
						alert(jsonObject.error);
					}
				}
			};
			xhr.send(jsonPayload);
		}
		catch(err)
		{
			console.log("Couldn't add RSO Event!");
		}
	});
}

function addPrivateEvent()
{
	const locationID = document.getElementById("addEventLocation").value;
	const eventName = document.getElementById("addEventName").value;
	const time = document.getElementById("addEventDateTime").value;
	const contactPhone = document.getElementById("addEventPhone").value;
	const contactEmail = document.getElementById("addEventEmail").value;

	const topHourCheck = time.split(":")[1] === "00";

	document.getElementById("startHourIssue").style.visibility = topHourCheck ? "hidden" : "visible";

	if(!topHourCheck)
	{
		return;
	}
	
	const tmp = {
		LocationID:locationID,
		EventName: eventName,
		Time: time,
		Phone: contactPhone,
		Email: contactEmail,
		UniversityName: universityName,
		UserID: userID,
		Role: role
	};

	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/AddPrivateEvent.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if(this.readyState == 4)
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if (this.status == 200) 
				{
					eventID = jsonObject.EventID;

					const container = document.getElementById("private-events-list");

					const card = document.createElement("div");
					card.className = "card mb-2 p-3";

					card.innerHTML = `
						<h3>${eventName}</h3>
						<p><strong>Time:</strong> ${time}</p>
						<p><strong>Phone:</strong> ${contactPhone}</p>
						<p><strong>Email:</strong> ${contactEmail}</p>
						<button onclick="viewEvent(${eventID}, ${locationID})" class="btn" data-bs-toggle="modal" data-bs-target="#viewEvent">More Details</button>
					`;

					container.appendChild(card);
					closeModalForm("addEvent");
				}
				else if(this.status == 409)
				{
					alert(jsonObject.error);
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("Couldn't add Private Event!");
	}
}

function addPublicEvent()
{
	const locationID = document.getElementById("addEventLocation").value;
	const eventName = document.getElementById("addEventName").value;
	const time = document.getElementById("addEventDateTime").value;
	const contactPhone = document.getElementById("addEventPhone").value;
	const contactEmail = document.getElementById("addEventEmail").value;

	const topHourCheck = time.split(":")[1] === "00";

	document.getElementById("startHourIssue").style.visibility = topHourCheck ? "hidden" : "visible";

	if(!topHourCheck)
	{
		return;
	}
	
	const tmp = {
		LocationID:locationID,
		EventName: eventName,
		Time: time,
		Phone: contactPhone,
		Email: contactEmail,
		UserID: userID,
		Role: role
	};

	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/AddPublicEvent.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if(this.readyState == 4)
			{
				const jsonObject = JSON.parse( xhr.responseText );
				if (this.status == 200) 
				{
					eventID = jsonObject.EventID;

					const container = document.getElementById("public-events-list");

					const card = document.createElement("div");
					card.className = "card mb-2 p-3";

					card.innerHTML = `
						<h3>${eventName}</h3>
						<p><strong>Time:</strong> ${time}</p>
						<p><strong>Phone:</strong> ${contactPhone}</p>
						<p><strong>Email:</strong> ${contactEmail}</p>
						<button onclick="viewEvent(${eventID}, ${locationID})" class="btn" data-bs-toggle="modal" data-bs-target="#viewEvent">More Details</button>
					`;

					container.appendChild(card);
					closeModalForm("addEvent");
				}
				else if(this.status == 409)
				{
					alert(jsonObject.error);
				}
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("Couldn't add Public Event!");
	}
}

function viewEvent(eventID, locationID)
{
	//	Get Event's location info
	getLocation(locationID).then(locationInfo => {
		document.getElementById("eventLocationName").innerHTML = locationInfo.Name;
		document.getElementById("eventLocationLongitude").innerHTML = locationInfo.Longitude;
		document.getElementById("eventLocationLatitude").innerHTML = locationInfo.Latitude;
	});

	//	Assign onclick to AddComment
	document.getElementById("addCommentButton").onclick = () => addComment(eventID);;

	//	Populate comments in event modal
	fetchComments(eventID);
}

function fetchRSOEvents(userID)
{
	const tmp = {
		UserID:userID
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/FetchRSOEvents.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				rsoEvents = jsonObject.RSO_Events;

				const container = document.getElementById("rso-events-list");
				container.innerHTML = ''; // Clear previous results

				rsoEvents.forEach(event => {
					const card = document.createElement("div");
					card.className = "card mb-2 p-3";

					card.innerHTML = `
						<h3>${event.EventName}</h3>
						<p><strong>RSO:</strong> ${event.RSOName}</p>
						<p><strong>Time:</strong> ${event.Time}</p>
						<p><strong>Phone:</strong> ${event.Phone}</p>
						<p><strong>Email:</strong> ${event.Email}</p>
						<button onclick="viewEvent(${event.EventID}, ${event.LocationID})" class="btn" data-bs-toggle="modal" data-bs-target="#viewEvent">More Details</button>
					`;

					container.appendChild(card);
    			});
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

function fetchPrivateEvents()
{
	const tmp = {
		UniversityName:universityName
	};
	const jsonPayload = JSON.stringify( tmp );
	
	const url = urlBase + '/FetchPrivateEvents.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				privateEvents = jsonObject.Private_Events;

				const container = document.getElementById("private-events-list");
				container.innerHTML = ''; // Clear previous results

				privateEvents.forEach(event => {
					const card = document.createElement("div");
					card.className = "card mb-2 p-3";

					card.innerHTML = `
						<h3>${event.EventName}</h3>
						<p><strong>Time:</strong> ${event.Time}</p>
						<p><strong>Phone:</strong> ${event.Phone}</p>
						<p><strong>Email:</strong> ${event.Email}</p>
						<button onclick="viewEvent(${event.EventID}, ${event.LocationID})" class="btn" data-bs-toggle="modal" data-bs-target="#viewEvent">More Details</button>
					`;

					container.appendChild(card);
    			});
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

function fetchPublicEvents()
{
	const url = urlBase + '/FetchPublicEvents.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				publicEvents = jsonObject.Public_Events;

				const container = document.getElementById("public-events-list");
				container.innerHTML = ''; // Clear previous results

				publicEvents.forEach(event => {
					const card = document.createElement("div");
					card.className = "card mb-2 p-3";

					card.innerHTML = `
						<h3>${event.EventName}</h3>
						<p><strong>Time:</strong> ${event.Time}</p>
						<p><strong>Phone:</strong> ${event.Phone}</p>
						<p><strong>Email:</strong> ${event.Email}</p>
						<button onclick="viewEvent(${event.EventID}, ${event.LocationID})" class="btn" data-bs-toggle="modal" data-bs-target="#viewEvent">More Details</button>
					`;

					container.appendChild(card);
    			});
			}
		};
		xhr.send();
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

//	Comments
function addComment(eventID)
{
	const rating = document.querySelector('#addCommentRating option:checked').value;;
	const text = document.getElementById("addCommentField").value;

	const tmp = {
		EventID : eventID,
		UserID : userID,
		Rating : rating,
		Text : text
	};
	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/AddComment.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				commentID = jsonObject.CommentID;
				timestamp = jsonObject.Timestamp;

				const container = document.getElementById("comments-list");

				const card = document.createElement("div");
				card.className = "p-2";
				card.id = `comment-${commentID}`;

				card.innerHTML = `
				<div class="card p-3">
					<div class="d-flex justify-content-between">
						<small class="text-muted">User ID: ${userID}</small>
						<small class="text-muted" id="comment-timestamp-${commentID}">${new Date(timestamp).toLocaleString()}</small>
					</div>
					
					<p class="mb-1 mt-2" id="comment-text-${commentID}" contenteditable="false">${text}</p>
					
					<div class="text-end">
						<span class="badge bg-secondary">Rating: 
							<select id="comment-rating-${commentID}" disabled>
								<option value="1" ${rating == 1 ? 'selected' : ''}>1</option>
								<option value="2" ${rating == 2 ? 'selected' : ''}>2</option>
								<option value="3" ${rating == 3 ? 'selected' : ''}>3</option>
								<option value="4" ${rating == 4 ? 'selected' : ''}>4</option>
								<option value="5" ${rating == 5 ? 'selected' : ''}>5</option>
							</select>
						</span>
					</div>
					
					<div class="d-flex justify-content-left">
						<button class="btn" onClick="editComment(${userID}, ${commentID})">Edit</button>
						<button class="btn" onClick="saveComment(${commentID})" style="display: none;">Save</button>
						<button class="btn" onClick="deleteComment(${userID}, ${commentID})">Delete</button>
					</div>
				</div>
				`;

				container.appendChild(card);
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

function editComment(commentUserID, commentID)
{
	if(commentUserID !== userID)
	{
		alert("You are not allowed to modify this comment!")
		return;
	}

	const commentText = document.querySelector(`#comment-text-${commentID}`);
	const commentRating = document.querySelector(`#comment-rating-${commentID}`);

	const commentButtons = document.querySelectorAll(`#comment-${commentID} .justify-content-left button`);

	commentText.contentEditable = true;
	commentRating.disabled = false;

	commentButtons[0].style.display = 'none';
	commentButtons[1].style.display = 'inline-block';
}

function saveComment(commentID)
{
	console.log(commentID);
	const text = document.querySelector(`#comment-text-${commentID}`).innerText;
	const rating = document.querySelector(`#comment-rating-${commentID}`).value;

	const tmp = {
		CommentID:commentID,
		Text:text,
		Rating:rating
	};
	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/UpdateComment.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText);
				const commentText = document.querySelector(`#comment-text-${commentID}`);
				const commentRating = document.querySelector(`#comment-rating-${commentID}`);
				const commentTimestamp = document.querySelector(`#comment-timestamp-${commentID}`);

				const commentButtons = document.querySelectorAll(`#comment-${commentID} .justify-content-left button`);

				commentTimestamp.innerHTML = new Date(jsonObject.Timestamp).toLocaleString();

				commentText.contentEditable = false;
				commentRating.disabled = true;

				commentButtons[0].style.display = 'inline-block';
				commentButtons[1].style.display = 'none';
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

function deleteComment(commentUserID, commentID)
{
	if(commentUserID !== userID)
	{
		alert("You are not allowed to delete this comment!")
		return;
	}

	const tmp = {
		CommentID:commentID
	};
	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/DeleteComment.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const comment = document.getElementById(`comment-${commentID}`);
				comment.remove();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

function fetchComments(eventID)
{
	const tmp = {
		EventID:eventID
	};
	const jsonPayload = JSON.stringify( tmp );

	const url = urlBase + '/FetchComments.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	try
	{
		xhr.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200) 
			{
				const jsonObject = JSON.parse( xhr.responseText );
				commentList = jsonObject.Comments;

				const container = document.getElementById("comments-list");
				container.innerHTML = ''; // Clear previous results

				commentList.forEach(comment => {
					const card = document.createElement("div");
					card.className = "p-2";
					card.id = `comment-${comment.CommentID}`;

					card.innerHTML = `
						<div class="card p-3">
							<div class="d-flex justify-content-between">
								<small class="text-muted">User ID: ${comment.UserID}</small>
								<small class="text-muted" id="comment-timestamp-${comment.CommentID}">${new Date(comment.Timestamp).toLocaleString()}</small>
							</div>
							
							<p class="mb-1 mt-2" id="comment-text-${comment.CommentID}" contenteditable="false">${comment.Text}</p>
							
							<div class="text-end">
								<span class="badge bg-secondary">Rating: 
									<select id="comment-rating-${comment.CommentID}" disabled>
										<option value="1" ${comment.Rating == 1 ? 'selected' : ''}>1</option>
										<option value="2" ${comment.Rating == 2 ? 'selected' : ''}>2</option>
										<option value="3" ${comment.Rating == 3 ? 'selected' : ''}>3</option>
										<option value="4" ${comment.Rating == 4 ? 'selected' : ''}>4</option>
										<option value="5" ${comment.Rating == 5 ? 'selected' : ''}>5</option>
									</select>
								</span>
							</div>
							
							<div class="d-flex justify-content-left">
								<button class="btn" onClick="editComment(${comment.UserID}, ${comment.CommentID})">Edit</button>
								<button class="btn" onClick="saveComment(${comment.CommentID})" style="display: none;">Save</button>
								<button class="btn" onClick="deleteComment(${comment.UserID}, ${comment.CommentID})">Delete</button>
							</div>
						</div>
					`;

					container.appendChild(card);
    			});
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("totally wrong!");
	}
}

// Close a modal.
function closeModalForm(modalId)
{
	// If the modal is open, hide it.
	const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
	if (modal)
	{
		modal.hide();
	}
}

//	Toggles password
function passwordVisToggle(inputField, eyeIcon)
{
	eyeIcon.addEventListener("click", function(){
		this.classList.toggle("fa-eye-slash");
		const type = inputField.getAttribute("type") === "password" ? "text" : "password";
		inputField.setAttribute("type", type);
	  });
}

// Cookies
function saveCookie()
{
	let minutes = 60;
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));	
	document.cookie = "userName=" + userName + ",userID=" + userID + ",role=" + role + ",university=" + universityName + ",userEmail=" + userEmail + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userID = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(let i = 0; i < splits.length; i++) 
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "userName" )
		{
			userName = tokens[1];
		}
		else if( tokens[0] == "role")
		{
			role = tokens[1];
		}
		else if( tokens[0] == "university")
		{
			universityName = tokens[1];
		}
		else if( tokens[0] == "userEmail")
			{
				userEmail = tokens[1];
			}
		else if( tokens[0] == "userID" )
		{
			userID = parseInt( tokens[1].trim() );
		}
	}
	
	if( userID < 0 )
	{
		window.location.href = "login.html";
	}
}

function loadUserInfo()
{
	readCookie();
	console.log(document.cookie);
	document.getElementById("navUser").innerHTML = userName + " (" + role + ")";
}

function toggleVisible(element, show)
{
	if(show)
	{
		if(element.classList.contains("uiNavBar"))
		{
			element.classList.remove("d-none");
			element.classList.add("d-flex");
		}
		if(element.classList.contains("nav-item"))
		{	
			element.classList.remove("d-none");
			element.classList.add("d-block");
		}
		element.style.visibility = "visible";
	}
	else
	{
		if(element.classList.contains("uiNavBar"))
			{
				element.classList.add("d-none");
				element.classList.remove("d-flex");
			}
			if(element.classList.contains("nav-item"))
			{	
				element.classList.add("d-none");
				element.classList.remove("d-block");
			}
		element.style.visibility = "hidden";
	}
}

//	Hides features or pages depending on user role
function profilePerms(role)
{
	const user_elements = document.querySelectorAll(".perm-user");
	const admin_elements = document.querySelectorAll(".perm-admin");
	const superadmin_elements = document.querySelectorAll(".perm-superadmin");

	if(role === "superadmin")
	{    
		user_elements.forEach(element => {
			toggleVisible(element, false);
		});
		admin_elements.forEach(element => {
			toggleVisible(element, false);
		});
		superadmin_elements.forEach(element => {
			toggleVisible(element, true);
		});
	}
	else if(role === "admin")
	{
		user_elements.forEach(element => {
			toggleVisible(element, false);
		});
		superadmin_elements.forEach(element => {
			toggleVisible(element, false);
		});
		admin_elements.forEach(element => {
			toggleVisible(element, true);
		});
	}
	else
	{
		admin_elements.forEach(element => {
			toggleVisible(element, false);
		});
		superadmin_elements.forEach(element => {
			toggleVisible(element, false);
		});
		user_elements.forEach(element => {
			toggleVisible(element, true);
		});
	}
}