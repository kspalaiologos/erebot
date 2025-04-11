import { Interaction, Snowflake, TextChannel, User } from "discord.js";
import { followUpErrorEmbed } from "./embed";

export const formatUtcTime = (time: string | null) =>
  time ? `<t:${time}:f>` : '?';

export const formatPlural = (n: number, quantity: string) =>
  n === 1 ? `1 ${quantity}` : `${n} ${quantity}s`;

export const trimTrailing = (str: string, chars: string) =>
  str.endsWith(chars) ? str.substring(0, str.length - chars.length) : str;

export const currentTimeUtc = () =>
  Math.floor(Date.now() / 1000);

export const notifyUser = async (user: User, message: string) => {
  try {
    await user.send(message);
  } catch (error) {
    console.error(`Failed to send DM to ${user.tag}:`, error);
  }
}

export const prompt = async (timeout: number, interaction: Interaction, filter: (msg: string) => boolean) => {
  try {
    for (;;) {
      const response = await (interaction.channel as TextChannel).awaitMessages({
        max: 1, time: timeout, filter: m => m.author.id === interaction.user.id, errors: ['time']
      });
      const content = response.first()?.content;
      if (content && filter(content)) {
        return content;
      } else {
        await followUpErrorEmbed(interaction, 'Error', `Invalid response: ${content}`);
      }
    }
  } catch (error) {
    await followUpErrorEmbed(interaction, 'Error', 'Timed out.');
  }
}