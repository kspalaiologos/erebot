import { Interaction, TextChannel, User } from "discord.js";
import { sendErrorEmbed, sendSuccessEmbed } from "./embed";
import { Database } from "sqlite3";

export const submitSolution = async (interaction: Interaction, db: Database, taskId: number, user: User, data: Blob) => {
  sendErrorEmbed(interaction, 'Error', 'Not implemented.');
}
