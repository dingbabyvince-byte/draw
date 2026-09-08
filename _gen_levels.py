# -*- coding: utf-8 -*-
# ORIGINAL_ASSET 关卡生成器：用几何形状拼出 50 张可涂色线稿。
# 用法：python prototype/_gen_levels.py            -> 写入 prototype/levels.js
#       python prototype/_gen_levels.py other.js   -> 写入指定文件（用于自检，不覆盖 levels.js）
# 约束：仅用 circle/ellipse/rect/path(多边形与简单曲线)，不用 clipPath/mask/gradient，
#       保证 flutter_svg 可复用；每张含 region(data-id 唯一/data-name/data-hint)+deco+palette+sticker。
import sys, os

ROOT = os.path.dirname(os.path.abspath(__file__))

def R(shape, name, hint, **k):
    d = {"shape": shape, "name": name, "hint": hint}
    d.update(k)
    return d

def render_region(rid, d):
    n = '"' + d["name"] + '"'; h = '"' + d["hint"] + '"'
    if d["shape"] == "circle":
        return '<circle class="region" data-id="%s" data-name=%s data-hint=%s cx="%.0f" cy="%.0f" r="%.0f"/>' % (rid, n, h, d["cx"], d["cy"], d["r"])
    if d["shape"] == "ellipse":
        return '<ellipse class="region" data-id="%s" data-name=%s data-hint=%s cx="%.0f" cy="%.0f" rx="%.0f" ry="%.0f"/>' % (rid, n, h, d["cx"], d["cy"], d["rx"], d["ry"])
    if d["shape"] == "rect":
        return '<rect class="region" data-id="%s" data-name=%s data-hint=%s x="%.0f" y="%.0f" width="%.0f" height="%.0f"/>' % (rid, n, h, d["x"], d["y"], d["w"], d["h"])
    if d["shape"] == "path":
        return '<path class="region" data-id="%s" data-name=%s data-hint=%s d="%s"/>' % (rid, n, h, d["d"])
    return ""

# ---------- doodad 库：每个返回 ([region...], [deco_svg...])，绕 (cx,cy) 缩放 s ----------
def sun(cx, cy, s):
    return ([R("circle", "太阳", "#ffd45a", cx=cx, cy=cy, r=46 * s)], [])
def cloud(cx, cy, s):
    return ([R("ellipse", "白云", "#cfe8ff", cx=cx, cy=cy, rx=70 * s, ry=30 * s)], [])
def grass(cx, cy, s, w=800):
    d = "M0 %.0f Q%.0f %.0f %.0f %.0f T%.0f %.0f L%.0f 600 L0 600 Z" % (cy, w * .25, cy - 22 * s, w * .5, cy, w, cy, w)
    return ([R("path", "草地", "#66bb6a", d=d)], [])
def water(cx, cy, s, w=800):
    d = "M0 %.0f Q%.0f %.0f %.0f %.0f T%.0f %.0f L%.0f 600 L0 600 Z" % (cy, w * .25, cy - 14 * s, w * .5, cy, w, cy, w)
    return ([R("path", "水面", "#4fc3f7", d=d)], [])
def road(cx, cy, s, w=800):
    return ([R("rect", "马路", "#8d6e63", x=0, y=cy, w=w, h=26 * s)], [])
def tree(cx, cy, s):
    trunk = R("rect", "树干", "#8d6e63", x=cx - 12 * s, y=cy + 30 * s, w=24 * s, h=80 * s)
    crown = R("circle", "树冠", "#43a047", cx=cx, cy=cy, r=60 * s)
    return ([trunk, crown], [])
def bush(cx, cy, s):
    return ([R("circle", "灌木", "#66bb6a", cx=cx, cy=cy, r=46 * s)], [])
def flower(cx, cy, s, col="#ec407a"):
    pet = []
    for dx, dy in [(0, -40), (40, 0), (0, 40), (-40, 0)]:
        pet.append(R("circle", "花瓣", col, cx=cx + dx * s, cy=cy + dy * s, r=30 * s))
    cen = R("circle", "花心", "#fdd835", cx=cx, cy=cy, r=24 * s)
    deco = ['<path class="deco" d="M%.0f %.0f L%.0f %.0f" stroke="#43a047" stroke-width="10" fill="none" stroke-linecap="round"/>' % (cx, cy + 24 * s, cx, cy + 96 * s)]
    return (pet + [cen], deco)
def mushroom(cx, cy, s):
    cap = R("path", "蘑菇伞", "#ef5350", d="M%.0f %.0f Q%.0f %.0f %.0f %.0f Q%.0f %.0f %.0f %.0f Z" % (cx - 50 * s, cy, cx, cy - 50 * s, cx + 50 * s, cy, cx, cy + 10 * s, cx - 50 * s, cy))
    stem = R("rect", "蘑菇柄", "#fff3e0", x=cx - 12 * s, y=cy, w=24 * s, h=40 * s)
    return ([cap, stem], [])
