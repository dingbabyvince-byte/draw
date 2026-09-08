# ORIGINAL_ASSET generator — project-owned SVG placeholders, no third-party art.
# Run once: python prototype/assets/_gen_assets.py
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def write(rel, content):
    path = ROOT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.strip() + "\n", encoding="utf-8")
    print("wrote", rel)


def svg(vb, body, w=None, h=None):
    parts = vb.split()
    ww = w or parts[2]
    hh = h or parts[3]
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{ww}" height="{hh}">\n{body}\n</svg>'


# ---------- Princess helpers ----------
def princess_body(expr="idle", tilt=0, arms="normal"):
    # 粉色可爱公主 — ORIGINAL_ASSET（原创，非萌可角色）
    eye = {
        "idle": ('<ellipse cx="82" cy="90" rx="9" ry="11" fill="#5b3a4a"/><ellipse cx="118" cy="90" rx="9" ry="11" fill="#5b3a4a"/><circle cx="85" cy="86" r="3" fill="#fff"/><circle cx="121" cy="86" r="3" fill="#fff"/>',
                 '<path d="M88 108 Q100 118 112 108" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "walk": ('<ellipse cx="82" cy="90" rx="9" ry="11" fill="#5b3a4a"/><ellipse cx="118" cy="90" rx="9" ry="11" fill="#5b3a4a"/><circle cx="85" cy="86" r="3" fill="#fff"/><circle cx="121" cy="86" r="3" fill="#fff"/>',
                 '<path d="M90 108 Q100 114 110 108" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "happy": ('<path d="M74 90 Q82 80 90 90" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/><path d="M110 90 Q118 80 126 90" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/>',
                  '<path d="M86 106 Q100 122 114 106" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "surprised": ('<circle cx="82" cy="88" r="8" fill="#5b3a4a"/><circle cx="118" cy="88" r="8" fill="#5b3a4a"/><circle cx="82" cy="88" r="3" fill="#fff"/><circle cx="118" cy="88" r="3" fill="#fff"/>',
                      '<ellipse cx="100" cy="112" rx="8" ry="10" fill="#5b3a4a"/>'),
        "slip": ('<ellipse cx="82" cy="90" rx="9" ry="11" fill="#5b3a4a"/><ellipse cx="118" cy="90" rx="9" ry="11" fill="#5b3a4a"/><circle cx="85" cy="86" r="3" fill="#fff"/><circle cx="121" cy="86" r="3" fill="#fff"/>',
                 '<path d="M88 112 Q100 104 112 112" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "swim": ('<ellipse cx="82" cy="90" rx="9" ry="11" fill="#5b3a4a"/><ellipse cx="118" cy="90" rx="9" ry="11" fill="#5b3a4a"/><circle cx="85" cy="86" r="3" fill="#fff"/><circle cx="121" cy="86" r="3" fill="#fff"/>',
                 '<ellipse cx="100" cy="112" rx="7" ry="5" fill="#c44e6a"/>'),
        "dance": ('<path d="M74 90 Q82 80 90 90" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/><path d="M110 90 Q118 80 126 90" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/>',
                  '<path d="M86 106 Q100 120 114 106" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="50" r="4" fill="#ffd45a"/><circle cx="130" cy="46" r="4" fill="#ff7eaa"/>'),
    }
    eyes, mouth = eye.get(expr, eye["idle"])
    if arms == "up":
        arm_l = '<rect x="46" y="92" width="20" height="64" rx="10" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3" transform="rotate(-30 56 124)"/>'
        arm_r = '<rect x="134" y="92" width="20" height="64" rx="10" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3" transform="rotate(30 144 124)"/>'
    elif arms == "swim":
        arm_l = '<rect x="22" y="158" width="64" height="18" rx="9" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/>'
        arm_r = '<rect x="114" y="158" width="64" height="18" rx="9" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/>'
    else:
        arm_l = '<rect x="50" y="150" width="20" height="72" rx="10" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/>'
        arm_r = '<rect x="130" y="150" width="20" height="72" rx="10" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/>'
    legs = ('<rect x="80" y="250" width="16" height="58" rx="8" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/><rect x="104" y="250" width="16" height="58" rx="8" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/>')
    if expr == "walk":
        legs = ('<rect x="74" y="250" width="16" height="58" rx="8" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3" transform="rotate(-14 82 279)"/><rect x="110" y="250" width="16" height="58" rx="8" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3" transform="rotate(14 118 279)"/>')
    if expr == "slip":
        legs = ('<rect x="66" y="246" width="16" height="62" rx="8" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3" transform="rotate(-24 74 277)"/><rect x="118" y="246" width="16" height="62" rx="8" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3" transform="rotate(26 126 277)"/>')
    water = ""
    if expr == "swim":
        water = '<ellipse cx="100" cy="258" rx="74" ry="18" fill="#7ad7ff" opacity="0.55"/><ellipse cx="70" cy="256" rx="12" ry="6" fill="#fff" opacity="0.5"/><ellipse cx="132" cy="260" rx="10" ry="5" fill="#fff" opacity="0.5"/>'
    g = f'''  <!-- ORIGINAL_ASSET: 彩虹小公主 {expr} -->
  <g transform="rotate({tilt} 100 170)">
    <path d="M52 88 Q50 30 100 26 Q150 30 148 88 L140 150 L60 150 Z" fill="#ff8fab" stroke="#e85a8a" stroke-width="4"/>
    <ellipse cx="46" cy="124" rx="16" ry="42" fill="#ff8fab" stroke="#e85a8a" stroke-width="4"/><ellipse cx="154" cy="124" rx="16" ry="42" fill="#ff8fab" stroke="#e85a8a" stroke-width="4"/>
    {arm_l}{arm_r}{legs}
    <path d="M72 150 Q100 142 128 150 L120 250 Q100 258 80 250 Z" fill="#ff6f9c" stroke="#d8336a" stroke-width="4"/><path d="M80 250 Q90 264 100 250 Q110 264 120 250" fill="none" stroke="#fff" stroke-width="4"/>
    <circle cx="100" cy="86" r="46" fill="#ffe0d4" stroke="#e8b98e" stroke-width="3"/>
    <path d="M58 72 Q70 38 100 36 Q130 38 142 72 Q124 58 100 58 Q76 58 58 72 Z" fill="#ff8fab" stroke="#e85a8a" stroke-width="3"/>
    {eyes}{mouth}
    <circle cx="72" cy="102" r="7" fill="#ff9bbf" opacity="0.6"/><circle cx="128" cy="102" r="7" fill="#ff9bbf" opacity="0.6"/>
    <path d="M130 50 C127 45 120 45 120 51 C120 56 130 63 130 63 C130 63 140 56 140 51 C140 45 133 45 130 50 Z" fill="#ff4d8d"/>
  </g>{water}'''
    return svg("0 0 200 320", g)


