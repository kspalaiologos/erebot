import { Client, GatewayIntentBits, CommandInteractionOptionResolver, AttachmentBuilder } from 'discord.js';
import * as dotenv from 'dotenv';
import {
  openDb, GameRow, TaskRow, SolutionRow,
  fetchGameRow, fetchHallOfFame, fetchLeaderboardForRound, fetchSolvedByTableForRound, fetchTasksForRound
} from './database';
import {
  sendSuccessEmbed,
  sendSuccessEmbedWithAttachment,
  sendErrorEmbed,
} from './embed';
import { formatPlural, formatUtcTime, trimTrailing } from './util';
import { Database } from 'sqlite3';

dotenv.config();

let db: Database;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers],
});

client.once('ready', async () => {
  db = await openDb();
  console.log(`Logged in as ${client.user?.tag}!`);
});

const isRoundActive = (row: GameRow) => {
  const now = new Date(Date.now());
  const start = row['start_time_utc'] ? new Date(parseInt(row['start_time_utc']) * 1000) : null;
  const end = row['end_time_utc'] ? new Date(parseInt(row['end_time_utc']) * 1000) : null;
  if (start == null || end == null) return false;
  return start <= now && now <= end;
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;
  const options = interaction.options as CommandInteractionOptionResolver;

  if (commandName === 'esore') {
    switch(options.getSubcommand()) {
      case 'info': {
        const row = await fetchGameRow(db, options.getInteger('round'));
        if (!row) {
          await sendErrorEmbed(interaction, 'Error', 'Round not found.');
          return;
        }
        const tasks = await fetchTasksForRound(db, row['id']);
        const formattedTasks = tasks.map((task, i) => `${i+1}. ${trimTrailing(task.description, '.')}: **${formatPlural(task.points, "point")}**`).join('\n');
        await sendSuccessEmbed(interaction, `Round ${row['id']}`,
`### ${row['name']} (${formatUtcTime(row['start_time_utc'])} - ${formatUtcTime(row['end_time_utc'])})

### Tasks:
${formattedTasks}.`);
        break;
      }
      case 'interpreter': {
        const row = await fetchGameRow(db, options.getInteger('round'));
        if (!row) {
          await sendErrorEmbed(interaction, 'Error', 'Round not found.');
          return;
        }
        const interpreterBuffer = Buffer.from(row['interpreter']);
        const attachment = new AttachmentBuilder(interpreterBuffer)
          .setName(`i${row['id']}.${row['interpreter_type']}`);
        sendSuccessEmbedWithAttachment(interaction, `Interpreter for round ${row['id']}`,
          `${interpreterBuffer.length} byte ${row['interpreter_type']} file.`, attachment);
        break;
      }
      case 'leaderboard': {
        const row = await fetchGameRow(db, options.getInteger('round'));
        if (!row) {
          await sendErrorEmbed(interaction, 'Error', 'Round not found.');
          return;
        }
        await sendSuccessEmbed(interaction, `Round ${row['id']}`,
`### Leaderboard:
${(await fetchLeaderboardForRound(db, row['id'])).join('\n')}

### Tasks:
${(await fetchSolvedByTableForRound(db, row['id'])).join('\n')}`);
        break;
      }
      case 'hall': {
        const page = options.getInteger('page') || 1;
        await sendSuccessEmbed(interaction, 'Hall of Fame',
`### Top ${10 * page} players (page ${page}):
${(await fetchHallOfFame(db, page)).map((entry, i) => `${i+1}. ${entry}`).join('\n')}`);
        break;
      }
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
