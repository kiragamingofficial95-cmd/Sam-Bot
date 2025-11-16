// ===== IMPORTS =====
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

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

// ===== CONFIG =====
const TARGET_USER_ID = "875722667557285939";   // Your client's ID
const EMOJI_ID = "1431503007689740429";         // Animated emoji ID ONLY (no <a:..:..>)

// ===== BOT LOGIC =====
client.on("messageCreate", async (message) => {
    if (message.author.bot) return;

    // Check if target user is mentioned
    if (message.mentions.users.has(TARGET_USER_ID)) {
        try {
            await message.react(EMOJI_ID); // Correct animated emoji usage
            console.log(`Reacted to a message by ${message.author.tag}`);
        } catch (err) {
            console.error("Failed to react to message:", err);
        }
    }
});

// ===== BOT READY =====
client.on("ready", () => {
    console.log(`🔥 Bot is online as ${client.user.tag}`);
});

// ===== LOGIN =====
client.login(process.env.DISCORD_BOT_TOKEN);