def house(cx, cy, s, wall="#ffe0b2", roof="#e57373"):
    w = R("rect", "墙", wall, x=cx - 110 * s, y=cy, w=220 * s, h=170 * s)
    r = R("path", "屋顶", roof, d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 130 * s, cy, cx, cy - 90 * s, cx + 130 * s, cy))
    door = R("rect", "门", "#8d6e63", x=cx - 28 * s, y=cy + 80 * s, w=56 * s, h=90 * s)
    w1 = R("rect", "左窗", "#81d4fa", x=cx - 86 * s, y=cy + 30 * s, w=48 * s, h=48 * s)
    w2 = R("rect", "右窗", "#81d4fa", x=cx + 38 * s, y=cy + 30 * s, w=48 * s, h=48 * s)
    chim = R("rect", "烟囱", "#a1887f", x=cx + 40 * s, y=cy - 90 * s, w=30 * s, h=70 * s)
    return ([chim, w, r, door, w1, w2], [])  # 烟囱在前先画避免被屋顶盖死
def car(cx, cy, s, body="#e57373"):
    b = R("rect", "车身", body, x=cx - 150 * s, y=cy, w=300 * s, h=80 * s)
    cab = R("path", "车顶", "#ef5350", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 90 * s, cy, cx - 50 * s, cy - 60 * s, cx + 60 * s, cy - 60 * s, cx + 100 * s, cy))
    w1 = R("circle", "左轮", "#37474f", cx=cx - 90 * s, cy=cy + 80 * s, r=34 * s)
    h1 = R("circle", "左轮毂", "#cfd8dc", cx=cx - 90 * s, cy=cy + 80 * s, r=15 * s)
    w2 = R("circle", "右轮", "#37474f", cx=cx + 90 * s, cy=cy + 80 * s, r=34 * s)
    h2 = R("circle", "右轮毂", "#cfd8dc", cx=cx + 90 * s, cy=cy + 80 * s, r=15 * s)
    light = R("circle", "车灯", "#fdd835", cx=cx + 140 * s, cy=cy + 30 * s, r=14 * s)
    return ([b, cab, w1, w2, h1, h2, light], [])
def boat(cx, cy, s):
    hull = R("path", "船身", "#8d6e63", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 110 * s, cy, cx + 110 * s, cy, cx, cy + 60 * s))
    sail = R("path", "船帆", "#fff", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx, cy, cx, cy - 110 * s, cx + 70 * s, cy))
    mast = R("rect", "桅杆", "#6d4c41", x=cx - 4 * s, y=cy - 110 * s, w=8 * s, h=110 * s)
    return ([hull, sail, mast], [])
def rocket(cx, cy, s):
    body = R("ellipse", "火箭身", "#eceff1", cx=cx, cy=cy - 20 * s, rx=42 * s, ry=120 * s)
    win = R("circle", "舷窗", "#81d4fa", cx=cx, cy=cy - 40 * s, r=18 * s)
    fin = R("path", "尾翼", "#ef5350", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 40 * s, cy + 20 * s, cx - 80 * s, cy + 60 * s, cx - 40 * s, cy + 40 * s))
    fin2 = R("path", "尾翼", "#ef5350", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx + 40 * s, cy + 20 * s, cx + 80 * s, cy + 60 * s, cx + 40 * s, cy + 40 * s))
    flame = R("path", "火焰", "#ff7043", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 20 * s, cy + 40 * s, cx, cy + 100 * s, cx + 20 * s, cy + 40 * s))
    return ([body, fin, fin2, win, flame], [])
def train(cx, cy, s):
    loco = R("rect", "车头", "#42a5f5", x=cx - 130 * s, y=cy, w=160 * s, h=90 * s)
    ch = R("rect", "烟囱", "#37474f", x=cx - 110 * s, y=cy - 50 * s, w=26 * s, h=50 * s)
    cab = R("rect", "驾驶室", "#ef5350", x=cx - 30 * s, y=cy - 50 * s, w=60 * s, h=50 * s)
    win = R("rect", "车窗", "#b3e5fc", x=cx - 20 * s, y=cy - 42 * s, w=40 * s, h=30 * s)
    wag = R("rect", "车厢", "#66bb6a", x=cx + 50 * s, y=cy + 10 * s, w=120 * s, h=80 * s)
    wh = [R("circle", "车轮", "#37474f", cx=cx - 90 * s + i * 50 * s, cy=cy + 95 * s, r=24 * s) for i in range(2)]
    wh2 = [R("circle", "车轮", "#37474f", cx=cx + 70 * s + i * 50 * s, cy=cy + 95 * s, r=22 * s) for i in range(2)]
    return ([loco, ch, cab, win, wag] + wh + wh2, [])
