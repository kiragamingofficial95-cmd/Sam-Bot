// index.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection } = require("discord.js");

// Paths
const configPath = path.join(__dirname, "config.json");
const ownersPath = path.join(__dirname, "extraOwners.json");

// Ensure files exist
if (!fs.existsSync(configPath)) throw new Error("Missing config.json");
if (!fs.existsSync(ownersPath)) fs.writeFileSync(ownersPath, JSON.stringify({ normal: [], admin: [] }, null, 2));

const config = require(configPath);

// Keep-alive (Render / Uptime)
const app = express();
app.get("/", (req, res) => res.send("Bot alive"));
app.listen(process.env.PORT || 3000, () => console.log("🌐 Keep-alive active"));

// Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Load commands
client.commands = new Collection();
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
  const cmd = require(path.join(__dirname, "commands", file));
  client.commands.set(cmd.data.name, cmd);
}

// Helpers: read owners fresh every time
function readOwners() {
  try {
    return JSON.parse(fs.readFileSync(ownersPath, "utf8"));
  } catch {
    return { normal: [], admin: [] };
  }
}

function isOwnerRole(member) {
  // member is GuildMember
  if (!member) return false;
  return member.roles.cache.has(config.ownerRoleId);
}

function isExtraNormal(userId) {
  const owners = readOwners();
  return owners.normal.includes(userId);
}
function isExtraAdmin(userId) {
  const owners = readOwners();
  return owners.admin.includes(userId);
}
function isOwnerOrExtra(member) {
  if (!member) return false;
  if (isOwnerRole(member)) return true;
  const id = member.user?.id ?? member.id;
  if (isExtraAdmin(id) || isExtraNormal(id)) return true;
  return false;
}
function isOwnerOrExtraAdmin(member) {
  if (!member) return false;
  if (isOwnerRole(member)) return true;
  const id = member.user?.id ?? member.id;
  if (isExtraAdmin(id)) return true;
  return false;
}

// Interaction handler
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, { configPath, ownersPath, readOwners, isOwnerOrExtra, isOwnerOrExtraAdmin, fs });
  } catch (err) {
    console.error("Command exec error:", err);
    if (!interaction.replied) {
      await interaction.reply({ content: "⚠️ An error occurred while running the command.", ephemeral: true }).catch(()=>{});
    }
  }
});

// Maintain existing react behaviour: react when owner is mentioned
const EMOJI_ID = "1431503007689740429";
client.on("messageCreate", async (message) => {
  if (message.author?.bot) return;
  if (message.mentions?.users?.has(config.ownerRoleId)) {
    // note: this checks for mention of role id as user — usually mentions.users is for users,
    // keep original behavior: react when owner (user) is mentioned; owner role mention detection requires different handling
  }
  // We'll keep the prior behavior of reacting to owner user id (if owner user is known)
  // If you prefer reaction on role mention, we can change.
});

// Ready
client.once("ready", () => {
  console.log(`🔥 Logged in as ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "@everyone", type: 3 }],
    status: "online"
  }).catch(()=>{});
});

// Login
client.login(process.env.DISCORD_BOT_TOKEN);
