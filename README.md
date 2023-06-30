### Storyblok-backup-and-Restore-Script
A Node.js script for backing up and restoring content from a [Storyblok](storyblok.com) space

**Description:**

This Node.js script allows you to back up the content of a Storyblok space using the Storyblok Management API. It fetches all stories from the specified space, saves them as individual JSON files, and stores them in a local backup directory. Additionally, the script provides instructions on how to use the Storyblok CLI to push the backup content back to Storyblok.

**Usage:**

1. Install dependencies:

   ```bash
   npm install axios fs dotenv
   ```

2. Set up environment variables:

   - Create a `.env` file in the project directory.
   - Add the following variables to the `.env` file:
     ```dotenv
     SPACE_ID=YOUR_SPACE_ID
     ACCESS_TOKEN=YOUR_ACCESS_TOKEN
     API_URL=STORYBLOK_API_URL
     ```
   - Replace `YOUR_SPACE_ID` with your Storyblok space ID.
   - Replace `YOUR_ACCESS_TOKEN` with your Storyblok Management API access token.
   - Replace `STORYBLOK_API_URL` with the base URL of the Storyblok Management API (e.g., `https://api.storyblok.com/`).
<br />
3. Run the backup script:


   ```bash
   node backup.js
   ```

   The script will start the backup process, fetching stories from the specified Storyblok space and saving them as JSON files in the `./backup` directory.
<br /> 
<br />
4. Push the content using [Storyblok CLI](https://github.com/storyblok/storyblok-cli):

   - Install the Storyblok CLI globally by running
    ```
    npm install -g storyblok-cli` or `yarn global add       storyblok-cli
    ```
   - Ensure you have the [Storyblok CLI](https://github.com/storyblok/storyblok-cli) installed and configured with your Storyblok account credentials.
   - Open a terminal or command prompt and navigate to the project directory.
   - Run the following command to push the backup content to Storyblok:

     ```bash
     storyblok push-component --token=YOUR_ACCESS_TOKEN --path=./backup
     ```

