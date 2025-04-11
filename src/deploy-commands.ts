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
      subcommand.setName('submit').setDescription('Submit your solution for a task.')
        .addIntegerOption(option =>
          option.setName('task').setDescription('The task number.').setRequired(true))
        .addAttachmentOption(option =>
          option.setName('file').setDescription('The file to submit.').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('hall').setDescription('Display the Hall of Fame of EsoRE.')
        .addIntegerOption(option =>
          option.setName('page').setDescription('The page number (optional, first if not given)').setRequired(false))),
  new SlashCommandBuilder().setName('eadmin').setDescription('EsoRE admin commands')
    .addSubcommand(subcommand =>
      subcommand.setName('start').setDescription('Start a new round.')
        .addAttachmentOption(option =>
          option.setName('data').setDescription('Round data.').setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand.setName('verify').setDescription('Start the verification process for the next entry in the queue.'))
    .addSubcommand(subcommand =>
      subcommand.setName('submitas').setDescription('Submit someone\'s solution for a task.')
        .addIntegerOption(option =>
          option.setName('task').setDescription('The task number.').setRequired(true))
        .addAttachmentOption(option =>
          option.setName('file').setDescription('The file to submit.').setRequired(true))
        .addUserOption(option =>
          option.setName('user').setDescription('The user to submit as.').setRequired(true)))
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