def mascot_body(expr="idle", tilt=0):
    eye = {
        "idle": ('<circle cx="82" cy="108" r="7" fill="#5b3a4a"/><circle cx="118" cy="108" r="7" fill="#5b3a4a"/>',
                 '<path d="M88 132 Q100 142 112 132" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "walk": ('<circle cx="82" cy="108" r="7" fill="#5b3a4a"/><circle cx="118" cy="108" r="7" fill="#5b3a4a"/>',
                 '<path d="M90 132 Q100 138 110 132" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "happy": ('<path d="M74 110 Q82 100 90 110" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/>'
                  '<path d="M110 110 Q118 100 126 110" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/>',
                  '<path d="M86 130 Q100 148 114 130" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "surprised": ('<circle cx="82" cy="106" r="8" fill="#5b3a4a"/><circle cx="118" cy="106" r="8" fill="#5b3a4a"/>'
                      '<circle cx="82" cy="106" r="3" fill="#fff"/><circle cx="118" cy="106" r="3" fill="#fff"/>',
                      '<ellipse cx="100" cy="136" rx="11" ry="13" fill="#5b3a4a"/>'),
        "slip": ('<circle cx="82" cy="108" r="7" fill="#5b3a4a"/><circle cx="118" cy="108" r="7" fill="#5b3a4a"/>',
                 '<path d="M88 140 Q100 130 112 140" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'),
        "swim": ('<circle cx="82" cy="108" r="7" fill="#5b3a4a"/><circle cx="118" cy="108" r="7" fill="#5b3a4a"/>',
                 '<ellipse cx="100" cy="134" rx="9" ry="7" fill="#c44e6a"/>'),
        "dance": ('<path d="M74 110 Q82 100 90 110" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/>'
                  '<path d="M110 110 Q118 100 126 110" fill="none" stroke="#5b3a4a" stroke-width="4" stroke-linecap="round"/>',
                  '<path d="M86 130 Q100 148 114 130" fill="none" stroke="#c44e6a" stroke-width="4" stroke-linecap="round"/>'
                  '<circle cx="55" cy="70" r="5" fill="#ffd45a"/><circle cx="145" cy="65" r="5" fill="#7ad7ff"/>'),
    }
    eyes, mouth = eye.get(expr, eye["idle"])
    legs = '<ellipse cx="76" cy="176" rx="16" ry="14" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/><ellipse cx="124" cy="176" rx="16" ry="14" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/>'
    if expr == "walk":
        legs = '<ellipse cx="68" cy="176" rx="16" ry="14" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/><ellipse cx="132" cy="172" rx="16" ry="14" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/>'
    if expr == "slip":
        legs = '<ellipse cx="60" cy="170" rx="16" ry="14" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4" transform="rotate(-20 60 170)"/><ellipse cx="140" cy="170" rx="16" ry="14" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4" transform="rotate(20 140 170)"/>'
    water = ""
    if expr == "swim":
        water = '<ellipse cx="100" cy="185" rx="78" ry="14" fill="#7ad7ff" opacity="0.5"/>'
    g = f'''  <!-- ORIGINAL_ASSET: 粉心星宝 {expr} -->
  <g transform="rotate({tilt} 100 110)">
    <line x1="100" y1="40" x2="100" y2="22" stroke="#ff7eaa" stroke-width="5" stroke-linecap="round"/>
    <path d="M100 8 L106 20 L118 22 L109 30 L112 42 L100 35 L88 42 L91 30 L82 22 L94 20 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="3"/>
    <path d="M58 60 L52 36 L74 52 Z" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/>
    <path d="M142 60 L148 36 L126 52 Z" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/>
    <ellipse cx="100" cy="118" rx="64" ry="60" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4"/>
    {legs}{eyes}{mouth}
    <circle cx="74" cy="126" r="7" fill="#ff9bbf" opacity="0.6"/>
    <circle cx="126" cy="126" r="7" fill="#ff9bbf" opacity="0.6"/>
  </g>{water}'''
    return svg("0 0 200 200", g)


