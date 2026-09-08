(function () {
  'use strict';
  var host, active = false, selected = null, drag = null, timers = [], stations = {}, washed = {}, lastPointerClick = 0;
  var foods = [
    { id: 'carrot', icon: '🥕', name: '胡萝卜', kind: 'veg' },
    { id: 'tomato', icon: '🍅', name: '番茄', kind: 'veg' },
    { id: 'corn', icon: '🌽', name: '玉米', kind: 'veg' },
    { id: 'strawberry', icon: '🍓', name: '草莓', kind: 'fruit' },
    { id: 'milk', icon: '🥛', name: '牛奶', kind: 'milk' },
    { id: 'bread', icon: '🍞', name: '面包', kind: 'bread' },
    { id: 'flour', icon: '🌾', name: '面粉', kind: 'powder' },
    { id: 'eggs', icon: '🥚', name: '鸡蛋', kind: 'egg' },
    { id: 'chocolate', icon: '🍫', name: '巧克力', kind: 'chocolate' },
    { id: 'cheese', icon: '🧀', name: '芝士', kind: 'cheese' }
  ];
  var recipes = {
    pot: { name: '汤锅', icon: '🍲', accepts: ['veg'], hints: ['🥕','🍅'], result: '🍲', sticker: 'pot', action: '🥄' },
    oven: { name: '烤箱', icon: '🧁', accepts: ['bread','fruit','milk'], hints: ['🍞','🍓'], result: '🧁', sticker: 'cupcake', action: '🧤' },
    blender: { name: '果汁机', icon: '🍹', accepts: ['fruit','milk'], hints: ['🍓','🥛'], result: '🍹', sticker: 'juice', action: '🌀' },
    cake: { name: '蛋糕机', icon: '🎂', accepts: ['powder','egg'], hints: ['🌾','🥚'], result: '🎂', sticker: 'cupcake', action: '🎀' },
    chocCake: { name: '巧克力蛋糕', icon: '🍫', accepts: ['powder','chocolate'], hints: ['🌾','🍫'], result: '🍫', sticker: 'cupcake', action: '🍩' },
    strawCake: { name: '草莓蛋糕', icon: '🍰', accepts: ['powder','fruit'], hints: ['🌾','🍓'], result: '🍰', sticker: 'cupcake', action: '🍒' },
    pizza: { name: '披萨烤炉', icon: '🍕', accepts: ['powder','cheese'], hints: ['🌾','🧀'], result: '🍕', sticker: 'pot', action: '🔥' },
    icecream: { name: '冰淇淋机', icon: '🍦', accepts: ['milk','fruit'], hints: ['🥛','🍓'], result: '🍦', sticker: 'juice', action: '❄️' },
    chocIce: { name: '巧克力冰淇淋', icon: '🍨', accepts: ['milk','chocolate'], hints: ['🥛','🍫'], result: '🍨', sticker: 'juice', action: '🍦' }
  };
  function later(fn, delay) { var id = setTimeout(function () { timers = timers.filter(function (t) { return t !== id; }); if (active) fn(); }, delay); timers.push(id); }
  function food(id) { return foods.find(function (f) { return f.id === id; }); }
  function sound(kind) { window.KidsAudio.effect(kind); }
  function button(label, cls, html, attrs) { return '<button type="button" class="' + cls + '" aria-label="' + label + '" ' + (attrs || '') + '>' + html + '</button>'; }
  function init() {
    host = document.getElementById('kitchenWorld'); if (!host || host.children.length) return;
    host.innerHTML = '<div class="kitchen-room"><div class="kitchen-window" aria-hidden="true"><span>☀️</span><i></i><i></i></div><div class="kitchen-bunting" aria-hidden="true">▾ ▾ ▾ ▾ ▾ ▾ ▾</div>' +
      '<div class="kitchen-tools">' + button('摇动打蛋器', 'hanging-tool', '🥄', 'data-toy="spoon"') + button('摇动擀面杖', 'hanging-tool', '<img src="assets/stickers/rolling-pin.svg" alt="">', 'data-toy="roller"') + button('摇动厨师帽', 'hanging-tool', '👨‍🍳', 'data-toy="hat"') + '</div>' +
      '<div class="kitchen-topbar">' + button('重新准备厨房', 'kitchen-icon', '↻', 'data-reset') + button('关闭声音', 'kitchen-icon', '🔊', 'data-kitchen-sound aria-pressed="true"') + '</div>' +
      '<div class="kitchen-counter"><div class="kitchen-sink" data-drop="sink">' + button('洗一洗选中的食材', 'sink-tap', '🚰', 'data-station="sink"') + '<div class="water-stream"></div><div class="sink-bowl"></div><div class="sink-food"></div></div>' +
      Object.keys(recipes).map(function (id) {
        var recipe = recipes[id];
        return '<div class="cook-station station-' + id + '" data-drop="' + id + '"><div class="recipe-bubble" aria-hidden="true">' + recipe.hints.join('<i>＋</i>') + '</div>' + button(recipe.name + '：加入两份食材，再点一下制作', 'appliance', '<span class="steam"><i></i><i></i><i></i></span><span class="appliance-body"></span><span class="food-inside"></span><span class="appliance-face">◡</span><span class="cook-progress"></span>', 'data-station="' + id + '"') + '<div class="ingredient-slots" aria-hidden="true"><span>○</span><span>○</span></div></div>';
      }).join('') + '</div><div class="kitchen-cabinets" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
      '<div class="kitchen-serving">' + button('喂小伙伴吃做好的一道菜', 'kitchen-friend', '<span class="friend-hat">👨‍🍳</span><span class="friend-face">😋</span><span class="friend-heart">♡</span>', 'data-feed') + '<div class="serving-plates" aria-label="做好的食物"></div><div class="kitchen-prizes" aria-label="本次获得的贴纸"></div></div>' +
      '<div class="food-shelf" aria-label="点选食材再点厨具，或拖动食材到厨具">' + foods.map(function (f) { var st = sticker(f.id); var visual = st.asset ? '<img src="' + st.asset + '" alt="">' : '<span style="display:grid;place-items:center;width:100%;height:100%;font-size:44px;pointer-events:none">' + f.icon + '</span>'; return button(f.name, 'kitchen-food', visual + '<span class="wash-check">💧</span>', 'data-food="' + f.id + '" aria-pressed="false"'); }).join('') + '</div><div class="kitchen-particles" aria-hidden="true"></div></div>';
    host.addEventListener('click', onClick);
    host.addEventListener('pointerdown', pointerDown);
    host.addEventListener('pointermove', pointerMove);
    host.addEventListener('pointerup', pointerUp);
    host.addEventListener('pointercancel', cancelDrag);
    host.addEventListener('lostpointercapture', cancelDrag);
    reset();
  }
  function sticker(id) { return window.STICKERS.find(function (s) { return s.id === id; }) || { asset: '', name: id }; }
  function burst(node, icons) {
    var room = host.getBoundingClientRect(), rect = node.getBoundingClientRect(), layer = host.querySelector('.kitchen-particles');
    for (var i = 0; i < 9; i++) {
      var p = document.createElement('span'); p.className = 'kitchen-particle'; p.textContent = icons[i % icons.length];
      p.style.left = rect.left - room.left + rect.width / 2 + 'px'; p.style.top = rect.top - room.top + rect.height / 2 + 'px';
      p.style.setProperty('--dx', (Math.random() - .5) * 170 + 'px'); p.style.setProperty('--dy', (-45 - Math.random() * 95) + 'px'); p.style.setProperty('--spin', (Math.random() - .5) * 100 + 'deg');
      layer.appendChild(p); later(function (particle) { return function () { particle.remove(); }; }(p), 1100);
    }
  }
  function bounce(node) { node.classList.remove('kitchen-bounce'); void node.offsetWidth; node.classList.add('kitchen-bounce'); later(function () { node.classList.remove('kitchen-bounce'); }, 600); }
  function choose(id) {
    selected = id;
    host.querySelectorAll('[data-food]').forEach(function (b) { b.classList.toggle('selected', b.dataset.food === id); b.setAttribute('aria-pressed', String(b.dataset.food === id)); });
    host.querySelectorAll('.cook-station').forEach(function (node) { node.classList.toggle('can-drop', !!id && recipes[node.dataset.drop].accepts.indexOf(food(id).kind) >= 0 && stations[node.dataset.drop].phase === 'idle' && stations[node.dataset.drop].foods.length < 2); });
    host.querySelector('.kitchen-sink').classList.toggle('can-drop', !!id);
  }
  function wash(id) {
    var sink = host.querySelector('.kitchen-sink'); sink.classList.remove('washing'); void sink.offsetWidth; sink.classList.add('washing'); sound('water');
    host.querySelector('.sink-food').textContent = id ? food(id).icon : '🫧';
    if (id) { washed[id] = true; host.querySelector('[data-food="' + id + '"]').classList.add('is-washed'); }
    burst(sink, ['💧','🫧']); later(function () { sink.classList.remove('washing'); }, 1600);
  }
  function drop(id, target) {
    if (target === 'sink') { wash(id); return; }
    var r = recipes[target], s = stations[target], node = host.querySelector('[data-drop="' + target + '"]');
    if (!r || !s) return;
    if (s.phase !== 'idle' || s.foods.length >= 2 || r.accepts.indexOf(food(id).kind) < 0) { bounce(node.querySelector('.recipe-bubble')); sound('pop'); return; }
    s.foods.push(id); choose(null); sound('pop'); updateStation(target); burst(node, [food(id).icon, '✨']);
  }
  function updateStation(id) {
    var node = host.querySelector('[data-drop="' + id + '"]'), s = stations[id], r = recipes[id];
    node.classList.toggle('is-cooking', s.phase === 'cooking'); node.classList.toggle('is-ready', s.phase === 'ready'); node.classList.toggle('is-loaded', s.foods.length === 2 && s.phase === 'idle');
    node.querySelector('.ingredient-slots').innerHTML = [0,1].map(function (i) { return '<span>' + (s.foods[i] ? food(s.foods[i]).icon : '○') + '</span>'; }).join('');
    node.querySelector('.food-inside').textContent = s.phase === 'ready' ? r.result : s.foods.map(function (id) { return food(id).icon; }).join('');
    node.querySelector('.appliance-face').textContent = s.phase === 'ready' ? '😋' : s.phase === 'cooking' ? r.action : s.foods.length === 2 ? '👆' : '◡';
    node.querySelector('.appliance').setAttribute('aria-label', r.name + (s.phase === 'ready' ? '做好了，点一下装盘' : s.phase === 'cooking' ? '制作中，点一下搅拌' : s.foods.length === 2 ? '食材备齐，点一下开始制作' : '，已加入' + s.foods.length + '份食材'));
  }
  function useStation(id) {
    if (id === 'sink') { wash(selected); return; }
    var s = stations[id], node = host.querySelector('[data-drop="' + id + '"]');
    if (s.phase === 'ready') { serve(id); return; }
    if (s.phase === 'cooking') { bounce(node.querySelector('.appliance')); burst(node, id === 'pot' ? ['🥕','💨'] : ['✨','💛']); sound('cook'); return; }
    if (selected) { drop(selected, id); return; }
    if (s.foods.length < 2) { bounce(node.querySelector('.recipe-bubble')); recipes[id].accepts.forEach(function (kind) { foods.filter(function (f) { return f.kind === kind; }).forEach(function (f) { bounce(host.querySelector('[data-food="' + f.id + '"]')); }); }); return; }
    s.phase = 'cooking'; updateStation(id); sound('cook');
    later(function () { s.phase = 'ready'; updateStation(id); sound('reward'); burst(node, ['✨','⭐']); }, 3200);
  }
  function serve(id) {
    var tray = host.querySelector('.serving-plates');
    if (tray.children.length >= 3) { bounce(host.querySelector('.kitchen-friend')); tray.querySelectorAll('button').forEach(bounce); return; }
    var r = recipes[id], plate = document.createElement('button'); plate.type = 'button'; plate.className = 'served-dish'; plate.dataset.dish = id; plate.setAttribute('aria-label', '把' + r.name + '做好的食物喂给小伙伴'); plate.textContent = r.result;
    tray.appendChild(plate); stations[id] = { foods: [], phase: 'idle' }; updateStation(id); choose(null); bounce(plate); sound('pop');
  }
  function feed(plate) {
    var friend = host.querySelector('.kitchen-friend');
    if (!plate) { bounce(friend); burst(friend, ['😋','♡']); return; }
    var id = plate.dataset.dish; if (plate.disabled) return;
    plate.disabled = true; plate.classList.add('dish-eaten'); friend.classList.add('is-eating'); friend.querySelector('.friend-face').textContent = '😍'; sound('reward');
    window.StickerLab.award(recipes[id].sticker);
    var prizes = host.querySelector('.kitchen-prizes'), prize = document.createElement('img'); prize.src = sticker(recipes[id].sticker).asset; prize.alt = sticker(recipes[id].sticker).name; prizes.appendChild(prize); if (prizes.children.length > 4) prizes.firstElementChild.remove();
    burst(friend, ['💕','⭐','✨']); later(function () { plate.remove(); friend.classList.remove('is-eating'); friend.querySelector('.friend-face').textContent = '😋'; }, 950);
  }
  function onClick(event) {
    if (Date.now() < lastPointerClick) return;
    var target = event.target.closest('button'); if (!target) return;
    if (target.hasAttribute('data-food')) { choose(selected === target.dataset.food ? null : target.dataset.food); bounce(target); sound('pop'); }
    else if (target.hasAttribute('data-station')) useStation(target.dataset.station);
    else if (target.hasAttribute('data-dish')) feed(target);
    else if (target.hasAttribute('data-feed')) feed(host.querySelector('.served-dish:not(:disabled)'));
    else if (target.hasAttribute('data-toy')) { bounce(target); burst(target, ['✨','🎵']); sound('cook'); }
    else if (target.hasAttribute('data-reset')) reset();
    else if (target.hasAttribute('data-kitchen-sound')) { document.getElementById('btnSoundHome').click(); syncSound(); }
  }
  function pointerDown(e) {
    var b = e.target.closest('[data-food]'); if (!b || drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag = { id: b.dataset.food, pointer: e.pointerId, x: e.clientX, y: e.clientY, moved: false, ghost: null, button: b }; b.setPointerCapture(e.pointerId);
  }
  function pointerMove(e) {
    if (!drag || drag.pointer !== e.pointerId) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) {
      drag.moved = true; choose(drag.id); drag.ghost = document.createElement('div'); drag.ghost.className = 'food-drag-ghost'; drag.ghost.textContent = food(drag.id).icon; document.body.appendChild(drag.ghost);
    }
    if (!drag.moved) return;
    e.preventDefault(); drag.ghost.style.left = e.clientX + 'px'; drag.ghost.style.top = e.clientY + 'px';
    var under = document.elementFromPoint(e.clientX, e.clientY), zone = under && under.closest('[data-drop]');
    host.querySelectorAll('[data-drop]').forEach(function (n) { n.classList.toggle('drag-over', n === zone); });
  }
  function pointerUp(e) {
    if (!drag || drag.pointer !== e.pointerId) return;
    var d = drag, under = document.elementFromPoint(e.clientX, e.clientY), zone = under && under.closest('[data-drop]');
    cancelDrag();
    if (d.moved) { lastPointerClick = Date.now() + 350; if (zone) drop(d.id, zone.dataset.drop); }
  }
  function cancelDrag() {
    if (!drag) return;
    var d = drag; drag = null; if (d.ghost) d.ghost.remove();
    if (d.button.hasPointerCapture(d.pointer)) d.button.releasePointerCapture(d.pointer);
    host.querySelectorAll('[data-drop]').forEach(function (n) { n.classList.remove('drag-over'); });
  }
  function reset() {
    cancelDrag(); timers.forEach(clearTimeout); timers = []; washed = {};
    Object.keys(recipes).forEach(function (id) { stations[id] = { foods: [], phase: 'idle' }; updateStation(id); }); choose(null);
    host.querySelector('.serving-plates').innerHTML = ''; host.querySelector('.kitchen-particles').innerHTML = ''; host.querySelector('.sink-food').textContent = '';
    host.querySelectorAll('.washing,.is-eating,.is-washed,.kitchen-bounce').forEach(function (n) { n.classList.remove('washing','is-eating','is-washed','kitchen-bounce'); });
    host.querySelector('.friend-face').textContent = '😋';
  }
  function syncSound() { var source = document.getElementById('btnSoundHome'), b = host.querySelector('[data-kitchen-sound]'), on = source.getAttribute('aria-pressed') === 'true'; b.textContent = on ? '🔊' : '🔇'; b.setAttribute('aria-label', on ? '关闭声音' : '开启声音'); b.setAttribute('aria-pressed', String(on)); }
  window.KitchenWorld = {
    open: function () { active = true; init(); syncSound(); window.KidsAudio.theme('kitchen'); },
    close: function () { if (!host) return; reset(); active = false; },
    snapshot: function () { return JSON.parse(JSON.stringify(stations)); }
  };
})();
