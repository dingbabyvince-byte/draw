// ORIGINAL_ASSET 数据：原创服装系统。
// 每件衣服是独立 SVG，带 zone(投放区) + z(图层顺序) + anchor(相对角色框的定位比例)。
// 渲染时按 z 从小到大叠加在角色 base 之上；同 zone 互斥替换。
window.ZONES = [
  { id: 'back', label: '背部', anchor: { x: 0.5, y: 0.42 } },
  { id: 'body', label: '身体', anchor: { x: 0.5, y: 0.52 } },
  { id: 'feet', label: '脚部', anchor: { x: 0.5, y: 0.94 } },
  { id: 'neck', label: '颈部', anchor: { x: 0.5, y: 0.34 } },
  { id: 'head', label: '头部', anchor: { x: 0.5, y: 0.06 } },
  { id: 'hand', label: '手部', anchor: { x: 0.82, y: 0.55 } }
];

window.OUTFITS = {
  princess: [
    { id: 'cape', name: '爱心披风', zone: 'back', z: 8, svg: 'assets/clothes/princess/cape.svg', anchor: { x: 0.5, y: 0.42 }, praise: '披风飘起来啦！' },
    { id: 'wings', name: '蝴蝶翅膀', zone: 'back', z: 10, svg: 'assets/clothes/princess/wings.svg', anchor: { x: 0.5, y: 0.42 }, praise: '翅膀扑棱扑棱！' },
    { id: 'pink-dress', name: '粉色公主裙', zone: 'body', z: 20, svg: 'assets/clothes/princess/pink-dress.svg', anchor: { x: 0.5, y: 0.52 }, praise: '粉色裙摆转呀转！' },
    { id: 'blue-dress', name: '蓝色蓬蓬裙', zone: 'body', z: 20, svg: 'assets/clothes/princess/blue-dress.svg', anchor: { x: 0.5, y: 0.52 }, praise: '蓝色蓬蓬裙像云朵！' },
    { id: 'swimsuit', name: '泳装', zone: 'body', z: 20, svg: 'assets/clothes/princess/swimsuit.svg', anchor: { x: 0.5, y: 0.52 }, praise: '穿好泳装去游泳！' },
    { id: 'beach-outfit', name: '海边度假服', zone: 'body', z: 20, svg: 'assets/clothes/princess/beach-outfit.svg', anchor: { x: 0.5, y: 0.52 }, praise: '海边度假装好亮！' },
    { id: 'necklace', name: '珍珠项链', zone: 'neck', z: 30, svg: 'assets/clothes/princess/necklace.svg', anchor: { x: 0.5, y: 0.34 }, praise: '珍珠项链闪闪的！' },
    { id: 'shoes', name: '小皮鞋', zone: 'feet', z: 35, svg: 'assets/clothes/princess/shoes.svg', anchor: { x: 0.5, y: 0.94 }, praise: '小皮鞋走起公主步！' },
    { id: 'hairpin', name: '星月发饰', zone: 'head', z: 38, svg: 'assets/clothes/princess/hairpin.svg', anchor: { x: 0.72, y: 0.10 }, praise: '发饰亮晶晶！' },
    { id: 'crown', name: '小皇冠', zone: 'head', z: 40, svg: 'assets/clothes/princess/crown.svg', anchor: { x: 0.5, y: 0.05 }, praise: '皇冠戴好啦！' },
    { id: 'wand', name: '魔法棒', zone: 'hand', z: 45, svg: 'assets/clothes/princess/wand.svg', anchor: { x: 0.86, y: 0.52 }, praise: '挥一挥魔法棒！' }
  ],
  mascot: [
    { id: 'cape', name: '小披风', zone: 'back', z: 8, svg: 'assets/clothes/mascot/cape.svg', anchor: { x: 0.5, y: 0.45 }, praise: '披风酷酷的！' },
    { id: 'wings', name: '小翅膀', zone: 'back', z: 10, svg: 'assets/clothes/mascot/wings.svg', anchor: { x: 0.5, y: 0.45 }, praise: '翅膀扑扑飞！' },
    { id: 'dress', name: '蓬蓬裙', zone: 'body', z: 20, svg: 'assets/clothes/mascot/dress.svg', anchor: { x: 0.5, y: 0.55 }, praise: '裙子圆滚滚！' },
    { id: 'chef-outfit', name: '厨师服', zone: 'body', z: 22, svg: 'assets/clothes/mascot/chef-outfit.svg', anchor: { x: 0.5, y: 0.50 }, praise: '小厨师上线！' },
    { id: 'beach-outfit', name: '海边度假服', zone: 'body', z: 20, svg: 'assets/clothes/mascot/beach-outfit.svg', anchor: { x: 0.5, y: 0.55 }, praise: '去海边玩喽！' },
    { id: 'shoes', name: '小鞋子', zone: 'feet', z: 35, svg: 'assets/clothes/mascot/shoes.svg', anchor: { x: 0.5, y: 0.94 }, praise: '鞋子穿好啦！' },
    { id: 'crown', name: '小皇冠', zone: 'head', z: 40, svg: 'assets/clothes/mascot/crown.svg', anchor: { x: 0.5, y: 0.08 }, praise: '星宝也戴皇冠！' }
  ]
};
