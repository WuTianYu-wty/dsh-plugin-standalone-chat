'use strict';

// Run the shipped client with a small DOM/store harness. Real placement is also
// checked in the desktop app; these assertions protect its native anchor/ref.
var assert = require('node:assert/strict');
var fs = require('node:fs');
var vm = require('node:vm');
var path = require('node:path');

async function verifyClient(clientSource) {
  var observer;
  var pending = false;
  var timers = new Map();
  var nextTimer = 0;
  var effects = [];
  var subscribers = [];
  var listeners = new Map();
  var plugin;
  var opens = [];
  var finishOpen;
  var failOpen = false;
  var deliveries = 0;
  var activeWorkspace;
  var scratchpad = { workspaceId: 'scratch', path: 'C:\\Users\\test\\.dsh\\scratchpad', title: '随手聊', sessionIds: ['scratch-session'] };
  var project = { workspaceId: 'project', path: 'C:\\project', title: '测试项目', sessionIds: ['project-session'] };

  function recordMutation(node) {
    while (node && node !== document.body) node = node.parentNode;
    if (node && observer && observer.active) pending = true;
  }
  function matches(node, selector) {
    var tag = selector.match(/^\w+/);
    if (tag && node.tagName !== tag[0]) return false;
    var classMatch = selector.match(/^\.([\w-]+)/);
    if (classMatch && !node.classList.contains(classMatch[1])) return false;
    var attrs = Array.from(selector.matchAll(/\[([^\]=*]+)(\*?=)?["']?([^\]"']*)["']?\]/g));
    return attrs.every(function (attr) {
      var value = attr[1] === 'class' ? node.className : node.getAttribute(attr[1]);
      if (!attr[2]) return value !== null;
      if (attr[2] === '*=') return value !== null && value.indexOf(attr[3]) !== -1;
      return value === attr[3];
    });
  }
  function element(tag) {
    var node = {
      tagName: tag, children: [], parentNode: null, className: '', attributes: {},
      textContent: '', disabled: false,
      setAttribute: function (name, value) { this.attributes[name] = String(value); },
      getAttribute: function (name) { return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null; },
      removeAttribute: function (name) { delete this.attributes[name]; },
      appendChild: function (child) { return this.insertBefore(child, null); },
      insertBefore: function (child, before) {
        if (child.parentNode) child.remove();
        child.parentNode = this;
        var position = before ? this.children.indexOf(before) : this.children.length;
        this.children.splice(position, 0, child);
        recordMutation(this);
        return child;
      },
      remove: function () {
        if (!this.parentNode) return;
        var parent = this.parentNode;
        parent.children.splice(parent.children.indexOf(this), 1);
        this.parentNode = null;
        recordMutation(parent);
      },
      querySelectorAll: function (selector) {
        var found = [];
        this.children.forEach(function visit(child) {
          if (selector.split(',').some(function (part) { return matches(child, part.trim()); })) found.push(child);
          child.children.forEach(visit);
        });
        return found;
      },
      querySelector: function (selector) { return this.querySelectorAll(selector)[0] || null; },
      click: function () { if (!this.disabled && this.onclick) return this.onclick({ stopPropagation: function () {} }); },
      getBoundingClientRect: function () {
        return this.classList.contains('dsh-native-chip-hidden') ? { x: 0, y: 0, width: 0, height: 0 } : { x: 420, y: 350, width: 130, height: 30 };
      }
    };
    node.classList = {
      contains: function (name) { return node.className.split(/\s+/).includes(name); },
      add: function () { Array.from(arguments).forEach(function (name) { if (!node.classList.contains(name)) node.className = (node.className + ' ' + name).trim(); }); },
      remove: function () { var names = Array.from(arguments); node.className = node.className.split(/\s+/).filter(function (name) { return !names.includes(name); }).join(' '); },
      toggle: function (name, force) { var add = force === undefined ? !this.contains(name) : force; if (add) this.add(name); else this.remove(name); return add; }
    };
    Object.defineProperty(node, 'innerHTML', { get: function () { return ''; }, set: function () { if (this.children.length) recordMutation(this); this.children = []; } });
    Object.defineProperty(node, 'nextSibling', { get: function () { return this.parentNode && this.parentNode.children[this.parentNode.children.indexOf(this) + 1] || null; } });
    return node;
  }
  var document = {
    body: element('body'), head: element('head'), createElement: element,
    querySelector: function (selector) { return this.body.querySelector(selector) || this.head.querySelector(selector); },
    querySelectorAll: function (selector) { return this.body.querySelectorAll(selector).concat(this.head.querySelectorAll(selector)); }
  };
  var hero = element('div'); hero.className = 'native_heroWorkspaceRow';
  var nativeChip = element('button'); nativeChip.className = 'native_workspace';
  nativeChip.setAttribute('aria-haspopup', 'menu');
  nativeChip.setAttribute('aria-expanded', 'false');
  var label = element('span'); label.className = 'native_workspaceLabel'; label.textContent = '选择工作区';
  nativeChip.appendChild(label);
  var originalClick = function () { nativeChip.setAttribute('aria-expanded', 'true'); };
  nativeChip.onclick = originalClick;
  hero.appendChild(nativeChip); document.body.appendChild(hero);
  var editor = element('div'); editor.setAttribute('contenteditable', 'false'); document.body.appendChild(editor);
  function store(getSnapshot) {
    return { getSnapshot: getSnapshot, subscribe: function (callback) { subscribers.push(callback); return function () { subscribers.splice(subscribers.indexOf(callback), 1); }; } };
  }
  function settle() {
    var count = 0;
    while (pending && count++ < 30) { pending = false; deliveries++; observer.callback([]); }
    assert.equal(pending, false, 'Observer must settle instead of observing its own updates');
  }
  function flush() {
    var count = 0;
    while (timers.size && count++ < 30) { var batch = Array.from(timers.values()); timers.clear(); batch.forEach(function (callback) { callback(); settle(); }); }
    assert.equal(timers.size, 0, 'Timers must settle');
    settle();
  }
  function publish() { subscribers.slice().forEach(function (callback) { callback(); }); flush(); }
  var sandbox = {
    document: document, console: { error: function () {}, warn: function () {} },
    window: {
      __ModuleLoader__: { load: function (module) { plugin = module.factory(function () { return { createElement: function () {} }; }); } },
      addEventListener: function (name, callback) { listeners.set(name, callback); },
      removeEventListener: function (name, callback) { if (listeners.get(name) === callback) listeners.delete(name); }
    },
    MutationObserver: function (callback) { observer = this; this.callback = callback; this.active = false; this.observe = function () { this.active = true; }; this.disconnect = function () { this.active = false; pending = false; }; },
    setTimeout: function (callback) { timers.set(++nextTimer, callback); return nextTimer; },
    clearTimeout: function (id) { timers.delete(id); }
  };
  vm.runInNewContext(clientSource, sandbox, { timeout: 1000 });
  plugin.apply({
    effect: function (factory) { effects.push(factory()); },
    get: function (name) {
      if (name === 'uiWorkspace') return { openWorkspace: function (id) {
        opens.push(id);
        return new Promise(function (resolve, reject) { finishOpen = function () {
          if (failOpen) reject(new Error('连接失败'));
          else { activeWorkspace = id; publish(); resolve(); }
        }; });
      } };
      if (name === 'sessions') return { create: function () { throw new Error('Unbound sessions must not be created'); }, list: store(function () {
        var id = activeWorkspace ? activeWorkspace + '-session' : 'unbound';
        var byId = {}; byId[id] = { id: id, blank: true, retainedBy: { mainView: 1 } };
        return { byId: byId };
      }) };
      if (name === 'workspaces') return { list: store(function () { return { items: [scratchpad, project] }; }) };
      throw new Error('Unexpected service: ' + name);
    }
  });
  flush();
  assert.ok(nativeChip.getBoundingClientRect().width > 0, 'Native menu anchor must remain visible with nonzero bounds');
  assert.equal(nativeChip.parentNode, hero, 'React-owned native anchor must stay in its original parent');
  assert.equal(nativeChip.onclick, originalClick, 'Keep native menu click handling');
  assert.equal(hero.querySelectorAll('button').length, 2, 'Only add one sibling action, no proxy button');
  nativeChip.click();
  assert.equal(nativeChip.getAttribute('aria-expanded'), 'true', 'Keep native ARIA state');
  var button = hero.querySelector('.dsh-no-project');
  assert.ok(button, 'No-project action must exist');
  assert.equal(button.getAttribute('aria-pressed'), 'false', 'Unbound disabled sessions are not an active temporary workspace');
  assert.equal(editor.getAttribute('contenteditable'), 'false', 'Never override native composer disabled state');
  pending = true; settle();
  assert.equal(hero.querySelector('.dsh-no-project'), button, 'Unchanged DOM updates must preserve focus and node identity');
  activeWorkspace = 'project'; publish();
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  var request = button.click();
  button.click();
  assert.deepEqual(opens, ['scratch'], 'Rapid clicks must open exactly one real scratchpad workspace');
  assert.equal(button.disabled, true, 'Busy action must be disabled');
  finishOpen(); await request; flush();
  assert.equal(button.disabled, false);
  assert.equal(button.getAttribute('aria-pressed'), 'true', 'Selected state follows actual workspace membership, independent of its renamed title');
  activeWorkspace = 'project'; publish();
  failOpen = true;
  request = button.click(); finishOpen(); await request; flush();
  assert.equal(button.getAttribute('aria-pressed'), 'false', 'Failed switch must keep actual project state');
  assert.equal(button.disabled, false, 'Failure must allow retry');
  assert.ok(hero.querySelector('[role="alert"]').textContent.includes('连接失败'), 'Failure must be visible');
  button.remove(); settle();
  assert.ok(hero.querySelector('.dsh-no-project'), 'Removed plugin controls must recover');
  failOpen = false;
  var prevented = false;
  var stopped = false;
  listeners.get('keydown')({ ctrlKey: true, altKey: true, key: 'n', code: '',
    preventDefault: function () { prevented = true; },
    stopPropagation: function () { stopped = true; }
  });
  assert.ok(prevented && stopped, 'Shortcut must handle key-only events and stop conflicting host shortcuts');
  assert.equal(opens.length, 3, 'Shortcut must navigate to scratchpad');
  finishOpen(); await Promise.resolve(); flush();
  effects.forEach(function (cleanup) { if (typeof cleanup === 'function') cleanup(); });
  assert.equal(observer.active, false, 'Dispose must stop the observer');
  assert.equal(subscribers.length, 0, 'Dispose must unsubscribe stores');
  assert.equal(listeners.size, 0, 'Dispose must remove keyboard shortcut');
  assert.equal(hero.querySelectorAll('button').length, 1, 'Dispose removes only plugin-owned controls');
  assert.equal(nativeChip.onclick, originalClick);
  return { passed: true, observerDeliveries: deliveries, checks: ['native visible anchor and click/ARIA preserved', 'no proxy menu trigger', 'stable button identity', 'native composer state preserved', 'real scratchpad selection', 'rapid-click guard', 'visible retryable failures', 'removed button recovery', 'keyboard shortcut compatibility', 'lifecycle cleanup'] };
}

verifyClient(fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'client.js'), 'utf8')).then(function (result) {
  console.log(JSON.stringify(result, null, 2));
}).catch(function (error) {
  console.error('Standalone chat regression failed: ' + error.stack);
  process.exitCode = 1;
});
