const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
function load(context, name) { vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), context); }
function stickerEnv(seed = {}, brokenStorage = false) {
  const storage = new Map(Object.entries(seed));
  const c = vm.createContext({ window: {}, document: { getElementById: () => null }, localStorage: {
    getItem(k) { if (brokenStorage) throw Error('disabled'); return storage.get(k) || null; },
    setItem(k,v) { if (brokenStorage) throw Error('disabled'); storage.set(k,v); }
  } });
  load(c, 'assets/data/stickers.js'); load(c, 'levels.js'); load(c, 'sticker-lab.js');
  return { c, storage, lab: c.window.StickerLab };
}
test('legacy level and world stickers migrate once and survive reload', () => {
  const env = stickerEnv(); const level = env.c.window.LEVELS[0];
  env.storage.set('kidsPaintCollectedStickers', JSON.stringify({ [level.id]: {}, 'pg-pot': { name:'pot' }, 'pg-unknown': null }));
  assert.equal(env.lab.count(), 3); assert.equal(env.lab.count(), 3);
  assert.equal(env.lab.snapshot().items['cake:1'], 1);
  assert.equal(env.lab.snapshot().items['pot:1'], 1);
  const reloaded = stickerEnv(Object.fromEntries(env.storage)); assert.equal(reloaded.lab.count(), 3);
});
test('repeat level completion adds one sticker without legacy double counting', () => {
  const {lab, storage, c} = stickerEnv(); const key = c.window.LEVELS[0].id;
  lab.award('cake', key);
  storage.set('kidsPaintCollectedStickers', JSON.stringify({ [key]: {} }));
  assert.equal(lab.count(), 1); lab.award('cake', key); assert.equal(lab.count(), 2);
});
test('two identical ranks merge atomically; four basics make one crown', () => {
  const {lab, storage} = stickerEnv();
  for (let i = 0; i < 4; i++) lab.award('strawberry');
  assert.equal(lab.merge('strawberry:1'), 'strawberry:2');
  assert.equal(lab.count(), 3);
  assert.equal(lab.merge('strawberry:1'), 'strawberry:2');
  assert.equal(lab.merge('strawberry:2'), 'strawberry:3');
  assert.equal(lab.count(), 1); assert.equal(lab.snapshot().items['strawberry:3'], 1);
  assert.equal(lab.merge('strawberry:3'), null); assert.equal(lab.merge('strawberry:1'), null);
  const restored = stickerEnv(Object.fromEntries(storage)); assert.equal(restored.lab.count(), 1);
  assert.equal(restored.lab.snapshot().items['strawberry:1'], undefined);
});
test('different foods and ranks cannot be merged; double click cannot spend twice', () => {
  const {lab} = stickerEnv(); lab.award('milk'); lab.award('bread');
  assert.equal(lab.merge('milk:1'), null); lab.award('milk');
  assert.equal(lab.merge('milk:1'), 'milk:2'); assert.equal(lab.merge('milk:1'), null);
  assert.equal(lab.count(), 2); assert.equal(lab.merge('__proto__:1'), null);
});
test('inventory works when storage is disabled, rejects malformed counts', () => {
  const {lab} = stickerEnv({}, true); lab.award('corn'); lab.award('corn');
  assert.equal(lab.merge('corn:1'), 'corn:2'); assert.equal(lab.count(), 1);
  const bad = stickerEnv({kidsPaintStickerInventoryV1: JSON.stringify({version:1,items:{'corn:1':-1,'milk:2':'3','bread:9':2,'cake:1':2},migrated:{}})});
  assert.equal(bad.lab.count(), 2);
});
function audioEnv() {
  const events = {}, timers = new Map(), clips = [], oscillators = [], contexts = []; let next = 0;
  const parameter = () => ({value:0,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});
  class Context {
    constructor() { this.currentTime = 0; this.state = 'running'; contexts.push(this); }
    createGain() { return {gain:parameter(),connect(){},disconnect(){}}; }
    createOscillator() { const o = {frequency:parameter(),connect(){},disconnect(){},start(){},stop(){}}; oscillators.push(o); return o; }
    suspend() { this.state = 'suspended'; return Promise.resolve(); }
    resume() { this.state = 'running'; return Promise.resolve(); }
  }
  class Audio { constructor(src) { this.src = src; clips.push(this); } play() { return Promise.resolve(); } pause() { this.paused = true; } }
  const doc = { hidden: false, addEventListener(name, fn) { events[name] = fn; } };
  const c = vm.createContext({window:{AudioContext:Context, addEventListener(name,fn){events[name]=fn;}},document:doc,Audio,
    setTimeout(fn){timers.set(++next,fn);return next;}, clearTimeout(id){timers.delete(id);}});
  load(c,'kids-audio.js'); return {api:c.window.KidsAudio,events,timers,clips,oscillators,contexts,doc};
}
test('music waits for gesture and has distinct tier melodies', () => {
  const e = audioEnv(); e.api.theme('L1'); assert.equal(e.oscillators.length,0);
  e.events.pointerdown(); assert.equal(e.oscillators.length,3); assert.equal(e.timers.size,1);
  const first = e.oscillators[0].frequency.value;
  e.api.theme('L2'); assert.notEqual(e.oscillators[3].frequency.value,first); assert.equal(e.timers.size,1);
  e.api.theme('L3'); assert.notEqual(e.oscillators[6].frequency.value,first);
  e.api.theme(null); assert.equal(e.timers.size,0);
});
test('star score selects offline voice and changing level cancels it', () => {
  const e = audioEnv();
  for (const [stars,name] of [[1,'good-job'],[2,'amazing'],[3,'unbelievable']]) {
    e.api.reward(stars); assert.ok(e.clips.at(-1).src.endsWith(name+'.wav'));
  }
  assert.equal(e.clips[0].paused,true); e.api.cancelVoice(); assert.equal(e.clips.at(-1).paused,true);
});
test('mute and background stop music and speech; foreground resumes one loop', () => {
  const e = audioEnv(); e.events.pointerdown(); e.api.theme('kitchen'); e.api.reward(3);
  e.api.enabled(false); assert.equal(e.timers.size,0); assert.equal(e.clips[0].paused,true);
  e.api.reward(2); assert.equal(e.clips.length,1); e.api.enabled(true); assert.equal(e.timers.size,1);
  e.doc.hidden = true; e.events.visibilitychange(); assert.equal(e.timers.size,0);
  assert.equal(e.contexts[0].state,'suspended');
  e.doc.hidden = false; e.events.visibilitychange(); assert.equal(e.timers.size,1);
});
test('all reward WAV assets contain a RIFF/WAVE payload', () => {
  for (const name of ['good-job','amazing','unbelievable']) {
    const bytes = fs.readFileSync(path.join(root,'assets/audio',name+'.wav'));
    assert.equal(bytes.toString('ascii',0,4),'RIFF'); assert.equal(bytes.toString('ascii',8,12),'WAVE'); assert.ok(bytes.length > 1000);
  }
});