def balloon(cx, cy, s, col="#ec407a"):
    envel = R("ellipse", "气球", col, cx=cx, cy=cy, rx=55 * s, ry=70 * s)
    basket = R("rect", "吊篮", "#8d6e63", x=cx - 30 * s, y=cy + 90 * s, w=60 * s, h=44 * s)
    rope = ['<path class="deco" d="M%.0f %.0f L%.0f %.0f M%.0f %.0f L%.0f %.0f" stroke="#6d4c41" stroke-width="4" fill="none"/>' % (cx - 30 * s, cy + 60 * s, cx - 20 * s, cy + 90 * s, cx + 30 * s, cy + 60 * s, cx + 20 * s, cy + 90 * s)]
    return ([envel, basket], rope)
def ball(cx, cy, s):
    return ([R("circle", "小球", "#ffffff", cx=cx, cy=cy, r=40 * s)], ['<path class="deco" d="M%.0f %.0f Q%.0f %.0f %.0f %.0f" stroke="#ef5350" stroke-width="4" fill="none"/>' % (cx, cy - 40 * s, cx + 30 * s, cy, cx, cy + 40 * s)])
def kite(cx, cy, s, col="#9b59b6"):
    k = R("path", "风筝", col, d="M%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx, cy - 60 * s, cx + 45 * s, cy, cx, cy + 60 * s, cx - 45 * s, cy))
    tail = ['<path class="deco" d="M%.0f %.0f Q%.0f %.0f %.0f %.0f" stroke="#43a047" stroke-width="5" fill="none"/>' % (cx, cy + 60 * s, cx + 30 * s, cy + 120 * s, cx, cy + 160 * s)]
    return ([k], tail)
def umbrella(cx, cy, s, col="#ff7eaa"):
    top = R("ellipse", "伞面", col, cx=cx, cy=cy - 20 * s, rx=72 * s, ry=44 * s)
    handle = R("rect", "伞柄", "#6d4c41", x=cx - 5 * s, y=cy, w=10 * s, h=90 * s)
    return ([top, handle], [])
def cake(cx, cy, s):
    base = R("rect", "蛋糕底", "#ff7043", x=cx - 70 * s, y=cy, w=140 * s, h=70 * s)
    top = R("rect", "蛋糕上层", "#fff", x=cx - 50 * s, y=cy - 60 * s, w=100 * s, h=60 * s)
    cherry = R("circle", "樱桃", "#e53935", cx=cx, cy=cy - 70 * s, r=14 * s)
    return ([base, top, cherry], [])
def gift(cx, cy, s, col="#7e57c2"):
    box = R("rect", "礼盒", col, x=cx - 60 * s, y=cy, w=120 * s, h=100 * s)
    rib = R("rect", "丝带", "#ffd45a", x=cx - 14 * s, y=cy, w=28 * s, h=100 * s)
    bow = R("path", "蝴蝶结", "#ffd45a", d="M%.0f %.0f Q%.0f %.0f %.0f %.0f Q%.0f %.0f %.0f %.0f Z" % (cx - 30 * s, cy - 10 * s, cx - 30 * s, cy - 40 * s, cx, cy - 10 * s, cx + 30 * s, cy - 40 * s, cx + 30 * s, cy - 10 * s))
    return ([box, rib, bow], [])
def apple(cx, cy, s):
    body = R("circle", "苹果", "#e74c3c", cx=cx, cy=cy, r=55 * s)
    stem = R("path", "果柄", "#8d6e63", d="M%.0f %.0f q %.0f %.0f %.0f %.0f l %.0f %.0f q %.0f %.0f %.0f %.0f z" % (cx - 4 * s, cy - 50 * s, -2, -20, 10, -30, 6, 6, -10, 10, -8, 25))
    leaf = R("path", "叶子", "#2ecc71", d="M%.0f %.0f q %.0f %.0f %.0f %.0f q %.0f %.0f %.0f %.0f z" % (cx + 10 * s, cy - 60 * s, 28, -22, 56, -5, -28, 22, -56, 5))
    hl = ['<circle class="deco" cx="%.0f" cy="%.0f" r="10" fill="#fff" opacity="0.4"/>' % (cx - 18 * s, cy - 18 * s)]
    return ([body, stem, leaf], hl)
def watermelon(cx, cy, s):
    rind = R("path", "西瓜皮", "#43a047", d="M%.0f %.0f A%.0f %.0f 0 0 1 %.0f %.0f Z" % (cx - 90 * s, cy, 90 * s, 90 * s, cx + 90 * s, cy))
    flesh = R("path", "西瓜瓤", "#ef5350", d="M%.0f %.0f A%.0f %.0f 0 0 1 %.0f %.0f L%.0f %.0f Z" % (cx - 80 * s, cy, 80 * s, 80 * s, cx + 80 * s, cy, cx, cy))
    seeds = ['<circle class="deco" cx="%.0f" cy="%.0f" r="5" fill="#37474f"/>' % (cx + (i - 1) * 26 * s, cy - 30 * s) for i in range(3)]
    return ([rind, flesh], seeds)
def strawberry(cx, cy, s):
    body = R("path", "草莓", "#e53935", d="M%.0f %.0f Q%.0f %.0f %.0f %.0f Q%.0f %.0f %.0f %.0f Z" % (cx - 35 * s, cy - 30 * s, cx, cy + 60 * s, cx + 35 * s, cy - 30 * s, cx, cy + 60 * s, cx, cy - 30 * s))
    leaf = R("path", "草莓叶", "#43a047", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 40 * s, cy - 30 * s, cx - 15 * s, cy - 50 * s, cx, cy - 36 * s, cx + 15 * s, cy - 50 * s, cx + 40 * s, cy - 30 * s))
    seeds = ['<circle class="deco" cx="%.0f" cy="%.0f" r="3" fill="#fff3e0"/>' % (cx + (i - 1) * 16 * s, cy + 10 * s) for i in range(3)]
    return ([body, leaf], seeds)
