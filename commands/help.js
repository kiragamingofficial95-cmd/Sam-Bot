// commands/help.js
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("Show bot commands help"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Bot Commands — Help")
      .setColor(0x2B65EC) // blue
      .setDescription("List of available commands. Owner-only commands require the special Owner role or Extra Owners.")
      .addFields(
        { name: "🔧 Owner / Extra Owner Commands", value: "`/slot add @user`\n`/slot remove @user`\n`/extraowner add @user`\n`/extraowner admin @user`\n`/extraowner remove @user`", inline: false },
        { name: "🛠️ Admin (config) Commands", value: "`/slotadmin roleset @role` — set which role is given on slot add\n`/slotadmin categoryset <id>` — set category ID where slot channels should be created", inline: false },
        { name: "ℹ️ Utility", value: "`/help` — this message", inline: false }
      )
      .setFooter({ text: "Contact the Owner for more features" });
    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
