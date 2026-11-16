"""Builds the six style-board artboards (3 directions x home + inner page) as self-contained HTML."""
import base64, pathlib
from PIL import Image

HERE = pathlib.Path(__file__).parent
NM = HERE / 'node_modules'
def b64(p): return base64.b64encode(pathlib.Path(p).read_bytes()).decode()
def png(p): return 'data:image/png;base64,' + b64(p)
def font(name, path, weight='100 900', stretch=None):
    st = f'font-stretch:{stretch};' if stretch else ''
    return f"@font-face{{font-family:'{name}';src:url(data:font/woff2;base64,{b64(path)}) format('woff2');font-weight:{weight};{st}font-display:block}}"

FONTS = '\n'.join([
    font('Departure Mono', 'fonts/DepartureMono-Regular.woff2', '400'),
    font('Archivo', NM / '@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2', '100 900', '62% 125%'),
    font('Bricolage Grotesque', NM / '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-standard-normal.woff2', '200 800', '75% 100%'),
    font('Bitcount Grid Double', NM / '@fontsource/bitcount-grid-double/files/bitcount-grid-double-latin-500-normal.woff2', '500'),
])

THEMES = {
    'a': dict(name='Daylight', paper='#f4f4f4', ink='#1a1c2c', soft='#566c86', accent='#ef7d57', accent_ink='#1a1c2c', second='#ffcd75',
              panel='#ffffff', line='#1a1c2c', lcd='#a7f070',
              display="font-family:'Archivo';font-weight:900;font-stretch:125%;text-transform:uppercase;letter-spacing:-0.035em",
              body="font-family:'Archivo';font-weight:420;font-stretch:100%", h1='153px', h1_lh='0.86', title='186px', map='town_a.png'),
    'b': dict(name='Night shift', paper='#1a1c2c', ink='#f4f4f4', soft='#94b0c2', accent='#ffcd75', accent_ink='#1a1c2c', second='#41a6f6',
              panel='#29366f', line='#566c86', lcd='#a7f070',
              display="font-family:'Bitcount Grid Double';font-weight:500;text-transform:uppercase;letter-spacing:0",
              body="font-family:'Departure Mono';font-weight:400", h1='184px', h1_lh='0.92', title='250px', map='town_b.png'),
    'c': dict(name='Game manual', paper='#ffcd75', ink='#1a1c2c', soft='#29366f', accent='#3b5dc9', accent_ink='#f4f4f4', second='#f4f4f4',
              panel='#f4f4f4', line='#1a1c2c', lcd='#f4f4f4',
              display="font-family:'Bricolage Grotesque';font-weight:800;font-stretch:75%;text-transform:uppercase;letter-spacing:-0.03em;font-variation-settings:'opsz' 96",
              body="font-family:'Bricolage Grotesque';font-weight:450;font-stretch:100%", h1='292px', h1_lh='0.8', title='330px', map='town_c.png'),
}

