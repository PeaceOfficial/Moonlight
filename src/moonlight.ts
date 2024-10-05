// Import necessary classes from discord.js
import { Client, GatewayIntentBits, CommandInteraction, Interaction, REST, Routes, CommandInteractionOptionResolver } from 'discord.js';
import { readFileSync } from 'fs';
import path, { join } from 'path';
import * as dotenv from 'dotenv';

// Import connections modules
import express from 'express'; // Import express for apache handling - (apache)
import mysql from 'mysql2/promise'; // Import mysql2/promise for async MySQL connection - (database, mysql)
import ngrok from 'ngrok'; // Import ngrok for tunneling - (domain, api)

// Load environment variables
dotenv.config({ path: "./vars/.env" });

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
//const APACHE_HOST = process.env.APACHE_HOST;
//const APACHE_PORT = process.env.APACHE_PORT;
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

///////////////////////////////////////////////////////////////////////////////// - Express route setup
/* const apache = express();

// Serve static files from the "public" directory
apache.use(express.static(path.join(__dirname, '../moonlight/')));

// Add a simple route
apache.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../moonlight/moonlink/profiles/profiles.php'));
});

// Start the server
apache.listen(APACHE_PORT, () => {
  console.log(`[ Moonlight 🌙 ] >> Apache: Server is listening on : ${APACHE_HOST}:${APACHE_PORT} - host... ✅`);
}); */

///////////////////////////////////////////////////////////////////////////////// - MySQL connection setup
let db: mysql.Connection;

const setupDatabase = async () => {
  try {
    db = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      port: Number(DB_PORT),
    });

    /////////////////////////////////////////////////////////////////////////////////

    // Create the database if it doesn't exist "MOONLINK"
    await db.query(`CREATE DATABASE IF NOT EXISTS moonlink`);
    await db.query(`USE moonlink`);

    // Create a "PROFILES" table if it doesn't exist with default value ...
    await db.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        userid VARCHAR(512),
        username VARCHAR(512),
        profile_effect VARCHAR(512),
        avatar VARCHAR(512),
        banner VARCHAR(512),
        decoration_asset VARCHAR(512),
        decoration_skuId VARCHAR(512),
        decoration_animated VARCHAR(512) DEFAULT 'true',
        PRIMARY KEY (userid)
      )
    `);

    // Add default insert into "PROFILES" table if there is nothing ...
    await db.query(`
      INSERT IGNORE INTO profiles (userid, username, profile_effect, avatar, banner, decoration_asset, decoration_skuId, decoration_animated) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
       ['317206043039891459', '@peaceofficial', '1139323075519852625', 'http://localhost/moonlink/images/avatar_default.png', 'http://localhost/moonlink/images/banner_default.gif', 'a_250640ab00a8837a1d56f35879138177', '100101099222222', 'true']);
    
    // Create a "BADGES" table if it doesn't exist ...
    await db.query(`
      CREATE TABLE IF NOT EXISTS badges (
        userid VARCHAR(512),
        username VARCHAR(512),
        badges_icon VARCHAR(512),
        badges_description VARCHAR(512),
        PRIMARY KEY (userid)
      )
    `);

    /////////////////////////////////////////////////////////////////////////////////

    // Create the database if it doesn't exist - "MOONLIGHT"
    await db.query(`CREATE DATABASE IF NOT EXISTS moonlight`);
    await db.query(`USE moonlight`);

    // Create a "USERS" table if it doesn't exist ...
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        userid VARCHAR(512),
        username VARCHAR(512)
      )
    `);

    console.log(``);
    console.log(`[ Moonlight 🌙 ] >> Mysql: "Succesfully" - Connected to the "Moonlink, Moonlight" - database... ✅`);
  } catch (err) {
    console.error(`[ Moonlight 🌙 ] >> Mysql: "Error" - Setting up the database: "${err}"❌`);
  }
};

///////////////////////////////////////////////////////////////////////////////// - Start Ngrok
const startNgrok = async () => {

  try {
    // Authenticate ngrok using token
    if (NGROK_AUTH_TOKEN) {
      await ngrok.authtoken(NGROK_AUTH_TOKEN);
    }

    // Start ngrok on the default port "80" (you can adjust this based on your server)
    const ngrokUrl = await ngrok.connect({
      addr: `${NGROK_HOST}:${NGROK_PORT}`,  // Connect to localhost and specified port
    });

        
    // Ngrok catch error && default log part
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

///////////////////////////////////////////////////////////////////////////////// - Handle interactions (commands, buttons, etc.)
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

///////////////////////////////////////////////////////////////////////////////// - Ready Function

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
  } catch (error) {
    console.error(error);
  }
});

// Login to Discord with your bot token
moonlight.login(TOKEN);
