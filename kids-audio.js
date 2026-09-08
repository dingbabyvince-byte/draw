(function () {
  'use strict';
  var ctx, bus, timer, theme = null, step = 0, enabled = true, unlocked = false, duckUntil = 0;
  var rewardAudio = null;
  var rewardFiles = ['assets/audio/good-job.wav', 'assets/audio/amazing.wav', 'assets/audio/unbelievable.wav'];
  var tracks = {
    L1: { beat: 470, notes: [72,76,79,76,74,77,79,0,76,79,81,79,76,74,72,0], bass: [48,53,55,48] },
    L2: { beat: 420, notes: [67,72,76,79,76,72,74,0,69,74,77,81,79,77,74,0], bass: [48,50,53,55] },
    L3: { beat: 540, notes: [76,79,83,79,74,78,81,0,72,76,79,83,81,79,76,0], bass: [48,55,53,48] },
    kitchen: { beat: 390, notes: [72,0,76,79,81,79,76,0,74,77,79,0,76,74,72,0], bass: [48,53,55,48] }
  };
  function context() {
    if (!unlocked || !enabled || document.hidden) return null;
    try {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); bus = ctx.createGain(); bus.gain.value = .7; bus.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume().catch(function () {});
    } catch (e) { return null; }
    return ctx;
  }
  function note(midi, duration, volume, type) {
    var c = context(); if (!c || !midi) return;
    var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
    o.type = type || 'sine'; o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(volume, t + .025);
    g.gain.exponentialRampToValueAtTime(.0001, t + duration);
    o.connect(g); g.connect(bus); o.start(t); o.stop(t + duration + .03);
    o.onended = function () { o.disconnect(); g.disconnect(); };
  }
  function stop() { clearTimeout(timer); timer = null; }
  function tick() {
    stop(); if (!theme || !enabled || !unlocked || document.hidden) return;
    var t = tracks[theme] || tracks.L1, soft = Date.now() < duckUntil ? .2 : 1;
    note(t.notes[step % t.notes.length], .7, .045 * soft);
    if (step % 4 === 0) {
      var bass = t.bass[Math.floor(step / 4) % t.bass.length];
      note(bass, 1.4, .025 * soft); note(bass + 7, 1.2, .012 * soft, 'triangle');
    }
    step++; timer = setTimeout(tick, t.beat);
  }
  function setTheme(next) {
    if (theme === next && timer) return;
    theme = next; step = 0; stop(); tick();
  }
  function cancelVoice() {
    if (rewardAudio) { rewardAudio.pause(); rewardAudio = null; }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
  window.KidsAudio = {
    theme: setTheme,
    enabled: function (value) {
      enabled = value; stop();
      if (!enabled) { cancelVoice(); if (ctx) ctx.suspend().catch(function () {}); }
      else tick();
    },
    effect: function (kind) {
      if (!enabled) return;
      duckUntil = Date.now() + 800;
      var notes = kind === 'reward' ? [72,76,79,84] : kind === 'water' ? [88,83,91] : kind === 'cook' ? [60,67,72] : [79,84];
      notes.forEach(function (n, i) { setTimeout(function () { note(n, .22, .075); }, i * 90); });
    },
    reward: function (stars) {
      if (!enabled || document.hidden) return;
      duckUntil = Date.now() + 3800;
      var phrase = stars >= 3 ? 'Unbelievable!' : stars === 2 ? 'Amazing!' : 'Good job!';
      cancelVoice();
      function fallback() { try {
        if (!enabled || document.hidden) return;
        if (window.speechSynthesis && window.SpeechSynthesisUtterance) {
          var u = new SpeechSynthesisUtterance(phrase), voices = window.speechSynthesis.getVoices();
          u.lang = 'en-US'; u.voice = voices.find(function (v) { return /^en[-_]US/i.test(v.lang) && v.localService; }) || voices.find(function (v) { return /^en/i.test(v.lang); }) || null;
          u.rate = .86; u.pitch = 1.15; u.volume = .85; window.speechSynthesis.speak(u);
        }
      } catch (e) {} }
      try {
        var clip = new Audio(rewardFiles[Math.max(0, Math.min(2, stars - 1))]); rewardAudio = clip; clip.volume = .85;
        var playing = clip.play();
        if (playing) playing.catch(function () { if (rewardAudio === clip) fallback(); });
      } catch (e) { fallback(); }
      return phrase;
    },
    cancelVoice: cancelVoice
  };
  document.addEventListener('pointerdown', function () { if (!unlocked) { unlocked = true; tick(); } }, { once: true });
  document.addEventListener('keydown', function () { if (!unlocked) { unlocked = true; tick(); } });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { stop(); cancelVoice(); if (ctx) ctx.suspend().catch(function () {}); }
    else tick();
  });
  window.addEventListener('pagehide', function () { stop(); cancelVoice(); });
})();