# character states
for st, kw in [
    ("idle", {}), ("walk", {}), ("happy", {}), ("surprised", {}),
    ("slip", {"tilt": -18}), ("swim", {"arms": "swim"}), ("dance", {"arms": "up"}),
]:
    write(f"characters/princess-{st}.svg", princess_body(st, **kw))
for st, kw in [
    ("idle", {}), ("walk", {}), ("happy", {}), ("surprised", {}),
    ("slip", {"tilt": 22}), ("swim", {}), ("dance", {}),
]:
    write(f"characters/mascot-{st}.svg", mascot_body(st, **kw))

write("characters/original-princess-base.svg", princess_body("idle"))
write("characters/original-pink-mascot-base.svg", mascot_body("idle"))

# ---------- Clothes ----------
clothes = {
    "princess/crown.svg": svg("0 0 120 70", '''  <!-- ORIGINAL_ASSET: 小皇冠（金色+粉色宝石） -->
  <path d="M14 54 L24 18 L42 44 L60 12 L78 44 L96 18 L106 54 Z" fill="#ffd45a" stroke="#c79a00" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="24" cy="20" r="6" fill="#ff7eaa"/><circle cx="60" cy="14" r="7" fill="#ff4d8d"/><circle cx="96" cy="20" r="6" fill="#ff7eaa"/>
  <rect x="14" y="50" width="92" height="13" rx="6" fill="#ffe082" stroke="#c79a00" stroke-width="3"/>
  <circle cx="60" cy="56" r="4" fill="#ff4d8d"/>''', 120, 70),
    "princess/hairpin.svg": svg("0 0 90 60", '''  <!-- ORIGINAL_ASSET: 星月发饰 -->
  <path d="M28 30 Q20 12 38 10 Q30 22 36 34 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="3"/>
  <path d="M52 12 L56 24 L68 26 L58 34 L61 46 L52 39 L43 46 L46 34 L36 26 L48 24 Z" fill="#ff7eaa" stroke="#e05a8a" stroke-width="3"/>''', 90, 60),
    "princess/pink-dress.svg": svg("0 0 140 180", '''  <!-- ORIGINAL_ASSET: 粉色公主裙（覆盖躯干到膝盖的蓬蓬裙） -->
  <path d="M48 16 Q70 6 92 16 L96 70 Q70 80 44 70 Z" fill="#ff6f9c" stroke="#d8336a" stroke-width="4"/>
  <rect x="44" y="64" width="52" height="13" rx="6" fill="#ffd45a" stroke="#c79a00" stroke-width="3"/>
  <path d="M40 76 Q70 68 100 76 L126 170 Q70 180 14 170 Z" fill="#ff9ec4" stroke="#e85a8a" stroke-width="4"/>
  <path d="M30 118 Q70 110 110 118" fill="none" stroke="#fff" stroke-width="4" opacity="0.85"/>
  <path d="M22 150 Q70 142 118 150" fill="none" stroke="#fff" stroke-width="4" opacity="0.85"/>
  <path d="M14 170 Q40 166 70 170 Q100 174 126 170" fill="none" stroke="#fff" stroke-width="4" opacity="0.85"/>
  <path d="M70 38 C67 33 60 33 60 39 C60 44 70 51 70 51 C70 51 80 44 80 39 C80 33 73 33 70 38 Z" fill="#ff4d8d"/>
  <circle cx="55" cy="132" r="5" fill="#fff" opacity="0.75"/><circle cx="85" cy="152" r="5" fill="#fff" opacity="0.75"/><circle cx="70" cy="100" r="4" fill="#fff" opacity="0.75"/>''', 140, 180),
    "princess/blue-dress.svg": svg("0 0 140 180", '''  <!-- ORIGINAL_ASSET: 蓝色蓬蓬裙 -->
  <path d="M52 18 Q70 6 88 18 L98 64 Q130 150 70 172 Q10 150 42 64 Z" fill="#7ad7ff" stroke="#3aa8d8" stroke-width="4"/>
  <ellipse cx="70" cy="120" rx="48" ry="28" fill="#a8e8ff" opacity="0.55"/>
  <circle cx="55" cy="90" r="5" fill="#fff"/><circle cx="85" cy="100" r="5" fill="#fff"/>''', 140, 180),
    "princess/cape.svg": svg("0 0 160 170", '''  <!-- ORIGINAL_ASSET: 披风 -->
  <path d="M50 20 Q80 10 110 20 L140 150 Q80 170 20 150 Z" fill="#b48cff" stroke="#8a5cd6" stroke-width="4"/>
  <path d="M55 30 Q80 22 105 30 L120 120 Q80 135 40 120 Z" fill="#d4b8ff" opacity="0.7"/>''', 160, 170),
    "princess/wings.svg": svg("0 0 180 140", '''  <!-- ORIGINAL_ASSET: 蝴蝶翅膀（粉色半透明） -->
  <path d="M90 70 Q40 18 18 70 Q16 122 60 112 Q82 102 90 70 Z" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4" opacity="0.88"/>
  <path d="M90 70 Q140 18 162 70 Q164 122 120 112 Q98 102 90 70 Z" fill="#ffd1e6" stroke="#ff7eaa" stroke-width="4" opacity="0.88"/>
  <circle cx="46" cy="72" r="9" fill="#fff" opacity="0.7"/><circle cx="134" cy="72" r="9" fill="#fff" opacity="0.7"/>
  <circle cx="40" cy="98" r="6" fill="#ff4d8d" opacity="0.6"/><circle cx="140" cy="98" r="6" fill="#ff4d8d" opacity="0.6"/>''', 180, 140),
    "princess/necklace.svg": svg("0 0 100 60", '''  <!-- ORIGINAL_ASSET: 珍珠项链 -->
  <path d="M20 18 Q50 48 80 18" fill="none" stroke="#e8d5a3" stroke-width="4"/>
  <circle cx="28" cy="24" r="5" fill="#fff" stroke="#d4c08a" stroke-width="2"/>
  <circle cx="42" cy="34" r="5" fill="#fff" stroke="#d4c08a" stroke-width="2"/>
  <circle cx="50" cy="38" r="7" fill="#ff7eaa" stroke="#e05a8a" stroke-width="2"/>
  <circle cx="58" cy="34" r="5" fill="#fff" stroke="#d4c08a" stroke-width="2"/>
  <circle cx="72" cy="24" r="5" fill="#fff" stroke="#d4c08a" stroke-width="2"/>''', 100, 60),
    "princess/shoes.svg": svg("0 0 140 50", '''  <!-- ORIGINAL_ASSET: 粉色小皮鞋（芭蕾风） -->
  <ellipse cx="40" cy="32" rx="31" ry="16" fill="#ff6f9c" stroke="#d8336a" stroke-width="3"/>
  <ellipse cx="100" cy="32" rx="31" ry="16" fill="#ff6f9c" stroke="#d8336a" stroke-width="3"/>
  <path d="M28 22 Q40 12 52 22" fill="none" stroke="#ffd45a" stroke-width="3" stroke-linecap="round"/>
  <path d="M88 22 Q100 12 112 22" fill="none" stroke="#ffd45a" stroke-width="3" stroke-linecap="round"/>
  <circle cx="40" cy="34" r="3" fill="#ffd45a"/><circle cx="100" cy="34" r="3" fill="#ffd45a"/>''', 140, 50),
    "princess/wand.svg": svg("0 0 70 140", '''  <!-- ORIGINAL_ASSET: 魔法棒 -->
  <rect x="30" y="40" width="10" height="90" rx="5" fill="#c9a0ff" stroke="#8a5cd6" stroke-width="3"/>
  <path d="M35 8 L40 26 L58 28 L44 38 L48 56 L35 46 L22 56 L26 38 L12 28 L30 26 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="3"/>''', 70, 140),
    "princess/swimsuit.svg": svg("0 0 120 160", '''  <!-- ORIGINAL_ASSET: 泳装 -->
  <path d="M40 30 Q60 18 80 30 L85 70 Q90 110 60 130 Q30 110 35 70 Z" fill="#7ad7ff" stroke="#3aa8d8" stroke-width="4"/>
  <path d="M38 55 H82" stroke="#fff" stroke-width="5"/>
  <circle cx="50" cy="80" r="4" fill="#fff"/><circle cx="70" cy="90" r="4" fill="#fff"/>''', 120, 160),
    "princess/beach-outfit.svg": svg("0 0 140 180", '''  <!-- ORIGINAL_ASSET: 海边度假服 -->
  <path d="M48 22 Q70 10 92 22 L100 60 Q115 140 70 160 Q25 140 40 60 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="4"/>
  <path d="M45 70 H95" stroke="#ff7eaa" stroke-width="6"/>
  <circle cx="58" cy="95" r="5" fill="#7ad7ff"/><circle cx="82" cy="110" r="5" fill="#7ad7ff"/>''', 140, 180),
    "mascot/crown.svg": svg("0 0 120 70", '''  <!-- ORIGINAL_ASSET: 萌宠小皇冠 -->
  <path d="M20 50 L30 16 L48 38 L60 10 L72 38 L90 16 L100 50 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="4"/>
  <circle cx="60" cy="10" r="7" fill="#ff7eaa"/>''', 120, 70),
    "mascot/dress.svg": svg("0 0 150 140", '''  <!-- ORIGINAL_ASSET: 萌宠蓬蓬裙 -->
  <path d="M40 20 Q75 8 110 20 L130 110 Q75 130 20 110 Z" fill="#ff9bbf" stroke="#e05a8a" stroke-width="4"/>
  <ellipse cx="75" cy="80" rx="45" ry="22" fill="#ffd1e6" opacity="0.6"/>''', 150, 140),
    "mascot/cape.svg": svg("0 0 160 140", '''  <!-- ORIGINAL_ASSET: 萌宠披风 -->
  <path d="M45 15 Q80 5 115 15 L145 120 Q80 135 15 120 Z" fill="#7ad7ff" stroke="#3aa8d8" stroke-width="4"/>''', 160, 140),
    "mascot/wings.svg": svg("0 0 180 120", '''  <!-- ORIGINAL_ASSET: 萌宠翅膀 -->
  <ellipse cx="40" cy="60" rx="36" ry="48" fill="#ffe9a8" stroke="#e8a900" stroke-width="4" opacity="0.9"/>
  <ellipse cx="140" cy="60" rx="36" ry="48" fill="#ffe9a8" stroke="#e8a900" stroke-width="4" opacity="0.9"/>''', 180, 120),
    "mascot/shoes.svg": svg("0 0 140 50", '''  <!-- ORIGINAL_ASSET: 萌宠小鞋 -->
  <ellipse cx="40" cy="28" rx="26" ry="15" fill="#b48cff" stroke="#8a5cd6" stroke-width="3"/>
  <ellipse cx="100" cy="28" rx="26" ry="15" fill="#b48cff" stroke="#8a5cd6" stroke-width="3"/>''', 140, 50),
    "mascot/chef-outfit.svg": svg("0 0 150 150", '''  <!-- ORIGINAL_ASSET: 厨师服 -->
  <ellipse cx="75" cy="28" rx="38" ry="22" fill="#fff" stroke="#cfd8dc" stroke-width="3"/>
  <rect x="45" y="45" width="60" height="85" rx="12" fill="#fff" stroke="#cfd8dc" stroke-width="3"/>
  <circle cx="75" cy="70" r="6" fill="#ff7eaa"/><circle cx="75" cy="95" r="6" fill="#ff7eaa"/>''', 150, 150),
    "mascot/beach-outfit.svg": svg("0 0 150 130", '''  <!-- ORIGINAL_ASSET: 萌宠海边度假服 -->
  <path d="M35 30 Q75 15 115 30 L125 100 Q75 115 25 100 Z" fill="#7ad7ff" stroke="#3aa8d8" stroke-width="4"/>
  <path d="M40 55 H110" stroke="#ffd45a" stroke-width="6"/>''', 150, 130),
}
for rel, content in clothes.items():
    write(f"clothes/{rel}", content)

