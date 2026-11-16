import { contact, person } from './story';

/** The contact file behind Save contact and the QR code on the card. */
export function vcard(): string {
  const [first, ...rest] = person.name.split(' ');
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${rest.join(' ')};${first};;;`,
    `FN:${person.name}`,
    `TITLE:${person.title}`,
    `EMAIL;TYPE=INTERNET:${contact.email}`,
    contact.phone && `TEL;TYPE=CELL:${contact.phone.replace(/\s+/g, '')}`,
    'ADR;TYPE=WORK:;;;Nairobi;;;Kenya',
    `URL:${contact.linkedin}`,
    `URL:${contact.github[0].url}`,
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}
