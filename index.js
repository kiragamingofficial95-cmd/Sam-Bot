// ===== IMPORTS =====
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

// ===== EXPRESS KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => {
    res.send("Bot is running!");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Express server is active");
});

// ===== DISCORD CLIENT =====
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();

// ===== LOAD COMMANDS (auto load commands folder) =====
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// ===== CONFIG =====
const TARGET_USER_ID = "875722667557285939";
const EMOJI_ID = "1431503007689740429"; // React emoji ID only

// ===== SLOT COMMAND HANDLER =====
client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: "⚠️ Error executing command!",
            ephemeral: true,
        });
    }
});

// ===== MESSAGE REACTION LOGIC =====
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    if (message.mentions.users.has(TARGET_USER_ID)) {
        try {
            await message.react(EMOJI_ID);
            console.log(`Reacted to message by ${message.author.tag}`);
        } catch (err) {
            console.error("Reaction failed:", err);
        }
    }
});

// ===== BOT READY =====
client.on("ready", () => {
    console.log(`🔥 Bot is online as ${client.user.tag}`);

    // BOT STATUS
    client.user.setPresence({
        activities: [{ name: "@everyone", type: 3 }], // Watching @everyone
        status: "online"
    });
});

// ===== LOGIN =====
client.login(process.env.DISCORD_BOT_TOKEN);
