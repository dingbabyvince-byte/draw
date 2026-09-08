(function () {
  'use strict';

  var LEVELS = window.LEVELS || [];
  var KEYS = {
    total: 'kidsPaintTotalStars',
    records: 'kidsPaintLevelRecords',
    stickers: 'kidsPaintCollectedStickers',
    sound: 'kidsPaintSoundEnabled',
    lastLevel: 'kidsPaintLastLevel',
    guide: 'kidsPaintGuideSeen',
    daily: 'kidsPaintDailyState',
    playgroundOutfit: 'kidsPaintPlaygroundOutfit',
    playgroundActions: 'kidsPaintPlaygroundActions'
  };
  var COLORS = {
    '#e74c3c': '红色', '#2ecc71': '绿色', '#8d6e63': '棕色', '#f1c40f': '黄色',
    '#3498db': '蓝色', '#e67e22': '橙色', '#9b59b6': '紫色', '#ec407a': '粉色',
    '#ff7043': '橘红色', '#9ccc65': '嫩绿色', '#26a69a': '青绿色', '#29b6f6': '天蓝色',
    '#5c6bc0': '靛蓝色', '#ab47bc': '紫罗兰色', '#ef5350': '红色', '#fdd835': '黄色',
    '#66bb6a': '绿色', '#26c6da': '青色', '#42a5f5': '蓝色', '#7e57c2': '紫色',
    '#78909c': '灰蓝色', '#37474f': '深灰色', '#cfd8dc': '银灰色', '#90caf9': '浅蓝色',
    '#66bb6a': '绿色', '#43a047': '绿色', '#ffe0b2': '奶油色', '#a1887f': '灰棕色',
    '#e57373': '珊瑚红', '#81d4fa': '浅蓝色', '#cfe8ff': '浅蓝色', '#b3e5fc': '云朵蓝',
    '#ffb3c7': '樱花粉', '#ff8a65': '蜜桃色', '#ffca28': '金黄色', '#d4e157': '青柠色',
    '#00acc1': '湖水蓝', '#3949ab': '宝石蓝', '#5e35b1': '葡萄紫', '#8e5a3c': '巧克力色',
    '#ffffff': '雪白色', '#212121': '墨黑色'
  };
  var MASTER_PALETTE = [
    '#ef5350', '#ff7043', '#ff8a65', '#ffb3c7', '#ec407a', '#ab47bc',
    '#7e57c2', '#5e35b1', '#3949ab', '#42a5f5', '#29b6f6', '#00acc1',
    '#26a69a', '#43a047', '#66bb6a', '#d4e157', '#fdd835', '#ffca28',
    '#e67e22', '#8e5a3c', '#a1887f', '#78909c', '#ffffff', '#212121'
  ];
  var TIER_INFO = {
    L1: { name: '小小入门岛', desc: '大块图形，轻松上手', icon: '🍎' },
    L2: { name: '彩色探险岛', desc: '多一点细节，多一点发现', icon: '🏠' },
    L3: { name: '想象花园岛', desc: '小小高手的创意天地', icon: '🌸' }
  };
  // ORIGINAL_ASSET: 角色/服装/场景数据来自 assets/data/*.js
  var CHARACTERS = window.CHARACTERS || [];
  var OUTFITS = window.OUTFITS || {};
  var ZONES = window.ZONES || [];
  var SCENES = window.SCENES || [];
  var STICKERS = window.STICKERS || [];
  var state = {
    levelIndex: 0,
    currentColor: null,
    filled: {},
    regionIds: [],
    usedHint: false,
    finished: false,
    usedColors: {},
    paintMode: 'fill',
    inputLocked: false,
    demoToken: 0,
    traceDrawing: false,
    tracePath: null,
    traceLast: null,
    traceDistance: 0,
    traceStrokes: 0,
    traceColors: {}
  };
  var soundEnabled = readText(KEYS.sound, 'on') !== 'off';
  var sessionCollectedStickers = {};

  /* 所有记录都包在安全读写里，file:// 禁用存储时仍可完整游玩。 */
  function read(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  function readText(key, fallback) {
    try { return localStorage.getItem(key) || fallback; } catch (e) { return fallback; }
  }
  function writeText(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }
  function totalStars() {
    var n = parseInt(readText(KEYS.total, '0'), 10);
    return isNaN(n) ? 0 : n;
  }
  function setTotalStars(value) { writeText(KEYS.total, Math.max(0, value)); }
  function records() {
    var data = read(KEYS.records, {});
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  }
  function collectedStickers() {
    var data = read(KEYS.stickers, {});
    if (!data || typeof data !== 'object' || Array.isArray(data)) data = {};
    Object.keys(sessionCollectedStickers).forEach(function (id) { data[id] = data[id] || { collectedAt: null }; });
    return data;
  }
  function stickerCount() { return window.StickerLab.count(); }
  function awardSticker(level) {
    window.StickerLab.award(lvSticker(level).id, level.id);
    var data = collectedStickers(), alreadyCollected = !!data[level.id];
    sessionCollectedStickers[level.id] = true;
    if (!alreadyCollected) {
      data[level.id] = { collectedAt: new Date().toISOString() };
      write(KEYS.stickers, data);
    }
    return true;
  }
  function todayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function dailyState() {
    var data = read(KEYS.daily, null);
    if (!data || data.date !== todayKey()) return { date: todayKey(), completed: false, colors: [], independent: false, celebrated: false };
    data.colors = Array.isArray(data.colors) ? data.colors : [];
    return data;
  }
  function saveDaily(data) { write(KEYS.daily, data); }

  // ---------- 音效（Web Audio，无需外部文件；浏览器禁音时静默降级） ----------
  var actx = null;
  function audio() {
    if (!soundEnabled || document.hidden) return null;
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {}
    }
    if (actx && actx.state === 'suspended') { try { actx.resume(); } catch (e2) {} }
    return actx;
  }
  function tone(freq, dur, type, vol) {
    if (!soundEnabled) return;
    var c = audio();
    if (!c) return;
    try {
      var o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      o.connect(g); g.connect(c.destination);
      var t = c.currentTime, v = vol || 0.15, d = dur || 0.15;
      g.gain.setValueAtTime(v, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  function popSound() { tone(560 + Math.random() * 90, 0.12, 'triangle', 0.18); }
  function boingSound() {
    if (!soundEnabled) return;
    tone(260, 0.16, 'sine', 0.2);
    setTimeout(function () { if (soundEnabled) tone(520, 0.22, 'triangle', 0.14); }, 80);
  }
  function slideSound() {
    if (!soundEnabled) return;
    tone(680, 0.1, 'sawtooth', 0.12);
    setTimeout(function () { if (soundEnabled) tone(190, 0.28, 'triangle', 0.16); }, 90);
  }
  function actionSound(kind) {
    if (!soundEnabled) return;
    if (kind === 'boing') boingSound();
    else if (kind === 'slide' || kind === 'slip') slideSound();
    else if (kind === 'chime' || kind === 'reward' || kind === 'sparkle') chime();
    else if (kind === 'piano') {
      [392, 494, 587, 784].forEach(function (f, i) {
        setTimeout(function () { if (soundEnabled) tone(f, 0.22, 'triangle', 0.16); }, i * 90);
      });
    } else if (kind === 'meow') {
      tone(880, 0.08, 'square', 0.08);
      setTimeout(function () { if (soundEnabled) tone(660, 0.18, 'sine', 0.12); }, 70);
    } else popSound();
  }
  function chime() {
    [523, 659, 784, 1047].forEach(function (f, i) {
      setTimeout(function () { if (soundEnabled) tone(f, 0.28, 'sine', 0.18); }, i * 110);
    });
  }
  function praise(text) {
    if (!soundEnabled) return;
    try {
      if ('speechSynthesis' in window) {
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN'; u.rate = 0.95; u.pitch = 1.25;
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }
  function renderSoundToggle() {
    var icon = soundEnabled ? '🔊' : '🔇', label = soundEnabled ? '关闭声音' : '开启声音', text = soundEnabled ? '声音开' : '声音关';
    ['btnSoundHome', 'btnSoundGame'].forEach(function (id) {
      if (!el[id]) return;
      el[id].innerHTML = icon + '<span>' + text + '</span>';
      el[id].setAttribute('aria-label', label);
      el[id].setAttribute('aria-pressed', soundEnabled ? 'true' : 'false');
      el[id].classList.toggle('is-off', !soundEnabled);
    });
  }
  function toggleSound() {
    soundEnabled = !soundEnabled;
    writeText(KEYS.sound, soundEnabled ? 'on' : 'off');
    window.KidsAudio.enabled(soundEnabled);
    if (!soundEnabled) {
      try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch (e) {}
      if (actx && actx.state === 'running') { try { actx.suspend(); } catch (e2) {} }
    } else if (actx && actx.state === 'suspended') {
      try { actx.resume(); } catch (e3) {}
    }
    renderSoundToggle();
    ['btnSoundHome', 'btnSoundGame'].forEach(function (id) {
      if (!el[id]) return;
      el[id].classList.remove('sound-toggle-feedback'); void el[id].offsetWidth; el[id].classList.add('sound-toggle-feedback');
    });
  }

  var el = {};
  function cacheDom() {
    ['homeView', 'gameView', 'homeStarTotal', 'homeStickerTotal', 'dailyCount', 'dailyGoals', 'levelCards', 'btnContinue', 'btnAlbum', 'btnHome', 'btnSoundHome', 'btnSoundGame',
      'levelTitle', 'levelAge', 'levelProgress', 'starTotal', 'stage', 'palette', 'selectedColor', 'selectedColorPreview', 'btnClear', 'btnHint', 'btnFillMode', 'btnTraceMode', 'btnDoneDrawing', 'traceProgress',
      'guideBubble', 'overlay', 'overlayStars', 'overlayMsg', 'overlayEarn', 'overlaySticker', 'btnReplay', 'btnNext', 'confetti', 'toast',
      'albumModal', 'albumGrid', 'albumCount', 'stickerGrid', 'stickerCount', 'btnCloseAlbum', 'btnPlayground', 'playgroundModal', 'btnClosePlayground', 'tabOutfit', 'tabAction', 'outfitMode', 'actionMode', 'characterPicker', 'outfitItems', 'outfitProgress', 'outfitFeedback', 'btnResetOutfit', 'btnPrincessLook', 'btnSurpriseLook', 'btnGoExplore', 'dressStage', 'dressLayers', 'wearSlots', 'scenePicker', 'actionCharPicker', 'sceneBg', 'actionScene', 'actionTargets', 'actionEggs', 'actionCharacter', 'actionBuddy', 'actionProgress', 'actionFeedback', 'actionMission'].forEach(function (id) { el[id] = document.getElementById(id); });
  }

  function groupedLevels(level) {
    return LEVELS.filter(function (lv) { return lv.level === level; });
  }
  function nextIncompleteIndex(level) {
    var group = groupedLevels(level);
    for (var i = 0; i < group.length; i++) {
      var globalIndex = LEVELS.indexOf(group[i]);
      if (!(records()[group[i].id] && records()[group[i].id].bestStars > 0)) return globalIndex;
    }
    return LEVELS.indexOf(group[0]);
  }
  function resumeIndex() {
    var saved = parseInt(readText(KEYS.lastLevel, '0'), 10);
    if (!isNaN(saved) && LEVELS[saved]) return saved;
    for (var i = 0; i < LEVELS.length; i++) {
      if (!(records()[LEVELS[i].id] && records()[LEVELS[i].id].bestStars > 0)) return i;
    }
    return 0;
  }
  function tierProgress(level) {
    var group = groupedLevels(level), done = 0, stars = 0;
    group.forEach(function (lv) {
      var record = records()[lv.id];
      if (record && record.bestStars > 0) { done++; stars += record.bestStars; }
    });
    return { done: done, total: group.length, stars: stars, maxStars: group.length * 3 };
  }
  function renderStars(count, cls) {
    var html = '';
    for (var i = 0; i < 3; i++) html += '<span class="' + (i < count ? (cls || 'on') : '') + '">★</span>';
    return html;
  }
  function renderHome() {
    var total = totalStars();
    el.homeStarTotal.textContent = '⭐ ' + total;
    el.homeStickerTotal.textContent = '🎟️ 贴纸 ' + stickerCount();
    var daily = dailyState(), goals = [daily.completed, daily.colors.length >= 3, daily.independent];
    el.dailyCount.textContent = goals.filter(Boolean).length + '/3';
    el.dailyGoals.innerHTML = [
      { text: '完成 1 张小画', done: goals[0] },
      { text: '试试 3 种颜色', done: goals[1] },
      { text: '自己完成一次', done: goals[2] }
    ].map(function (goal) {
      return '<div class="goal ' + (goal.done ? 'done' : '') + '"><span class="goal-check">' + (goal.done ? '✓' : '') + '</span><span>' + goal.text + '</span></div>';
    }).join('');

    el.levelCards.innerHTML = ['L1', 'L2', 'L3'].map(function (tier) {
      var info = TIER_INFO[tier], progress = tierProgress(tier);
      return '<button class="level-card" data-level="' + tier + '" type="button" aria-label="进入' + info.name + '">' +
        '<span class="level-badge">' + info.icon + ' ' + tier + '</span>' +
        '<div class="level-stars">' + renderStars(Math.min(3, Math.round(progress.stars / Math.max(1, progress.total)))) + '</div>' +
        '<h3>' + info.name + '</h3><p>适合 ' + (tier === 'L1' ? '3-4' : tier === 'L2' ? '4-5' : '5-6') + ' 岁 · ' + info.desc + '</p>' +
        '<div class="level-progress">' + progress.done + '/' + progress.total + ' 张完成 · ' + progress.stars + '⭐</div>' +
        '</button>';
    }).join('');
    el.levelCards.querySelectorAll('.level-card').forEach(function (card) {
      card.addEventListener('click', function () { openGame(nextIncompleteIndex(card.getAttribute('data-level'))); });
    });
  }

  function updateTotals() {
    var value = '⭐ ' + totalStars();
    el.homeStarTotal.textContent = value;
    el.starTotal.textContent = value;
    el.homeStickerTotal.textContent = '🎟️ 贴纸 ' + stickerCount();
    renderSoundToggle();
  }
  function showView(name) {
    el.homeView.hidden = name !== 'home';
    el.gameView.hidden = name !== 'game';
  }
  function openGame(index) {
    if (!LEVELS.length) return;
    state.levelIndex = Math.max(0, Math.min(index, LEVELS.length - 1));
    writeText(KEYS.lastLevel, state.levelIndex);
    showView('game');
    loadLevel(state.levelIndex);
  }
  function goHome() {
    window.KidsAudio.theme(null);
    hideOverlay(); closeAlbum(); renderHome(); showView('home');
    window.scrollTo(0, 0);
  }

  // ---------- 关卡渲染 ----------
  function loadLevel(index) {
    state.levelIndex = index;
    state.currentColor = null; state.filled = {}; state.regionIds = []; state.usedHint = false; state.finished = false; state.usedColors = {};
    state.inputLocked = true; state.traceDrawing = false; state.tracePath = null; state.traceLast = null; state.traceDistance = 0; state.traceStrokes = 0; state.traceColors = {};
    var lv = LEVELS[index], vb = lv.viewBox.split(' ').map(Number);
    window.KidsAudio.cancelVoice();
    window.KidsAudio.theme(lv.level);
    el.levelTitle.textContent = '第' + (index + 1) + '关 · ' + lv.title;
    el.levelAge.textContent = lv.level + ' · ' + lv.age;
    var tierLevels = groupedLevels(lv.level), tierPosition = tierLevels.indexOf(lv) + 1;
    el.levelProgress.textContent = tierPosition + '/' + tierLevels.length;
    updateTotals();
    el.stage.innerHTML = '<svg id="art" viewBox="' + lv.viewBox + '" preserveAspectRatio="xMidYMid meet" aria-label="' + lv.title + '"><rect x="0" y="0" width="' + vb[2] + '" height="' + vb[3] + '" fill="' + lv.bg + '"/>' + lv.art + '<g id="traceLayer" aria-label="我的线条"></g></svg>';
    var svg = el.stage.querySelector('svg');
    svg.querySelectorAll('.region').forEach(function (r) {
      r.setAttribute('fill', '#ffffff'); r.setAttribute('stroke', '#37474f'); r.setAttribute('stroke-width', '6'); r.setAttribute('stroke-linejoin', 'round');
      state.regionIds.push(r.getAttribute('data-id'));
      r.addEventListener('click', function () { onRegionTap(r); });
    });
    svg.querySelectorAll('.deco').forEach(function (d) { d.setAttribute('pointer-events', 'none'); });
    installTraceEvents(svg);
    renderPalette(lv);
    setPaintMode(state.paintMode, true);
    showIntroDemo(svg);
    showGuideIfNeeded();
  }
  function colorName(color) { return COLORS[String(color).toLowerCase()] || '彩色'; }
  function renderPalette(lv) {
    el.palette.innerHTML = '';
    var colors = MASTER_PALETTE.slice();
    (lv.palette || []).forEach(function (c) { if (colors.indexOf(c) < 0) colors.unshift(c); });
    colors.forEach(function (c) {
      var b = document.createElement('button'); b.className = 'swatch'; b.style.background = c; b.setAttribute('aria-label', colorName(c));
      b.addEventListener('click', function () { selectColor(c, b); }); el.palette.appendChild(b);
    });
    var first = el.palette.querySelector('.swatch');
    if (first) selectColor(colors[0], first, true);
  }
  function selectColor(c, btn, silent) {
    state.currentColor = c;
    el.palette.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('sel'); });
    if (btn) btn.classList.add('sel');
    el.selectedColor.textContent = '我选了' + colorName(c);
    if (el.selectedColorPreview) el.selectedColorPreview.style.background = c;
    if (!silent) { popSound(); trackColor(c); }
  }
  function trackColor(c) {
    state.usedColors[c] = true;
    var daily = dailyState(), colors = daily.colors.slice();
    if (colors.indexOf(c) < 0) colors.push(c);
    daily.colors = colors; saveDaily(daily);
  }

  // ---------- 交互 ----------
  function onRegionTap(r) {
    if (state.finished || state.inputLocked || state.paintMode !== 'fill') return;
    if (!state.currentColor) { toast('先选一个颜色吧'); return; }
    var id = r.getAttribute('data-id');
    r.setAttribute('fill', state.currentColor); state.filled[id] = state.currentColor; trackColor(state.currentColor); popSound();
    r.classList.remove('painted'); void r.offsetWidth; r.classList.add('painted');
    setTimeout(function () { r.classList.remove('painted'); }, 330);
    checkCompletion();
  }

  // ---------- 两种画法：点按填色 / 手指描线 ----------
  function setPaintMode(mode, silent) {
    state.paintMode = mode === 'trace' ? 'trace' : 'fill';
    var tracing = state.paintMode === 'trace';
    if (el.btnFillMode) {
      el.btnFillMode.classList.toggle('is-active', !tracing);
      el.btnFillMode.setAttribute('aria-pressed', tracing ? 'false' : 'true');
    }
    if (el.btnTraceMode) {
      el.btnTraceMode.classList.toggle('is-active', tracing);
      el.btnTraceMode.setAttribute('aria-pressed', tracing ? 'true' : 'false');
    }
    if (el.traceProgress) el.traceProgress.hidden = !tracing;
    if (el.btnDoneDrawing) el.btnDoneDrawing.hidden = !tracing;
    if (el.stage) el.stage.classList.toggle('trace-mode', tracing);
    var art = el.stage && el.stage.querySelector('#art');
    if (art) art.style.touchAction = tracing ? 'none' : 'manipulation';
    if (!silent) {
      toast(tracing ? '用手指沿着线条画，粗粗的线更容易画哦！' : '点选颜色，再点图形就能填色');
      popSound();
    }
    updateTraceProgress();
  }

  function svgPoint(svg, event) {
    var point = svg.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    var matrix = svg.getScreenCTM();
    return matrix ? point.matrixTransform(matrix.inverse()) : point;
  }

  function installTraceEvents(svg) {
    svg.addEventListener('pointerdown', function (event) {
      if (state.paintMode !== 'trace' || state.inputLocked || state.finished) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault();
      var point = svgPoint(svg, event), layer = svg.querySelector('#traceLayer');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'child-trace');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', state.currentColor || '#ef5350');
      path.setAttribute('stroke-width', '15');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('d', 'M ' + point.x.toFixed(1) + ' ' + point.y.toFixed(1));
      layer.appendChild(path);
      state.traceDrawing = true; state.tracePath = path; state.traceLast = point;
      state.traceColors[state.currentColor || '#ef5350'] = true;
      trackColor(state.currentColor || '#ef5350');
      try { svg.setPointerCapture(event.pointerId); } catch (e) {}
    });
    svg.addEventListener('pointermove', function (event) {
      if (!state.traceDrawing || !state.tracePath) return;
      event.preventDefault();
      var point = svgPoint(svg, event), last = state.traceLast;
      state.traceDistance += Math.hypot(point.x - last.x, point.y - last.y);
      state.tracePath.setAttribute('d', state.tracePath.getAttribute('d') + ' L ' + point.x.toFixed(1) + ' ' + point.y.toFixed(1));
      state.traceLast = point;
    });
    function endTrace() {
      if (!state.traceDrawing) return;
      state.traceDrawing = false; state.tracePath = null; state.traceLast = null; state.traceStrokes += 1;
      popSound(); updateTraceProgress();
    }
    svg.addEventListener('pointerup', endTrace);
    svg.addEventListener('pointercancel', endTrace);
  }

  function updateTraceProgress() {
    if (!el.traceProgress || !el.btnDoneDrawing) return;
    var ready = state.traceStrokes >= 3 && state.traceDistance >= 180;
    el.traceProgress.textContent = ready ? '线条有精神啦，可以完成作品！' : '已画 ' + state.traceStrokes + ' 笔 · 再沿着轮廓画一画';
    el.btnDoneDrawing.disabled = !ready;
  }

  function finishTraceDrawing() {
    if (state.traceStrokes < 3 || state.traceDistance < 180) {
      toast('再画几笔吧，让画面更丰富一点');
      return;
    }
    finish();
  }

  function showIntroDemo(svg) {
    var token = ++state.demoToken;
    var regions = Array.prototype.slice.call(svg.querySelectorAll('.region'));
    var badge = document.createElement('div');
    badge.className = 'intro-demo-badge';
    badge.innerHTML = '<strong>先看一遍怎么画</strong><span>4 秒后轮到你</span>';
    el.stage.appendChild(badge);
    el.stage.classList.add('intro-demo');
    var step = Math.max(45, Math.min(170, Math.floor(2600 / Math.max(1, regions.length))));
    regions.forEach(function (region, i) {
      setTimeout(function () {
        if (state.demoToken !== token) return;
        region.setAttribute('fill', region.getAttribute('data-hint') || '#eeeeee');
        region.classList.add('demo-painting');
        setTimeout(function () { region.classList.remove('demo-painting'); }, 260);
      }, 350 + i * step);
    });
    setTimeout(function () {
      if (state.demoToken !== token) return;
      regions.forEach(function (region) { region.setAttribute('fill', '#ffffff'); });
      if (badge.parentNode) badge.parentNode.removeChild(badge);
      el.stage.classList.remove('intro-demo');
      state.inputLocked = false;
      toast(state.paintMode === 'trace' ? '轮到你描线啦！' : '轮到你配颜色啦！');
    }, 4000);
  }

  function installHintHold() {
    var timer = null, active = false, pressed = false;
    function start(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.preventDefault(); active = false; pressed = true;
      timer = setTimeout(function () { active = true; showHintDemo(); }, 420);
    }
    function stop() {
      if (!pressed) return;
      pressed = false;
      if (timer) clearTimeout(timer);
      timer = null;
      if (active) hideHintDemo();
      else toast('要长按“示范”才能偷看正确颜色哦');
      active = false;
    }
    el.btnHint.addEventListener('pointerdown', start);
    el.btnHint.addEventListener('pointerup', stop);
    el.btnHint.addEventListener('pointercancel', stop);
    el.btnHint.addEventListener('pointerleave', function (event) { if (event.buttons) stop(); });
    el.btnHint.addEventListener('contextmenu', function (event) { event.preventDefault(); });
  }
  function clearAll() {
    var svg = el.stage.querySelector('svg'); if (!svg) return;
    svg.querySelectorAll('.region').forEach(function (r) { r.setAttribute('fill', '#ffffff'); });
    state.filled = {}; state.finished = false; state.usedHint = false; state.usedColors = {};
    state.traceDistance = 0; state.traceStrokes = 0; state.traceColors = {};
    var trace = svg.querySelector('#traceLayer'); if (trace) trace.innerHTML = '';
    updateTraceProgress();
    el.stage.classList.remove('celebrate'); tone(300, 0.12, 'sine', 0.12); toast('画布变干净啦，再试一次！');
  }
  function showHintDemo() {
    var svg = el.stage.querySelector('svg'); if (!svg) return;
    svg.querySelectorAll('.region').forEach(function (r) { r.setAttribute('fill', r.getAttribute('data-hint') || '#cccccc'); });
    state.usedHint = true; el.stage.classList.add('hint-peek');
    toast('正在看正确颜色，松开就回到你的作品'); tone(660, 0.15, 'sine', 0.12);
  }
  function hideHintDemo() {
    var svg = el.stage.querySelector('svg'); if (!svg) return;
    svg.querySelectorAll('.region').forEach(function (r) {
      var id = r.getAttribute('data-id');
      r.setAttribute('fill', state.filled[id] || '#ffffff');
    });
    el.stage.classList.remove('hint-peek');
  }
  function checkCompletion() {
    if (state.regionIds.every(function (id) { return !!state.filled[id]; })) finish();
  }

  // ---------- 鼓励式结算与持久化 ----------
  function finish() {
    if (state.finished) return;
    state.finished = true;
    var lv = LEVELS[state.levelIndex], distinct = {};
    Object.keys(state.filled).forEach(function (id) { distinct[state.filled[id]] = true; });
    Object.keys(state.traceColors || {}).forEach(function (color) { distinct[color] = true; });
    var colorCount = Object.keys(distinct).length, stars = 1;
    if (colorCount >= (lv.minColorsForStar2 || 3)) stars = 2;
    if (stars === 2 && !state.usedHint) stars = 3;
    var allRecords = records(), old = allRecords[lv.id] || {}, previous = old.bestStars || 0, added = Math.max(0, stars - previous);
    var stickerAwarded = awardSticker(lv);
    allRecords[lv.id] = { bestStars: Math.max(previous, stars), completedAt: new Date().toISOString(), attempts: (old.attempts || 0) + 1 };
    write(KEYS.records, allRecords);
    if (added) setTotalStars(totalStars() + added);
    var daily = dailyState(); daily.completed = true; if (!state.usedHint) daily.independent = true; saveDaily(daily);
    updateTotals(); renderHome();
    el.stage.classList.add('celebrate'); chime(); showOverlay(stars, previous, added, stickerAwarded); window.KidsAudio.reward(stars);
    if (!daily.celebrated && daily.completed && daily.colors.length >= 3 && daily.independent) {
      daily.celebrated = true; saveDaily(daily); setTimeout(function () { toast('今日小任务都完成啦！'); }, 900);
    }
  }
  function showOverlay(stars, previous, added, stickerAwarded) {
    var html = '';
    for (var i = 0; i < 3; i++) html += '<span class="star ' + (i < stars ? 'on' : '') + '" style="animation-delay:' + (i * 0.18) + 's">★</span>';
    el.overlayStars.innerHTML = html;
    el.overlayMsg.textContent = stars === 3 ? '太棒了！自己完成了！' : stars === 2 ? '真棒！颜色好丰富！' : '完成啦，真厉害！';
    el.overlayEarn.textContent = added ? (previous ? '这次得到更好的成绩，星星 + ' + added + '！' : '第一次完成，星星 + ' + added + '！') : '这幅画的最好成绩是 ' + Math.max(previous, stars) + ' 颗星，继续保持！';
    var sticker = lvSticker(LEVELS[state.levelIndex]);
    el.overlaySticker.innerHTML = stickerAwarded
      ? stickerArt(sticker, 'sticker-reward-icon') + '<span><strong>贴纸 +1</strong><br>' + sticker.name + ' · 相同贴纸可以合并</span>'
      : stickerArt(sticker, 'sticker-reward-icon') + '<span>这张贴纸已经收进画册啦<br><strong>' + sticker.name + '</strong></span>';
    el.btnNext.textContent = state.levelIndex + 1 < LEVELS.length ? '下一张' : '回到首页';
    renderConfetti(); el.overlay.classList.add('show'); el.overlay.setAttribute('aria-hidden', 'false');
  }
  function renderConfetti() {
    var colors = ['#ff7eaa', '#ffd45a', '#8065e8', '#75c99a', '#5ec8ed'];
    el.confetti.innerHTML = '';
    for (var i = 0; i < 22; i++) {
      var piece = document.createElement('i'); piece.style.left = (3 + Math.random() * 94) + '%'; piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = (Math.random() * .65) + 's'; piece.style.transform = 'rotate(' + Math.round(Math.random() * 90) + 'deg)'; el.confetti.appendChild(piece);
    }
  }
  function hideOverlay() { el.overlay.classList.remove('show'); el.overlay.setAttribute('aria-hidden', 'true'); }

  function lvSticker(level) {
    if (STICKERS.length) {
      var index = Math.max(0, LEVELS.indexOf(level));
      return STICKERS[index % STICKERS.length];
    }
    return level.sticker || { emoji: '🌟', name: '彩虹小贴纸' };
  }
  function stickerArt(sticker, cls) {
    if (sticker && sticker.asset) return '<img class="' + (cls || '') + '" src="' + sticker.asset + '" alt="" draggable="false" data-original-asset="ORIGINAL_ASSET"/>';
    return '<span class="' + (cls || '') + '" aria-hidden="true">' + ((sticker && sticker.emoji) || '🌟') + '</span>';
  }

  // ---------- 画册 ----------
  function openAlbum() {
    renderAlbum(); el.albumModal.classList.add('show'); el.albumModal.setAttribute('aria-hidden', 'false');
  }
  function closeAlbum() { el.albumModal.classList.remove('show'); el.albumModal.setAttribute('aria-hidden', 'true'); }
  function thumbnailArt(lv) {
    return lv.art.replace(/data-hint="([^"]+)"/g, function (_, color) { return 'data-hint="' + color + '" fill="' + color + '"'; });
  }
  function renderAlbum() {
    var done = LEVELS.filter(function (lv) { return records()[lv.id] && records()[lv.id].bestStars > 0; });
    el.albumCount.textContent = done.length + ' 张';
    if (!done.length) {
      el.albumGrid.innerHTML = '<div class="album-empty"><span class="empty-emoji">🖍️</span>还没有作品呢！<br>画好第一张，它就会住进画册。</div>';
    } else {
      el.albumGrid.innerHTML = done.map(function (lv) {
        var record = records()[lv.id];
        return '<button type="button" class="album-item" data-id="' + lv.id + '"><div class="album-thumb"><svg class="album-svg" viewBox="' + lv.viewBox + '" preserveAspectRatio="xMidYMid meet"><rect width="100%" height="100%" fill="' + lv.bg + '"/>' + thumbnailArt(lv) + '</svg></div><div class="album-meta"><span>' + lv.title + '</span><small>' + renderStars(record.bestStars, 'on') + '</small></div></button>';
      }).join('');
    }
    el.albumGrid.querySelectorAll('.album-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var index = LEVELS.findIndex(function (lv) { return lv.id === item.getAttribute('data-id'); });
        closeAlbum(); openGame(index);
      });
    });
    window.StickerLab.render();
  }

  // ---------- 互动乐园 v2：原创 SVG 换装 + 探索世界 ----------
  // ORIGINAL_ASSET: 所有角色/服装/场景图层均为项目内 SVG
  var playground = {
    outfit: null,
    actions: null,
    mode: 'action',
    drag: null,
    sceneClickBlockUntil: 0,
    animState: 'idle',
    animTimer: null,
    transitioning: false
  };

  function characterById(id) {
    return CHARACTERS.find(function (item) { return item.id === id; }) || CHARACTERS[0];
  }
  function sceneById(id) {
    return SCENES.find(function (item) { return item.id === id; }) || SCENES[0];
  }
  function outfitCatalog(charId) {
    return OUTFITS[charId] || [];
  }
  function outfitItemById(charId, itemId) {
    return outfitCatalog(charId).find(function (item) { return item.id === itemId; });
  }
  function zoneLabel(zoneId) {
    var z = ZONES.find(function (item) { return item.id === zoneId; });
    return z ? z.label : zoneId;
  }

  function playgroundOutfit() {
    var data = read(KEYS.playgroundOutfit, {}), characters = data && data.characters;
    if (!characters || typeof characters !== 'object' || Array.isArray(characters)) characters = {};
    CHARACTERS.forEach(function (character) {
      if (!characters[character.id] || typeof characters[character.id] !== 'object') characters[character.id] = {};
    });
    // 迁移旧 emoji 萌可存档键
    ['star', 'flower', 'sweet'].forEach(function (legacy) { delete characters[legacy]; });
    var currentCharacter = characterById(data && data.currentCharacter).id;
    return {
      characters: characters,
      currentCharacter: currentCharacter,
      completed: !!(data && data.completed),
      completedBy: (data && data.completedBy && typeof data.completedBy === 'object') ? data.completedBy : {}
    };
  }
  function currentOutfit() {
    var id = playground.outfit.currentCharacter;
    if (!playground.outfit.characters[id]) playground.outfit.characters[id] = {};
    return playground.outfit.characters[id];
  }
  function savePlaygroundOutfit() {
    playground.outfit.outfit = currentOutfit();
    write(KEYS.playgroundOutfit, playground.outfit);
  }

  function playgroundActions() {
    var data = read(KEYS.playgroundActions, {});
    var found = data && data.found && typeof data.found === 'object' ? data.found : {};
    var eggs = data && data.eggs && typeof data.eggs === 'object' ? data.eggs : {};
    var positions = data && data.positions && typeof data.positions === 'object' ? data.positions : {};
    var sceneId = (data && data.sceneId && sceneById(data.sceneId)) ? data.sceneId : (SCENES[0] && SCENES[0].id);
    return {
      found: found,
      eggs: eggs,
      positions: positions,
      sceneCompleted: data && data.sceneCompleted && typeof data.sceneCompleted === 'object' ? data.sceneCompleted : {},
      sceneId: sceneId,
      completed: !!(data && data.completed),
      pos: data && data.pos && typeof data.pos === 'object' ? data.pos : { x: 50, y: 78 }
    };
  }
  function savePlaygroundActions() { write(KEYS.playgroundActions, playground.actions); }

  function setPlaygroundFeedback(mode, text, kind) {
    var target = mode === 'outfit' ? el.outfitFeedback : el.actionFeedback;
    if (!target) return;
    target.textContent = text;
    target.className = 'playground-feedback' + (kind ? ' ' + kind : '');
  }
  function playgroundCelebrate(message) {
    var box = document.createElement('div');
    box.className = 'playground-celebration';
    box.textContent = message;
    el.playgroundModal.querySelector('.playground-card').appendChild(box);
    if (soundEnabled) { chime(); praise('太棒啦！'); }
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 2600);
  }

  // 安静书：衣服按身体部位 anchor + scale 真正"穿"到角色身上（图层定位，不靠文字）。
  // 衣服按"新角色"身体比例定位（覆盖 outfits.js 里偏高的旧 anchor，避免裙子盖脸）。
  var WEAR_ZONE_POS = {
    head: { anchor: { x: 0.5, y: 0.10 }, scale: 0.40 },
    hair: { anchor: { x: 0.70, y: 0.14 }, scale: 0.28 },
    body: { anchor: { x: 0.5, y: 0.62 }, scale: 0.52 },
    back: { anchor: { x: 0.5, y: 0.50 }, scale: 0.66 },
    cape: { anchor: { x: 0.5, y: 0.55 }, scale: 0.60 },
    neck: { anchor: { x: 0.5, y: 0.44 }, scale: 0.34 },
    feet: { anchor: { x: 0.5, y: 0.95 }, scale: 0.55 },
    hand: { anchor: { x: 0.82, y: 0.58 }, scale: 0.34 }
  };
  function layeredActorHtml(character, worn, stateName, compact) {
    var stateSrc = (character.states && character.states[stateName]) || character.states.idle || character.base;
    var layers = [{ z: 1, src: stateSrc, cls: 'layer-base', alt: character.name }];
    var items = [];
    Object.keys(worn || {}).forEach(function (zone) {
      var item = outfitItemById(character.id, worn[zone]);
      if (item) items.push(item);
    });
    items.sort(function (a, b) { return (a.z || 0) - (b.z || 0); });
    items.forEach(function (item) {
      var pos = WEAR_ZONE_POS[item.zone] || {};
      layers.push({
        z: item.zone === 'back' ? 0 : (item.z || 10),
        src: item.svg,
        cls: 'layer-wear zone-' + item.zone,
        alt: item.name,
        anchor: pos.anchor || item.anchor,
        scale: item.scale || pos.scale || 0.5
      });
    });
    var scaleNote = compact ? ' is-compact' : '';
    return '<div class="actor-frame character-' + character.id + scaleNote + '" style="--frame-w:' + character.frame.w + ';--frame-h:' + character.frame.h + '">' +
      layers.map(function (layer) {
        var style = 'z-index:' + layer.z + ';';
        if (layer.anchor) {
          style += 'left:' + (layer.anchor.x * 100) + '%;top:' + (layer.anchor.y * 100) + '%;';
          style += 'transform:translate(-50%,-50%);width:' + (layer.scale * 100) + '%;height:auto;';
        }
        return '<img class="actor-layer ' + layer.cls + '" src="' + layer.src + '" alt="" aria-hidden="true" draggable="false" style="' + style + '" data-original-asset="ORIGINAL_ASSET"/>';
      }).join('') + '</div>';
  }

  function renderCharacterPicker() {
    el.characterPicker.innerHTML = CHARACTERS.map(function (character) {
      var selected = character.id === playground.outfit.currentCharacter;
      var thumb = character.states.idle || character.base;
      return '<button type="button" class="character-card character-' + character.id + (selected ? ' is-selected' : '') + '" data-character-id="' + character.id + '" aria-pressed="' + selected + '">' +
        '<span class="picker-avatar" aria-hidden="true"><img src="' + thumb + '" alt="" draggable="false" data-original-asset="ORIGINAL_ASSET"/></span>' +
        '<strong>' + character.name + '</strong><small>' + character.note + '</small></button>';
    }).join('');
    el.characterPicker.querySelectorAll('.character-card').forEach(function (button) {
      button.addEventListener('click', function () { selectCharacter(button.getAttribute('data-character-id')); });
    });
  }

  function selectCharacter(id) {
    playground.outfit.currentCharacter = characterById(id).id;
    savePlaygroundOutfit();
    renderCharacterPicker();
    renderOutfit();
    setPlaygroundFeedback('outfit', '换好小伙伴啦！每位都有自己的衣橱。', 'success');
  }

  function renderOutfit() {
    var outfit = currentOutfit();
    var used = {};
    Object.keys(outfit).forEach(function (zone) { if (outfit[zone]) used[outfit[zone]] = true; });
    var character = characterById(playground.outfit.currentCharacter);
    var catalog = outfitCatalog(character.id);
    var zoneIds = [];
    catalog.forEach(function (item) {
      if (zoneIds.indexOf(item.zone) === -1) zoneIds.push(item.zone);
    });

    el.dressLayers.innerHTML = layeredActorHtml(character, outfit, 'idle', false);
    el.dressStage.setAttribute('aria-label', character.name);
    el.dressStage.className = 'dress-character character-' + character.id;
    el.dressStage.style.aspectRatio = character.frame.w + ' / ' + character.frame.h;
    el.dressStage.style.height = 'auto';

    el.wearSlots.innerHTML = zoneIds.map(function (zone) {
      var item = outfitItemById(character.id, outfit[zone]);
      var filled = !!item;
      return '<div class="wear-slot wear-' + zone + (filled ? ' is-filled' : '') + '" data-zone="' + zone + '">' +
        (filled
          ? '<img class="slot-art" src="' + item.svg + '" alt="" draggable="false" style="width:72%;height:auto;" data-original-asset="ORIGINAL_ASSET"/>'
          : '<span class="slot-hint" aria-hidden="true"></span>') +
        '</div>';
    }).join('');

    el.outfitItems.innerHTML = catalog.map(function (item) {
      return '<button type="button" class="drag-item princess-item ' + (used[item.id] ? 'is-used' : '') + '" data-outfit-id="' + item.id + '" aria-label="' + item.name + '">' +
        '<span class="drag-emoji" aria-hidden="true"><img src="' + item.svg + '" alt="" draggable="false" style="width:46px;height:auto;" data-original-asset="ORIGINAL_ASSET"/></span>' +
        '<small>' + item.name + '</small>' +
        '</button>';
    }).join('');

    var wornCount = Object.keys(outfit).filter(function (z) { return !!outfit[z]; }).length;
    el.outfitProgress.textContent = '已装扮 ' + wornCount + '/' + zoneIds.length;

    el.outfitItems.querySelectorAll('.drag-item').forEach(function (node) {
      node.addEventListener('pointerdown', function (event) {
        beginDrag(node, 'outfit', event, node.getAttribute('data-outfit-id'));
      });
      node.addEventListener('click', function () {
        if (!node._dragged) tryOnItem(node.getAttribute('data-outfit-id'));
      });
    });
  }

  function tryOnItem(id) {
    var character = characterById(playground.outfit.currentCharacter);
    var item = outfitItemById(character.id, id);
    if (!item) return;
    currentOutfit()[item.zone] = item.id;
    savePlaygroundOutfit();
    renderOutfit();
    setPlaygroundFeedback('outfit', item.praise || ('穿上了' + item.name + '！'), 'success');
    popSound();
    var zoneCount = {};
    outfitCatalog(character.id).forEach(function (it) { zoneCount[it.zone] = true; });
    var need = Object.keys(zoneCount).length;
    var worn = Object.keys(currentOutfit()).filter(function (z) { return !!currentOutfit()[z]; }).length;
    if (worn >= need && !playground.outfit.completedBy[character.id]) {
      playground.outfit.completedBy[character.id] = true;
      playground.outfit.completed = true;
      savePlaygroundOutfit();
      playgroundCelebrate('造型完成！去探索世界试试吧');
    }
  }

  function applyOutfitLook(kind) {
    var character = characterById(playground.outfit.currentCharacter);
    var catalog = outfitCatalog(character.id), byZone = {};
    catalog.forEach(function (item) { (byZone[item.zone] = byZone[item.zone] || []).push(item); });
    var preferred = ['crown', 'hairpin', 'pink-dress', 'blue-dress', 'dress', 'necklace', 'shoes', 'wand', 'wings', 'cape'];
    var next = {};
    Object.keys(byZone).forEach(function (zone) {
      var choices = byZone[zone], picked;
      if (kind === 'princess') {
        preferred.some(function (id) { picked = choices.find(function (item) { return item.id === id; }); return !!picked; });
      }
      if (!picked) picked = choices[Math.floor(Math.random() * choices.length)];
      if (picked) next[zone] = picked.id;
    });
    playground.outfit.characters[character.id] = next;
    savePlaygroundOutfit(); renderOutfit();
    setPlaygroundFeedback('outfit', kind === 'princess' ? '公主造型完成！皇冠和裙摆都闪起来啦！' : '惊喜造型搭好啦，带去探索世界看看吧！', 'success');
    actionSound('sparkle'); showActionParticlesAtDress();
  }

  function showActionParticlesAtDress() {
    var node = document.createElement('div');
    node.className = 'dress-sparkles'; node.textContent = '✦  ✧  ✦';
    el.dressStage.appendChild(node);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 1000);
  }

  function setActorState(stateName, duration) {
    playground.animState = stateName || 'idle';
    if (playground.animTimer) clearTimeout(playground.animTimer);
    renderActionActors();
    if (stateName && stateName !== 'idle') {
      playground.animTimer = setTimeout(function () {
        playground.animState = 'idle';
        renderActionActors();
      }, duration || 900);
    }
  }

  function renderActionActors() {
    var active = characterById(playground.outfit.currentCharacter);
    var buddy = CHARACTERS.find(function (c) { return c.id !== active.id; });
    var worn = playground.outfit.characters[active.id] || {};
    var state = playground.animState || 'idle';
    el.actionCharacter.innerHTML = layeredActorHtml(active, worn, state, true);
    el.actionCharacter.setAttribute('aria-label', active.name);
    if (buddy && el.actionBuddy) {
      var buddyWorn = playground.outfit.characters[buddy.id] || {};
      var buddyState = state === 'dance' ? 'happy' : (state === 'slip' ? 'surprised' : (state === 'swim' ? 'happy' : 'idle'));
      el.actionBuddy.innerHTML = layeredActorHtml(buddy, buddyWorn, buddyState, true);
      el.actionBuddy.setAttribute('aria-hidden', 'false');
      el.actionBuddy.classList.add('is-visible');
    }
  }

  function renderScenePicker() {
    if (!el.scenePicker) return;
    el.scenePicker.innerHTML = SCENES.map(function (scene) {
      var selected = scene.id === playground.actions.sceneId;
      return '<button type="button" class="scene-chip' + (selected ? ' is-selected' : '') + '" data-scene-id="' + scene.id + '">' + scene.name + '</button>';
    }).join('');
    el.scenePicker.querySelectorAll('.scene-chip').forEach(function (btn) {
      btn.addEventListener('click', function () { switchScene(btn.getAttribute('data-scene-id')); });
    });
  }

  function renderActionCharPicker() {
    if (!el.actionCharPicker) return;
    el.actionCharPicker.innerHTML = CHARACTERS.map(function (character) {
      var selected = character.id === playground.outfit.currentCharacter;
      return '<button type="button" class="action-char-chip' + (selected ? ' is-selected' : '') + '" data-character-id="' + character.id + '" aria-label="切换到' + character.name + '">' +
        '<img src="' + (character.states.idle || character.base) + '" alt="" draggable="false" data-original-asset="ORIGINAL_ASSET"/>' +
        '<span>' + character.name + '</span></button>';
    }).join('');
    el.actionCharPicker.querySelectorAll('.action-char-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        playground.outfit.currentCharacter = characterById(btn.getAttribute('data-character-id')).id;
        savePlaygroundOutfit();
        renderActionCharPicker();
        renderActionActors();
        setPlaygroundFeedback('action', '换成' + characterById(playground.outfit.currentCharacter).name + '出来玩啦！', 'success');
      });
    });
  }

  function currentSceneObjects() {
    var scene = sceneById(playground.actions.sceneId);
    return scene ? (scene.objects || []) : [];
  }
  function currentSceneEggs() {
    var scene = sceneById(playground.actions.sceneId);
    return scene ? (scene.eggs || []) : [];
  }

  function renderActions() {
    var state = playground.actions;
    var scene = sceneById(state.sceneId);
    if (el.sceneBg) {
      el.sceneBg.style.backgroundImage = scene && scene.svg ? 'url("' + scene.svg + '")' : '';
    }
    renderScenePicker();
    renderActionCharPicker();
    renderActionActors();

    var objects = currentSceneObjects();
    el.actionTargets.innerHTML = objects.map(function (target) {
      var key = scene.id + ':' + target.id;
      var found = !!state.found[key];
      return '<button type="button" class="action-target' + (found ? ' is-active' : '') + '" data-action-id="' + target.id + '" style="left:' + (target.x * 100) + '%;top:' + (target.y * 100) + '%" aria-label="' + target.name + '">' +
        '<img class="target-art" src="' + target.svg + '" alt="" draggable="false" data-original-asset="ORIGINAL_ASSET"/>' +
        '<strong>' + target.name + '</strong></button>';
    }).join('');

    el.actionEggs.innerHTML = currentSceneEggs().map(function (egg) {
      var key = scene.id + ':' + egg.id;
      var found = !!state.eggs[key];
      return '<button type="button" class="action-egg' + (found ? ' is-found' : '') + '" data-egg-id="' + egg.id + '" style="left:' + (egg.x * 100) + '%;top:' + (egg.y * 100) + '%" aria-label="惊喜' + egg.name + '">' +
        '<img src="' + egg.svg + '" alt="" draggable="false" data-original-asset="ORIGINAL_ASSET"/>' +
        '<small>' + (found ? '已发现' : '惊喜') + '</small></button>';
    }).join('');

    var foundCount = Object.keys(state.found).length;
    var worldTotal = SCENES.reduce(function (total, item) { return total + (item.objects || []).length; }, 0);
    el.actionProgress.textContent = '世界发现 ' + foundCount + '/' + worldTotal;
    if (el.actionMission) {
      var sceneFound = objects.filter(function (target) { return !!state.found[scene.id + ':' + target.id]; }).length;
      var eggFound = currentSceneEggs().filter(function (egg) { return !!state.eggs[scene.id + ':' + egg.id]; }).length;
      el.actionMission.innerHTML = '<strong>🎯 ' + scene.name + '小任务</strong><span>互动 ' + sceneFound + '/' + objects.length + ' · 彩蛋 ' + eggFound + '/' + currentSceneEggs().length + '</span>';
      el.actionMission.classList.toggle('is-complete', sceneFound === objects.length);
    }

    var pos = state.pos || { x: 50, y: 78 };
    moveCharacterTo(pos.x, pos.y);
    placeBuddy();
    el.actionCharacter.onpointerdown = actionPointerDown;
  }

  function placeBuddy() {
    if (!el.actionBuddy) return;
    var pos = playground.actions.pos || { x: 50, y: 78 };
    el.actionBuddy.style.left = Math.max(8, Math.min(92, pos.x - 12)) + '%';
    el.actionBuddy.style.top = Math.max(12, Math.min(90, pos.y + 4)) + '%';
  }

  function switchScene(sceneId) {
    var scene = sceneById(sceneId);
    if (!scene) return;
    var previousScene = playground.actions.sceneId;
    if (previousScene) playground.actions.positions[previousScene] = playground.actions.pos;
    playground.actions.sceneId = scene.id;
    playground.actions.pos = playground.actions.positions[scene.id] || { x: 50, y: 78 };
    playground.transitioning = false;
    savePlaygroundActions();
    renderActions();
    setPlaygroundFeedback('action', '来到' + scene.name + '啦！', 'success');
    actionSound('sparkle');
  }

  function setMode(mode) {
    playground.mode = mode;
    var outfit = mode === 'outfit';
    el.outfitMode.hidden = !outfit;
    el.actionMode.hidden = outfit;
    el.tabOutfit.classList.toggle('is-active', outfit);
    el.tabAction.classList.toggle('is-active', !outfit);
    el.tabOutfit.setAttribute('aria-selected', outfit ? 'true' : 'false');
    el.tabAction.setAttribute('aria-selected', outfit ? 'false' : 'true');
    el.playgroundModal.querySelector('.playground-card').classList.toggle('kitchen-active', !outfit);
    el.tabOutfit.textContent = outfit ? '安静书' : '👗';
    el.tabAction.textContent = outfit ? '小小厨房' : '🍳';
    el.tabOutfit.setAttribute('aria-label', '安静书换装');
    el.tabAction.setAttribute('aria-label', '小小厨房');
    if (!outfit) {
      window.KitchenWorld.open();
    } else {
      window.KitchenWorld.close();
      window.KidsAudio.theme(null);
    }
  }

  function openPlayground() {
    playground.outfit = playgroundOutfit();
    playground.actions = playgroundActions();
    playground.animState = 'idle';
    renderCharacterPicker();
    renderOutfit();
    renderActions();
    setMode(playground.mode);
    el.playgroundModal.classList.add('show');
    el.playgroundModal.setAttribute('aria-hidden', 'false');
  }
  function closePlayground() {
    window.KitchenWorld.close();
    window.KidsAudio.theme(el.gameView.hidden ? null : LEVELS[state.levelIndex].level);
    el.playgroundModal.classList.remove('show');
    el.playgroundModal.setAttribute('aria-hidden', 'true');
  }

  function zoneAt(x, y) {
    var found = null;
    el.wearSlots.querySelectorAll('.wear-slot').forEach(function (zone) {
      var r = zone.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) found = zone;
    });
    return found;
  }
  function targetAt(x, y) {
    var found = null;
    el.actionTargets.querySelectorAll('.action-target').forEach(function (target) {
      var r = target.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) found = target;
    });
    return found;
  }

  function beginDrag(node, kind, event, id) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    playground.drag = { node: node, kind: kind, id: id, startX: event.clientX, startY: event.clientY, zone: null, moved: false, triggered: {} };
    node.classList.add('is-dragging');
    try { node.setPointerCapture(event.pointerId); } catch (e) {}
    window.addEventListener('pointermove', dragMove, { passive: false });
    window.addEventListener('pointerup', dragEnd, { once: true });
    window.addEventListener('pointercancel', dragEnd, { once: true });
  }

  function actionPositionAt(clientX, clientY) {
    var board = el.actionScene.getBoundingClientRect();
    var x = Math.max(5, Math.min(95, ((clientX - board.left) / board.width) * 100));
    var y = Math.max(8, Math.min(92, ((clientY - board.top) / board.height) * 100));
    return { x: x, y: y };
  }

  function moveCharacterTo(x, y, callback) {
    el.actionCharacter.style.left = x + '%';
    el.actionCharacter.style.top = y + '%';
    el.actionCharacter.style.bottom = 'auto';
    playground.actions.pos = { x: x, y: y };
    playground.actions.positions[playground.actions.sceneId] = playground.actions.pos;
    placeBuddy();
    if (callback) setTimeout(callback, 310);
  }

  function triggerNearbyEggs(x, y) {
    var scene = sceneById(playground.actions.sceneId);
    currentSceneEggs().forEach(function (egg) {
      if (Math.hypot(egg.x * 100 - x, egg.y * 100 - y) < 10) triggerEgg(egg.id);
    });
  }

  function dragMove(event) {
    if (!playground.drag) return;
    event.preventDefault();
    var d = playground.drag;
    var dx = event.clientX - d.startX;
    var dy = event.clientY - d.startY;
    if (Math.hypot(dx, dy) > 8) d.moved = true;
    if (d.kind === 'outfit') {
      d.node.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)';
      el.wearSlots.querySelectorAll('.wear-slot').forEach(function (zone) { zone.classList.remove('is-over'); });
      var zone = zoneAt(event.clientX, event.clientY);
      if (zone) zone.classList.add('is-over');
      d.zone = zone;
    } else {
      setActorState('walk', 400);
      var pos = actionPositionAt(event.clientX, event.clientY);
      moveCharacterTo(pos.x, pos.y);
      triggerNearbyEggs(pos.x, pos.y);
      var target = targetAt(event.clientX, event.clientY);
      if (target) {
        var targetId = target.getAttribute('data-action-id');
        if (!d.triggered[targetId]) { d.triggered[targetId] = true; triggerAction(targetId); }
      }
    }
  }

  function dragEnd(event) {
    if (!playground.drag) return;
    window.removeEventListener('pointermove', dragMove);
    var d = playground.drag;
    playground.drag = null;
    d.node.classList.remove('is-dragging');
    d.node.style.transform = '';
    el.wearSlots.querySelectorAll('.wear-slot').forEach(function (zone) { zone.classList.remove('is-over'); });
    if (d.kind === 'outfit') {
      d.node._dragged = d.moved;
      var character = characterById(playground.outfit.currentCharacter);
      var item = outfitItemById(character.id, d.id);
      var zone = zoneAt(event.clientX, event.clientY) || d.zone;
      if (d.moved && zone && item && zone.getAttribute('data-zone') === item.zone) tryOnItem(item.id);
      else if (d.moved && zone) setPlaygroundFeedback('outfit', '这个卡位不是它的家，再试试发光的卡位吧！', 'gentle');
    } else {
      playground.sceneClickBlockUntil = Date.now() + 280;
      savePlaygroundActions();
      var pos = actionPositionAt(event.clientX, event.clientY);
      triggerNearbyEggs(pos.x, pos.y);
      var target = targetAt(event.clientX, event.clientY);
      if (target && !d.triggered[target.getAttribute('data-action-id')]) triggerAction(target.getAttribute('data-action-id'));
    }
  }

  function actionPointerDown(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    beginDrag(el.actionCharacter, 'action', event, 'action-character');
  }

  function awardPlaygroundSticker(name) {
    var data = collectedStickers();
    var id = 'pg-' + String(name || 'sticker');
    if (!data[id]) {
      data[id] = { collectedAt: new Date().toISOString(), name: name };
      write(KEYS.stickers, data);
      return true;
    }
    return false;
  }

  function triggerAction(id) {
    var scene = sceneById(playground.actions.sceneId);
    var target = currentSceneObjects().find(function (item) { return item.id === id; });
    if (!target) return;
    var key = scene.id + ':' + id;
    var first = !playground.actions.found[key];

    if (target.trigger === 'scene' && target.toScene) {
      if (playground.transitioning) return;
      playground.transitioning = true;
      setPlaygroundFeedback('action', target.feedback, 'success');
      actionSound(target.sound || 'sparkle');
      setActorState('surprised', 700);
      setTimeout(function () { switchScene(target.toScene); }, 450);
      playground.actions.found[key] = true;
      savePlaygroundActions();
      return;
    }

    if (first) {
      playground.actions.found[key] = true;
      savePlaygroundActions();
      var node = el.actionTargets.querySelector('[data-action-id="' + id + '"]');
      if (node) node.classList.add('is-active');
      el.actionProgress.textContent = '发现 ' + Object.keys(playground.actions.found).length + ' 个动作';
    }

    setPlaygroundFeedback('action', first ? target.feedback : (target.feedback + ' 再玩一次也可以！'), target.trigger === 'slip' ? 'gentle' : 'success');
    actionSound(target.sound || 'pop');
    el.actionCharacter.classList.remove('is-busy');
    void el.actionCharacter.offsetWidth;
    el.actionCharacter.classList.add('is-busy');
    setActorState(target.state || 'happy', target.trigger === 'slip' ? 1100 : 900);

    if (target.trigger === 'reward' && target.givesSticker && first) {
      if (awardPlaygroundSticker(target.givesSticker)) {
        playgroundCelebrate('得到贴纸：' + target.givesSticker);
      }
    }
    if (target.flee) {
      var node2 = el.actionTargets.querySelector('[data-action-id="' + id + '"]');
      if (node2) {
        node2.classList.add('is-fleeing');
        setTimeout(function () { node2.classList.remove('is-fleeing'); }, 900);
      }
    }
    if (target.trigger === 'action' && target.sound === 'piano') showActionParticles('♪ ♫');

    var sceneFoundCount = currentSceneObjects().filter(function (item) {
      return !!playground.actions.found[scene.id + ':' + item.id];
    }).length;
    if (sceneFoundCount >= currentSceneObjects().length && !playground.actions.sceneCompleted[scene.id]) {
      playground.actions.sceneCompleted[scene.id] = true;
      savePlaygroundActions();
      awardPlaygroundSticker(scene.name + '探索家');
      setTimeout(function () { playgroundCelebrate(scene.name + '探索完成！奖励一枚美食贴纸'); renderActions(); }, 350);
    } else if (el.actionMission) {
      renderActions();
    }

    var totalObjects = SCENES.reduce(function (n, s) { return n + (s.objects ? s.objects.length : 0); }, 0);
    if (Object.keys(playground.actions.found).length >= totalObjects && !playground.actions.completed) {
      playground.actions.completed = true;
      savePlaygroundActions();
      playgroundCelebrate('探索世界的惊喜都找到啦！');
    }
  }

  function showActionParticles(text) {
    var node = document.createElement('div');
    node.className = 'action-particles';
    node.textContent = text;
    el.actionScene.appendChild(node);
    setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 1100);
  }

  function triggerEgg(id) {
    var scene = sceneById(playground.actions.sceneId);
    var key = scene.id + ':' + id;
    if (playground.actions.eggs[key]) return;
    var egg = currentSceneEggs().find(function (item) { return item.id === id; });
    if (!egg) return;
    playground.actions.eggs[key] = true;
    savePlaygroundActions();
    var node = el.actionEggs.querySelector('[data-egg-id="' + id + '"]');
    if (node) {
      node.classList.add('is-found');
      var small = node.querySelector('small');
      if (small) small.textContent = '已发现';
    }
    setPlaygroundFeedback('action', egg.feedback, 'success');
    actionSound(egg.sound || 'sparkle');
    setActorState('happy', 800);
    el.actionCharacter.classList.remove('is-busy');
    void el.actionCharacter.offsetWidth;
    el.actionCharacter.classList.add('is-busy');
    renderActions();
  }

  var toastTimer = null;
  function toast(msg) {
    el.toast.textContent = msg; el.toast.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.classList.remove('show'); }, 1800);
  }
  function showGuideIfNeeded() {
    if (readText(KEYS.guide, '') === '1') { el.guideBubble.hidden = true; return; }
    el.guideBubble.hidden = false; writeText(KEYS.guide, '1');
    setTimeout(function () { if (el.guideBubble) el.guideBubble.hidden = true; }, 4800);
  }

  function init() {
    window.KidsAudio.enabled(soundEnabled);
    cacheDom(); renderSoundToggle(); renderHome(); showView('home');
    el.btnContinue.addEventListener('click', function () { openGame(resumeIndex()); });
    el.btnAlbum.addEventListener('click', openAlbum); el.btnCloseAlbum.addEventListener('click', closeAlbum);
    el.homeStickerTotal.addEventListener('click', openAlbum);
    el.btnHome.addEventListener('click', goHome); el.btnClear.addEventListener('click', clearAll); installHintHold();
    el.btnFillMode.addEventListener('click', function () { setPaintMode('fill'); });
    el.btnTraceMode.addEventListener('click', function () { setPaintMode('trace'); });
    el.btnDoneDrawing.addEventListener('click', finishTraceDrawing);
    el.btnSoundHome.addEventListener('click', toggleSound); el.btnSoundGame.addEventListener('click', toggleSound);
    el.btnPlayground.addEventListener('click', openPlayground); el.btnClosePlayground.addEventListener('click', closePlayground);
    el.tabOutfit.addEventListener('click', function () { setMode('outfit'); });
    el.tabAction.addEventListener('click', function () { setMode('action'); });
    el.btnResetOutfit.addEventListener('click', function () {
      playground.outfit.characters[playground.outfit.currentCharacter] = {};
      delete playground.outfit.completedBy[playground.outfit.currentCharacter];
      savePlaygroundOutfit();
      renderOutfit();
      setPlaygroundFeedback('outfit', '准备好啦，再搭一套新造型吧！', 'success');
    });
    if (el.btnPrincessLook) el.btnPrincessLook.addEventListener('click', function () { applyOutfitLook('princess'); });
    if (el.btnSurpriseLook) el.btnSurpriseLook.addEventListener('click', function () { applyOutfitLook('surprise'); });
    if (el.btnGoExplore) {
      el.btnGoExplore.addEventListener('click', function () {
        setMode('action');
        setPlaygroundFeedback('action', '带着新造型出发啦！点空地或拖动角色探索。', 'success');
      });
    }
    el.actionScene.addEventListener('click', function (event) {
      if (Date.now() < playground.sceneClickBlockUntil) return;
      var target = event.target.closest ? event.target.closest('.action-target') : null;
      var egg = event.target.closest ? event.target.closest('.action-egg') : null;
      if (target) {
        var action = currentSceneObjects().find(function (item) { return item.id === target.getAttribute('data-action-id'); });
        if (action) {
          setActorState('walk', 350);
          moveCharacterTo(action.x * 100, action.y * 100, function () {
            savePlaygroundActions();
            triggerAction(action.id);
          });
        }
        return;
      }
      if (egg) {
        var eggData = currentSceneEggs().find(function (item) { return item.id === egg.getAttribute('data-egg-id'); });
        if (eggData) {
          setActorState('walk', 350);
          moveCharacterTo(eggData.x * 100, eggData.y * 100, function () {
            savePlaygroundActions();
            triggerEgg(eggData.id);
          });
        }
        return;
      }
      var pos = actionPositionAt(event.clientX, event.clientY);
      setActorState('walk', 350);
      moveCharacterTo(pos.x, pos.y, function () {
        savePlaygroundActions();
        triggerNearbyEggs(pos.x, pos.y);
      });
    });
    el.btnReplay.addEventListener('click', function () { hideOverlay(); loadLevel(state.levelIndex); });
    el.btnNext.addEventListener('click', function () {
      hideOverlay(); if (state.levelIndex + 1 < LEVELS.length) openGame(state.levelIndex + 1); else goHome();
    });
    el.overlay.addEventListener('click', function (event) { if (event.target === el.overlay) hideOverlay(); });
    el.albumModal.addEventListener('click', function (event) { if (event.target === el.albumModal) closeAlbum(); });
    el.playgroundModal.addEventListener('click', function (event) { if (event.target === el.playgroundModal) closePlayground(); });
    document.addEventListener('pointerdown', function once() { audio(); document.removeEventListener('pointerdown', once); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  // 便于离线静态检查和手工验收，不暴露可变内部数据。
  window.KidsPaintApp = {
    openGame: openGame,
    goHome: goHome,
    renderHome: renderHome,
    openPlayground: openPlayground,
    characters: function () { return CHARACTERS; },
    scenes: function () { return SCENES; }
  };
})();
