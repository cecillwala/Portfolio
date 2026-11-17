// Everything the front page says about Cecil lives in this one file.
//
// SAMPLE DATA: any value written as sample('…') is an invented placeholder, waiting for Cecil's
// real words or numbers. While DRAFT is true the page prints a small "sample" tag beside each one,
// so a placeholder can never pass for a fact. To finish: replace sample('…') with the real string
// and, when none are left, set DRAFT to false.
export const DRAFT = true;
export const sample = (text) => ({ text, sample: true });
/** Read a value that may or may not be a sample. */
export const say = (v) => (typeof v === 'string' ? v : v.text);
export const isSample = (v) => typeof v !== 'string' && v.sample === true;

export const profile = {
  name: ['Cecil', 'Lwala'],
  role: 'Software developer',
  place: 'Nairobi, Kenya',
  // One sentence for an employer in Kenya: what he builds, and for whom.
  line: 'I build the software behind lending in Kenya: the mobile app, the services under it, and the USSD menu that reaches every phone.',
  availability: sample('Open to roles in Kenya from December 2026'),
};

// Selected work, strongest first. Three is the right number; the lift holds the rest.
export const work = [
  {
    id: 'musoni',
    title: 'Musoni',
    colour: '#61BC00',
    what: 'A lending platform that works on any phone',
    result: 'Over 130 people now borrow and repay through it, from a smartphone app or by dialling a USSD code.',
    facts: [['Role', 'Lead developer, at GikTek'], ['When', 'May to August 2026'], ['Now', 'In testing for the Play Store']],
    stack: ['Flutter', 'Spring Boot', 'PostgreSQL', 'M-Pesa', 'USSD'],
    image: { src: '/work/musoni.png', width: 212, height: 118, alt: 'Three screens of the Musoni app drawn as pixel art: verifying an ID, a loan offer, and a repayment.' },
    href: '/musoni',
    action: 'Open the case study',
  },
  {
    id: 'lexims',
    title: 'LexIMS',
    colour: '#ffe066',
    what: 'Audits, findings and follow-up in one place',
    result: sample('Scheduling an audit went from nine steps to four, and every finding now has an owner and a date.'),
    facts: [['Role', 'Developer, at GikTek'], ['When', '2026, in progress'], ['Focus', 'Workflows, interface and an intelligence layer']],
    stack: ['Workflows', 'User experience', 'AI retrieval'],
    image: { src: '/work/lexims.png', width: 300, height: 166, alt: 'A floor under construction in pixel art, with scaffolding and small figures in hard hats.' },
    href: '/projects#lexims',
    action: 'Visit the floor',
  },
  {
    id: 'chama',
    title: sample('Chama'),
    colour: '#ff6b8b',
    what: sample('A savings-group ledger members can trust'),
    result: sample('Forty groups keep their contributions and loans here, and treasurers close the month in minutes.'),
    facts: [['Role', sample('Sole developer')], ['When', sample('2025')], ['Now', sample('Live')]],
    stack: [sample('Angular'), sample('Spring Boot'), sample('PostgreSQL')],
    image: null,
    href: null,
    action: null,
  },
];
