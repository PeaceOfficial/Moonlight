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
// Import connections modules
const promise_1 = __importDefault(require("mysql2/promise")); // Import mysql2/promise for async MySQL connection - (database, mysql)
const ngrok_1 = __importDefault(require("ngrok")); // Import ngrok for tunneling - (domain, api)
// Load environment variables
dotenv.config({ path: "./vars/.env" });
// Read the package.json file for version
const packageJsonPath = (0, path_1.join)(__dirname, '..', 'package.json');
const packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf8'));
const version = packageJson.version;
// Load environment variables
const TOKEN = process.env.TOKEN;
const CLIENT_NAME = process.env.CLIENT_NAME;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_NAME = process.env.GUILD_NAME;
const GUILD_ID = process.env.GUILD_ID;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_PORT = process.env.DB_PORT;
const NGROK_AUTH_TOKEN = process.env.NGROK_AUTH_TOKEN;
const NGROK_HOST = process.env.NGROK_HOST;
const NGROK_PORT = process.env.NGROK_PORT;
// Create a new client instance with intents
const moonlight = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
console.log(`[ Moonlight 🌙 ] >> Apache: Connection created trough "httpd.exe" | Listening on: (80) - port... ✅`);
console.log(`[ Moonlight 🌙 ] >> Mysql: Connected created trough "mysqld.exe" | Listening on: (3306) - port... ✅`);
///////////////////////////////////////////////////////////////////////////////// - MySQL connection setup
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
        console.log(``);
        console.log(`[ Moonlight 🌙 ] >> Mysql: "Succesfully" - Connected to the "${DB_NAME}" - database... ✅`);
    }
    catch (err) {
        console.error(`[ Moonlight 🌙 ] >> Mysql: "Error" - Setting up the database: "${err}"❌`);
    }
};
///////////////////////////////////////////////////////////////////////////////// - Start Ngrok
const startNgrok = async () => {
    try {
        // Authenticate ngrok using token
        if (NGROK_AUTH_TOKEN) {
            await ngrok_1.default.authtoken(NGROK_AUTH_TOKEN);
        }
        // Start ngrok on the default port 80 (you can adjust this based on your server)
        const ngrokUrl = await ngrok_1.default.connect({
            addr: `${NGROK_HOST}:${NGROK_PORT}`, // Connect to localhost and specified port
        });
        // Ngrok catch error && default log part
        console.log(``);
        console.log(`[ Moonlight 🌙 ] >> Ngrok: "Succesfully" - Connected to the "tunnel" <-> "${ngrokUrl}" - domain... ✅`);
        console.log(`[ Moonlight 🌙 ] >> Ngrok: "Succesfully" - Deployed on the "domain" <-> "http://${NGROK_HOST}:${NGROK_PORT}" - host... ✅`);
    }
    catch (error) {
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
moonlight.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand())
        return; // Check if the interaction is a CommandInteraction
    const commandInteraction = interaction;
    const { commandName } = commandInteraction;
    if (commandName === 'ping') {
        await commandInteraction.reply('🏓 Pong!');
    }
    else if (commandName === 'save') {
        const options = commandInteraction.options;
        const userId = interaction.user.id; // Get the User ID from the interaction
        try {
            await db.query(`
        INSERT INTO \`users\` 
        (userid)
        VALUES 
        ('${userId}');
      `);
            await commandInteraction.reply(`Your User ID ${userId} saved!`);
        }
        catch (err) {
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
    const rest = new discord_js_1.REST({ version: '10' }).setToken(TOKEN);
    try {
        // Register guild-specific commands
        await rest.put(discord_js_1.Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log(``);
        console.log(`[ Moonlight 🌙 ] >> Information: "${CLIENT_NAME} - ${CLIENT_ID}" | "(${version})" | - version... 📜`);
        console.log(``);
        console.log(`[ Moonlight 🌙 ] >> Commands: "Succesfully" - Added application (/) - commands... ✅`);
        console.log(``);
        console.log(`[ Moonlight 🌙 ] >> Connection: "Succesfully" - Connected to "${GUILD_NAME} - ${GUILD_ID}" - server... 🚀`);
        console.log(``);
    }
    catch (error) {
        console.error(error);
    }
});
// Login to Discord with your bot token
moonlight.login(TOKEN);
