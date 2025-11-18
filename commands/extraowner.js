// commands/extraowner.js
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

const ownersPath = path.join(__dirname, "..", "extraOwners.json");
const configPath = path.join(__dirname, "..", "config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extraowner")
    .setDescription("Manage extra owners (Owner role only)")
    .addSubcommand(s => s.setName("add").setDescription("Add normal extra owner").addUserOption(o => o.setName("user").setDescription("User").setRequired(true)))
    .addSubcommand(s => s.setName("admin").setDescription("Add admin extra owner (full access)").addUserOption(o => o.setName("user").setDescription("User").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove an extra owner").addUserOption(o => o.setName("user").setDescription("User").setRequired(true))),
  async execute(interaction, helpers) {
    const { fs } = helpers;
    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");

    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const ownerRoleId = cfg.ownerRoleId;
    // Only members with the owner role can use
    if (!interaction.member.roles.cache.has(ownerRoleId)) {
      return interaction.reply({ content: "❌ Only members with the Owner role can manage extra owners.", ephemeral: true });
    }

    const owners = JSON.parse(fs.readFileSync(ownersPath, "utf8"));

    if (sub === "add") {
      if (owners.normal.includes(user.id) || owners.admin.includes(user.id)) {
        return interaction.reply({ content: "⚠️ User is already an extra owner.", ephemeral: true });
      }
      owners.normal.push(user.id);
      fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));
      return interaction.reply({ content: `✅ ${user.tag} added as extra owner (normal).` });
    }

    if (sub === "admin") {
      if (owners.admin.includes(user.id)) return interaction.reply({ content: "⚠️ Already admin extra owner.", ephemeral: true });
      owners.normal = owners.normal.filter(id => id !== user.id);
      owners.admin.push(user.id);
      fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));
      return interaction.reply({ content: `✅ ${user.tag} added as admin extra owner (full access).` });
    }

    // remove
    owners.normal = owners.normal.filter(id => id !== user.id);
    owners.admin = owners.admin.filter(id => id !== user.id);
    fs.writeFileSync(ownersPath, JSON.stringify(owners, null, 2));
    return interaction.reply({ content: `❌ ${user.tag} removed from extra owners (if existed).` });
  }
};
