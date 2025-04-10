import { EmbedBuilder, AttachmentBuilder, ColorResolvable } from 'discord.js';

const makeEmbed = (color: ColorResolvable, title: string, description: string) =>
  new EmbedBuilder().setColor(color).setTitle(title).setDescription(description).setTimestamp();

export const sendSuccessEmbed = async (interaction: any, title: string, description: string) =>
  await interaction.reply({ embeds: [makeEmbed('#009900', title, description)] });

export const sendSuccessEmbedWithAttachment = async (interaction: any, title: string, description: string, attachment: AttachmentBuilder) =>
  await interaction.reply({ embeds: [makeEmbed('#009900', title, description)], files: [attachment] });

export const sendErrorEmbed = async (interaction: any, title: string, description: string) =>
  await interaction.reply({ embeds: [makeEmbed('#990000', title, description)] });

export const followUpSuccessEmbed = async (interaction: any, title: string, description: string) =>
  await interaction.followUp({ embeds: [makeEmbed('#009900', title, description)] });

export const followUpErrorEmbed = async (interaction: any, title: string, description: string) =>
  await interaction.followUp({ embeds: [makeEmbed('#990000', title, description)] });