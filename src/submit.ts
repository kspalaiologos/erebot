import { Interaction, TextChannel, User } from "discord.js";
import { sendErrorEmbed, sendSuccessEmbed } from "./embed";
import { Database } from "sqlite3";
import { fetchGameRow, fetchTasksForRound, insertValidationQueue, yankValidationQueue } from "./database";

export const submitSolution = async (interaction: Interaction, db: Database, taskId: number, user: User, data: Blob) => {
  yankValidationQueue(db, user.id, taskId);
  const arrayBuffer = await data.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const roundRow = await fetchGameRow(db, null);
  const task = (await fetchTasksForRound(db, roundRow!['id']))[taskId - 1];
  if (!task) {
    await sendErrorEmbed(interaction, 'Error', 'Task not found.');
    return;
  }
  insertValidationQueue(db, user.id, buffer, taskId, eval(task.score_program)(arrayBuffer));
  await sendSuccessEmbed(interaction, 'Success', `Your solution has been submitted for validation.`);
}