def fish(cx, cy, s, col="#e67e22"):
    body = R("path", "鱼身", col, d="M%.0f %.0f Q%.0f %.0f %.0f %.0f Q%.0f %.0f %.0f %.0f Z" % (cx - 60 * s, cy, cx, cy - 50 * s, cx + 60 * s, cy, cx, cy + 50 * s, cx - 60 * s, cy))
    tail = R("path", "鱼尾", col, d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx + 60 * s, cy, cx + 110 * s, cy - 35 * s, cx + 110 * s, cy + 35 * s))
    eye = ['<circle class="deco" cx="%.0f" cy="%.0f" r="9" fill="#37474f"/>' % (cx - 30 * s, cy - 8 * s)]
    bubble = R("circle", "泡泡", "#b3e5fc", cx=cx - 110 * s, cy=cy - 40 * s, r=22 * s)
    return ([body, tail, bubble], eye)
def bird(cx, cy, s, col="#42a5f5"):
    body = R("ellipse", "鸟身", col, cx=cx, cy=cy, rx=46 * s, ry=34 * s)
    head = R("circle", "鸟头", col, cx=cx + 34 * s, cy=cy - 24 * s, r=22 * s)
    beak = R("path", "鸟嘴", "#ffb300", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx + 56 * s, cy - 24 * s, cx + 80 * s, cy - 18 * s, cx + 56 * s, cy - 12 * s))
    wing = R("path", "翅膀", "#1e88e5", d="M%.0f %.0f Q%.0f %.0f %.0f %.0f Q%.0f %.0f %.0f %.0f Z" % (cx - 10 * s, cy - 10 * s, cx - 30 * s, cy + 20 * s, cx + 10 * s, cy + 18 * s, cx, cy + 4 * s, cx - 10 * s, cy - 10 * s))
    eye = ['<circle class="deco" cx="%.0f" cy="%.0f" r="3" fill="#37474f"/>' % (cx + 40 * s, cy - 26 * s)]
    return ([body, head, beak, wing], eye)
def butterfly(cx, cy, s, col="#ab47bc"):
    lw = R("ellipse", "左翅", col, cx=cx - 40 * s, cy=cy - 16 * s, rx=34 * s, ry=40 * s)
    rw = R("ellipse", "右翅", col, cx=cx + 40 * s, cy=cy - 16 * s, rx=34 * s, ry=40 * s)
    lwl = R("ellipse", "左下翅", "#ec407a", cx=cx - 30 * s, cy=cy + 30 * s, rx=26 * s, ry=28 * s)
    rwl = R("ellipse", "右下翅", "#ec407a", cx=cx + 30 * s, cy=cy + 30 * s, rx=26 * s, ry=28 * s)
    body = R("rect", "身体", "#5d4037", x=cx - 6 * s, y=cy - 40 * s, w=12 * s, h=80 * s)
    return ([lw, rw, lwl, rwl, body], [])
def bee(cx, cy, s):
    body = R("ellipse", "蜜蜂身", "#fdd835", cx=cx, cy=cy, rx=44 * s, ry=30 * s)
    stripe = R("rect", "条纹", "#5d4037", x=cx - 6 * s, y=cy - 30 * s, w=12 * s, h=60 * s)
    wing = R("ellipse", "翅膀", "#b3e5fc", cx=cx, cy=cy - 40 * s, rx=26 * s, ry=18 * s)
    return ([body, stripe, wing], [])
def rabbit(cx, cy, s, col="#fff3e0"):
    earl = R("ellipse", "左耳", col, cx=cx - 18 * s, cy=cy - 60 * s, rx=12 * s, ry=40 * s)
    earr = R("ellipse", "右耳", col, cx=cx + 18 * s, cy=cy - 60 * s, rx=12 * s, ry=40 * s)
    head = R("circle", "头", col, cx=cx, cy=cy, r=34 * s)
    body = R("ellipse", "身体", col, cx=cx, cy=cy + 60 * s, rx=46 * s, ry=40 * s)
    eye = ['<circle class="deco" cx="%.0f" cy="%.0f" r="5" fill="#37474f"/>' % (cx - 12 * s, cy - 4 * s), '<circle class="deco" cx="%.0f" cy="%.0f" r="5" fill="#37474f"/>' % (cx + 12 * s, cy - 4 * s)]
    return ([earl, earr, body, head], eye)
