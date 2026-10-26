'use strict';

// Execute the real client against a minimal DOM with queued child-list mutations.
// Bound delivery count so a regression reports a failure instead of hanging Node.
function verifyStandaloneChat(clientSource) {
  var vm = require('vm');
  var assert = require('assert');
  var observer;
  var pendingMutation = false;
  var timers = [];
  var plugin;
  var callbackCount = 0;
  var projectTitle = '';
  var subscribers = [];

  function recordMutation(element) {
    var current = element;
    while (current && current !== document.body) current = current.parentNode;
    if (current && observer && observer.active) pendingMutation = true;
  }

  function element(tag) {
    var node = {
      tagName: tag,
      children: [],
      parentNode: undefined,
      className: '',
      dataset: {},
      attributes: {},
      textContent: '',
      classList: { add: function () {}, remove: function () {} },
      setAttribute: function (name, value) { this.attributes[name] = value; },
      getAttribute: function (name) { return this.attributes[name]; },
      removeAttribute: function (name) { delete this.attributes[name]; },
      appendChild: function (child) {
        child.parentNode = this;
        this.children.push(child);
        recordMutation(this);
        return child;
      },
      insertBefore: function (child, before) {
        child.parentNode = this;
        this.children.splice(Math.max(0, this.children.indexOf(before)), 0, child);
        recordMutation(this);
        return child;
      },
      querySelector: function (selector) {
        if (this === heroRow && selector.indexOf('button[') === 0) return nativeChip;
        if (selector === '.dsh-codex-tabs-row') {
          return this.children.filter(function (child) { return child.className === 'dsh-codex-tabs-row'; })[0];
        }
        return undefined;
      }
    };
    Object.defineProperty(node, 'innerHTML', {
      get: function () { return ''; },
      set: function () {
        var hadChildren = this.children.length > 0;
        this.children = [];
        if (hadChildren) recordMutation(this);
      }
    });
    return node;
  }

  var document = {
    body: element('body'),
    head: element('head'),
    createElement: element,
    querySelector: function (selector) {
      if (selector.indexOf('heroWorkspaceRow') !== -1) return heroRow;
      return undefined;
    }
  };
  var heroRow = element('div');
  var nativeChip = element('button');
  document.body.appendChild(heroRow);
  heroRow.appendChild(nativeChip);

  function store(snapshot) {
    return {
      getSnapshot: snapshot,
      subscribe: function (callback) { subscribers.push(callback); }
    };
  }

  function settle() {
    var turns = 0;
    while (pendingMutation && turns < 30) {
      pendingMutation = false;
      turns += 1;
      callbackCount += 1;
      observer.callback([]);
    }
    assert.strictEqual(pendingMutation, false, 'DOM observer did not settle after 30 deliveries; plugin keeps observing its own changes');
  }

  var sandbox = {
    window: {
      __ModuleLoader__: { load: function (module) {
        plugin = module.factory(function (name) {
          assert.strictEqual(name, 'react');
          return { createElement: function () {} };
        });
      } },
      addEventListener: function () {}
    },
    document: document,
    console: console,
    MutationObserver: function (callback) {
      this.callback = callback;
      this.active = false;
      this.observe = function () { this.active = true; };
      this.disconnect = function () { this.active = false; pendingMutation = false; };
      observer = this;
    },
    setTimeout: function (callback) { timers.push(callback); return timers.length; },
    clearTimeout: function () {}
  };
  vm.runInNewContext(clientSource, sandbox, { filename: 'standalone-chat/client.js', timeout: 1000 });
  plugin.apply({ get: function (name) {
    if (name === 'uiWorkspace') return {};
    if (name === 'sessions') return { list: store(function () {
      return { byId: { active: { id: 'active', retainedBy: { mainView: 1 } } } };
    }) };
    if (name === 'workspaces') return { list: store(function () {
      return { items: projectTitle ? [{ title: projectTitle, sessionIds: ['active'] }] : [] };
    }) };
    throw new Error('Unexpected dependency: ' + name);
  } });

  timers.shift()();
  settle();
  var tabContainer = heroRow.querySelector('.dsh-codex-tabs-row');
  assert.ok(tabContainer, 'Tabs must be created');
  assert.strictEqual(tabContainer.children.length, 2);
  var projectButton = tabContainer.children[0];
  pendingMutation = true;
  settle();
  assert.strictEqual(tabContainer.children[0], projectButton, 'Unchanged page mutations must preserve button identity and focus');

  projectTitle = '测试项目';
  subscribers.forEach(function (callback) { callback(); });
  while (timers.length) { timers.shift()(); settle(); }
  assert.strictEqual(tabContainer.children[0].children[1].textContent, '测试项目');
  assert.ok(tabContainer.children[0].className.indexOf('dsh-active') !== -1);

  tabContainer.children.pop();
  pendingMutation = true;
  settle();
  assert.strictEqual(tabContainer.children.length, 2, 'Removed controls must be repaired');
  assert.ok(observer.active, 'Observer must remain active for future external changes');

  return { passed: true, observerDeliveries: callbackCount, checks: ['observer settles', 'stable controls keep focus', 'workspace state changes', 'missing controls recover', 'observer stays active'] };
}

var fs = require('fs');
try {
  var clientPath = process.argv[2] || require('path').join(__dirname, '..', 'client.js');
  var verification = verifyStandaloneChat(fs.readFileSync(clientPath, 'utf8'));
  console.log(JSON.stringify(verification, null, 2));
} catch (error) {
  console.error('Standalone chat regression failed: ' + error.message);
  process.exitCode = 1;
}
