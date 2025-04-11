import { AttachmentBuilder, Interaction, User } from "discord.js";
import { sendErrorEmbed, sendSuccessEmbed, sendSuccessEmbedWithAttachment } from "./embed";
import { Database } from "sqlite3";
import { fetchGameRow, fetchSolution, fetchTasksForRound, GameRow, insertValidationQueue, yankValidationQueue } from "./database";
import { getOwner } from ".";
import { notifyUser } from "./util";

const isRoundActive = (row: GameRow) => {
  const now = new Date(Date.now());
  const start = row['start_time_utc'] ? new Date(parseInt(row['start_time_utc']) * 1000) : null;
  const end = row['end_time_utc'] ? new Date(parseInt(row['end_time_utc']) * 1000) : null;
  if (start == null || end == null) return false;
  return start <= now && now <= end;
}

export const querySolution = async (interaction: Interaction, db: Database, taskId: number, roundId: number, user: User) => {
  const roundRow = await fetchGameRow(db, roundId);
  if (!roundRow) {
    await sendErrorEmbed(interaction, 'Error', 'Round not found.');
    return;
  }
  if (isRoundActive(roundRow)) {
    await sendErrorEmbed(interaction, 'Error', 'The round is active. You may not query solutions.');
    return;
  }
  const tasks = await fetchTasksForRound(db, roundRow['id']);
  if (taskId < 1 || taskId > tasks.length) {
    await sendErrorEmbed(interaction, 'Error', 'Task not found.');
    return;
  }
  const task = tasks[taskId - 1];
  const solution = await fetchSolution(db, task.id, user.id);
  if (!solution) {
    await sendErrorEmbed(interaction, 'Error', 'Solution not found.');
    return;
  }
  const interpreterBuffer = Buffer.from(solution.content);
  const randomName = Math.random().toString(36).substring(2, 8);
  const attachment = new AttachmentBuilder(interpreterBuffer).setName(`v${taskId}-${roundId}-${user.id}-${randomName}`);
  await sendSuccessEmbedWithAttachment(interaction, 'Solution', `Solution for task ${taskId}, round ${roundId}, by ${user.tag} (${user.id}).`, attachment);
}

export const submitSolution = async (interaction: Interaction, db: Database, taskId: number, user: User, data: Blob) => {
  yankValidationQueue(db, user.id, taskId);
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const roundRow = await fetchGameRow(db, null);
  if (!isRoundActive(roundRow!)) {
    await sendErrorEmbed(interaction, 'Error', 'Round is not active.');
    return;
  }
  const task = (await fetchTasksForRound(db, roundRow!['id']))[taskId - 1];
  if (!task) {
    await sendErrorEmbed(interaction, 'Error', 'Task not found.');
    return;
  }
  insertValidationQueue(db, user.id, buffer, taskId, eval(task.score_program)(arrayBuffer));
  await sendSuccessEmbed(interaction, 'Success', `Your solution has been submitted for validation.`);
  await notifyUser(await getOwner(), `User ${user.tag} (${user.id}) submitted a solution for task ${taskId} (${task.description}).`);
}
