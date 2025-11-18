// commands/slot.js
const { SlashCommandBuilder, ChannelType } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("slot")
    .setDescription("Add or remove a slot for a user (Owner / Extra Owners only).")
    .addSubcommand(s => s.setName("add").setDescription("Give slot role + create channel").addUserOption(o => o.setName("user").setDescription("User").setRequired(true)))
    .addSubcommand(s => s.setName("remove").setDescription("Remove slot role + delete channel").addUserOption(o => o.setName("user").setDescription("User").setRequired(true))),
  async execute(interaction, helpers) {
    const { configPath, isOwnerOrExtra, fs } = helpers;
    const memberInvoker = interaction.member;
    if (!isOwnerOrExtra(memberInvoker)) {
      return interaction.reply({ content: "❌ Only the bot Owner role or Extra Owners can use this command.", ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();
    const user = interaction.options.getUser("user");
    const guild = interaction.guild;
    if (!guild) return interaction.reply({ content: "This command must be used in a server.", ephemeral: true });

    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const roleId = cfg.slotRole;
    const categoryId = cfg.slotCategory;

    if (!guild.roles.cache.has(roleId)) return interaction.reply({ content: "❌ Config role not found in this server.", ephemeral: true });
    if (!guild.channels.cache.has(categoryId)) return interaction.reply({ content: "❌ Config category not found in this server.", ephemeral: true });

    // fetch member object
    let targetMember;
    try { targetMember = await guild.members.fetch(user.id); } catch (e) { return interaction.reply({ content: "Could not fetch member.", ephemeral: true }); }

    if (sub === "add") {
      try {
        await targetMember.roles.add(roleId);
      } catch (e) {
        console.error("Add role failed:", e);
        return interaction.reply({ content: "Failed to add role. Check bot permissions and role hierarchy.", ephemeral: true });
      }

      const channelName = `${user.username}-slot`.slice(0,95);
      try {
        const ch = await guild.channels.create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: categoryId,
          permissionOverwrites: [
            { id: guild.roles.everyone.id, allow: ["ViewChannel", "SendMessages"] }
          ]
        });
        return interaction.reply({ content: `✅ Slot created: <#${ch.id}> for ${user.tag}` });
      } catch (e) {
        console.error("Create channel failed:", e);
        return interaction.reply({ content: "Role added but failed to create channel. Check bot Manage Channels permission in that category.", ephemeral: true });
      }
    } else { // remove
      try { await targetMember.roles.remove(roleId); } catch (e) { console.error("Remove role failed:", e); }
      const chName = `${user.username}-slot`.slice(0,95);
      const ch = guild.channels.cache.find(c => c.name === chName && c.type === ChannelType.GuildText);
      if (ch) {
        try { await ch.delete(); } catch (e) { console.error("Delete ch:", e); }
      }
      return interaction.reply({ content: `❌ Slot removed for ${user.tag}` });
    }
  }
};
