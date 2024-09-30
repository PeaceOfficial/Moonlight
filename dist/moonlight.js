"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary classes from discord.js
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = require("path");
// Read the package.json file for version
const packageJsonPath = (0, path_1.join)(__dirname, '..', 'package.json'); // Adjusted path
const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf8'));
const version = packageJson.version;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
// Create a new client instance with intents
const moonlight = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
// Register the /ping command
const commands = [
    {
        name: 'ping', description: 'Replies with Pong!',
    },
];
// Register commands when the bot is ready
moonlight.once('ready', async () => {
    console.log(`[ Moonlight 🌙 ] >> (${version}) : Is now online...`);
    const rest = new discord_js_1.REST({ version: '10' }).setToken(BOT_TOKEN);
    try {
        // console.log('[ Moonlight 🌙 ] >> (${version}) : Started refreshing application (/) commands.');
        await rest.put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('[ Moonlight 🌙 ] >> (${version}) : Successfully reloaded application (/) commands.');
    }
    catch (error) {
        console.error(error);
    }
});
// Handle interactions (commands, buttons, etc.)
moonlight.on('interactionCreate', async (interaction) => {
    // Check if the interaction is a CommandInteraction
    if (!interaction.isCommand())
        return;
    const commandInteraction = interaction;
    const { commandName } = commandInteraction;
    if (commandName === 'ping') {
        await commandInteraction.reply('🏓 Pong! - Latency: ${latency}ms | API Latency: ${apiLatency}ms');
    }
});
// Login to Discord with your bot token
moonlight.login(BOT_TOKEN);
