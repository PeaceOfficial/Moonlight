// Import necessary classes from discord.js
import { Client, GatewayIntentBits, CommandInteraction, Interaction, REST, Routes, CommandInteractionOptionResolver } from 'discord.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import mysql from 'mysql2/promise'; // Import mysql2/promise for async MySQL connection

// Load environment variables
dotenv.config({ path: "./vars/.env" }); // Adjust path to ensure correct .env file loading

// Read the package.json file for version
const packageJsonPath = join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Load environment variables
const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;

// Create a new client instance with intents
const moonlight = new Client({ intents: [GatewayIntentBits.Guilds] });

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

    console.log(`[ Moonlight 🌙 ] >> (${version}) : Database '${DB_NAME}' - Is now online...`);
  } catch (err) {
    console.error(`[ Moonlight 🌙 ] >> (${version}) : Error setting up the database:`, err);
  }
};

// Register commands when the bot is ready
moonlight.once('ready', async () => {
  console.log(`[ Moonlight 🌙 ] >> (${version}) : Is now online...`);

  // Setup the MySQL database
  await setupDatabase();

  const rest = new REST({ version: '10' }).setToken(TOKEN as string);

  try {
    // Register guild-specific commands
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID as string, GUILD_ID as string),
      { body: commands }
    );

    console.log(`[ Moonlight 🌙 ] >> (${version}) : Successfully reloaded application (/) commands.`);
  } catch (error) {
    console.error(error);
  }
});

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
  // Check if the interaction is a CommandInteraction
  if (!interaction.isCommand()) return;

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
      console.error(`[ Moonlight 🌙 ] >> (${version}) : Error saving user ID:`, err);
      await commandInteraction.reply('There was an error saving your User ID. Please try again.');
    }
  }

});

// Login to Discord with your bot token
moonlight.login(TOKEN);