# ---------- Scenes ----------
scenes = {
    "pool.svg": svg("0 0 800 500", '''  <!-- ORIGINAL_ASSET: 泳池场景 -->
  <rect width="800" height="500" fill="#b8ecff"/>
  <rect y="280" width="800" height="220" fill="#5ec8f0"/>
  <ellipse cx="400" cy="360" rx="280" ry="90" fill="#7ad7ff"/>
  <rect x="120" y="250" width="560" height="28" rx="8" fill="#fff" opacity="0.7"/>
  <circle cx="120" cy="80" r="40" fill="#ffd45a"/><circle cx="200" cy="70" r="28" fill="#fff" opacity="0.85"/><circle cx="250" cy="80" r="34" fill="#fff" opacity="0.75"/>
  <rect x="40" y="300" width="60" height="120" fill="#8bc34a"/><rect x="700" y="310" width="50" height="110" fill="#8bc34a"/>'''),
    "beach.svg": svg("0 0 800 500", '''  <!-- ORIGINAL_ASSET: 海边场景 -->
  <rect width="800" height="500" fill="#87d6ff"/>
  <circle cx="680" cy="90" r="48" fill="#ffd45a"/>
  <rect y="260" width="800" height="120" fill="#5ec8f0"/>
  <rect y="360" width="800" height="140" fill="#f5e0a8"/>
  <ellipse cx="180" cy="390" rx="70" ry="28" fill="#e8c878"/>
  <path d="M520 360 L560 280 L600 360 Z" fill="#8d6e63"/><ellipse cx="560" cy="270" rx="55" ry="30" fill="#66bb6a"/>
  <circle cx="120" cy="100" r="30" fill="#fff" opacity="0.8"/><circle cx="160" cy="95" r="36" fill="#fff" opacity="0.75"/>'''),
    "restaurant.svg": svg("0 0 800 500", '''  <!-- ORIGINAL_ASSET: 餐厅场景 -->
  <rect width="800" height="500" fill="#fff3e0"/>
  <rect y="360" width="800" height="140" fill="#d7ccc8"/>
  <rect x="80" y="200" width="200" height="160" rx="12" fill="#ffe0b2" stroke="#e0a86a" stroke-width="4"/>
  <rect x="520" y="180" width="200" height="180" rx="12" fill="#ffccbc" stroke="#e8957a" stroke-width="4"/>
  <rect x="300" y="240" width="200" height="120" rx="10" fill="#fff" stroke="#cfd8dc" stroke-width="4"/>
  <circle cx="400" cy="280" r="28" fill="#ff7043"/><rect x="360" y="300" width="80" height="10" fill="#8d6e63"/>
  <rect x="0" y="0" width="800" height="60" fill="#ffab91"/>'''),
    "kitchen.svg": svg("0 0 800 500", '''  <!-- ORIGINAL_ASSET: 厨房场景 -->
  <rect width="800" height="500" fill="#e8f5e9"/>
  <rect y="340" width="800" height="160" fill="#b0bec5"/>
  <rect x="60" y="180" width="260" height="160" rx="10" fill="#eceff1" stroke="#90a4ae" stroke-width="4"/>
  <circle cx="140" cy="250" r="36" fill="#78909c"/><circle cx="240" cy="250" r="36" fill="#78909c"/>
  <rect x="480" y="200" width="240" height="140" rx="10" fill="#fff" stroke="#90a4ae" stroke-width="4"/>
  <rect x="520" y="230" width="80" height="60" rx="6" fill="#81d4fa"/><rect x="620" y="240" width="60" height="50" rx="6" fill="#ffab91"/>
  <rect x="0" y="0" width="800" height="50" fill="#a5d6a7"/>'''),
    "living-room.svg": svg("0 0 800 500", '''  <!-- ORIGINAL_ASSET: 客厅场景 -->
  <rect width="800" height="500" fill="#ede7f6"/>
  <rect y="360" width="800" height="140" fill="#d7ccc8"/>
  <rect x="100" y="220" width="280" height="140" rx="18" fill="#ce93d8" stroke="#ab47bc" stroke-width="4"/>
  <rect x="120" y="200" width="80" height="40" rx="10" fill="#ce93d8"/><rect x="280" y="200" width="80" height="40" rx="10" fill="#ce93d8"/>
  <rect x="480" y="180" width="220" height="160" rx="8" fill="#90caf9" stroke="#64b5f6" stroke-width="4"/>
  <circle cx="590" cy="250" r="40" fill="#fff59d"/><rect x="40" y="80" width="120" height="90" rx="8" fill="#fff" stroke="#b39ddb" stroke-width="3"/>
  <rect x="0" y="0" width="800" height="40" fill="#b39ddb"/>'''),
}
for name, content in scenes.items():
    write(f"scenes/{name}", content)

