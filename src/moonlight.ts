// Import necessary classes from discord.js
import { Client, GatewayIntentBits, CommandInteraction, Interaction, REST, Routes } from 'discord.js';

import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv'; // Use named import for dotenv

// Read the package.json file for version
const packageJsonPath = join(__dirname, '..', 'package.json'); // Adjusted path
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

dotenv.config({path: "./vars/.env"}); // To load your .env file containing the bot token

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Create a new client instance with intents
const moonlight = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register the /ping command
const commands = [
  {
    name: 'ping', description: 'Replies with Pong!',
  },
];

// Register commands when the bot is ready
moonlight.once('ready', async () => {
  console.log(`[ Moonlight 🌙 ] >> (${version}) : Is now online...`);

  const rest = new REST({ version: '10' }).setToken(TOKEN as string);

  try {
    // console.log('[ Moonlight 🌙 ] >> (${version}) : Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID as string, TOKEN as string),
      { body: commands }
    );

    console.log('[ Moonlight 🌙 ] >> (${version}) : Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

// Handle interactions (commands, buttons, etc.)
moonlight.on('interactionCreate', async (interaction: Interaction) => {
  // Check if the interaction is a CommandInteraction
  if (!interaction.isCommand()) return;

  const commandInteraction = interaction as CommandInteraction;

  const { commandName } = commandInteraction;

  if (commandName === 'ping') {
    await commandInteraction.reply('🏓 Pong! - Latency: ${latency}ms | API Latency: ${apiLatency}ms');
  }
});

// Login to Discord with your bot token
moonlight.login(TOKEN);
