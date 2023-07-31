const fs = require("fs");
const axios = require("axios");
const { createInterface } = require("readline");

const BACKUP_DIR = "./backup";

const handleUpdate = async (storyId, spaceId, oauthToken, storyData) => {
	const apiUrl = `https://mapi.storyblok.com/v1/spaces/${spaceId}/stories/${storyId}`;

	const headers = {
		"Content-Type": "application/json",
		Authorization: `${oauthToken}`,
	};

	try {
		const response = await axios.put(
			apiUrl,
			{ ...storyData, force_update: 1, publish: 1 },
			{ headers }
		);
		return response.data;
	} catch (error) {
		throw error;
	}
};

const promptSpaceId = () => {
	return new Promise((resolve) => {
		readline.question(
			"Enter the space ID you want to sync stories to and press enter: ",
			(spaceId) => {
				if (!spaceId) {
					console.log("No space ID provided, exiting...");
					process.exit();
				}
				resolve(spaceId);
			}
		);
	});
};

const promptOAuthToken = () => {
	return new Promise((resolve) => {
		readline.question(
			"Enter your storyblok OAUTH TOKEN and press enter: ",
			(oauthToken) => {
				resolve(oauthToken);
			}
		);
	});
};

const updateStory = async (storyId) => {
	try {
		const backupFile = `${BACKUP_DIR}/${storyId}.json`;

		// Verify that file exists
		if (!fs.existsSync(backupFile)) {
			console.log(`Backup for Story with ID: ${storyId}, exiting...`);
			process.exit();
		}

		const storyData = JSON.parse(fs.readFileSync(backupFile));

		// Get space ID and OAUTH token from user
		const spaceId = await promptSpaceId();
		const oauthToken = await promptOAuthToken();

		const newStory = await handleUpdate(
			storyId,
			spaceId,
			oauthToken,
			storyData
		);

		console.log(
			`Story "${newStory?.story?.full_slug}" in space ${spaceId} with ID ${newStory?.story?.id} updated from backup successfully!`
		);
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});

readline.question(
	"Enter the ID of the story you want to update: ",
	async (storyId) => {
		if (!storyId) {
			console.log("No ID provided, exiting...");
			process.exit();
		} else {
			await updateStory(storyId);
			readline.close();
		}
	}
);