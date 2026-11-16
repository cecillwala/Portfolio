// A playable copy of the borrower's USSD journey. The steps are the real ones (PIN, apply with the
// full cost shown before you confirm, balance, repay by M-Pesa prompt). The figures are made up.
import { key, chime, blip } from './pixel.js';

const kes = (n) => 'KES ' + Number(n).toLocaleString('en-KE');

export function initUssd() {
  const lcd = document.getElementById('lcd'), pad = document.getElementById('handset');
  if (!lcd || !pad) return;
  let state = 'idle', input = '', amount = 0;

  /** Each state: what the screen says, which keys do something, and what a key or Send does. */
  const S = {
    idle: { text: () => 'Musoni Capital\n\nPress Send to dial.', hot: ['send'], send: () => 'pin' },
    pin: { text: () => 'Karibu.\nEnter your PIN:\n' + '*'.repeat(input.length), entry: 4, hot: ['digits'], done: () => 'menu' },
    menu: { text: () => '1. Apply for a loan\n2. My loans\n0. Exit', hot: ['1', '2', '0'], keys: { 1: 'amount', 2: 'loans', 0: 'bye' } },
    amount: { text: () => 'Loan amount (KES):\n' + input, entry: 6, hot: ['digits', 'send'], send: () => { amount = Number(input); return amount >= 500 && amount <= 50000 ? 'cost' : 'range'; } },
    range: { text: () => 'Enter an amount from\n500 to 50,000.\n\n0. Back', hot: ['0'], keys: { 0: 'amount' } },
    cost: { text: () => `You get ${kes(amount)}.\nYou repay ${kes(Math.round(amount * 1.1))}\nwithin 30 days.\n1. Confirm\n2. Cancel`, hot: ['1', '2'], keys: { 1: 'sent', 2: 'menu' } },
    sent: { text: () => 'Request received.\nYou will get an SMS\nonce it is reviewed.\n\n0. Menu', hot: ['0'], keys: { 0: 'menu' }, win: true },
    loans: { text: () => '1. View balance\n2. Repay loan\n0. Back', hot: ['1', '2', '0'], keys: { 1: 'balance', 2: 'repay', 0: 'menu' } },
    balance: { text: () => 'Balance: KES 5,500\nDue in 12 days.\n\n0. Back', hot: ['0'], keys: { 0: 'loans' } },
    repay: { text: () => 'Amount to repay (KES):\n' + input, entry: 6, hot: ['digits', 'send'], send: () => { amount = Number(input); return amount > 0 ? 'stk' : 'repay'; } },
    stk: { text: () => `Check your phone.\nEnter your M-Pesa PIN\nthere to pay ${kes(amount)}.\n\n0. Menu`, hot: ['0'], keys: { 0: 'menu' }, win: true },
    bye: { text: () => 'Goodbye.\n\nPress Send to dial\nagain.', hot: ['send'], send: () => 'pin' },
  };

  function render() {
    const s = S[state];
    lcd.textContent = s.text();
    if (s.entry) { const cur = document.createElement('span'); cur.className = 'cur'; cur.textContent = '_'; lcd.appendChild(cur); }
    for (const b of pad.querySelectorAll('button')) {
      const k = b.dataset.k;
      b.classList.toggle('hot', s.hot.includes(k) || (s.hot.includes('digits') && /^\d$/.test(k)));
    }
  }
  function to(next) { state = next; input = ''; if (S[state].win) chime(); render(); }
  function press(k) {
    const s = S[state];
    key();
    if (k === 'clear') { if (input) input = input.slice(0, -1); else if (state !== 'idle') return to('menu' in S && state !== 'pin' ? 'menu' : 'idle'); return render(); }
    if (k === 'send') { if (s.send && (!s.entry || input.length)) return to(s.send()); return blip(160, 0.08, 'square', 0.03); }
    if (s.entry && /^\d$/.test(k)) { if (input.length < s.entry) input += k; if (s.done && input.length === s.entry) return to(s.done()); return render(); }
    if (s.keys && k in s.keys) return to(s.keys[k]);
    blip(160, 0.08, 'square', 0.03);
  }
  pad.addEventListener('click', (e) => { const b = e.target.closest('button[data-k]'); if (b) press(b.dataset.k); });
  pad.addEventListener('keydown', (e) => {
    if (/^[0-9*#]$/.test(e.key)) { press(e.key); e.preventDefault(); }
    else if (e.key === 'Backspace') { press('clear'); e.preventDefault(); }
  });
  render();
}
