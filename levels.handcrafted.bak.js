// 关卡数据：每张图是一段 SVG 元素字符串。
// - class="region" 的元素是可填色区块（data-id 唯一、data-name 中文名、data-hint 示范色）
// - class="deco" 的元素是装饰（不可点、不填色，保留自身 fill/stroke，如眼睛、花茎、烟雾）
// 素材约束：仅用 circle/ellipse/rect/path(多边形与简单曲线)，不用 clipPath/mask/gradient，
//           以便 Phase 1 的 flutter_svg 能直接复用。
// 新增关卡只需往 LEVELS 数组追加一项。
window.LEVELS = [
  // ---------------- L1（3-4岁，大块少色） ----------------
  {
    id: 'l1-apple',
    level: 'L1',
    age: '3-4岁',
    title: '小苹果',
    viewBox: '0 0 800 600',
    minColorsForStar2: 3,
    sticker: { emoji: '🍎', name: '红红小苹果' },
    palette: ['#e74c3c', '#2ecc71', '#8d6e63', '#f1c40f', '#3498db', '#e67e22'],
    bg: '#eaf6ff',
    art:
      '<circle class="region" data-id="sun" data-name="太阳" data-hint="#f1c40f" cx="125" cy="115" r="58"/>' +
      '<path class="region" data-id="ground" data-name="草地" data-hint="#2ecc71" d="M0 498 Q200 466 400 498 T800 498 L800 600 L0 600 Z"/>' +
      '<path class="region" data-id="apple" data-name="苹果" data-hint="#e74c3c" d="M400 248 C358 206 278 218 268 300 C258 382 310 470 400 482 C490 470 542 382 532 300 C522 218 442 206 400 248 Z"/>' +
      '<path class="region" data-id="stem" data-name="果柄" data-hint="#8d6e63" d="M394 250 q -3 -30 15 -47 l 10 9 q -15 15 -13 38 z"/>' +
      '<path class="region" data-id="leaf" data-name="叶子" data-hint="#2ecc71" d="M414 214 q 44 -34 84 -7 q -42 34 -84 7 z"/>' +
      '<circle class="deco" cx="452" cy="296" r="17" fill="#ffffff" opacity="0.5"/>'
  },
  {
    id: 'l1-fish',
    level: 'L1',
    age: '3-4岁',
    title: '小鱼',
    viewBox: '0 0 800 600',
    minColorsForStar2: 3,
    sticker: { emoji: '🐟', name: '蹦蹦小鱼' },
    palette: ['#e67e22', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6', '#f1c40f'],
    bg: '#e3f4fb',
    art:
      '<path class="region" data-id="sand" data-name="沙地" data-hint="#f1c40f" d="M0 520 Q200 498 400 520 T800 520 L800 600 L0 600 Z"/>' +
      '<circle class="region" data-id="bubble" data-name="泡泡" data-hint="#3498db" cx="602" cy="158" r="30"/>' +
      '<path class="region" data-id="tail" data-name="鱼尾" data-hint="#e67e22" d="M256 300 L160 230 L160 370 Z"/>' +
      '<path class="region" data-id="body" data-name="鱼身" data-hint="#e67e22" d="M252 300 Q252 206 388 206 Q522 206 522 300 Q522 394 388 394 Q252 394 252 300 Z"/>' +
      '<path class="region" data-id="fin" data-name="鱼鳍" data-hint="#e74c3c" d="M352 210 Q392 150 438 210 Z"/>' +
      '<circle class="deco" cx="466" cy="278" r="18" fill="#ffffff"/>' +
      '<circle class="deco" cx="470" cy="278" r="9" fill="#37474f"/>'
  },

  // ---------------- L2（4-5岁，中等块、8色） ----------------
  {
    id: 'l2-house',
    level: 'L2',
    age: '4-5岁',
    title: '小房子',
    viewBox: '0 0 800 600',
    minColorsForStar2: 4,
    sticker: { emoji: '🏠', name: '暖暖小房子' },
    palette: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#8d6e63', '#78909c'],
    bg: '#eaf6ff',
    art:
      '<circle class="region" data-id="sun" data-name="太阳" data-hint="#f1c40f" cx="690" cy="95" r="52"/>' +
      '<ellipse class="region" data-id="cloud" data-name="白云" data-hint="#90caf9" cx="165" cy="115" rx="74" ry="38"/>' +
      '<path class="region" data-id="ground" data-name="草地" data-hint="#66bb6a" d="M0 492 Q200 470 400 492 T800 492 L800 600 L0 600 Z"/>' +
      '<rect class="region" data-id="trunk" data-name="树干" data-hint="#8d6e63" x="140" y="408" width="28" height="92"/>' +
      '<circle class="region" data-id="crown" data-name="树冠" data-hint="#43a047" cx="154" cy="378" r="66"/>' +
      '<rect class="region" data-id="wall" data-name="墙" data-hint="#ffe0b2" x="270" y="300" width="260" height="192"/>' +
      '<rect class="region" data-id="chimney" data-name="烟囱" data-hint="#a1887f" x="470" y="200" width="34" height="104"/>' +
      '<path class="region" data-id="roof" data-name="屋顶" data-hint="#e57373" d="M246 306 L400 196 L554 306 Z"/>' +
      '<rect class="region" data-id="door" data-name="门" data-hint="#8d6e63" x="372" y="398" width="62" height="94"/>' +
      '<rect class="region" data-id="win1" data-name="左窗" data-hint="#81d4fa" x="298" y="336" width="56" height="56"/>' +
      '<rect class="region" data-id="win2" data-name="右窗" data-hint="#81d4fa" x="446" y="336" width="56" height="56"/>'
  },
  {
    id: 'l2-car',
    level: 'L2',
    age: '4-5岁',
    title: '小汽车',
    viewBox: '0 0 800 600',
    minColorsForStar2: 4,
    sticker: { emoji: '🚗', name: '嘟嘟小汽车' },
    palette: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6', '#8d6e63', '#78909c'],
    bg: '#eaf6ff',
    art:
      '<circle class="region" data-id="sun" data-name="太阳" data-hint="#f1c40f" cx="700" cy="95" r="50"/>' +
      '<ellipse class="region" data-id="cloud" data-name="白云" data-hint="#90caf9" cx="160" cy="110" rx="72" ry="36"/>' +
      '<path class="region" data-id="ground" data-name="地面" data-hint="#9ccc65" d="M0 486 L800 486 L800 600 L0 600 Z"/>' +
      '<rect class="region" data-id="body" data-name="车身" data-hint="#e57373" x="160" y="352" width="470" height="104" rx="24"/>' +
      '<path class="region" data-id="cabin" data-name="车顶" data-hint="#ef5350" d="M268 352 L312 282 L468 282 L512 352 Z"/>' +
      '<path class="region" data-id="winF" data-name="前窗" data-hint="#81d4fa" d="M326 344 L350 296 L392 296 L392 344 Z"/>' +
      '<path class="region" data-id="winB" data-name="后窗" data-hint="#81d4fa" d="M404 344 L404 296 L448 296 L470 344 Z"/>' +
      '<circle class="region" data-id="wheel1" data-name="左轮" data-hint="#37474f" cx="272" cy="462" r="50"/>' +
      '<circle class="region" data-id="hub1" data-name="左轮毂" data-hint="#cfd8dc" cx="272" cy="462" r="22"/>' +
      '<circle class="region" data-id="wheel2" data-name="右轮" data-hint="#37474f" cx="520" cy="462" r="50"/>' +
      '<circle class="region" data-id="hub2" data-name="右轮毂" data-hint="#cfd8dc" cx="520" cy="462" r="22"/>' +
      '<circle class="region" data-id="light" data-name="车灯" data-hint="#fdd835" cx="608" cy="394" r="16"/>'
  },

  // ---------------- L3（5-6岁，多区块、10色） ----------------
  {
    id: 'l3-garden',
    level: 'L3',
    age: '5-6岁',
    title: '花园',
    viewBox: '0 0 800 600',
    minColorsForStar2: 5,
    sticker: { emoji: '🌸', name: '香香小花朵' },
    palette: ['#e74c3c', '#ec407a', '#ff7043', '#f1c40f', '#9ccc65', '#26a69a', '#29b6f6', '#5c6bc0', '#ab47bc', '#8d6e63'],
    bg: '#eaf6ff',
    art:
      '<circle class="region" data-id="sun" data-name="太阳" data-hint="#fdd835" cx="705" cy="92" r="50"/>' +
      '<ellipse class="region" data-id="cloud1" data-name="白云" data-hint="#b3e5fc" cx="170" cy="105" rx="70" ry="36"/>' +
      '<ellipse class="region" data-id="cloud2" data-name="白云" data-hint="#b3e5fc" cx="430" cy="78" rx="58" ry="30"/>' +
      '<path class="region" data-id="grass" data-name="草地" data-hint="#66bb6a" d="M0 468 Q200 446 400 468 T800 468 L800 600 L0 600 Z"/>' +
      '<path class="deco" d="M165 415 L165 490" stroke="#43a047" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      '<path class="deco" d="M400 435 L400 492" stroke="#43a047" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      '<path class="deco" d="M628 412 L628 490" stroke="#43a047" stroke-width="10" fill="none" stroke-linecap="round"/>' +
      // 花1
      '<circle class="region" data-id="f1p1" data-name="花瓣" data-hint="#ec407a" cx="165" cy="352" r="30"/>' +
      '<circle class="region" data-id="f1p2" data-name="花瓣" data-hint="#ec407a" cx="208" cy="395" r="30"/>' +
      '<circle class="region" data-id="f1p3" data-name="花瓣" data-hint="#ec407a" cx="165" cy="438" r="30"/>' +
      '<circle class="region" data-id="f1p4" data-name="花瓣" data-hint="#ec407a" cx="122" cy="395" r="30"/>' +
      '<circle class="region" data-id="f1c" data-name="花心" data-hint="#fdd835" cx="165" cy="395" r="25"/>' +
      // 花2
      '<circle class="region" data-id="f2p1" data-name="花瓣" data-hint="#ab47bc" cx="400" cy="372" r="30"/>' +
      '<circle class="region" data-id="f2p2" data-name="花瓣" data-hint="#ab47bc" cx="443" cy="415" r="30"/>' +
      '<circle class="region" data-id="f2p3" data-name="花瓣" data-hint="#ab47bc" cx="400" cy="458" r="30"/>' +
      '<circle class="region" data-id="f2p4" data-name="花瓣" data-hint="#ab47bc" cx="357" cy="415" r="30"/>' +
      '<circle class="region" data-id="f2c" data-name="花心" data-hint="#fdd835" cx="400" cy="415" r="25"/>' +
      // 花3
      '<circle class="region" data-id="f3p1" data-name="花瓣" data-hint="#ff7043" cx="628" cy="349" r="30"/>' +
      '<circle class="region" data-id="f3p2" data-name="花瓣" data-hint="#ff7043" cx="671" cy="392" r="30"/>' +
      '<circle class="region" data-id="f3p3" data-name="花瓣" data-hint="#ff7043" cx="628" cy="435" r="30"/>' +
      '<circle class="region" data-id="f3p4" data-name="花瓣" data-hint="#ff7043" cx="585" cy="392" r="30"/>' +
      '<circle class="region" data-id="f3c" data-name="花心" data-hint="#fdd835" cx="628" cy="392" r="25"/>'
  },
  {
    id: 'l3-train',
    level: 'L3',
    age: '5-6岁',
    title: '小火车',
    viewBox: '0 0 800 600',
    minColorsForStar2: 5,
    sticker: { emoji: '🚂', name: '咔嚓小火车' },
    palette: ['#ef5350', '#ff7043', '#fdd835', '#66bb6a', '#26c6da', '#42a5f5', '#7e57c2', '#ec407a', '#8d6e63', '#78909c'],
    bg: '#eaf6ff',
    art:
      '<circle class="region" data-id="sun" data-name="太阳" data-hint="#fdd835" cx="712" cy="88" r="48"/>' +
      '<ellipse class="region" data-id="cloud1" data-name="白云" data-hint="#b3e5fc" cx="150" cy="100" rx="68" ry="34"/>' +
      '<ellipse class="region" data-id="cloud2" data-name="白云" data-hint="#b3e5fc" cx="430" cy="76" rx="56" ry="28"/>' +
      '<circle class="deco" cx="137" cy="230" r="16" fill="#cfd8dc" opacity="0.85"/>' +
      '<circle class="deco" cx="126" cy="200" r="21" fill="#cfd8dc" opacity="0.7"/>' +
      '<circle class="deco" cx="140" cy="166" r="26" fill="#cfd8dc" opacity="0.55"/>' +
      '<path class="region" data-id="ground" data-name="地面" data-hint="#9ccc65" d="M0 496 L800 496 L800 600 L0 600 Z"/>' +
      '<rect class="region" data-id="rail" data-name="铁轨" data-hint="#8d6e63" x="0" y="472" width="800" height="20"/>' +
      '<rect class="region" data-id="loco" data-name="车头" data-hint="#42a5f5" x="92" y="312" width="210" height="120"/>' +
      '<rect class="region" data-id="chimney" data-name="烟囱" data-hint="#37474f" x="120" y="256" width="34" height="64"/>' +
      '<rect class="region" data-id="cabin" data-name="驾驶室" data-hint="#ef5350" x="232" y="248" width="82" height="72"/>' +
      '<rect class="region" data-id="cabwin" data-name="车窗" data-hint="#b3e5fc" x="250" y="264" width="46" height="40"/>' +
      '<rect class="region" data-id="wagon1" data-name="车厢一" data-hint="#66bb6a" x="344" y="336" width="150" height="96"/>' +
      '<rect class="region" data-id="wagon2" data-name="车厢二" data-hint="#fdd835" x="536" y="336" width="150" height="96"/>' +
      '<path class="deco" d="M302 400 L344 400" stroke="#546e7a" stroke-width="9" fill="none"/>' +
      '<path class="deco" d="M494 400 L536 400" stroke="#546e7a" stroke-width="9" fill="none"/>' +
      '<circle class="region" data-id="wheel1" data-name="车轮" data-hint="#37474f" cx="140" cy="444" r="34"/>' +
      '<circle class="region" data-id="wheel2" data-name="车轮" data-hint="#37474f" cx="214" cy="444" r="34"/>' +
      '<circle class="region" data-id="wheel3" data-name="车轮" data-hint="#37474f" cx="278" cy="448" r="28"/>' +
      '<circle class="region" data-id="w1a" data-name="车轮" data-hint="#37474f" cx="384" cy="450" r="30"/>' +
      '<circle class="region" data-id="w1b" data-name="车轮" data-hint="#37474f" cx="456" cy="450" r="30"/>' +
      '<circle class="region" data-id="w2a" data-name="车轮" data-hint="#37474f" cx="576" cy="450" r="30"/>' +
      '<circle class="region" data-id="w2b" data-name="车轮" data-hint="#37474f" cx="648" cy="450" r="30"/>'
  }
];
