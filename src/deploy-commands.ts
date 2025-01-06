import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const commands = [
  new SlashCommandBuilder().setName('esore').setDescription('EsoRE commands')
    .addSubcommand(subcommand =>
      subcommand.setName('info').setDescription('Get the information about a round.')
        .addIntegerOption(option =>
          option.setName('round').setDescription('The round number (optional, latest if not given)').setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand.setName('interpreter').setDescription('Get the interpreter of a round.')
        .addIntegerOption(option =>
          option.setName('round').setDescription('The round number (optional, latest if not given)').setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand.setName('leaderboard').setDescription('Get the leaderboard of a round.')
        .addIntegerOption(option =>
          option.setName('round').setDescription('The round number (optional, latest if not given)').setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand.setName('hall').setDescription('Display the Hall of Fame of EsoRE.')
        .addIntegerOption(option =>
          option.setName('page').setDescription('The page number (optional, first if not given)').setRequired(false)))
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID!),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
