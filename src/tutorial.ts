import { AttachmentBuilder, Interaction, TextChannel } from "discord.js";
import jszip from 'jszip';
import { followUpErrorEmbed, followUpSuccessEmbed, sendErrorEmbed, sendSuccessEmbed, sendSuccessEmbedWithAttachment } from "./embed";
import { insertGame, insertTask, peekValidationQueue, popValidationQueue, transferValidationQueue, ValidationQueueRow } from "./database";
import { Database } from "sqlite3";
import { notifyUser, prompt } from "./util";

export const tutorial = async (interaction: Interaction) => {
  await sendErrorEmbed(interaction, 'Error', 'This command is not implemented yet.');
};