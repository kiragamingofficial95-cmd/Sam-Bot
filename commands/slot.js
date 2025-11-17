const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slot")
        .setDescription("Add or remove a slot for a user")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Give slot role + create channel")
                .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Remove slot role + delete channel")
                .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        ),

    async execute(interaction, client, config) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");

        const guild = interaction.guild;
        const member = await guild.members.fetch(user.id);

        const roleId = config.slotRole;
        const categoryId = config.slotCategory;

        if (!guild.roles.cache.has(roleId))
            return interaction.reply({ content: "❌ Role ID in config.json is invalid!", ephemeral: true });

        if (!guild.channels.cache.has(categoryId))
            return interaction.reply({ content: "❌ Category ID in config.json is invalid!", ephemeral: true });

        // ADD SLOT
        if (sub === "add") {
            await member.roles.add(roleId);

            const channel = await guild.channels.create({
                name: `${user.username}-slot`,
                parent: categoryId,
                type: 0,
                permissionOverwrites: [
                    { id: guild.roles.everyone.id, allow: ["ViewChannel", "SendMessages"] }
                ]
            });

            return interaction.reply({
                content: `✅ Slot created for **${user.username}** → <#${channel.id}>`,
            });
        }

        // REMOVE SLOT
        if (sub === "remove") {
            await member.roles.remove(roleId);

            const channel = guild.channels.cache.find(
                c => c.name === `${user.username}-slot`
            );

            if (channel) await channel.delete();

            return interaction.reply({
                content: `❌ Slot removed for **${user.username}**.`,
            });
        }
    }
};
