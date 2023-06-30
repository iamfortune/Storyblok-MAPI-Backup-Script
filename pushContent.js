const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const BACKUP_DIR = "./backup";
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

function pushContent() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);

    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);

      // Push the backedup content using the Storyblok CLI
      exec(
        `storyblok push-component --token=${ACCESS_TOKEN} --path=${filePath}`,
        (error, stdout, stderr) => {
          if (error) {
            console.error(`Error occurred while pushing ${file}:`, error);
          } else if (stderr) {
            console.error(`Error occurred while pushing ${file}:`, stderr);
          } else {
            console.log(`Successfully pushed ${file}`);
          }
        }
      );
    }

    console.log("Content push completed.");
  } catch (error) {
    console.error("Error occurred while pushing content:", error);
  }
}

pushContent();
