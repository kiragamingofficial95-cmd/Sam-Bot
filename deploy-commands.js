// DEPLOY-COMMANDS.JS
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

rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
)
.then(() => console.log("✅ All slash commands deployed"))
.catch(console.error);
