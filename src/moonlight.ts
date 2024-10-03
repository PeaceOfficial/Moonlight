// Import necessary classes from discord.js
import { Client, GatewayIntentBits, CommandInteraction, Interaction, REST, Routes, CommandInteractionOptionResolver } from 'discord.js';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import * as dotenv from 'dotenv';

// Import connections modules
import express from 'express'; // Import express for apach connection - (webfolder)
import mysql from 'mysql2/promise'; // Import mysql2/promise for async MySQL connection - (database, mysql)
import ngrok from 'ngrok'; // Import ngrok for tunneling - (domain, api)

// Load environment variables
dotenv.config({ path: "./vars/.env" }); // Adjust path to ensure correct .env file loading

// Read the package.json file for version
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Load environment variables
const TOKEN = process.env.TOKEN;
const CLIENT_NAME = process.env.CLIENT_NAME;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_NAME = process.env.GUILD_NAME;
const GUILD_ID = process.env.GUILD_ID;
const APACHE_PORT = process.env.APACHE_PORT;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;
const NGROK_HOST = process.env.NGROK_HOST;
const NGROK_PORT = process.env.NGROK_PORT;

// Create a new client instance with intents
const moonlight = new Client({ intents: [GatewayIntentBits.Guilds] });

// Apache connection setup
const apache = express();

apache.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the "public" folder

// Start the server
apache.listen(APACHE_PORT, () => {
  console.log(`[ Moonlight 🌙 ] >> Apache: Connected and Listening on: (${APACHE_PORT}) - port... ✅`);
});

// MySQL connection setup
let db: mysql.Connection;

const setupDatabase = async () => {
  try {
    db = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
    });

    // Create the database if it doesn't exist
    await db.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`);
    await db.query(`USE ${DB_NAME}`);

    // Create a users table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        userid VARCHAR(512),
        profile_effect VARCHAR(512),
        avatar VARCHAR(512),
        banner VARCHAR(512),
        badges VARCHAR(512),
        badges_icon VARCHAR(512),
        badges_description VARCHAR(512),
        badges_id VARCHAR(512),
        decoration VARCHAR(512),
        decoration_asset VARCHAR(512),
        decoration_skuId VARCHAR(512),
        decoration_animated VARCHAR(512)
      )
    `);

    console.log(`[ Moonlight 🌙 ] >> Mysql: "Succesfully" - Connected to the "${DB_NAME}" - database... ✅`);
  } catch (err) {
    console.error(`[ Moonlight 🌙 ] >> Mysql: "Error" - Setting up the database: "${err}"❌`);
  }
};

// Start ngrok tunnel
const startNgrok = async () => {

  try {
    // Authenticate ngrok using token
    if (NGROK_AUTH_TOKEN) {
      await ngrok.authtoken(NGROK_AUTH_TOKEN);
    }

    // Start ngrok on the default port 80 (you can adjust this based on your server)
    const ngrokUrl = await ngrok.connect({
      addr: `${NGROK_HOST}:${NGROK_PORT}`,  // Connect to localhost and specified port
    });

        
    // Tunnel 
    console.log(``);
    console.log(`[ Moonlight 🌙 ] >> Ngrok: "Succesfully" - Connected to the "tunnel" <-> "${ngrokUrl}" - domain... ✅`);
    console.log(`[ Moonlight 🌙 ] >> Ngrok: "Succesfully" - Deployed on the "domain" <-> "http://${NGROK_HOST}:${NGROK_PORT}" - host... ✅`);
  } catch (error) {
    console.error(`[ Moonlight 🌙 ] >> Ngrok: "Error" - Starting ngrok tunnel server: "${error}"❌`);
  }
};

// Register the /ping command
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: "save",
    description: 'save test'
  }
];

// Handle interactions (commands, buttons, etc.)
moonlight.on('interactionCreate', async (interaction: Interaction) => {

  if (!interaction.isCommand()) return; // Check if the interaction is a CommandInteraction

  const commandInteraction = interaction as CommandInteraction;

  const { commandName } = commandInteraction;

  if (commandName === 'ping') {
    await commandInteraction.reply('🏓 Pong!');
  }

  else if (commandName === 'save') 
    {
    const options = commandInteraction.options as CommandInteractionOptionResolver;
    const userId = interaction.user.id; // Get the User ID from the interaction
    try {
      await db.query(`
        INSERT INTO \`users\` 
        (userid)
        VALUES 
        ('${userId}');
      `);
      await commandInteraction.reply(`Your User ID ${userId} saved!`);
    } catch (err) {
      console.error(`[ Moonlight 🌙 ] >> Command: "Error" - Saving user ID: ${userId} - ${err} ❌`);
      await commandInteraction.reply('There was an error saving your User ID. Please try again.');
    }
  }

});

///////////////////////////////////////////////////////////////////////////////// START FUNCTIONS

// Register commands when the bot is ready
moonlight.once('ready', async () => {

  await setupDatabase(); // Setup the MySQL database
  await startNgrok(); // Start ngrok tunneling

  const rest = new REST({ version: '10' }).setToken(TOKEN as string);

  try {
    // Register guild-specific commands
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID as string, GUILD_ID as string),
      { body: commands }
    );

    console.log(``);
    console.log(`[ Moonlight 🌙 ] >> Information: "${CLIENT_NAME} - ${CLIENT_ID}" | "(${version})" | - version... 📜`);
    console.log(``);
    console.log(`[ Moonlight 🌙 ] >> Commands: "Succesfully" - Added application (/) - commands... ✅`);
    console.log(``);
    console.log(`[ Moonlight 🌙 ] >> Connection: "Succesfully" - Connected to "${GUILD_NAME} - ${GUILD_ID}" - server... 🚀`);
    console.log(``);

/*     console.log(`[ Moonlight 🌙 ] >> Name: "${CLIENT_NAME}"`);
    console.log(`[ Moonlight 🌙 ] >> Version: "${version}"`);
    console.log(`[ Moonlight 🌙 ] >> Server: "${GUILD_NAME} - ${GUILD_ID}"`);
    console.log(`[ Moonlight 🌙 ] >> Client: "${CLIENT_NAME} - ${CLIENT_ID}"`); */

    //console.log(`[ Moonlight 🌙 ] >> Connection: "${CLIENT_NAME}" ` + `| ` + `Version: "${version}"` + ` has been connected to the ` + ` (${GUILD_ID}) ` + `server... 🚀`);
  } catch (error) {
    console.error(error);
  }
});

// Login to Discord with your bot token
moonlight.login(TOKEN);
