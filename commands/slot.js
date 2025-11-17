const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slot")
        .setDescription("Add or remove a slot for a user")
        .addSubcommand(sub =>
            sub.setName("add")
                .setDescription("Give slot role + create slot channel")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Select a user")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName("remove")
                .setDescription("Remove slot role + delete slot channel")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("Select a user")
                        .setRequired(true)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");

        const guild = interaction.guild;
        const member = await guild.members.fetch(user.id);
        const roleId = "1430534921436528708";
        const categoryId = "1430985538814349362";

        if (sub === "add") {
            await member.roles.add(roleId);

            const channelName = `${user.username}-slot`;

            const channel = await guild.channels.create({
                name: channelName,
                parent: categoryId,
                type: 0,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone.id,
                        allow: ["ViewChannel", "SendMessages"]
                    }
                ]
            });

            return interaction.reply({
                content: `✅ Slot created for **${user.username}**.\nRole added + Channel created: <#${channel.id}>`,
                ephemeral: false,
            });
        }

        if (sub === "remove") {
            await member.roles.remove(roleId);

            const channelName = `${user.username}-slot`;
            const channel = guild.channels.cache.find(ch => ch.name === channelName);

            if (channel) await channel.delete();

            return interaction.reply({
                content: `❌ Slot removed for **${user.username}**.\nRole removed + Channel deleted.`,
                ephemeral: false,
            });
        }
    }
};
