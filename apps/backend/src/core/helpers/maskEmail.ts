import { padEnd } from 'lodash';

function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  const maskedUsername = padEnd(username.substring(0, 2), username.length, '*');
  const maskedDomain = domain.replace(/./g, '*').split('.').join('');
  const maskedEmail = `${maskedUsername}@${maskedDomain}.com`;
  return maskedEmail;
}

export default maskEmail;