# ---------- Objects ----------
objects = {
    "banana.svg": svg("0 0 80 80", '''  <!-- ORIGINAL_ASSET: 香蕉皮 -->
  <path d="M20 30 Q40 10 60 28 Q55 50 40 55 Q25 50 20 30 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="3"/>
  <path d="M28 35 Q40 48 52 35" fill="none" stroke="#e8a900" stroke-width="3"/>''', 80, 80),
    "treasure-chest.svg": svg("0 0 90 80", '''  <!-- ORIGINAL_ASSET: 宝箱 -->
  <rect x="12" y="30" width="66" height="40" rx="6" fill="#c98a3a" stroke="#8d5a1f" stroke-width="3"/>
  <path d="M12 34 Q45 8 78 34" fill="#e0a85a" stroke="#8d5a1f" stroke-width="3"/>
  <rect x="38" y="42" width="14" height="16" rx="3" fill="#ffd45a" stroke="#e8a900" stroke-width="2"/>''', 90, 80),
    "piano.svg": svg("0 0 110 80", '''  <!-- ORIGINAL_ASSET: 钢琴 -->
  <rect x="8" y="20" width="94" height="48" rx="6" fill="#5b3a4a" stroke="#3a2430" stroke-width="3"/>
  <rect x="16" y="28" width="12" height="32" fill="#fff"/><rect x="32" y="28" width="12" height="32" fill="#fff"/>
  <rect x="48" y="28" width="12" height="32" fill="#fff"/><rect x="64" y="28" width="12" height="32" fill="#fff"/>
  <rect x="80" y="28" width="12" height="32" fill="#fff"/>
  <rect x="26" y="28" width="8" height="20" fill="#222"/><rect x="42" y="28" width="8" height="20" fill="#222"/><rect x="74" y="28" width="8" height="20" fill="#222"/>''', 110, 80),
    "swimming-ring.svg": svg("0 0 90 90", '''  <!-- ORIGINAL_ASSET: 游泳圈 -->
  <circle cx="45" cy="45" r="36" fill="none" stroke="#ff7eaa" stroke-width="16"/>
  <circle cx="45" cy="45" r="36" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10 8"/>''', 90, 90),
    "magic-door.svg": svg("0 0 70 110", '''  <!-- ORIGINAL_ASSET: 魔法门 -->
  <path d="M10 100 V30 Q35 5 60 30 V100 Z" fill="#b48cff" stroke="#8a5cd6" stroke-width="4"/>
  <circle cx="48" cy="60" r="6" fill="#ffd45a"/>
  <path d="M20 40 L50 40" stroke="#d4b8ff" stroke-width="3"/>''', 70, 110),
    "cat.svg": svg("0 0 90 80", '''  <!-- ORIGINAL_ASSET: 小猫 -->
  <ellipse cx="48" cy="50" rx="28" ry="22" fill="#ffcc80" stroke="#e0a050" stroke-width="3"/>
  <circle cx="48" cy="30" r="18" fill="#ffcc80" stroke="#e0a050" stroke-width="3"/>
  <path d="M32 18 L28 4 L40 14 Z" fill="#ffcc80" stroke="#e0a050" stroke-width="2"/>
  <path d="M64 18 L68 4 L56 14 Z" fill="#ffcc80" stroke="#e0a050" stroke-width="2"/>
  <circle cx="42" cy="28" r="3" fill="#5b3a4a"/><circle cx="54" cy="28" r="3" fill="#5b3a4a"/>
  <path d="M48 32 L48 38" stroke="#e05a8a" stroke-width="2"/><path d="M70 55 Q82 40 78 30" fill="none" stroke="#e0a050" stroke-width="4"/>''', 90, 80),
    "table-food.svg": svg("0 0 100 80", '''  <!-- ORIGINAL_ASSET: 餐桌美食 -->
  <ellipse cx="50" cy="55" rx="40" ry="14" fill="#8d6e63"/>
  <ellipse cx="50" cy="40" rx="28" ry="18" fill="#ff7043" stroke="#e64a19" stroke-width="3"/>
  <circle cx="42" cy="36" r="5" fill="#fff"/><circle cx="58" cy="42" r="4" fill="#fff"/>''', 100, 80),
    "pot.svg": svg("0 0 90 80", '''  <!-- ORIGINAL_ASSET: 锅具 -->
  <ellipse cx="45" cy="55" rx="32" ry="18" fill="#78909c" stroke="#546e7a" stroke-width="3"/>
  <rect x="20" y="28" width="50" height="30" rx="8" fill="#90a4ae" stroke="#546e7a" stroke-width="3"/>
  <rect x="8" y="38" width="18" height="8" rx="3" fill="#546e7a"/><rect x="64" y="38" width="18" height="8" rx="3" fill="#546e7a"/>
  <path d="M35 22 Q45 8 55 22" fill="none" stroke="#b0bec5" stroke-width="4"/>''', 90, 80),
    "plant.svg": svg("0 0 70 90", '''  <!-- ORIGINAL_ASSET: 花盆 -->
  <path d="M18 50 L22 85 H48 L52 50 Z" fill="#e8957a" stroke="#c96a4a" stroke-width="3"/>
  <ellipse cx="35" cy="28" rx="18" ry="22" fill="#66bb6a" stroke="#43a047" stroke-width="3"/>
  <circle cx="28" cy="22" r="5" fill="#ff7eaa"/><circle cx="42" cy="30" r="5" fill="#ffd45a"/>''', 70, 90),
    "ball.svg": svg("0 0 70 70", '''  <!-- ORIGINAL_ASSET: 小球 -->
  <circle cx="35" cy="35" r="28" fill="#fff" stroke="#90a4ae" stroke-width="3"/>
  <path d="M35 7 Q50 35 35 63 Q20 35 35 7" fill="none" stroke="#ef5350" stroke-width="3"/>
  <path d="M8 35 H62" stroke="#42a5f5" stroke-width="3"/>''', 70, 70),
    "tree.svg": svg("0 0 90 120", '''  <!-- ORIGINAL_ASSET: 大树 -->
  <rect x="38" y="70" width="14" height="42" rx="4" fill="#8d6e63"/>
  <circle cx="45" cy="50" r="36" fill="#66bb6a" stroke="#43a047" stroke-width="3"/>
  <circle cx="28" cy="42" r="16" fill="#81c784"/><circle cx="60" cy="38" r="18" fill="#81c784"/>''', 90, 120),
    "star-egg.svg": svg("0 0 60 60", '''  <!-- ORIGINAL_ASSET: 隐藏星星彩蛋 -->
  <path d="M30 6 L36 22 L54 24 L40 36 L44 54 L30 44 L16 54 L20 36 L6 24 L24 22 Z" fill="#ffd45a" stroke="#e8a900" stroke-width="3"/>''', 60, 60),
    "mushroom.svg": svg("0 0 70 70", '''  <!-- ORIGINAL_ASSET: 小蘑菇 -->
  <rect x="28" y="36" width="14" height="26" rx="4" fill="#fff3e0" stroke="#e0c8a0" stroke-width="2"/>
  <path d="M12 40 Q35 8 58 40 Z" fill="#ef5350" stroke="#c62828" stroke-width="3"/>
  <circle cx="28" cy="28" r="4" fill="#fff"/><circle cx="42" cy="22" r="5" fill="#fff"/>''', 70, 70),
}
for name, content in objects.items():
    write(f"objects/{name}", content)

print("done")
