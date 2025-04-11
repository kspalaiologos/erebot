import { AttachmentBuilder, Interaction, TextChannel } from "discord.js";
import jszip from 'jszip';
import { followUpErrorEmbed, followUpSuccessEmbed, sendErrorEmbed, sendSuccessEmbed, sendSuccessEmbedWithAttachment } from "./embed";
import { insertGame, insertTask, peekValidationQueue, popValidationQueue, transferValidationQueue, ValidationQueueRow } from "./database";
import { Database } from "sqlite3";
import { notifyUser, prompt } from "./util";

export const tutorial = async (interaction: Interaction) => {
  await sendSuccessEmbed(interaction, 'EsoRE tutorial',
`EsoRE (short for Esolang Reverse Engineering) is a programming competition where players implement simple programs (like a "Hello, world!" or "cat" program) in a new undocumented esoteric language. The language is specified by its interpreter, which is purposefully obfuscated and customarily written either in C or JavaScript. Usually, a few example programs are given to demonstrate general features of the language.

To enter the contest, you must first make sure that a round is active. You can check this by using the \`/esore info\` command, which specifies the start and end dates of the most recent contest. You may obtain the interpreter by using the \`/esore interpreter\` command.

Once your solution is ready and tested, you may submit it using the \`/esore submit\` command. You must specify the task number and attach the file containing your solution. Your solution will be added to the validation queue, and you will be notified when it is validated.

To track the progress of other participants, use the \`/esore leaderboard\` command. This will show you the current scores of all participants, as well as the number of tasks they have solved. You can also use the \`/esore hall\` command to see the top players of all time.

Many of the commands admit an extra argument specifying the round number, allowing you to obtain information concerning already concluded rounds. After the round, the submissions of individual users are published and can be accessed using the \`/esore solution\` command.`);
};