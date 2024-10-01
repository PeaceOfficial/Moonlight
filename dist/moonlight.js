"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import necessary classes from discord.js
const discord_js_1 = require("discord.js");
const fs_1 = require("fs");
const path_1 = require("path");
const dotenv = __importStar(require("dotenv"));
const promise_1 = __importDefault(require("mysql2/promise")); // Import mysql2/promise for async MySQL connection
// Load environment variables
dotenv.config({ path: "./vars/.env" }); // Adjust path to ensure correct .env file loading
// Read the package.json file for version
const packageJsonPath = (0, path_1.join)(__dirname, '..', 'package.json');
const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf8'));
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
const moonlight = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
// MySQL connection setup
let db;
const setupDatabase = async () => {
    try {
        db = await promise_1.default.createConnection({
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
      CREATE TABLE IF NOT EXISTS fakeProfile (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        profile_effect VARCHAR(255),
        banner VARCHAR(512),
        avatar VARCHAR(512),
        decoration_asset VARCHAR(255),
        decoration_skuId VARCHAR(255),
        decoration_animated BOOLEAN
      )
    `);
        console.log(`[ Moonlight 🌙 ] >> (${version}) : Database '${DB_NAME}' - Is now online...`);
    }
    catch (err) {
        console.error(`[ Moonlight 🌙 ] >> (${version}) : Error setting up the database:`, err);
    }
};
// Register the commands
const commands = [
    {
        name: 'ping',
        description: 'Replies with Pong!',
    },
    {
        name: 'saveuserid',
        description: 'Saves the provided username and your User ID to the database',
        options: [
            {
                type: 3, // STRING type
                name: 'user',
                description: 'The username to save',
                required: true,
            },
        ],
    },
];
// Register commands when the bot is ready
moonlight.once('ready', async () => {
    console.log(`[ Moonlight 🌙 ] >> (${version}) : Is now online...`);
    // Setup the MySQL database
    await setupDatabase();
    const rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
    try {
        // Register guild-specific commands
        await rest.put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log(`[ Moonlight 🌙 ] >> (${version}) : Successfully reloaded application (/) commands.`);
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
        await commandInteraction.reply('🏓 Pong!');
    }
    else if (commandName === 'saveuserid') {
        const options = commandInteraction.options;
        const username = options.getString('user'); // Get the username from the command
        const userId = interaction.user.id; // Get the User ID from the interaction
        try {
            // Save the User ID and username to the database
            await db.query(`
        INSERT INTO fakeProfile (id, user_id, profile_effect) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE user_id = ?, profile_effect = ?
      `, [userId, userId, username, userId, username]); // Use ON DUPLICATE KEY to update if exists
            await commandInteraction.reply(`Your User ID ${userId} and username "${username}" have been saved!`);
        }
        catch (err) {
            console.error(`[ Moonlight 🌙 ] >> (${version}) : Error saving user ID:`, err);
            await commandInteraction.reply('There was an error saving your User ID. Please try again.');
        }
    }
});
// Login to Discord with your bot token
moonlight.login(TOKEN);
