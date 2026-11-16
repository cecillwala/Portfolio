// All copy on the site lives here. Edit text in this file and nowhere else.
// Rules (see docs/EXECUTION_PLAN.md): bubbles under 110 characters, British English,
// no LexIMS partner or architecture, no Musoni internals, estimates flagged with estimate: true.

export type Block =
  | { kind: 'hero' }
  | { kind: 'reasons'; items: { title: string; text: string }[] }
  | { kind: 'card'; title: string; meta: string; lines?: string[]; tags?: string[] }
  | { kind: 'list'; title: string; items: string[]; tags?: string[] }
  | { kind: 'stations'; rows: { name: string; did: string; tools: string }[] }
  | { kind: 'phones'; title: string; shots: { label: string; file: string | null }[] }
  | { kind: 'ussd'; title: string; screens: string[][] }
  | { kind: 'safeguards'; items: { name: string; text: string }[] }
  | { kind: 'stats'; items: { value: string; label: string; estimate?: boolean }[] }
  | { kind: 'jobs'; rows: { name: string; example: string }[] }
  | { kind: 'contact' };

export type Beat = { says: string[]; block?: Block };
export type Chapter = {
  id: string;
  title: string;
  period: string;
  intro: string;
  /** Which sprite in public/sprites/props.png Cecil carries: index into PROPS. */
  prop: (typeof PROPS)[number];
  beats: Beat[];
};

export const PROPS = ['none', 'backpack', 'notebook', 'container', 'phone', 'lamp', 'card'] as const;

export const person = {
  name: 'Cecil Lwala',
  title: 'Software Developer',
  line: 'I build mobile apps, the backends behind them, and the infrastructure that keeps them running.',
  location: 'Nairobi, Kenya',
};

export const contact = {
  email: 'lwalacecil13@gmail.com',
  /** TODO(Cecil): add your number, e.g. '+254 7XX XXX XXX'. Left empty, the card hides the line. */
  phone: '',
  linkedin: 'https://www.linkedin.com/in/cecillwala',
  github: [
    { label: 'Personal', url: 'https://github.com/cecillwala' },
    { label: 'Work', url: 'https://github.com/lwalacecil' },
  ],
  /** TODO(Cecil): drop the PDF at public/cv/Cecil-Lwala-CV.pdf, then set this to true. */
  cvReady: false,
  cv: '/cv/Cecil-Lwala-CV.pdf',
};

