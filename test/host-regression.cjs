'use strict';

var assert = require('node:assert/strict');
var fs = require('node:fs');
var path = require('node:path');
var vm = require('node:vm');

async function verifyHost(source) {
  var created = [];
  var directories = [];
  var existing;
  var warnings = [];
  var registry = {
    resolveByPath: async function (directory) { assert.equal(directory, path.join('/test-home', '.dsh', 'scratchpad')); return existing; },
    create: async function (directory) { created.push(directory); existing = { id: 'scratch' }; return existing; }
  };
  // Substitute only module imports; execute the actual exported host functions.
  var plugin = vm.runInNewContext(source.replace(/^import .*;\s*$/gm, '').replace(/^export /gm, '') + '\n;({ apply, inject })', {
    mkdirSync: function (directory, options) { assert.equal(options.recursive, true); directories.push(directory); },
    join: path.join, homedir: function () { return '/test-home'; },
    console: { warn: function () { warnings.push(Array.from(arguments).join(' ')); } }
  });
  assert.ok(plugin.inject.includes('workspaceRegistry'), 'Wait for the native workspace registry');
  var ctx = { workspaceRegistry: registry };
  await plugin.apply(ctx);
  await plugin.apply(ctx);
  assert.equal(created.length, 1, 'Register scratchpad once and reuse the existing workspace');
  assert.equal(directories.length, 2);
  existing = undefined;
  registry.create = async function () { throw new Error('registration denied'); };
  await plugin.apply(ctx);
  assert.ok(warnings.some(function (warning) { return warning.includes('registration denied'); }), 'Report host errors without blocking Harness startup');
  return { passed: true, checks: ['registry dependency', 'scratchpad registered idempotently', 'host failure is reported without blocking startup'] };
}

verifyHost(fs.readFileSync(process.argv[2] || path.join(__dirname, '..', 'index.js'), 'utf8')).then(function (result) {
  console.log(JSON.stringify(result, null, 2));
}).catch(function (error) {
  console.error('Standalone chat host regression failed: ' + error.stack);
  process.exitCode = 1;
});
