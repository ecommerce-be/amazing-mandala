# Rigenera public/logo.svg e src/app/icon.svg (poi aggiornare src/components/Logo.tsx).
# Uso: python scripts/generate-logo.py
import math
RAINBOW=['#d7263d','#f46036','#f4c430','#7cb518','#1b998b','#2e6fdb','#6a3fa0','#c2187a']
INK='#1f2a44'; GOLD='#d9a21b'
def petal(cx,cy,r0,r1,w,ang):
    # petalo a goccia da r0 a r1, larghezza w, ruotato di ang gradi
    a=math.radians(ang); ux,uy=math.cos(a),math.sin(a); px,py=-uy,ux
    p0=(cx+ux*r0,cy+uy*r0); p1=(cx+ux*r1,cy+uy*r1); m=(r0+r1)/2
    c1=(cx+ux*m+px*w,cy+uy*m+py*w); c2=(cx+ux*m-px*w,cy+uy*m-py*w)
    f=lambda p:f"{p[0]:.2f} {p[1]:.2f}"
    return f"M{f(p0)} Q{f(c1)} {f(p1)} Q{f(c2)} {f(p0)}Z"
def mark(cx=100,cy=100,s=1.0):
    o=[]; W=lambda v:f"{v*s:.2f}"
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{W(80)}" fill="#f6efe2" stroke="{INK}" stroke-width="{W(1.1)}"/>')
    for i in range(32):
        c=RAINBOW[(i//2)%8] if i%2==0 else GOLD
        o.append(f'<path d="{petal(cx,cy,68*s,79*s,3.6*s,i*11.25-90)}" fill="{c}" stroke="{INK}" stroke-width="{W(0.5)}"/>')
    for i in range(16):
        ang=i*22.5-90; c=RAINBOW[i%8]
        o.append(f'<path d="{petal(cx,cy,40*s,69*s,9.5*s,ang)}" fill="{c}" stroke="{INK}" stroke-width="{W(0.8)}"/>')
        o.append(f'<path d="{petal(cx,cy,46*s,63*s,4*s,ang)}" fill="#f6efe2" fill-opacity="0.55"/>')
    for i in range(16):
        ang=i*22.5-90+11.25; c=RAINBOW[(i+4)%8]
        o.append(f'<path d="{petal(cx,cy,44*s,62*s,3.2*s,ang)}" fill="{c}" stroke="{INK}" stroke-width="{W(0.5)}"/>')
        x=cx+math.cos(math.radians(ang))*65*s; y=cy+math.sin(math.radians(ang))*65*s
        o.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{W(1.8)}" fill="{GOLD}" stroke="{INK}" stroke-width="{W(0.4)}"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{W(42)}" fill="{INK}"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{W(39.5)}" fill="none" stroke="{GOLD}" stroke-width="{W(0.8)}" stroke-dasharray="{W(1.5)} {W(2)}"/>')
    for i in range(12):
        ang=i*30-90; c=GOLD if i%2==0 else '#f46036'
        o.append(f'<path d="{petal(cx,cy,19*s,38*s,7.5*s,ang)}" fill="{c}" stroke="{INK}" stroke-width="{W(0.7)}"/>')
    for i in range(8):
        ang=i*45-90+22.5; c=['#1b998b','#c2187a'][i%2]
        o.append(f'<path d="{petal(cx,cy,8*s,25*s,6*s,ang)}" fill="{c}" stroke="{INK}" stroke-width="{W(0.6)}"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{W(9)}" fill="#f4c430" stroke="{INK}" stroke-width="{W(0.8)}"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{W(5)}" fill="#d7263d"/>')
    o.append(f'<circle cx="{cx}" cy="{cy}" r="{W(2)}" fill="#f6efe2"/>')
    return '\n  '.join(o)
RED='#d90f1f'; CREAM='#f6efe2'
CAP="var(--font-marcellus), Marcellus, Georgia, serif"
SCRIPT="var(--font-script), 'Great Vibes', cursive"
def full_logo(cap=CAP, script=SCRIPT):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="Amazing Mandala">
  <defs>
    <path id="am-top" d="M 33 120 A 87 87 0 0 1 207 120"/>
    <path id="am-bottom" d="M 17.5 120 A 102.5 102.5 0 0 0 222.5 120"/>
  </defs>
  <circle cx="120" cy="120" r="118" fill="{RED}"/>
  <circle cx="120" cy="120" r="115.5" fill="none" stroke="{GOLD}" stroke-width="1.2"/>
  <circle cx="120" cy="120" r="72" fill="{CREAM}" stroke="{GOLD}" stroke-width="1.2"/>
  {mark(120,120,0.86)}
  <text fill="{CREAM}" letter-spacing="2.5"><textPath href="#am-top" startOffset="50%" text-anchor="middle"><tspan font-family="{cap}" font-size="29">A</tspan><tspan font-family="{script}" font-size="43">mazing</tspan></textPath></text>
  <text fill="{CREAM}" letter-spacing="2.5"><textPath href="#am-bottom" startOffset="50%" text-anchor="middle"><tspan font-family="{cap}" font-size="29">M</tspan><tspan font-family="{script}" font-size="43">andala</tspan></textPath></text>
</svg>'''
icon=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="18 18 164 164">
  {mark(100,100,1.0)}
</svg>'''
open('logo.svg','w').write(full_logo("Marcellus, Georgia, serif","'Great Vibes', cursive")); open('icon.svg','w').write(icon)
open('logo.inner.svg','w').write(full_logo())
