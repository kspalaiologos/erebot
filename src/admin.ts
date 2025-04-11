import { Interaction, TextChannel } from "discord.js";
import jszip from 'jszip';
import { followUpErrorEmbed, followUpSuccessEmbed, sendErrorEmbed, sendSuccessEmbed } from "./embed";
import { insertGame, insertTask } from "./database";
import { Database } from "sqlite3";

export const adminCreateRound = async (db: Database, interaction: Interaction, roundData: Blob) => {
  let zipfile: jszip;
  let indexjson: any;
  try {
    zipfile = await jszip.loadAsync(roundData.arrayBuffer());
    indexjson = JSON.parse(await zipfile.file('index.json')?.async('string')!);
  } catch (e) {
    await sendErrorEmbed(interaction, 'Error', 'Invalid round data: index.json is not valid JSON.');
    return;
  }
  const allowedFields = ['name', 'duration', 'interpreter', 'extraFiles', 'tasks'];
  const requiredFields = ['name', 'duration', 'interpreter', 'tasks'];
  if (Object.keys(indexjson).some(field => !allowedFields.includes(field))) {
    await sendErrorEmbed(interaction, 'Error', 'Invalid round data: index.json contains invalid fields.');
    return;
  }
  if (!requiredFields.every(field => field in indexjson)) {
    await sendErrorEmbed(interaction, 'Error', 'Invalid round data: index.json is missing required fields.');
    return;
  }
  // Game table.
  const roundName = indexjson.name;
  let interpreterData, interpreterExt;
  if (indexjson.extraFiles) {
    const fileNames = [indexjson.interpreter, ...indexjson.extraFiles];
    const files = await Promise.all(fileNames.map(name => zipfile.file(name)?.async('nodebuffer')));
    if (files.includes(undefined)) {
      await sendErrorEmbed(interaction, 'Error', 'Invalid round data: index.json references missing files.');
      return;
    }
    const interpreterZip = new jszip();
    files.forEach((file, i) => { interpreterZip.file(fileNames[i], file!); });
    interpreterData = await interpreterZip.generateAsync({ type: 'nodebuffer' });
    interpreterExt = 'zip';
  } else {
    interpreterData = await zipfile.file(indexjson.interpreter)?.async('nodebuffer');
    interpreterExt = indexjson.interpreter.split('.').pop()!;
  }
  if (!interpreterData) {
    await sendErrorEmbed(interaction, 'Error', 'Invalid round data: index.json references missing interpreter.');
    return;
  }
  const startTime = Math.floor(Date.now() / 1000);
  const endTime = startTime + indexjson.duration * 24 * 60 * 60;
  // Field: roundName, interpreterData, interpreterExt, startTime, endTime
  // Task table.
  const tasks = []
  for (const task of indexjson.tasks) {
    const requiredFields = ['name', 'points', 'score_program'];
    if (!requiredFields.every(field => field in task)) {
      await sendErrorEmbed(interaction, 'Error', 'Invalid round data: task is missing required fields.');
      return;
    }
    if (task.points < 1 || task.points > 99) {
      await sendErrorEmbed(interaction, 'Error', 'Invalid round data: task points must be between 1 and 99.');
      return;
    }
    if (task.score_program == null) {
      await sendErrorEmbed(interaction, 'Error', 'Invalid round data: task is missing score_program.');
      return;
    }
    try { eval(task.score_program); } catch (e) {
      await sendErrorEmbed(interaction, 'Error', 'Invalid round data: task score_program is not valid JavaScript.');
      return;
    }
    tasks.push({
      name: task.name,
      points: task.points,
      score_program: task.score_program
    });
  }
  // Ask the user for confirmation
  await sendSuccessEmbed(interaction, 'Confirm',
`Are you sure you want to create a new round with the following details?

**Name:** ${roundName}
**Start Time:** ${new Date(startTime * 1000).toUTCString()}
**End Time:** ${new Date(endTime * 1000).toUTCString()}
**Interpreter**: See attachment.
**Tasks:**
${tasks.map((task, i) => `${i + 1}. ${task.name} (${task.points} points)`).join('\n')}

Type "yes" to confirm.`);
  try {
    const response = await (interaction.channel as TextChannel).awaitMessages({ max: 1, time: 30000, filter: m => m.author.id === interaction.user.id, errors: ['time'] });
    const yesno = response.first()?.content.toLowerCase();
    if (yesno && !yesno.startsWith('yes')) {
      await followUpErrorEmbed(interaction, 'Error', 'Round creation cancelled.');
      return;
    }
  } catch (e) {
    await followUpErrorEmbed(interaction, 'Error', 'Round creation timed out.');
    return;
  }
  // Insert the game into the database
  const gameId = await insertGame(db, roundName, interpreterData, interpreterExt, startTime, endTime);
  if (!gameId) {
    await sendErrorEmbed(interaction, 'Error', 'Failed to create round.');
    return;
  }
  // Insert the tasks into the database
  for (const task of tasks) {
    await insertTask(db, gameId.id, task.name, task.points, task.score_program);
  }
  await followUpSuccessEmbed(interaction, 'Success', 'Round creation confirmed.');
}

export const adminVerify = async (interaction: Interaction, db: Database) => {
  await sendErrorEmbed(interaction, 'Error', 'This command is not implemented yet.');
}