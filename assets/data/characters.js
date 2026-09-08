// ORIGINAL_ASSET 数据：原创角色系统。
// 2 个原创角色可同时出场、可自由切换；刻意避开《爱心萌可》的名称/脸型/发型/配色/标志图案。
// 素材均为项目内手写原创 SVG（见 assets/characters/*.svg），无外部素材、无授权依赖。
window.CHARACTERS = [
  {
    id: 'princess',
    name: '彩虹小公主',
    theme: 'rainbow-heart',
    note: '薰衣草发 · 爱心小公主',
    frame: { w: 200, h: 320 },
    anchor: { x: 0.5, y: 0.96 },
    palette: { skin: '#ffe0c4', hair: '#b48cff', accent: '#ff4d8d' },
    states: {
      idle: 'assets/characters/princess-idle.svg',
      walk: 'assets/characters/princess-walk.svg',
      happy: 'assets/characters/princess-happy.svg',
      surprised: 'assets/characters/princess-surprised.svg',
      slip: 'assets/characters/princess-slip.svg',
      swim: 'assets/characters/princess-swim.svg',
      dance: 'assets/characters/princess-dance.svg'
    },
    base: 'assets/characters/original-princess-base.svg'
  },
  {
    id: 'mascot',
    name: '粉心星宝',
    theme: 'pink-star',
    note: '圆滚滚粉色伙伴',
    frame: { w: 200, h: 200 },
    anchor: { x: 0.5, y: 0.96 },
    palette: { body: '#ffd1e6', accent: '#ff7eaa' },
    states: {
      idle: 'assets/characters/mascot-idle.svg',
      walk: 'assets/characters/mascot-walk.svg',
      happy: 'assets/characters/mascot-happy.svg',
      surprised: 'assets/characters/mascot-surprised.svg',
      slip: 'assets/characters/mascot-slip.svg',
      swim: 'assets/characters/mascot-swim.svg',
      dance: 'assets/characters/mascot-dance.svg'
    },
    base: 'assets/characters/original-pink-mascot-base.svg'
  }
];
