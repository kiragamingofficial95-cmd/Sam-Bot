const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// === CONFIG ===
const TARGET_USER_ID = "875722667557285939"; 
const EMOJI = "<a:slotz:1431503007689740429>";

// === BOT LOGIC ===
client.on("messageCreate", async (message) => {
    if (message.author.bot) return; // ignore bots

    // check if the target user is mentioned
    if (message.mentions.users.has(TARGET_USER_ID)) {
        try {
            await message.react(EMOJI);
            console.log(`Reacted to a message by ${message.author.tag}`);
        } catch (err) {
            console.error("Failed to react to message:", err);
        }
    }
});

// === LOGIN ===
client.login("MTQzOTQ5MTg2ODY2MzQ4MDM2MA.G8Bd5j.my1Q-KDOA0XFn1sIcQHRJQ598K2XlsPERx9pms");

client.on("ready", () => {
    console.log(`Bot is online as ${client.user.tag}`);
});