def scaled(path, k):
    im = Image.open(HERE / path).convert('RGBA')
    out = HERE / f'_x{k}_{path}'
    im.resize((im.width * k, im.height * k), Image.NEAREST).save(out)
    return png(out), im.width * k, im.height * k

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--paper);color:var(--ink);%(body)s;font-size:19px;line-height:1.45;width:1440px;-webkit-font-smoothing:antialiased}
.ui{font-family:'Departure Mono',monospace;font-weight:400;letter-spacing:0}
.bar{height:64px;display:flex;align-items:center;gap:28px;padding:0 32px;border-bottom:3px solid var(--line)}
.mark{%(display)s;font-size:26px}
.bar nav{display:flex;gap:6px;margin-left:24px}
.bar nav a{font-size:15px;padding:7px 12px;color:var(--ink);text-decoration:none}
.bar nav a.on{background:var(--ink);color:var(--paper)}
.bar .right{margin-left:auto;display:flex;align-items:center;gap:14px;font-size:14px}
.chip{border:2px solid var(--ink);padding:6px 10px;font-size:14px;background:none;color:var(--ink)}
.btn{background:var(--accent);color:var(--accent_ink);border:3px solid var(--ink);box-shadow:4px 4px 0 var(--ink);padding:9px 14px;font-size:15px}
.hero{padding:26px 32px 22px;border-bottom:3px solid var(--line)}
.hero h1{%(display)s;font-size:%(h1)s;line-height:%(h1_lh)s;white-space:nowrap}
.hero .sub{display:flex;gap:40px;align-items:baseline;margin-top:16px}
.hero .role{font-size:20px;white-space:nowrap}
.hero .line{font-size:23px;max-width:880px;line-height:1.32}
.world{position:relative;height:720px;background-size:100%% 100%%;image-rendering:pixelated;border-bottom:3px solid var(--line)}
.sprite{position:absolute;image-rendering:pixelated}
.bubble{position:absolute;background:#f4f4f4;color:#1a1c2c;border:3px solid #1a1c2c;box-shadow:5px 5px 0 #1a1c2c;padding:14px 16px 16px;font-size:18px;line-height:1.3;width:430px}
.bubble::after{content:'';position:absolute;left:-13px;bottom:22px;width:20px;height:20px;background:#f4f4f4;border:solid #1a1c2c;border-width:0 0 3px 3px;transform:rotate(45deg)}
.replies{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.replies span{border:2px solid #1a1c2c;padding:5px 9px;font-size:14px;background:#ffcd75}
.replies span + span{background:#f4f4f4}
.hint{position:absolute;left:32px;bottom:22px;background:#1a1c2c;color:#f4f4f4;padding:8px 12px;font-size:14px}
.quest{position:absolute;right:32px;bottom:22px;background:#f4f4f4;color:#1a1c2c;border:3px solid #1a1c2c;padding:8px 12px;font-size:14px}
.ring{position:absolute;border:3px dashed #f4f4f4;outline:3px dashed #1a1c2c;outline-offset:-6px}
.tag{position:absolute;background:#ffcd75;color:#1a1c2c;border:3px solid #1a1c2c;padding:6px 10px;font-size:14px}
/* inner page */
.crumb{display:flex;gap:18px;align-items:center;padding:18px 32px;font-size:14px}
.head{display:grid;grid-template-columns:minmax(0,1fr) 380px;gap:40px;padding:6px 32px 30px;align-items:end;border-bottom:3px solid var(--line)}
.head h1{%(display)s;font-size:%(title)s;line-height:.8}
.head h1 small{display:block;font-size:.3em;letter-spacing:-.01em;margin-top:.12em}
.facts{display:grid;grid-template-columns:92px 1fr;gap:9px 14px;font-size:16px;padding-bottom:10px}
.facts dt{color:var(--soft)}
.stats{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:3px solid var(--line)}
.stats div{padding:22px 32px 24px;border-left:3px solid var(--line)}
.stats div:first-child{border-left:0}
.stats b{%(display)s;font-size:104px;line-height:.9;display:block}
.stats span{font-size:18px}
.cols{display:grid;grid-template-columns:230px 1fr;gap:44px;padding:36px 32px 48px}
.index{font-size:15px;display:grid;gap:4px;align-content:start}
.index a{padding:7px 10px;color:var(--ink)}
.index a.on{background:var(--ink);color:var(--paper)}
.main h2{%(display)s;font-size:62px;line-height:.92;margin:0 0 14px}
.main p{font-size:23px;line-height:1.38;max-width:850px}
.main section + section{margin-top:52px}
.phones{display:flex;gap:22px;margin-top:24px}
.phone{width:200px;height:400px;border:4px solid var(--ink);border-radius:26px;background:repeating-linear-gradient(135deg,var(--panel) 0 14px,transparent 14px 28px);display:grid;place-items:center;text-align:center;font-size:14px;padding:16px}
.try{position:relative;display:grid;grid-template-columns:300px 1fr;gap:36px;margin-top:26px;align-items:start}
.nokia{background:#333c57;border:4px solid #1a1c2c;border-radius:34px 34px 46px 46px;padding:26px 24px 30px;box-shadow:8px 8px 0 #1a1c2c}
.lcd{background:var(--lcd);color:#1a1c2c;border:4px solid #1a1c2c;padding:12px;font-size:17px;line-height:1.35;height:150px}
.keys{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:20px}
.keys span{background:#94b0c2;color:#1a1c2c;border:3px solid #1a1c2c;border-radius:9px;text-align:center;padding:5px 0;font-size:17px}
.keys span.hot{background:#ffcd75;box-shadow:0 0 0 4px #ef7d57}
.guards{display:grid;grid-template-columns:1fr 1fr;gap:0 34px;margin-top:8px}
.guards div{border-top:3px solid var(--line);padding:13px 0 15px;font-size:19px}
.guards b{display:block;font-family:'Departure Mono';font-weight:400;font-size:17px}
"""

def page(theme, body):
    t = THEMES[theme]
    vars_ = ';'.join(f'--{k}:{v}' for k, v in t.items() if k in ('paper', 'ink', 'soft', 'accent', 'accent_ink', 'second', 'panel', 'line', 'lcd'))
    css = CSS % dict(display=t['display'], body=t['body'], h1=t['h1'], h1_lh=t['h1_lh'], title=t['title'])
    return f"<!doctype html><html lang='en-GB'><head><meta charset='utf-8'><style>{FONTS}\n:root{{{vars_}}}\n{css}</style></head><body>{body}</body></html>"

def bar(active, back=False):
    links = ''.join(f"<a class='{'on' if n == active else ''}'>{n}</a>" for n in ('Town', 'Work', 'Projects', 'Stack', 'Card'))
    return f"<header class='bar ui'><div class='mark'>Cecil Lwala</div><nav>{links}</nav><div class='right'><span>23:31 in Nairobi</span><span class='chip'>Sound: off</span><span class='btn'>Skip to the work</span></div></header>"

def home(theme):
    t = THEMES[theme]
    m, _, _ = scaled(t['map'], 3)
    c, cw, ch = scaled('cecil_wave.png', 3)
    body = f"""{bar('Town')}
<section class='hero'><h1>Cecil Lwala</h1>
<div class='sub'><p class='role ui'>Software developer, Nairobi</p><p class='line'>I build mobile apps, the backends behind them and the infrastructure that keeps them running. This town is my career so far. Walk in anywhere.</p></div></section>
<section class='world' style="background-image:url({m})">
<div class='ring' style='left:1140px;top:36px;width:264px;height:264px'></div>
<div class='tag ui' style='left:1140px;top:306px'>The Musoni loan app: enter</div>
<img class='sprite' src='{c}' width='{cw}' height='{ch}' style='left:560px;top:248px'>
<div class='bubble ui' style='left:676px;top:292px'>Karibu! I'm Cecil. Where shall we start?
<div class='replies'><span>Show me your work</span><span>What's your stack?</span><span>Just the CV</span></div></div>
<div class='hint ui'>Click a building, or walk with the arrow keys</div>
<div class='quest ui'>Places visited 0 / 6</div>
</section>"""
    return page(theme, body)

def inner(theme):
    c, cw, ch = scaled('cecil_point.png', 6)
    keys = ''.join(f"<span class='{'hot' if k == '1' else ''}'>{k}</span>" for k in '123456789*0#')
    body = f"""{bar('Projects')}
<div class='crumb ui'><span class='chip'>Back to town</span><span>Place 4 of 6</span></div>
<section class='head'><h1>Musoni<small>The loan app I led</small></h1>
<dl class='facts ui'><dt>Role</dt><dd>Lead developer</dd><dt>When</dt><dd>May 2026 to now</dd><dt>Status</dt><dd>In testing for the Play Store</dd><dt>Built</dt><dd>Mobile app, backend, staff portal, USSD channel</dd><dt>Stack</dt><dd>Flutter, Spring Boot, PostgreSQL, M-Pesa</dd></dl></section>
<section class='stats'><div><b>130+</b><span>active users</span></div><div><b>4</b><span>things built: app, backend, staff portal, USSD</span></div><div><b>3</b><span>months from picking it up to closing the build</span></div></section>
<div class='cols'><nav class='index ui'><a class='on'>The brief</a><a>The app</a><a>Try the USSD menu</a><a>Behind the app</a><a>Safeguards</a><a>Seeing it run</a><a>What I learnt</a></nav>
<div class='main'>
<section><h2>The brief</h2><p>It started with conversations, not code. I picked the project up in May 2026 and sat with the client to learn what their borrowers needed: a loan they could apply for and repay from whatever phone they owned.</p></section>
<section><h2>The app</h2><p>Built in Flutter. Sign up with a phone number, a national ID and a selfie; drop out halfway and it picks up where you left. Every offer shows its full cost before you accept. Repay by M-Pesa and watch the payment land.</p>
<div class='phones ui'><div class='phone'>Screenshot<br>Sign-up</div><div class='phone'>Screenshot<br>Loan offer</div><div class='phone'>Screenshot<br>Repayment</div></div></section>
<section><h2>Try the USSD menu</h2><p>Not every borrower has a smartphone, so I built a USSD channel. This one works: press a key.</p>
<div class='try'><div class='nokia ui'><div class='lcd'>Karibu Musoni Capital<br><br>1. Apply for a loan<br>2. My loans</div><div class='keys'>{keys}</div></div>
<div style='position:relative;height:330px'><img class='sprite' src='{c}' width='{cw}' height='{ch}' style='left:-6px;top:86px;transform:scaleX(-1)'>
<div class='bubble ui' style='left:206px;top:40px;width:380px'>Go on, press 1. It is the same menu borrowers dial, with pretend money.</div></div></div></section>
<section><h2>Safeguards</h2><div class='guards'><div><b>Device binding</b>Sign-in is tied to the enrolled phone. A stolen PIN alone is not enough.</div><div><b>Certificate pinning</b>The app only talks to the genuine server.</div><div><b>App attestation</b>The server can tell a genuine app from a tampered one.</div><div><b>Screen protection</b>Sensitive screens cannot be screenshotted or recorded.</div></div></section>
</div></div>"""
    return page(theme, body)

if __name__ == '__main__':
    out = HERE / 'out'; out.mkdir(exist_ok=True)
    for th in THEMES:
        (out / f'{th}-home.html').write_text(home(th))
        (out / f'{th}-page.html').write_text(inner(th))
    print('ok', [p.name for p in out.iterdir()])
