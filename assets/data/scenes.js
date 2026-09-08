// ORIGINAL_ASSET 数据：场景 + 互动对象 + 彩蛋。
// 坐标 x/y 用 0~1 比例（相对场景），自适应横竖屏。
// trigger: slip / reward / action / scene / sound
window.SCENES = [
  {
    id: 'pool',
    name: '泳池',
    svg: 'assets/scenes/pool.svg',
    objects: [
      { id: 'banana', name: '香蕉皮', x: 0.28, y: 0.78, svg: 'assets/objects/banana.svg', trigger: 'slip', state: 'slip', sound: 'slip', feedback: '哎呀！滑倒啦～拍拍继续走！', once: true },
      { id: 'chest', name: '宝箱', x: 0.74, y: 0.32, svg: 'assets/objects/treasure-chest.svg', trigger: 'reward', state: 'happy', givesSticker: '泳池宝藏', sound: 'reward', feedback: '打开宝箱，得到一张贴纸！', once: true },
      { id: 'piano', name: '钢琴', x: 0.50, y: 0.18, svg: 'assets/objects/piano.svg', trigger: 'action', state: 'dance', sound: 'piano', feedback: '叮叮咚咚，弹琴跳舞！' },
      { id: 'ring', name: '游泳圈', x: 0.18, y: 0.62, svg: 'assets/objects/swimming-ring.svg', trigger: 'action', state: 'swim', sound: 'sparkle', feedback: '扑通！下水游泳啦～' },
      { id: 'door', name: '魔法门', x: 0.90, y: 0.48, svg: 'assets/objects/magic-door.svg', trigger: 'scene', toScene: 'living-room', sound: 'sparkle', feedback: '魔法门亮了！走进客厅～' }
    ],
    eggs: [
      { id: 'pool-star', name: '隐藏星星', x: 0.08, y: 0.16, svg: 'assets/objects/star-egg.svg', feedback: '找到泳池边的小星星！', sound: 'sparkle', once: true }
    ]
  },
  {
    id: 'beach',
    name: '海边',
    svg: 'assets/scenes/beach.svg',
    objects: [
      { id: 'ball', name: '沙滩球', x: 0.62, y: 0.72, svg: 'assets/objects/ball.svg', trigger: 'action', state: 'happy', sound: 'boing', feedback: '咚！沙滩球滚得好远！' },
      { id: 'ring', name: '游泳圈', x: 0.22, y: 0.58, svg: 'assets/objects/swimming-ring.svg', trigger: 'action', state: 'swim', sound: 'sparkle', feedback: '海边游泳真凉快！' },
      { id: 'cat', name: '小猫', x: 0.78, y: 0.40, svg: 'assets/objects/cat.svg', trigger: 'action', state: 'surprised', sound: 'meow', feedback: '喵！小猫跑开啦！', flee: true },
      { id: 'chest', name: '宝箱', x: 0.42, y: 0.78, svg: 'assets/objects/treasure-chest.svg', trigger: 'reward', state: 'happy', givesSticker: '海边宝藏', sound: 'reward', feedback: '沙子里挖出宝箱贴纸！', once: true },
      { id: 'door', name: '魔法门', x: 0.92, y: 0.50, svg: 'assets/objects/magic-door.svg', trigger: 'scene', toScene: 'restaurant', sound: 'sparkle', feedback: '魔法门通向餐厅！' }
    ],
    eggs: [
      { id: 'beach-mush', name: '唱歌蘑菇', x: 0.12, y: 0.28, svg: 'assets/objects/mushroom.svg', feedback: '海边蘑菇唱起啦啦啦！', sound: 'pop', once: true }
    ]
  },
  {
    id: 'restaurant',
    name: '餐厅',
    svg: 'assets/scenes/restaurant.svg',
    objects: [
      { id: 'food', name: '美食', x: 0.48, y: 0.52, svg: 'assets/objects/table-food.svg', trigger: 'action', state: 'happy', sound: 'chime', feedback: '啊呜啊呜，好好吃！' },
      { id: 'cat', name: '小猫', x: 0.18, y: 0.70, svg: 'assets/objects/cat.svg', trigger: 'action', state: 'surprised', sound: 'meow', feedback: '喵呜～小猫偷吃跑开！', flee: true },
      { id: 'piano', name: '钢琴', x: 0.78, y: 0.28, svg: 'assets/objects/piano.svg', trigger: 'action', state: 'dance', sound: 'piano', feedback: '餐厅里响起小曲儿！' },
      { id: 'plant', name: '花盆', x: 0.30, y: 0.30, svg: 'assets/objects/plant.svg', trigger: 'action', state: 'happy', sound: 'pop', feedback: '给小花浇了点水！' },
      { id: 'door', name: '魔法门', x: 0.90, y: 0.55, svg: 'assets/objects/magic-door.svg', trigger: 'scene', toScene: 'kitchen', sound: 'sparkle', feedback: '魔法门通向厨房！' }
    ],
    eggs: [
      { id: 'rest-star', name: '隐藏星星', x: 0.88, y: 0.16, svg: 'assets/objects/star-egg.svg', feedback: '餐厅天花板藏着星星！', sound: 'sparkle', once: true }
    ]
  },
  {
    id: 'kitchen',
    name: '厨房',
    svg: 'assets/scenes/kitchen.svg',
    objects: [
      { id: 'pot', name: '锅具', x: 0.28, y: 0.48, svg: 'assets/objects/pot.svg', trigger: 'action', state: 'surprised', sound: 'boing', feedback: '锅盖叮咚！哈哈哈哈～' },
      { id: 'food', name: '美食', x: 0.62, y: 0.58, svg: 'assets/objects/table-food.svg', trigger: 'action', state: 'happy', sound: 'chime', feedback: '厨房小点心好香！' },
      { id: 'banana', name: '香蕉皮', x: 0.48, y: 0.82, svg: 'assets/objects/banana.svg', trigger: 'slip', state: 'slip', sound: 'slip', feedback: '厨房也有香蕉皮！滑～', once: true },
      { id: 'plant', name: '香草盆', x: 0.80, y: 0.36, svg: 'assets/objects/plant.svg', trigger: 'action', state: 'happy', sound: 'pop', feedback: '香草闻起来香香的！' },
      { id: 'door', name: '魔法门', x: 0.10, y: 0.50, svg: 'assets/objects/magic-door.svg', trigger: 'scene', toScene: 'living-room', sound: 'sparkle', feedback: '魔法门通向客厅！' }
    ],
    eggs: [
      { id: 'kit-mush', name: '会笑蘑菇', x: 0.88, y: 0.78, svg: 'assets/objects/mushroom.svg', feedback: '蘑菇咯咯笑起来！', sound: 'boing', once: true }
    ]
  },
  {
    id: 'living-room',
    name: '客厅',
    svg: 'assets/scenes/living-room.svg',
    objects: [
      { id: 'piano', name: '钢琴', x: 0.70, y: 0.42, svg: 'assets/objects/piano.svg', trigger: 'action', state: 'dance', sound: 'piano', feedback: '客厅音乐会开始！' },
      { id: 'cat', name: '小猫', x: 0.28, y: 0.68, svg: 'assets/objects/cat.svg', trigger: 'action', state: 'surprised', sound: 'meow', feedback: '喵！沙发上的猫跑啦！', flee: true },
      { id: 'plant', name: '花盆', x: 0.14, y: 0.36, svg: 'assets/objects/plant.svg', trigger: 'action', state: 'happy', sound: 'pop', feedback: '客厅小花开得更好了！' },
      { id: 'chest', name: '宝箱', x: 0.50, y: 0.72, svg: 'assets/objects/treasure-chest.svg', trigger: 'reward', state: 'happy', givesSticker: '客厅宝藏', sound: 'reward', feedback: '沙发旁的宝箱贴纸！', once: true },
      { id: 'door', name: '魔法门', x: 0.90, y: 0.50, svg: 'assets/objects/magic-door.svg', trigger: 'scene', toScene: 'pool', sound: 'sparkle', feedback: '魔法门回到泳池啦！' }
    ],
    eggs: [
      { id: 'live-star', name: '隐藏星星', x: 0.08, y: 0.18, svg: 'assets/objects/star-egg.svg', feedback: '相框后面藏着星星！', sound: 'sparkle', once: true }
    ]
  }
];
