// Hand-authored, simplified CBD plan. East is +x, south is +y.
// Relative landmark placement checked against the city-centre map on p.6:
// https://www.un-redd.org/sites/default/files/2021-10/UN-REDD_PB4_Practical%20Information.pdf
// Not imported GIS data, a navigational map, or the real addresses of portfolio clients.
export const roads = [
  { name: 'Uhuru Highway', width: 24, points: [[230,40],[260,220],[300,410],[340,610],[400,880]] },
  { name: 'Kenyatta Avenue', width: 22, points: [[160,180],[300,250],[460,330],[650,410],[790,420]] },
  { name: 'Moi Avenue', width: 19, points: [[690,50],[710,210],[750,390],[780,580],[800,830]] },
  { name: 'Haile Selassie Avenue', width: 22, points: [[350,730],[550,730],[790,730],[970,700]] },
  { name: 'City Hall Way', width: 15, points: [[340,450],[550,450],[750,450]] },
  { name: 'Harambee Avenue', width: 15, points: [[360,620],[570,620],[790,620]] },
  { name: 'Muindi Mbingu Street', width: 12, points: [[440,90],[460,310],[490,450]] },
  { name: 'Tom Mboya Street', width: 14, points: [[820,70],[850,330],[900,620],[930,730]] },
  { name: 'Mama Ngina Street', width: 12, points: [[580,320],[590,450],[610,620]] },
  { name: 'Banda Street', width: 11, points: [[300,220],[470,220],[710,210],[840,200]] },
];
export const landmarks = [
  { id:'kicc', name:'KICC', x:610, y:515, w:62, d:62, h:116, kind:'kicc', color:'#b67558' },
  { id:'times', name:'Times Tower', x:690, y:645, w:40, d:42, h:138, kind:'tower', color:'#71889c' },
  { id:'archives', name:'National Archives', x:775, y:270, w:66, d:46, h:30, kind:'archive', color:'#cbb697' },
  { id:'station', name:'Railway Station', x:780, y:815, w:120, d:32, h:23, kind:'station', color:'#ab7860' },
  { id:'gpo', name:'GPO', x:390, y:365, w:56, d:48, h:45, kind:'post', color:'#b99272' },
];
export const destinations = [
  { id:'experience', name:'Experience', sub:'The places I’ve worked', x:485,y:150,w:55,d:45,h:63,color:'#78c9b5',tag:'01', links:[['GikTek','/work#giktek'],['Podii Consultants','/work#podii']], say:'From my first desk at Podii to building and delivering software at GikTek.' },
  { id:'projects', name:'Projects', sub:'Things I’ve helped build', x:645,y:340,w:48,d:42,h:58,color:'#ffa66e',tag:'02',links:[['Explore Musoni','/musoni'],['Read about LexIMS','/work#lexims']],say:'Mobile apps, backends, staff portals and systems built for people to use.' },
  { id:'freelance',name:'The studio',sub:'Company profiles & websites',x:845,y:525,w:55,d:42,h:43,color:'#c9b1ff',tag:'03',links:[['Discuss a project','/work#contact']],say:'A space for my independent work: company profiles, websites and helping businesses tell their story. Case studies are being prepared.' },
  { id:'about',name:'About me',sub:'Meet Cecil',x:385,y:540,w:45,d:40,h:30,color:'#f5d98b',tag:'04',links:[['My background','/work#egerton']],say:'I’m Cecil, a software developer in Nairobi. I build mobile apps, the backends behind them and the infrastructure they run on.' },
  { id:'contact',name:'Say hello',sub:'The next chapter',x:555,y:800,w:42,d:35,h:32,color:'#f499ae',tag:'05',links:[['Get in touch','/work#contact']],say:'Have a project in mind, a role to discuss, or something interesting to build? Let’s talk.' },
];
