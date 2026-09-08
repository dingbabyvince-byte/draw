(function () {
  'use strict';
  var KEY = 'kidsPaintStickerInventoryV1', memory = null, selected = null;
  var catalog = window.STICKERS || [];
  function blank() { return { version: 1, items: {}, migrated: {} }; }
  function save(data) { memory = data; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  function valid(id) { return catalog.some(function (s) { return s.id === id; }); }
  function addTo(data, id, rank) {
    if (!valid(id)) return;
    var key = id + ':' + rank;
    data.items[key] = (data.items[key] || 0) + 1;
  }
  function inventory() {
    var data = memory;
    if (!data) { try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) {} }
    if (!data || data.version !== 1 || !data.items || !data.migrated) data = blank();
    Object.keys(data.items).forEach(function (key) {
      var parts = key.split(':'), n = data.items[key];
      if (!valid(parts[0]) || !/^[1-3]$/.test(parts[1]) || !Number.isSafeInteger(n) || n < 1) delete data.items[key];
    });
    // Migrate each old unlock once, including rewards from the former world.
    var old = {}; try { old = JSON.parse(localStorage.getItem('kidsPaintCollectedStickers')) || {}; } catch (e) {}
    Object.keys(old).forEach(function (key) {
      if (data.migrated[key]) return;
      var index = (window.LEVELS || []).findIndex(function (lv) { return lv.id === key; });
      var legacy = old[key] || {};
      var sticker = index >= 0 ? catalog[index % catalog.length] : catalog.find(function (s) { return s.name === legacy.name || s.id === legacy.name; });
      if (!sticker && key.indexOf('pg-') === 0) sticker = catalog.find(function (s) { return s.id === 'chef-hat'; });
      if (sticker) addTo(data, sticker.id, 1);
      data.migrated[key] = true;
    });
    save(data); return data;
  }
  function art(sticker, rank) {
    return '<span class="lab-art rank-' + rank + '"><img src="' + sticker.asset + '" alt="" draggable="false">' + (rank > 1 ? '<i>' + (rank === 2 ? '✨' : '👑') + '</i>' : '') + '</span>';
  }
  function total() { var data = inventory(); return Object.keys(data.items).reduce(function (n, key) { return n + data.items[key]; }, 0); }
  function refreshTotals() {
    ['homeStickerTotal', 'stickerCount'].forEach(function (id) { var el = document.getElementById(id); if (el) el.textContent = (id === 'homeStickerTotal' ? '🎟️ 贴纸 ' : '') + total() + (id === 'stickerCount' ? ' 张' : ''); });
  }
  function render(highlight) {
    var grid = document.getElementById('stickerGrid'); if (!grid) return;
    var data = inventory(), keys = Object.keys(data.items).filter(function (k) { return data.items[k] > 0; });
    refreshTotals();
    grid.innerHTML = '<div class="lab-guide">相同贴纸 × 2 → 闪亮贴纸 ✨ → 皇冠贴纸 👑<small>点贴纸放进展示盘；点合并，消耗两张相同等级贴纸。</small></div><div class="lab-display" aria-label="贴纸展示盘"><span>🍽️</span></div>' +
      (keys.length ? keys.map(function (key) {
        var parts = key.split(':'), rank = +parts[1], sticker = catalog.find(function (s) { return s.id === parts[0]; }), count = data.items[key];
        return '<div class="lab-item' + (highlight === key ? ' just-merged' : '') + '"><button class="lab-preview" data-preview="' + key + '" aria-label="展示' + sticker.name + '">' + art(sticker, rank) + '<b>' + sticker.name + '</b><small>' + ['','普通','闪亮','皇冠'][rank] + ' × ' + count + '</small></button>' +
          (rank < 3 ? '<button class="lab-merge" data-merge="' + key + '" ' + (count < 2 ? 'disabled' : '') + ' aria-label="合并两张' + sticker.name + '">' + (count >= 2 ? '✨ 合并 × 2' : '再收集 1 张') + '</button>' : '<span class="lab-max">👑 最高级</span>') + '</div>';
      }).join('') : '<div class="sticker-empty">画完一关或做一道菜，收集第一张贴纸吧！</div>');
    grid.querySelectorAll('[data-merge]').forEach(function (button) {
      button.addEventListener('click', function () {
        var key = button.dataset.merge, next = merge(key);
        if (next) { window.KidsAudio.effect('reward'); render(next); preview(next); }
      });
    });
    grid.querySelectorAll('[data-preview]').forEach(function (button) { button.addEventListener('click', function () { preview(button.dataset.preview); window.KidsAudio.effect('pop'); }); });
    if (selected && data.items[selected]) preview(selected);
  }
  function preview(key) {
    var parts = key.split(':'), sticker = catalog.find(function (s) { return s.id === parts[0]; }), tray = document.querySelector('.lab-display');
    if (!sticker || !tray) return;
    selected = key; tray.innerHTML = art(sticker, +parts[1]);
  }
  function merge(key) {
    var data = inventory(), parts = key.split(':'), rank = +parts[1];
    if (!valid(parts[0]) || rank < 1 || rank >= 3 || !(data.items[key] >= 2)) return null;
    data.items[key] -= 2; if (!data.items[key]) delete data.items[key];
    addTo(data, parts[0], rank + 1); save(data); return parts[0] + ':' + (rank + 1);
  }
  window.StickerLab = {
    award: function (id, legacyKey) {
      var data = inventory(); addTo(data, id, 1);
      if (legacyKey) data.migrated[legacyKey] = true;
      save(data); refreshTotals();
    },
    count: total, render: render, merge: merge,
    snapshot: function () { return JSON.parse(JSON.stringify(inventory())); }
  };
})();
