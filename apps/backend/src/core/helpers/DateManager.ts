import { intlFormat } from 'date-fns';

const formatTypes = {
  time: {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
  dateTime: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  },
  date: {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  },
  formattedDateTime: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  },
} as const;

export class DateManager {
  public static formatDate({
    date,
    formatString,
    locale,
  }: {
    date: Date;
    formatString: keyof typeof formatTypes;
    locale?: string;
  }): string {
    return intlFormat(date, formatTypes[formatString], {
      locale,
    });
  }
}
