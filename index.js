// ===== IMPORTS =====
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const config = require("./config.json");

// ===== EXPRESS KEEP ALIVE =====
const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
app.listen(process.env.PORT || 3000, () => {
    console.log("🌐 Express keep-alive active");
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

// ===== AUTO LOAD COMMANDS =====
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    client.commands.set(cmd.data.name, cmd);
}

// ===== MESSAGE REACTION CONFIG =====
const TARGET_USER = "875722667557285939";
const EMOJI_ID = "1431503007689740429";

// ===== SLASH COMMAND EXECUTION =====
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client, config);
    } catch (err) {
        console.error(err);
        return interaction.reply({
            content: "⚠️ Command failed!",
            ephemeral: true
        });
    }
});

// ===== MESSAGE REACTION FEATURE =====
client.on("messageCreate", async message => {
    if (message.author.bot) return;

    if (message.mentions.users.has(TARGET_USER)) {
        try {
            await message.react(EMOJI_ID);
        } catch (err) {
            console.error("Reaction error:", err);
        }
    }
});

// ===== BOT ONLINE =====
client.on("ready", () => {
    console.log(`🔥 Bot is online as ${client.user.tag}`);

    client.user.setPresence({
        activities: [{ name: "@everyone", type: 3 }],
        status: "online"
    });
});

// ===== LOGIN =====
client.login(process.env.DISCORD_BOT_TOKEN);
