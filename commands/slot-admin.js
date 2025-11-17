const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slotadmin")
        .setDescription("Admin settings for slot system")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub =>
            sub.setName("roleset")
                .setDescription("Set the slot role")
                .addRoleOption(o => o.setName("role").setDescription("New role").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("categoryset")
                .setDescription("Set the slot category")
                .addStringOption(o => o.setName("id").setDescription("Category ID").setRequired(true))
        ),

    async execute(interaction, client, config) {
        const sub = interaction.options.getSubcommand();

        const configPath = path.join(__dirname, "..", "config.json");

        if (sub === "roleset") {
            const role = interaction.options.getRole("role");
            config.slotRole = role.id;

            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            return interaction.reply(`✅ Slot role updated → <@&${role.id}>`);
        }

        if (sub === "categoryset") {
            const id = interaction.options.getString("id");

            if (!interaction.guild.channels.cache.has(id))
                return interaction.reply("❌ Invalid category ID!");

            config.slotCategory = id;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            return interaction.reply(`📁 Slot category updated → <#${id}>`);
        }
    }
};