export const chapters: Chapter[] = [
  {
    id: 'hero',
    title: 'Cecil Lwala',
    period: 'Now',
    intro: person.line,
    prop: 'none',
    beats: [
      {
        block: { kind: 'hero' },
        says: [
          "Hi, I'm Cecil. Well, the 16-bit version.",
          'I build mobile apps, the backends behind them, and the infrastructure they run on.',
        ],
      },
      {
        block: {
          kind: 'reasons',
          items: [
            { title: 'End to end', text: 'Client conversations, mobile, backend, USSD and deployment, on one project.' },
            { title: 'Built for real conditions', text: "Slow networks, feature phones and people's money." },
            { title: 'AI with guardrails', text: 'Intelligence that shows its sources and leaves decisions to people.' },
          ],
        },
        says: [
          'I led a loan platform from the first client meeting to an app, a backend and a USSD channel.',
          "Right now I'm building the intelligence layer of an ISO compliance platform.",
          "Keep scrolling and I'll walk you through it. In a hurry? Take the shortcut up top.",
        ],
      },
    ],
  },
  {
    id: 'egerton',
    title: 'Egerton University',
    period: '2022 to 2026',
    intro: 'Where it started: a Computer Science degree, and a question about how theory holds up in real systems.',
    prop: 'backpack',
    beats: [
      {
        block: {
          kind: 'card',
          title: 'Bachelor of Science, Computer Science',
          meta: 'Egerton University, 2022 to 2026. Graduating 27 November 2026.',
        },
        says: [
          'It starts here. Egerton University, 2022. Computer Science.',
          'This is where I learnt the theory.',
          'But I wanted to know how it holds up in real systems, with real users.',
          'So in 2024 I went looking for a team that ships.',
        ],
      },
    ],
  },
  {
    id: 'podii',
    title: 'Podii Consultants',
    period: 'April to September 2024',
    intro: 'A technical internship, and six months of learning how a real team ships.',
    prop: 'notebook',
    beats: [
      {
        block: {
          kind: 'list',
          title: 'Technical Intern',
          items: [
            'Took part in daily stand-ups, sprint planning and iterative delivery.',
            'Shadowed experienced engineers through the full delivery lifecycle.',
            'Tested features, wrote detailed bug reports and documented user feedback.',
            "Studied the company's stack, including Elixir, and built small projects to practise.",
          ],
          tags: ['Elixir', 'Git', 'QA testing', 'Agile'],
        },
        says: [
          'April 2024. My first desk: technical intern at Podii Consultants.',
          'I joined the daily stand-ups and sprint planning, and watched how a real team ships.',
          'I shadowed senior engineers through the whole cycle, from design to delivery.',
          'I tested features, wrote the bug reports and documented what users told us.',
          'Their stack was Elixir. So I taught myself Elixir and built small projects with it.',
          'I left knowing how good teams use Git: feature branches, pull requests, clean merges.',
          'Six months in, I knew what I wanted next: to build the systems myself.',
        ],
      },
    ],
  },
  {
    id: 'giktek',
    title: 'GikTek',
    period: 'April 2025 to present',
    intro: 'Software developer. Backend, frontend, messaging, security, containers and observability.',
    prop: 'container',
    beats: [
      {
        block: {
          kind: 'stations',
          rows: [
            { name: 'Backend', did: 'Built services and took part in architecture discussions on scalable, modular design.', tools: 'Java, Spring Boot, Spring Data, Spring Cloud' },
            { name: 'Frontend', did: 'Built web interfaces, including for a Stanbic Ghana project.', tools: 'Angular' },
            { name: 'Messaging', did: 'Decoupled services with asynchronous queues and delivery guarantees.', tools: 'RabbitMQ' },
            { name: 'Security', did: 'Implemented stateless authentication and authorisation across services.', tools: 'OAuth2, JWT' },
            { name: 'Containers', did: 'Built images and created a cluster with automated rollouts, load balancing and self-healing.', tools: 'Docker, Kubernetes' },
            { name: 'Observability', did: 'Collected metrics and aggregated logs for real-time monitoring.', tools: 'Prometheus, Grafana, Loki' },
          ],
        },
        says: [
          'April 2025. I joined GikTek as a software developer. This is where it got hands-on.',
          'Backend first: Java and Spring Boot services, with Angular on the front.',
          'Then, how services talk. RabbitMQ gave us queues instead of tight coupling.',
          'And who gets in. I implemented OAuth2 and JWT authentication across services.',
          'I packaged it all with Docker and created a Kubernetes cluster to run it.',
          "A system you can't see is a system you can't fix. So: Prometheus, Grafana and Loki.",
          'Then came the project that put all of it to work.',
        ],
      },
    ],
  },
  {
    id: 'musoni',
    title: 'The Musoni loan app',
    period: 'May 2026 to now, at GikTek',
    intro: 'A lending platform I led: mobile app, backend, staff portal and a USSD channel for any phone.',
    prop: 'phone',
    beats: [
      {
        block: {
          kind: 'card',
          title: 'My first lead role',
          meta: 'Picked up in May 2026. Build closed in early August. Now in testing for the Play Store.',
          lines: ['What I built: the mobile app, the backend, the staff portal and the USSD channel.'],
          tags: ['Flutter', 'Dart', 'Java', 'Spring Boot', 'PostgreSQL', 'USSD', 'M-Pesa'],
        },
        says: [
          'Musoni: a loan platform, and my first lead role.',
          'I picked it up in May 2026. It started with conversations, not code.',
          'I sat with the client to learn what their borrowers needed.',
        ],
      },
      {
        block: {
          kind: 'phones',
          title: 'The app',
          // TODO(Cecil): put screenshots in public/shots/ and set file, e.g. '/shots/musoni-signup.png'.
          shots: [
            { label: 'Sign up: phone number, ID and selfie', file: null },
            { label: 'Loan offer with its full cost', file: null },
            { label: 'Repay by M-Pesa, live status', file: null },
          ],
        },
        says: [
          'First, the app. I built it in Flutter: sign up, verify your ID, apply, repay.',
          'Sign-up checks a national ID and a selfie. Drop out halfway and it picks up where you left.',
          'Every loan offer shows its full cost before you accept.',
          "Repayment is by M-Pesa, and the app shows the payment's status live.",
        ],
      },
      {
        block: {
          kind: 'list',
          title: 'Behind the app',
          items: [
            'A Spring Boot backend for onboarding, loan applications and repayments.',
            'A staff portal for reviewing customers and approving loans.',
          ],
        },
        says: [
          'Behind it, a Spring Boot backend runs onboarding, loan applications and repayments.',
          'Staff needed a view too, so I built their portal for reviewing customers and loans.',
        ],
      },
      {
        block: {
          kind: 'ussd',
          title: 'The USSD channel',
          screens: [
            ['Welcome.', 'Enter your PIN:'],
            ['1. Apply for a loan', '2. My loans'],
            ['Loan cost shown in full.', '1. Confirm', '2. Cancel'],
            ['1. View balance', '2. Repay loan'],
          ],
        },
        says: [
          'But not every borrower has a smartphone.',
          'So I built a USSD channel. Dial, enter a PIN, apply, check a balance, repay.',
          'Any phone works. Nobody is left out because of the handset they own.',
        ],
      },
      {
        block: {
          kind: 'safeguards',
          items: [
            { name: 'Device binding', text: 'Sign-in is tied to the enrolled phone.' },
            { name: 'Certificate pinning', text: 'The app only talks to the genuine server.' },
            { name: 'App attestation', text: 'The server can tell a genuine app from a tampered one.' },
            { name: 'Screen protection', text: 'Sensitive screens cannot be screenshotted or recorded.' },
            { name: 'Clean-up', text: 'ID and selfie photos leave the phone once uploaded.' },
            { name: 'No double loans', text: 'A retry on a weak network never creates a second application.' },
            { name: 'Observability', text: 'Logs, metrics and alerts in Grafana, Loki and Prometheus.' },
          ],
        },
        says: [
          "This is people's money, so security came first.",
          'Device binding ties an account to its phone. A stolen PIN alone is not enough.',
          'Certificate pinning, app attestation and blocked screenshots guard the rest.',
          'And I can see it all running: logs, metrics and alerts in Grafana, Loki and Prometheus.',
        ],
      },
      {
        block: {
          kind: 'stats',
          items: [
            { value: '130+', label: 'active users' },
            { value: '4', label: 'things built: app, backend, staff portal, USSD' },
            { value: '3 months', label: 'from picking it up to closing the build' },
            // TODO(Cecil): the two below are placeholder estimates. Replace them and remove estimate.
            { value: '250', label: 'loan applications', estimate: true },
            { value: '5 min', label: 'typical sign-up time', estimate: true },
          ],
        },
        says: ['The build closed in early August. It now has over 130 active users.', "It's in final testing for the Play Store."],
      },
    ],
  },
  {
    id: 'lexims',
    title: 'LexIMS',
    period: 'In progress',
    intro: 'An audit and ISO compliance platform. My part: the workflows, the interface and the intelligence layer.',
    prop: 'lamp',
    beats: [
      {
        block: {
          kind: 'list',
          title: 'Workflows',
          items: [
            'ISO standards: scope, evidence clause by clause, and the gaps listed. Covers ISO 9001, 14001, 45001, 27001 and 22000.',
            'Audits: scheduled in four steps, seven stages from Planning to Follow-up, and a report exported from the record.',
            'Documents: SOPs with approvals, revision history and review dates.',
            'Continual improvement: corrective, preventive and improvement actions in one register.',
            'Also: compliance, master logs, projects and task boards, human resources, a dashboard, forms and reports.',
          ],
        },
        says: [
          "Now, what I'm building today: LexIMS.",
          'It helps organisations run audits and stay ISO compliant, without binders and lost emails.',
          'My work here has three parts. First: streamlining the workflows.',
          'An audit is scheduled in four steps, then recorded stage by stage, planning to follow-up.',
          'A finding becomes an action with an owner, a root cause and a due date.',
        ],
      },
      {
        block: {
          kind: 'list',
          title: 'Interface',
          items: [
            'One design standard across every module, so each screen behaves the same way.',
            'Guided journeys in place of long forms.',
            'Recorded walkthroughs and a welcome tour for new users.',
          ],
        },
        says: ['Second: the interface. Calmer screens and a clear next step on every page.'],
      },
      {
        block: {
          kind: 'jobs',
          rows: [
            { name: 'Advise', example: "Answers a question from the organisation's own documents and records, with sources." },
            { name: 'Draft', example: 'Writes a first version of a project plan for a person to edit and approve.' },
            { name: 'Assign', example: 'Suggests who should own a piece of work, and says why.' },
            { name: 'Remind', example: 'Works out who needs a nudge and sends one email instead of many.' },
            { name: 'Ingest', example: 'Turns an email or a form into a record, then asks the sender to confirm.' },
            { name: 'Detect', example: 'Notices a task due while its owner is on leave.' },
          ],
        },
        says: [
          'Third, the part I enjoy most: the intelligence layer.',
          'Ask a question in plain words. It answers from your own documents and shows its sources.',
          'It drafts, suggests owners, sends reminders and spots clashes a person would miss.',
        ],
      },
      {
        block: {
          kind: 'safeguards',
          items: [
            { name: 'A person decides', text: 'It proposes; a named person approves, closes and signs off.' },
            { name: 'Sources shown', text: 'Every answer says which document or record it came from.' },
            { name: 'No AI in arithmetic', text: 'Balances, scores and dates come from fixed rules.' },
            { name: 'Data kept apart', text: "Each organisation's records stay separate." },
          ],
        },
        says: ['But it never decides. A named person approves, and fixed rules do the arithmetic.'],
      },
      {
        block: {
          kind: 'card',
          title: 'Next: a model shaped for the platform',
          // TODO(Cecil): confirm this wording. It reflects your learning lab as of November 2026.
          meta: 'In progress',
          lines: [
            'I am working towards fine-tuning open-weight models, so the intelligence is specific to this platform.',
            'The groundwork is under way: neural networks from first principles, then retrieval, agents and evaluation.',
          ],
        },
        says: [
          'Next: fine-tuning open-weight models, so the intelligence is shaped for this platform.',
          "I'm studying how these models work from the ground up to get there. Ask me how it's going.",
        ],
      },
    ],
  },
  {
    id: 'contact',
    title: 'Say hello',
    period: 'Now',
    intro: 'The next chapter is not written yet.',
    prop: 'card',
    beats: [
      {
        block: { kind: 'contact' },
        says: [
          "That's the story so far. The next chapter isn't written yet.",
          "If you're building something and want me in it, here's my card.",
          'Flip it. Save it. Or just say hello.',
        ],
      },
    ],
  },
];

