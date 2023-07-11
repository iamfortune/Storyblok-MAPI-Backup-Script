### Storyblok-backup-script
A Node.js script for backing up content locally from a [Storyblok](storyblok.com) space with the Management API

#### **Description:**

This Node.js script allows you to back up the content of a Storyblok space using the Storyblok Management API. It fetches all stories from the specified space, saves them as individual JSON files, and stores them in a local backup directory. 

#### **Usage: Setting up the repo**

Install the dependencies:

   ```bash
   npm install axios fs dotenv
   ```

### Actions

- Backup your content locally:

```bash 
   npm run backup
```

