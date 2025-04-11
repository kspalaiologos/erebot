import { Interaction, User } from "discord.js";
import { sendErrorEmbed, sendSuccessEmbed } from "./embed";
import { Database } from "sqlite3";
import { fetchGameRow, fetchTasksForRound, GameRow, insertValidationQueue, yankValidationQueue } from "./database";

const isRoundActive = (row: GameRow) => {
  const now = new Date(Date.now());
  const start = row['start_time_utc'] ? new Date(parseInt(row['start_time_utc']) * 1000) : null;
  const end = row['end_time_utc'] ? new Date(parseInt(row['end_time_utc']) * 1000) : null;
  if (start == null || end == null) return false;
  return start <= now && now <= end;
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
}
