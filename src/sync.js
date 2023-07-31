const fs = require("fs");
const axios = require("axios");
const { createInterface } = require("readline");

const BACKUP_DIR = "./backup";

const createStory = async (spaceId, oauthToken, storyData) => {
	const apiUrl = `https://mapi.storyblok.com/v1/spaces/${spaceId}/stories/`;

	const headers = {
		"Content-Type": "application/json",
		Authorization: `${oauthToken}`,
	};

	try {
		const response = await axios.post(
			apiUrl,
			{ ...storyData, publish: 1 },
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

const syncLostStories = async (token) => {
	let page = 1;
	let storyIds = [];

	while (true) {
		try {
			const res = await axios.get("https://api.storyblok.com/v2/cdn/stories", {
				params: {
					page,
					token,
					per_page: 25,
				},
			});

			const { data } = res;
			storyIds.push(...data.stories.map((story) => Number(story.id)));

			if (data.stories.length < 25) {
				break;
			}

			page++;
		} catch (error) {
			console.error("Error occurred while fetching stories:", error?.message);
			process.exit();
		}
	}

	try {
		let remoteStoryIds = fs.readdirSync(BACKUP_DIR).map((fileName) => {
			return fileName.split(".")[0];
		});

		remoteStoryIds = remoteStoryIds.map((id) => Number(id));

		// Find story IDs that are in the remote backup but not in the space
		const lostStoryIds = remoteStoryIds.filter((id) => !storyIds.includes(id));

		console.log(
			`Found ${lostStoryIds.length} lost stories, IDs:`,
			lostStoryIds.join(", ")
		);

		if (lostStoryIds.length === 0) {
			return;
		}

		console.log("Syncing lost stories to space...");

		const handleStoryCreations = async (spaceId, oauthToken) => {
			if (!oauthToken) {
				console.log("No token provided, exiting...");
				process.exit();
			} else {
				for (const storyId of lostStoryIds) {
					try {
						// check if story doesn't exist in backup folder
						if (!fs.existsSync(`${BACKUP_DIR}/${storyId}.json`)) {
							console.log(
								`Story with ID: ${storyId} not found in backup, skipping...`
							);
							continue;
						}

						const data = JSON.parse(
							fs.readFileSync(`${BACKUP_DIR}/${storyId}.json`, {
								encoding: "utf-8",
							})
						);

						const storyToSync = {
							name: data.name,
							slug: data.slug,
							content: data.content,
							parent_id: data.parent_id,
							is_startpage: data.is_startpage,
						};
						const res = await createStory(spaceId, oauthToken, storyToSync);
						console.log(`Story ${res?.story?.name} synced successfully!`);
					} catch (error) {
						throw `Error occurred while syncing stories: ${error?.message}`;
					}
				}
			}
		};

		// Get space ID and OAUTH token from user
		const spaceId = await promptSpaceId();
		const oauthToken = await promptOAuthToken();

		// Sync lost stories to space
		await handleStoryCreations(spaceId, oauthToken);

		readline.close();
	} catch (error) {
		console.log(error);
	}
};

const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});

readline.question(
	"Enter an ACCESS TOKEN of the space you want to sync stories to and press enter: ",
	async (token) => {
		if (!token) {
			console.log("No token provided, exiting...");
			process.exit();
		} else {
			await syncLostStories(token);
			readline.close();
		}
	}
);