def cat(cx, cy, s, col="#ffcc80"):
    earl = R("path", "左耳", col, d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 30 * s, cy - 20 * s, cx - 18 * s, cy - 50 * s, cx - 4 * s, cy - 20 * s))
    earr = R("path", "右耳", col, d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx + 30 * s, cy - 20 * s, cx + 18 * s, cy - 50 * s, cx + 4 * s, cy - 20 * s))
    head = R("circle", "头", col, cx=cx, cy=cy, r=30 * s)
    body = R("ellipse", "身体", col, cx=cx, cy=cy + 56 * s, rx=40 * s, ry=34 * s)
    tail = R("path", "尾巴", col, d="M%.0f %.0f Q%.0f %.0f %.0f %.0f" % (cx + 38 * s, cy + 56 * s, cx + 80 * s, cy + 40 * s, cx + 70 * s, cy + 10 * s))
    eye = ['<circle class="deco" cx="%.0f" cy="%.0f" r="4" fill="#37474f"/>' % (cx - 10 * s, cy - 4 * s), '<circle class="deco" cx="%.0f" cy="%.0f" r="4" fill="#37474f"/>' % (cx + 10 * s, cy - 4 * s)]
    return ([earl, earr, body, tail, head], eye)
def star(cx, cy, s, col="#ffd45a"):
    return ([R("path", "星星", col, d="M%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx, cy - 50 * s, cx + 14 * s, cy - 16 * s, cx + 50 * s, cy - 16 * s, cx + 22 * s, cy + 6 * s, cx + 32 * s, cy + 40 * s, cx, cy + 18 * s, cx - 32 * s, cy + 40 * s, cx - 22 * s, cy + 6 * s, cx - 50 * s, cy - 16 * s, cx - 14 * s, cy - 16 * s))], [])
def rainbow(cx, cy, s):
    out = ['<path class="deco" d="M%.0f %.0f A%.0f %.0f 0 0 1 %.0f %.0f" stroke="%s" stroke-width="14" fill="none"/>' % (cx - 90 * s, cy, 90 * s, 90 * s, cx + 90 * s, cy, c) for c in ["#ef5350", "#ffb300", "#66bb6a", "#42a5f5", "#ab47bc"]]
    return ([], out)
def icecream(cx, cy, s):
    cone = R("path", "甜筒", "#ffcc80", d="M%.0f %.0f L%.0f %.0f L%.0f %.0f Z" % (cx - 40 * s, cy, cx + 40 * s, cy, cx, cy + 90 * s))
    scoop = R("circle", "冰淇淋", "#ff8fab", cx=cx, cy=cy - 20 * s, r=44 * s)
    cherry = R("circle", "樱桃", "#e53935", cx=cx, cy=cy - 60 * s, r=12 * s)
    return ([cone, scoop, cherry], [])

DOODADS = {k: v for k, v in list(globals().items()) if callable(v) and not k.startswith("_") and k not in ("R", "render_region") and v.__module__ == "__main__"}

# ---------- 50 个场景配方：(tier, title, bg, palette, [(doodad, x, y, s), ...]) ----------
P1 = ['#e74c3c', '#2ecc71', '#8d6e63', '#f1c40f', '#3498db', '#e67e22']
P2 = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#8d6e63', '#78909c']
P3 = ['#e74c3c', '#ec407a', '#ff7043', '#f1c40f', '#9ccc65', '#26a69a', '#29b6f6', '#5c6bc0', '#ab47bc', '#8d6e63']
RECIPES = [
 ("L1","小苹果","#eaf6ff",P1,[("sun",690,95,1),("grass",0,498,1),("apple",400,330,1.1)]),
 ("L1","小气球","#eaf6ff",P1,[("sun",120,110,1),("cloud",560,120,1.2),("balloon",400,300,1.3)]),
 ("L1","小皮球","#eaf6ff",P1,[("sun",680,100,1),("grass",0,500,1),("ball",400,330,1.6)]),
 ("L1","向日葵","#eaf6ff",P1,[("sun",120,110,1),("grass",0,498,1),("flower",420,360,1.4)]),
 ("L1","小蘑菇","#eaf6ff",P1,[("cloud",560,110,1.2),("grass",0,500,1),("mushroom",400,360,1.6)]),
 ("L1","小草莓","#eaf6ff",P1,[("sun",680,100,1),("grass",0,500,1),("strawberry",400,360,1.8)]),
 ("L1","小星星","#eaf6ff",P1,[("cloud",160,110,1.2),("cloud",640,120,1),("star",400,320,2.2)]),
 ("L1","小蜜蜂","#eaf6ff",P1,[("sun",120,110,1),("cloud",560,120,1.2),("bee",400,300,1.8)]),
 ("L1","小西瓜","#eaf6ff",P1,[("sun",680,100,1),("grass",0,500,1),("watermelon",400,360,1.6)]),
 ("L1","冰淇淋","#eaf6ff",P1,[("cloud",560,110,1.2),("grass",0,500,1),("icecream",400,340,1.6)]),
 ("L1","小帆船","#e3f4fb",P1,[("sun",680,100,1),("water",0,420,1),("boat",400,340,1.4)]),
 ("L1","小兔子","#eaf6ff",P1,[("sun",680,100,1),("grass",0,498,1),("rabbit",400,360,1.8)]),
 ("L1","小蝴蝶","#eaf6ff",P1,[("sun",120,110,1),("flower",560,360,1.2),("butterfly",400,300,1.6)]),
 ("L1","小乌龟","#eaf6ff",P1,[("sun",680,100,1),("grass",0,500,1),("balloon",150,300,1),("mushroom",600,360,1.2)]),
 ("L1","小鸟飞","#eaf6ff",P1,[("sun",120,110,1),("cloud",560,120,1.2),("bird",420,300,1.8),("cloud",300,160,1)]),
 ("L1","小花田","#eaf6ff",P1,[("sun",680,100,1),("grass",0,500,1),("flower",300,360,1.2),("flower",500,380,1.2)]),
 ("L1","果树下","#eaf6ff",P1,[("sun",680,100,1),("grass",0,498,1),("tree",180,360,1.4),("apple",500,380,1)]),
 ("L1","彩虹下","#eaf6ff",P1,[("rainbow",400,360,1.6),("grass",0,500,1),("cloud",150,140,1),("cloud",650,140,1)]),
 # L2
 ("L2","小房子","#eaf6ff",P2,[("sun",690,95,1),("cloud",165,115,1),("grass",0,492,1),("tree",150,360,1.2),("house",430,330,1.2)]),
 ("L2","小汽车","#eaf6ff",P2,[("sun",700,95,1),("cloud",160,110,1),("road",0,470,1),("car",400,380,1.3)]),
 ("L2","花园","#eaf6ff",P2,[("sun",705,92,1),("cloud",170,105,1),("cloud",430,78,1),("grass",0,468,1),("flower",200,400,1.2),("flower",400,420,1.2),("flower",600,395,1.2)]),
 ("L2","小火车","#eaf6ff",P2,[("sun",712,88,1),("cloud",150,100,1),("cloud",430,76,1),("grass",0,496,1),("train",420,360,1.2)]),
 ("L2","生日蛋糕","#eaf6ff",P2,[("cloud",160,110,1),("cloud",620,110,1),("grass",0,500,1),("cake",400,360,1.6),("balloon",180,300,1),("balloon",620,300,1)]),
 ("L2","小礼物","#eaf6ff",P2,[("sun",680,100,1),("cloud",160,110,1),("grass",0,500,1),("gift",400,360,1.6),("star",200,200,1)]),
 ("L2","放风筝","#eaf6ff",P2,[("sun",120,110,1),("cloud",560,120,1.2),("grass",0,500,1),("kite",480,200,1.4),("rabbit",300,420,1.4)]),
 ("L2","小猫咪","#eaf6ff",P2,[("sun",680,100,1),("cloud",160,110,1),("grass",0,500,1),("cat",400,370,1.8),("ball",200,420,1)]),
 ("L2","水果盘","#eaf6ff",P2,[("cloud",160,110,1),("cloud",620,110,1),("apple",260,360,1.1),("strawberry",400,380,1.4),("watermelon",560,360,1.2)]),
 ("L2","池塘","#e3f4fb",P2,[("sun",680,100,1),("cloud",160,110,1),("water",0,420,1),("fish",320,330,1.2),("fish",560,330,1.2),("flower",150,470,1)]),
 ("L2","果园","#eaf6ff",P2,[("sun",680,100,1),("grass",0,498,1),("tree",200,350,1.2),("tree",560,360,1.2),("apple",400,420,1)]),
 ("L2","蜜蜂采蜜","#eaf6ff",P2,[("sun",120,110,1),("cloud",620,110,1),("grass",0,500,1),("flower",260,400,1.3),("flower",540,410,1.3),("bee",400,300,1.6)]),
 ("L2","小帆船比赛","#e3f4fb",P2,[("sun",680,100,1),("cloud",160,110,1),("water",0,430,1),("boat",280,350,1.1),("boat",520,350,1.1),("bird",600,200,1)]),
 ("L2","兔子和花","#eaf6ff",P2,[("sun",680,100,1),("cloud",160,110,1),("grass",0,500,1),("rabbit",300,400,1.6),("flower",520,420,1.4),("butterfly",420,280,1.2)]),
 ("L2","花园小屋","#eaf6ff",P2,[("sun",690,95,1),("cloud",560,110,1),("grass",0,492,1),("house",440,330,1),("flower",200,430,1),("flower",280,450,1),("tree",120,380,1)]),
 ("L2","雪人场景","#eaf6ff",P2,[("cloud",160,110,1),("cloud",620,110,1),("grass",0,500,1),("balloon",400,340,1.2),("gift",250,440,1),("star",560,200,1)]),
 # L3
 ("L3","花园聚会","#eaf6ff",P3,[("sun",705,92,1),("cloud",170,105,1),("cloud",430,78,1),("grass",0,468,1),("flower",180,400,1.2),("flower",330,430,1.2),("flower",480,415,1.2),("flower",630,400,1.2),("butterfly",400,300,1.2),("bird",250,180,1)]),
 ("L3","动物园","#eaf6ff",P3,[("sun",700,95,1),("cloud",160,105,1),("grass",0,500,1),("rabbit",200,400,1.3),("cat",400,400,1.3),("bird",560,300,1.2),("butterfly",620,420,1.2),("tree",120,340,1)]),
 ("L3","海边日落","#e3f4fb",P3,[("sun",620,140,1.4),("cloud",160,110,1),("water",0,400,1),("boat",400,340,1.2),("ball",200,450,1),("umbrella",560,360,1.2),("star",120,200,1)]),
 ("L3","农场","#eaf6ff",P3,[("sun",700,95,1),("cloud",160,105,1),("grass",0,498,1),("house",460,330,1),("tree",160,350,1.2),("apple",300,440,1),("strawberry",560,450,1.2),("rabbit",620,420,1.1),("cat",200,450,1)]),
 ("L3","生日派对","#eaf6ff",P3,[("cloud",160,110,1),("cloud",430,80,1),("cloud",620,110,1),("grass",0,500,1),("cake",400,360,1.6),("balloon",180,280,1),("balloon",620,280,1),("gift",250,440,1),("star",560,200,1),("balloon",400,200,1)]),
 ("L3","游乐园","#eaf6ff",P3,[("sun",690,95,1),("cloud",160,105,1),("cloud",620,105,1),("grass",0,498,1),("balloon",200,300,1.3),("balloon",600,300,1.3),("kite",400,200,1.4),("car",420,420,1.1),("star",300,180,1),("bird",560,180,1)]),
 ("L3","太空火箭","#dfe9ff",P3,[("star",120,120,1),("star",300,180,1),("star",560,140,1),("star",680,220,1),("moon",620,120,1.2),("rocket",400,320,1.6),("star",200,400,1)]),
 ("L3","森林野餐","#eaf6ff",P3,[("sun",690,95,1),("cloud",160,105,1),("grass",0,498,1),("tree",160,330,1.2),("tree",600,340,1.2),("cake",400,440,1.2),("apple",300,450,1),("strawberry",500,450,1.2),("butterfly",450,300,1),("bird",250,200,1)]),
 ("L3","海边城堡","#e3f4fb",P3,[("sun",680,100,1),("cloud",160,110,1),("water",0,420,1),("house",400,330,1.1),("boat",180,360,1),("boat",620,360,1),("umbrella",560,440,1),("ball",300,450,1),("star",120,200,1)]),
 ("L3","花海","#eaf6ff",P3,[("sun",700,92,1),("cloud",430,80,1),("grass",0,468,1),("flower",160,410,1.1),("flower",280,430,1.1),("flower",400,420,1.1),("flower",520,430,1.1),("flower",640,410,1.1),("butterfly",340,300,1),("bee",500,290,1.2),("bird",200,200,1)]),
 ("L3","果园丰收","#eaf6ff",P3,[("sun",690,95,1),("cloud",160,105,1),("grass",0,498,1),("tree",180,330,1.2),("tree",420,340,1.2),("tree",620,330,1.2),("apple",260,440,1),("apple",500,450,1),("apple",680,440,1),("strawberry",380,470,1),("rabbit",120,450,1)]),
 ("L3","车站","#eaf6ff",P3,[("sun",700,95,1),("cloud",160,105,1),("cloud",620,105,1),("grass",0,498,1),("train",420,360,1.2),("house",150,360,1),("tree",640,360,1.1),("bird",250,200,1),("cat",560,470,1),("star",300,160,1)]),
 ("L3","彩虹乐园","#eaf6ff",P3,[("rainbow",400,360,1.6),("sun",120,120,1),("cloud",640,120,1),("grass",0,500,1),("flower",250,430,1.2),("flower",550,430,1.2),("balloon",400,260,1.2),("butterfly",180,360,1),("bird",600,300,1),("star",700,200,1)]),
 ("L3","动物园派对","#eaf6ff",P3,[("sun",700,95,1),("cloud",160,105,1),("grass",0,500,1),("rabbit",180,420,1.2),("cat",340,430,1.2),("bird",500,300,1.1),("butterfly",620,420,1.2),("bee",260,300,1),("tree",120,360,1),("flower",560,460,1),("mushroom",420,470,1)]),
 ("L3","冬日小镇","#eaf6ff",P3,[("cloud",160,110,1),("cloud",430,80,1),("cloud",620,110,1),("grass",0,500,1),("house",300,360,1),("house",560,360,1),("tree",120,370,1.1),("tree",680,370,1.1),("balloon",440,300,1.2),("gift",440,460,1),("star",200,200,1)]),
 ("L3","四季小屋","#eaf6ff",P3,[("sun",700,95,1),("rainbow",250,200,1),("cloud",160,110,1),("grass",0,498,1),("house",400,340,1.1),("tree",160,360,1.1),("flower",560,450,1),("flower",640,440,1),("bird",250,200,1),("butterfly",520,300,1),("apple",300,460,1)]),
]

STICKERS = {"sun":"暖暖太阳","cloud":"软软云朵","grass":"绿绿草地","tree":"高高树儿","flower":"香香花朵","house":"暖暖小屋","car":"嘟嘟汽车","fish":"蹦蹦小鱼","bird":"啾啾小鸟","butterfly":"彩彩蝴蝶","rabbit":"跳跳小兔","cat":"喵喵小猫","apple":"红红苹果","balloon":"飘飘气球","cake":"甜甜蛋糕","gift":"惊喜礼盒","rocket":"嗖嗖火箭","train":"咔嚓火车","star":"闪闪星星","rainbow":"七彩彩虹","bee":"嗡嗡蜜蜂","mushroom":"小蘑菇","watermelon":"甜甜西瓜","strawberry":"红红草莓","icecream":"凉凉冰淇淋","boat":"小小帆船","kite":"高高风筝","umbrella":"小花伞","bird":"啾啾小鸟","ball":"圆圆小球","road":"长长马路","water":"清清水面","moon":"弯弯月亮","strawberry":"红红草莓"}

def build_level(idx, tier, title, bg, palette, places):
    regions, decos = [], []
    rid = 0
    for (name, x, y, s) in places:
        fn = DOODADS.get(name)
        if not fn: continue
        rs, ds = fn(x, y, s)
        for r in rs:
            rid += 1
            regions.append(render_region("r%d" % rid, r))
        for d in ds:
            decos.append(d)
    art = "".join(regions) + "".join(decos)
    minc = {"L1": 3, "L2": 4, "L3": 5}[tier]
    stick_dood = places[0][0] if places else "star"
    st_name = STICKERS.get(stick_dood, "小小贴纸")
    st_emoji = {"sun":"☀️","cloud":"☁️","grass":"🌱","tree":"🌳","flower":"🌸","house":"🏠","car":"🚗","fish":"🐟","bird":"🐦","butterfly":"🦋","rabbit":"🐰","cat":"🐱","apple":"🍎","balloon":"🎈","cake":"🎂","gift":"🎁","rocket":"🚀","train":"🚂","star":"⭐","rainbow":"🌈","bee":"🐝","mushroom":"🍄","watermelon":"🍉","strawberry":"🍓","icecream":"🍦","boat":"⛵","kite":"🪁","umbrella":"☂️","ball":"⚽","water":"💧","moon":"🌙"}.get(stick_dood, "⭐")
    return {
        "id": "%s-%03d" % (tier.lower(), idx + 1),
        "level": tier, "age": {"L1": "3-4岁", "L2": "4-5岁", "L3": "5-6岁"}[tier],
        "title": title, "viewBox": "0 0 800 600", "minColorsForStar2": minc,
        "sticker": {"emoji": st_emoji, "name": st_name},
        "palette": palette, "bg": bg, "art": art
    }

def main():
    out_path = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "levels.js")
    levels = [build_level(i, *r) for i, r in enumerate(RECIPES)]
    js = ["// 关卡数据：由 _gen_levels.py 自动生成（50 张原创几何线稿，ORIGINAL_ASSET）。",
          "// 约束：仅用 circle/ellipse/rect/path，无 clipPath/mask/gradient，flutter_svg 可复用。",
          "// 重新生成：python prototype/_gen_levels.py [输出路径]",
          "window.LEVELS = ["]
    for lv in levels:
        js.append("  {")
        for k in ["id", "level", "age", "title", "viewBox", "minColorsForStar2"]:
            v = lv[k]
            js.append("    %s: %s," % (k, ("\"%s\"" % v) if isinstance(v, str) else v))
        js.append("    sticker: { emoji: \"%s\", name: \"%s\" }," % (lv["sticker"]["emoji"], lv["sticker"]["name"]))
        js.append("    palette: %s," % str(lv["palette"]).replace("'", "\""))
        js.append("    bg: \"%s\"," % lv["bg"])
        js.append("    art: '" + lv["art"].replace("\\", "\\\\").replace("'", "\\'") + "',")
        js.append("  },")
    js.append("];")
    content = "\n".join(js) + "\n"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote %d levels to %s" % (len(levels), out_path))

if __name__ == "__main__":
    main()
