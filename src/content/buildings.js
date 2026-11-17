import { musoniBrand } from './brands.js';

// Floors are stored oldest first and revealed inside each building.
// Musoni uses its repository's verified branding. Other marks remain fallbacks.
// A floor with `room` is a first-person room: the lift doors open and the visitor is standing on
// the floor, with Cecil as host (the rooms are in src/scripts/floors). Floors without one still
// use the arrival bubble and the details pop-up.
export const buildings = {
  projects: {
    title: 'Projects', subtitle: 'A career, one floor at a time.', accent: '#ffb577',
    intro: 'Start downstairs with the earliest project. Work your way up to what I’m building now.',
    floors: [
      { id:'musoni', name:'Musoni', mark:'M', logo:musoniBrand.logoOnDark, brand:musoniBrand, color:musoniBrand.green, period:'May 2026 → build closed August 2026', status:'In testing', construction:false, category:'Professional', role:'Lead developer · at GikTek',
        summary:'A lending platform spanning a Flutter app, Spring Boot backend, staff portal and USSD channel.',
        points:['Led delivery after picking up the project in May 2026.','Built mobile onboarding, loan applications and repayments.','Delivered the backend, staff portal and a USSD channel for feature phones.'],
        tags:['Flutter','Spring Boot','USSD','M-Pesa'], room:'musoni' },
      { id:'lexims', name:'LexIMS', mark:'L', logo:null, color:'#ffe066', period:'Current project', status:'Under construction', construction:true, category:'Professional', role:'Developer · workflows, interface & intelligence',
        summary:'An Integrated Management System for projects, compliance, audits, findings and continual improvement.',
        points:['Refining the journeys and interface across the platform.','Connecting findings to actions, owners and follow-up.','Building an intelligence layer that shows its sources and keeps people in control.'],
        tags:['Workflows','User experience','AI retrieval'], href:null, action:null },
    ],
  },
  experience: {
    title:'Work Experience', subtitle:'The teams that shaped how I build.', accent:'#7bd9ce',
    intro:'The first desk is downstairs. My current role is on the next floor.',
    floors:[
      { id:'podii',name:'Podii Consultants',mark:'P',logo:null,color:'#c79bff',period:'April → September 2024',status:'Technical internship',construction:false,category:'Experience',role:'Technical Intern',
        summary:'Six months learning how a real team designs, tests and delivers software.',
        points:['Joined daily stand-ups, sprint planning and iterative delivery.','Tested features, wrote bug reports and documented user feedback.','Studied Elixir and built small projects to practise.'],tags:['Elixir','Git','QA testing','Agile'],href:null },
      { id:'giktek',name:'GikTek',mark:'G',logo:null,color:'#5fe1ff',period:'April 2025 → present',status:'Current role',construction:false,category:'Experience',role:'Software Developer',
        summary:'Building web and mobile systems, the services behind them and the infrastructure that keeps them running.',
        points:['Developed Spring Boot services and Angular interfaces.','Worked with messaging, authentication, containers and automated deployments.','Led the Musoni loan platform and contributed to LexIMS.'],tags:['Spring Boot','Angular','Kubernetes','Observability'],href:'/projects',action:'Visit the Projects building' },
    ],
  },
  education: {
    title:'Education',subtitle:'Where the foundations were laid.',accent:'#7dff9a',
    intro:'Theory, practice, and the beginning of the journey.',
    floors:[
      {id:'egerton',name:'Egerton University',mark:'E',logo:null,color:'#7dff9a',period:'2022 → 2026',status:'Graduating 27 November 2026',construction:false,category:'Education',role:'BSc Computer Science',
        summary:'A Computer Science degree and a growing interest in how theory holds up in real systems.',
        points:['Studied Computer Science at Egerton University.','Took the next step into professional practice with a technical internship at Podii in 2024.'],tags:['Computer Science','Software development'],href:'/experience',action:'Continue to Work Experience' },
    ],
  },
};
