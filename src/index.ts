import { Hero } from "./components/hero";
import { API_ENVIRONMENT_VARIABLE_KEY, DB_FILE_NAME } from "./config";
import { DB } from "./lib/db";
import { Paragraph } from "./components/paragtaph";
import { confirm } from "@inquirer/prompts";

async function main() {
  // Show Hero text
  await Hero();

  const _DB = new DB(DB_FILE_NAME);
  // Check project initialization
  if (!_DB.exists()) {
    Paragraph({
      tag: "warning",
      text: "This directory isn't used before.",
    });

    // Start initialization process
    Paragraph({
      tag: "info",
      text: "In order to save your settings and chat history, we need to initialize a local database.",
    });
    const initializable = await confirm({
      message: "Don't you mind to make a database for Hack Club AI CLI?",
    });
    if (initializable) {
      Paragraph({
        tag: "success",
        text: "Great! Initializing...",
      });
    } else {
      Paragraph({
        tag: "info",
        text: "Initialization rejected. Exiting...",
      });
      process.exit(0);
    }
  }

  // Connect to the database
  _DB.connect();

  // Then, check if there is `HACK_CLUB_AI_API_KEY` in the environment variables
  const apiKey = process.env[API_ENVIRONMENT_VARIABLE_KEY];
  if (!apiKey) {
    Paragraph({
      tag: "warning",
      text: `You don't have your Hack Club AI API key set in the environment variables.`,
    });
    Paragraph({
      tag: "warning",
      text: `Please visit https://ai.hackclub.com/dashboard to get your API key and set it in the environment variable named ${API_ENVIRONMENT_VARIABLE_KEY}.`,
    });
    Paragraph({
      tag: "info",
      text: `After setting the environment variable, please restart the application.`,
    });
    process.exit(0);
  }
}

/* RUN ! */
main();
