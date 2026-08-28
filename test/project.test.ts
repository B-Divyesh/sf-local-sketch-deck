import test from 'node:test';
import assert from 'node:assert/strict';
import { blankProject, exportHtml, sampleProject, validateProject } from '../src/project.ts';

test('blank projects are valid portable files', () => {
  const project = blankProject();
  assert.equal(validateProject(JSON.parse(JSON.stringify(project))), true);
  assert.equal(project.format, 'local-sketch-deck');
});
test('sample contains all five bounded action types', () => {
  const actions = new Set(sampleProject().cards.flatMap(c => c.elements.map(e => e.action?.type).filter(Boolean)));
  ['show', 'hide', 'changeText', 'playSound', 'goToCard'].forEach(action => assert.ok(actions.has(action as never)));
});
test('export is standalone and does not inject raw title markup', () => {
  const project = sampleProject(); project.name = '<script>alert(1)</script>';
  const html = exportHtml(project);
  assert.match(html, /local-sketch-deck/);
  assert.doesNotMatch(html, /<title><script>/);
  assert.match(html, /function act/);
});
