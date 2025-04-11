import { User } from "discord.js";

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