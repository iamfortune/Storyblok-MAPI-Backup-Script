const axios = require("axios");
const fs = require("fs");

require('dotenv').config();

const SPACE_ID = process.env.SPACE_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const API_URL = process.env.API_URL;

async function backupContent() {
  let page = 1;
  let stories = [];

  while (true) {
    try {
      const response = await axios.get(
        `${API_URL}v1/spaces/${SPACE_ID}/stories/`,
        {
          headers: {
            Authorization: `${ACCESS_TOKEN}`,
          },
          params: {
            page,
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
  }
}

backupContent();
