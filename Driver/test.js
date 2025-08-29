const Firefly = require('./firefly-api.js');
require('dotenv').config();

async function test() {
	// Fetch school from code
	var host = await Firefly.getHost(process.env.CODE);
	console.log("Firefly HOST", host);

	// Create instance
	const instance = new Firefly(process.env.HOST);
	instance.setDeviceId(process.env.DEVICE_ID);

	var apiVersion = await instance.apiVersion;
	console.log("API version", apiVersion);

	// Authentication URL
	console.log("Authenticating via ", instance.authUrl);
	instance.authenticate(); //all this does is console.log
	instance.completeAuthentication(process.env.XML);

	const credsAreValid = await instance.verifyCredentials();
	console.log("Credentials are valid:", credsAreValid);

	// Events/timetable
	const startDate = new Date();
	const endDate = new Date();
	endDate.setDate(endDate.getDate() + 7); // Next 7 days
	const events = await instance.getEvents(startDate, endDate);
	console.log("Events", events);

	// Messages
	const messages = await instance.messages;
	console.log("Messages", messages);

	// Bookmarks
	const bookmarks = await instance.bookmarks;
	console.log("Bookmarks", bookmarks);

	// Groups
	const groups = await instance.groups;
	console.log("Groups", groups);

	// Classes
	const classes = await instance.classes;
	console.log("Classes", classes);

	// Tasks
	const tasks = await instance.getTasks();
	console.log("Tasks", tasks);
}

test();