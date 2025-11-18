// deploy-commands.js
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const cmdPath = path.join(__dirname, "commands");
const files = fs.readdirSync(cmdPath).filter(f => f.endsWith(".js"));

for (const file of files) {
  const command = require(path.join(cmdPath, file));
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log("⏳ Registering guild commands...");
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log("✅ Commands registered for guild:", process.env.GUILD_ID);
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
})();
