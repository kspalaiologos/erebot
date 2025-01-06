
export const formatUtcTime = (time: string | null) =>
  time ? `<t:${time}:f>` : '?';

export const formatPlural = (n: number, quantity: string) =>
  n === 1 ? `1 ${quantity}` : `${n} ${quantity}s`;

export const trimTrailing = (str: string, chars: string) =>
  str.endsWith(chars) ? str.substring(0, str.length - chars.length) : str;