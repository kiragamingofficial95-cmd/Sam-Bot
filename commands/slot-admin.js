// commands/slot-admin.js
const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slotadmin")
    .setDescription("Admin settings for slot system (Owner role or Extra Owner admin only)")
    .addSubcommand(s => s.setName("roleset").setDescription("Set slot role").addRoleOption(o => o.setName("role").setDescription("Role").setRequired(true)))
    .addSubcommand(s => s.setName("categoryset").setDescription("Set slot category (ID)").addStringOption(o => o.setName("id").setDescription("Category ID").setRequired(true))),
  async execute(interaction, helpers) {
    const { configPath, isOwnerOrExtraAdmin, fs } = helpers;
    const memberInvoker = interaction.member;
    if (!isOwnerOrExtraAdmin(memberInvoker)) {
      return interaction.reply({ content: "❌ Only the Owner role or Extra Owners (admin) can use this command.", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const configPathResolved = path.join(__dirname, "..", "config.json");

    if (sub === "roleset") {
      const role = interaction.options.getRole("role");
      cfg.slotRole = role.id;
      fs.writeFileSync(configPathResolved, JSON.stringify(cfg, null, 2));
      return interaction.reply({ content: `✅ Slot role set to ${role.name} (${role.id})`, ephemeral: true });
    } else {
      const id = interaction.options.getString("id").trim();
      if (!interaction.guild.channels.cache.has(id)) {
        return interaction.reply({ content: "❌ Invalid category ID in this server.", ephemeral: true });
      }
      cfg.slotCategory = id;
      fs.writeFileSync(configPathResolved, JSON.stringify(cfg, null, 2));
      return interaction.reply({ content: `✅ Slot category set → <#${id}>`, ephemeral: true });
    }
  }
};
