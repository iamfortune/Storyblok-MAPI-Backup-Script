const fs = require("fs");
const axios = require("axios");
const { createInterface } = require("readline");

require("dotenv").config();

const backupContent = async (token) => {
	let page = 1;
	let stories = [];

	while (true) {
		try {
			const response = await axios.get(
				"https://api.storyblok.com/v2/cdn/stories",
				{
					params: {
						page,
						token,
						per_page: 25,
					},
				}
			);

			const { data } = response;
			stories.push(...data.stories);

			if (data.stories.length < 25) {
				break;
			}

			page++;
		} catch (error) {
			console.error("Error occurred while fetching stories:", error);
			break;
		}
	}

	try {
		if (!fs.existsSync("./backup")) {
			fs.mkdirSync("./backup");
		}

		for (const story of stories) {
			const { id, full_slug } = story;
			const fileName = `./backup/${id}.json`;
			fs.writeFileSync(fileName, JSON.stringify(story));
			console.log(`${full_slug} backed up`);
		}

		console.log("Content backup completed.");
	} catch (error) {
		console.error("Error occurred while writing backup files:", error);
	} finally {
		process.exit();
	}
};

const readline = createInterface({
	input: process.stdin,
	output: process.stdout,
});

readline.question(
	"Enter an ACCESS TOKEN of the space you want to backup and press enter: ",
	(accessToken) => {
		if (accessToken) {
			backupContent(accessToken);
		} else {
			console.log("Content backup skipped.");
		}
	}
);