// ---------- Browse mode ----------
export const work = [
  { place: 'GikTek', role: 'Software Developer', period: 'April 2025 to present', chapter: 'giktek', summary: 'Backend, frontend, messaging, security, containers and observability. Lead on the Musoni loan app; now building LexIMS.' },
  { place: 'Podii Consultants', role: 'Technical Intern', period: 'April to September 2024', chapter: 'podii', summary: 'Stand-ups, shadowing senior engineers, QA testing and bug reports, and Elixir on the side.' },
];

export const projects = [
  { id: 'musoni', name: 'The Musoni loan app', status: 'In testing for the Play Store', role: 'Lead', summary: 'A lending platform: Flutter app, Spring Boot backend, staff portal and a USSD channel for any phone. Device binding, certificate pinning and app attestation in the release build.' },
  { id: 'lexims', name: 'LexIMS', status: 'In progress', role: 'Developer', summary: 'An audit and ISO compliance platform. Streamlined workflows, a calmer interface, and an intelligence layer that shows its sources and leaves decisions to people.' },
  { id: 'giktek', name: 'GikTek platform work', status: 'Ongoing', role: 'Developer', summary: 'Spring Boot services, Angular interfaces, RabbitMQ messaging, OAuth2 and JWT, Kubernetes, and monitoring with Prometheus, Grafana and Loki.' },
];

/** Technology to the project ids (above) that used it. Podii is listed as text only. */
export const stack: { tech: string; used: string[]; note?: string }[] = [
  { tech: 'Java, Spring Boot', used: ['giktek', 'musoni', 'lexims'] },
  { tech: 'Flutter, Dart', used: ['musoni'] },
  { tech: 'TypeScript', used: ['musoni', 'lexims'] },
  { tech: 'Angular', used: ['giktek'], note: 'Stanbic Ghana project' },
  { tech: 'Next.js, React', used: ['musoni', 'lexims'] },
  { tech: 'PostgreSQL', used: ['musoni'] },
  { tech: 'MySQL', used: ['giktek'] },
  { tech: 'Docker, Kubernetes', used: ['giktek'] },
  { tech: 'RabbitMQ', used: ['giktek'] },
  { tech: 'OAuth2, JWT', used: ['giktek', 'musoni'] },
  { tech: 'Prometheus, Grafana, Loki', used: ['giktek', 'musoni'] },
  { tech: 'M-Pesa, USSD', used: ['musoni'] },
  { tech: 'AI retrieval', used: ['lexims'] },
  { tech: 'Elixir', used: [], note: 'Self-study at Podii' },
];
