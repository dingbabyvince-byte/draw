// ORIGINAL_ASSET 引擎：原创角色图层渲染 + 换装 + 探索世界（点击/拖动移动 + 碰撞触发）+ 存档。
// 自包含、零依赖、file:// 可用（SVG 经 <img> 加载，localStorage 包 try/catch）。
// 对齐 _gen_assets.py 生成的全套素材与 data/*.js 数据形状（praise/flee/toScene/base/全 sound）。
// 不侵入主 app.js；通过 playground2-demo.html 独立验证。
(function () {
  'use strict';
  var CHARS = window.CHARACTERS || [];
  var OUTFITS = window.OUTFITS || {};
  var SCENES = window.SCENES || [];
  var SAVE_KEY = 'kidsPaintPlaygroundV2';

  // zone 默认缩放（数据无 scale 字段时兜底，便于后续逐件微调）
  var ZONE_SCALE = { head: 0.52, body: 0.70, back: 0.95, neck: 0.50, feet: 0.62, hand: 0.42, hair: 0.38, cape: 0.80 };

  function findChar(id) { return CHARS.filter(function (c) { return c.id === id; })[0] || CHARS[0]; }
  function findScene(id) { return SCENES.filter(function (s) { return s.id === id; })[0] || SCENES[0]; }

  function loadSave() {
    try { var v = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  }
  function writeSave(v) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(v)); } catch (e) {} }

  var st = { charId: 'princess', worn: {}, sceneId: 'pool', pos: { x: 0.5, y: 0.78 }, found: {}, fled: {}, charState: 'idle' };

  var el = {};
  // ---------- 音效（Web Audio 合成，原创无外部文件） ----------
  var actx = null;
  function audio() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e) {} } return actx; }
  function tone(freq, dur, type, vol, when) {
    var c = audio(); if (!c) return;
    try { var o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.value = freq; o.connect(g); g.connect(c.destination); var t = (when || c.currentTime), v = vol || 0.15, d = dur || 0.15; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.start(t); o.stop(t + d + 0.02); } catch (e) {}
  }
  function slide(freqA, freqB, dur, vol) { var c = audio(); if (!c) return; try { var o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.connect(g); g.connect(c.destination); var t = c.currentTime; o.frequency.setValueAtTime(freqA, t); o.frequency.exponentialRampToValueAtTime(freqB, t + dur); g.gain.setValueAtTime(vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.start(t); o.stop(t + dur + 0.02); } catch (e) {} }
  function seq(notes, type, vol, step) { var c = audio(); if (!c) return; notes.forEach(function (f, i) { tone(f, 0.22, type || 'triangle', vol || 0.16, c.currentTime + i * (step || 0.12)); }); }
  var SOUNDS = {
    slip:    function () { slide(420, 140, 0.4, 0.18); },
    boing:   function () { slide(300, 700, 0.18, 0.16); slide(700, 300, 0.18, 0.12); },
    pop:     function () { tone(880, 0.1, 'triangle', 0.16); },
    sparkle: function () { tone(1320, 0.18, 'sine', 0.14); tone(1760, 0.12, 'sine', 0.1, actx.currentTime + 0.08); },
    meow:    function () { slide(700, 1100, 0.14, 0.14); slide(1100, 820, 0.16, 0.12); },
    chime:   function () { seq([523, 659, 784], 'sine', 0.16, 0.1); },
    piano:   function () { seq([392, 494, 587, 494, 392], 'triangle', 0.16, 0.12); },
    reward:  function () { seq([523, 659, 784, 1047], 'triangle', 0.18, 0.1); }
  };
  function play(name) { if (SOUNDS[name]) SOUNDS[name](); }

  // ---------- 渲染 ----------
  function charSprite() {
    var c = findChar(st.charId);
    var box = el.stage.getBoundingClientRect();
    var w = Math.max(80, Math.min(150, box.width * 0.18));
    var h = w * (c.frame.h / c.frame.w);
    el.char.style.width = w + 'px';
    el.char.style.height = h + 'px';
    el.char.style.left = (st.pos.x * 100) + '%';
    el.char.style.top = (st.pos.y * 100) + '%';
    // base 全框铺满；衣服按 anchor+scale 定位（scale 缺省取 zone 默认）
    var worn = st.worn[st.charId] || {};
    var layers = [{ z: 0, kind: 'base', src: c.states[st.charState] || c.states.idle || c.base }];
    (OUTFITS[st.charId] || []).forEach(function (it) {
      if (worn[it.zone] === it.id) layers.push({ z: it.z, kind: 'cloth', src: it.svg, anchor: it.anchor, scale: it.scale || ZONE_SCALE[it.zone] || 0.6 });
    });
    layers.sort(function (a, b) { return a.z - b.z; });
    el.char.innerHTML = '';
    layers.forEach(function (L) {
      var img = document.createElement('img');
      img.src = L.src; img.draggable = false; img.alt = '';
      if (L.kind === 'base') { img.className = 'pg-layer-base'; }
      else { img.className = 'pg-layer-clothes'; img.style.left = (L.anchor.x * 100) + '%'; img.style.top = (L.anchor.y * 100) + '%'; img.style.width = (L.scale * 100) + '%'; }
      el.char.appendChild(img);
    });
  }
  function renderScene() {
    var sc = findScene(st.sceneId);
    el.stage.style.backgroundImage = "url('" + sc.svg + "')";
    el.objects.innerHTML = '';
    sc.objects.forEach(function (o) {
      var wrap = document.createElement('div');
      wrap.className = 'pg-obj' + (st.found[o.id] && o.once ? ' is-found' : '') + (st.fled[o.id] ? ' is-fled' : '');
      wrap.style.left = (o.x * 100) + '%'; wrap.style.top = (o.y * 100) + '%';
      wrap.dataset.id = o.id;
      var img = document.createElement('img'); img.src = o.svg; img.draggable = false; img.alt = o.name;
      wrap.appendChild(img);
      var lab = document.createElement('span'); lab.textContent = o.name; wrap.appendChild(lab);
      wrap.addEventListener('pointerdown', function (e) { e.stopPropagation(); gotoObject(o); });
      el.objects.appendChild(wrap);
    });
    sc.eggs.forEach(function (o) {
      var wrap = document.createElement('div'); wrap.className = 'pg-egg' + (st.found[o.id] ? ' is-found' : '');
      wrap.style.left = (o.x * 100) + '%'; wrap.style.top = (o.y * 100) + '%'; wrap.dataset.id = o.id;
      var img = document.createElement('img'); img.src = o.svg; img.draggable = false; img.alt = o.name;
      wrap.appendChild(img);
      wrap.addEventListener('pointerdown', function (e) { e.stopPropagation(); trigger(o, true); });
      el.objects.appendChild(wrap);
    });
  }
  function renderDressPanel() {
    var c = findChar(st.charId);
    el.dress.innerHTML = '<div class="pg-panel-title">给' + c.name + '换装（点一下穿上/脱下）</div>';
    var worn = st.worn[st.charId] || {};
    var row = document.createElement('div'); row.className = 'pg-dress-row';
    (OUTFITS[st.charId] || []).forEach(function (it) {
      var b = document.createElement('button'); b.className = 'pg-dress-btn' + (worn[it.zone] === it.id ? ' on' : '');
      b.innerHTML = '<img src="' + it.svg + '" alt=""/><span>' + it.name + '</span>';
      b.addEventListener('click', function () { toggleWear(it); });
      row.appendChild(b);
    });
    el.dress.appendChild(row);
  }
  function renderCharSwitch() {
    el.switch.innerHTML = '';
    CHARS.forEach(function (c) {
      var b = document.createElement('button'); b.className = 'pg-char-btn' + (c.id === st.charId ? ' on' : '');
      b.innerHTML = '<img src="' + (c.base || c.states.idle) + '" alt=""/><span>' + c.name + '</span>';
      b.addEventListener('click', function () { st.charId = c.id; st.charState = 'idle'; persist(); refresh(); });
      el.switch.appendChild(b);
    });
  }

  // ---------- 换装 ----------
  function toggleWear(item) {
    var worn = st.worn[st.charId] = st.worn[st.charId] || {};
    var putting = worn[item.zone] !== item.id;
    if (putting) worn[item.zone] = item.id; else delete worn[item.zone];
    play('sparkle'); persist(); refresh();
    feedback(putting ? (item.praise || (item.name + ' 穿上啦！')) : (item.name + ' 脱下来啦'), 'gentle');
  }

  // ---------- 移动 ----------
  function setState(s) { st.charState = s; charSprite(); }
  function moveToPoint(px, py, onDone) {
    var rect = el.stage.getBoundingClientRect();
    var x = (px - rect.left) / rect.width, y = (py - rect.top) / rect.height;
    x = Math.max(0.05, Math.min(0.95, x)); y = Math.max(0.45, Math.min(0.92, y));
    st.pos = { x: x, y: y };
    setState('walk');
    el.char.style.transition = 'left .42s linear, top .42s linear';
    charSprite();
    clearTimeout(moveToPoint._t);
    moveToPoint._t = setTimeout(function () { el.char.style.transition = ''; setState('idle'); if (onDone) onDone(); else checkNearby(); }, 430);
  }
  function gotoObject(o) {
    var wrap = el.objects.querySelector('[data-id="' + o.id + '"]');
    if (!wrap) return trigger(o);
    var r = wrap.getBoundingClientRect();
    moveToPoint(r.left + r.width / 2, r.top + r.height / 2, function () { trigger(o); });
  }
  function checkNearby() {
    var sc = findScene(st.sceneId);
    var cR = el.char.getBoundingClientRect();
    var cx = cR.left + cR.width / 2, cy = cR.top + cR.height / 2;
    sc.objects.forEach(function (o) {
      var w = el.objects.querySelector('[data-id="' + o.id + '"]'); if (!w) return;
      var r = w.getBoundingClientRect(); var ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      if (Math.hypot(cx - ox, cy - oy) < r.width * 0.9) trigger(o);
    });
  }

  // ---------- 触发 ----------
  function trigger(o, isEgg) {
    if (o.once && st.found[o.id]) return;
    if (o.once) st.found[o.id] = true;
    if (o.sound) play(o.sound);
    if (o.state) { setState(o.state); setTimeout(function () { setState('idle'); }, 1400); }
    if (o.flee) st.fled[o.id] = true;
    if (o.trigger === 'reward' && o.givesSticker) feedback(o.feedback || '得到贴纸：' + o.givesSticker, 'success');
    else feedback(o.feedback || '发现了！', 'gentle');
    if (o.trigger === 'scene' && o.toScene && findScene(o.toScene)) {
      st.sceneId = o.toScene; st.pos = { x: 0.1, y: 0.78 }; persist(); refresh(); return;
    }
    persist(); refresh();
  }

  // ---------- 持久化与刷新 ----------
  function persist() { writeSave({ char: st.charId, worn: st.worn, scene: st.sceneId, pos: st.pos, found: st.found, fled: st.fled }); }
  function refresh() { renderScene(); charSprite(); renderDressPanel(); renderCharSwitch(); }
  function restore() {
    var v = loadSave();
    if (v.char) st.charId = v.char;
    if (v.worn) st.worn = v.worn;
    if (v.scene) st.sceneId = v.scene;
    if (v.pos) st.pos = v.pos;
    if (v.found) st.found = v.found;
    if (v.fled) st.fled = v.fled;
    st.charState = 'idle';
  }

  // ---------- 反馈 ----------
  var fbTimer = null;
  function feedback(msg, kind) {
    el.fb.textContent = msg; el.fb.className = 'pg-fb ' + (kind || '');
    clearTimeout(fbTimer); fbTimer = setTimeout(function () { el.fb.className = 'pg-fb'; el.fb.textContent = ''; }, 2200);
  }

  // ---------- 拖动角色 ----------
  var drag = null;
  function onStagePointer(e) {
    if (e.target.closest('.pg-obj') || e.target.closest('.pg-egg')) return;
    audio();
    moveToPoint(e.clientX, e.clientY);
  }
  function onCharPointer(e) { e.stopPropagation(); e.preventDefault(); audio(); drag = { ox: e.clientX, oy: e.clientY }; setState('walk'); if (el.char.setPointerCapture) { try { el.char.setPointerCapture(e.pointerId); } catch (x) {} } }
  function onPointerMove(e) {
    if (!drag) return;
    var r = el.stage.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    x = Math.max(0.05, Math.min(0.95, x)); y = Math.max(0.45, Math.min(0.92, y));
    st.pos = { x: x, y: y }; el.char.style.transition = ''; charSprite();
  }
  function onPointerUp() { if (!drag) return; drag = null; setState('idle'); persist(); checkNearby(); }

  // ---------- 初始化 ----------
  function init() {
    el.stage = document.getElementById('pg-stage');
    el.char = document.getElementById('pg-char');
    el.objects = document.getElementById('pg-objects');
    el.dress = document.getElementById('pg-dress');
    el.switch = document.getElementById('pg-switch');
    el.fb = document.getElementById('pg-feedback');
    var resetBtn = document.getElementById('pg-reset');
    if (resetBtn) resetBtn.addEventListener('click', function () { st.worn = {}; st.found = {}; st.pos = { x: 0.5, y: 0.78 }; st.charState = 'idle'; persist(); refresh(); feedback('造型重置啦，再打扮一次吧', 'gentle'); });
    restore();
    el.stage.addEventListener('pointerdown', onStagePointer);
    el.char.addEventListener('pointerdown', onCharPointer);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    window.addEventListener('resize', function () { charSprite(); });
    refresh();
  }
  window.Playground2 = { init: init, refresh: refresh, state: function () { return st; } };
})();
