const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');
const root = resolve(__dirname, '..');

function runtime(storage = {}) {
  const writes = [];
  const sandbox = {
    window: {}, URL, console,
    localStorage: {
      getItem: key => storage[key] || null,
      setItem: (key, value) => { writes.push(key); storage[key] = value; }
    }
  };
  vm.createContext(sandbox);
  for (const path of ['tasks-data.js', 'src/models/LecturerProgressModel.js', 'src/models/ProjectModel.js']) {
    vm.runInContext(readFileSync(resolve(root, path), 'utf8'), sandbox);
  }
  return { ...sandbox.window, writes, sandbox };
}

test('real plan retains all 64 task IDs and 16 assignments per member', () => {
  const { PROJECT_DATA: base, LecturerProgressModel: Model } = runtime();
  const model = new Model(base);
  assert.equal(new Set(base.tasks.map(t => t.id)).size, 64);
  assert.equal(model.summary().total, 64);
  for (const member of base.members) {
    assert.equal(model.summary(model.filter({ member: member.id })).total, 16);
  }
  assert.doesNotMatch(JSON.stringify(base), /SmartTro|phòng trọ|chủ trọ|nhận ca|chấm công|bảng lương|VietQR/i);
});

test('Cloud status drives project/member totals, identity and combined filters', () => {
  const { PROJECT_DATA: base, LecturerProgressModel: Model, writes } = runtime();
  const model = new Model(base);
  model.applySnapshot([
    { task_id: 'T001', status: 'done', actual_hours: 4, progress_percent: 100 },
    { task_id: 'T002', status: 'review', actual_hours: 2, progress_percent: 90 },
    { task_id: 'T003', status: 'in_progress', actual_hours: 3, progress_percent: 35 },
    { task_id: 'ROLE_TV01', status: 'claimed', notes: 'Người phụ trách mới', pr_link: '123', updated_by: 'PRIVATE-CODE' }
  ]);
  assert.equal(model.summary().done, 1);
  assert.equal(model.summary().review, 1);
  assert.equal(model.summary().in_progress, 1);
  assert.equal(model.summary().synced, 3);
  assert.equal(model.summary().percent, 2);
  const member = model.summary(model.filter({ member: 'TV01' }));
  assert.equal(member.done, 1);
  assert.equal(member.percent, 6);
  assert.equal(member.actual, 6);
  assert.equal(model.filter({ member: 'TV01', week: '8', status: 'review', keyword: 'T002' }).length, 1);
  assert.equal(model.identity(base.members[0]).name, 'Người phụ trách mới');
  assert.ok(!JSON.stringify(model.claims).includes('PRIVATE-CODE'));
  assert.equal(writes.length, 0);
});

test('successful empty pull removes stale Cloud values; invalid pull keeps prior snapshot', () => {
  const { PROJECT_DATA: base, LecturerProgressModel: Model } = runtime();
  const model = new Model(base);
  model.applySnapshot([{ task_id: 'T001', status: 'done', actual_hours: 4 }]);
  assert.throws(() => model.applySnapshot({ error: 'offline' }));
  assert.equal(model.summary().done, 1);
  model.applySnapshot([]);
  assert.equal(model.summary().synced, 0);
  assert.equal(model.summary().done, 0);
  assert.equal(model.tasks[0].actualHours, 0);
  assert.equal(new Model({ tasks: [], members: [] }).summary().percent, 0);
});

test('unsafe evidence and Cloud text cannot become active markup', () => {
  const { LecturerProgressModel: Model } = runtime();
  assert.equal(Model.evidenceUrl('javascript:alert(1)'), '');
  assert.equal(Model.evidenceUrl('data:text/html,<script>alert(1)</script>'), '');
  assert.equal(Model.evidenceUrl('https://github.com/org/repo/pull/1'), 'https://github.com/org/repo/pull/1');
  assert.equal(Model.escape('<img src=x onerror="bad()">'), '&lt;img src=x onerror=&quot;bad()&quot;&gt;');
});

test('old local state keeps recorded progress but gets current task definitions', () => {
  const { ProjectModel: project, PROJECT_DATA: base } = runtime({
    INT4211_DE25_STATE: JSON.stringify({ tasks: [{ id: 'T001', name: 'SmartTro phòng trọ', owner: 'TV04', status: 'done', progressPercent: 100, notes: 'Minh chứng thật', actualHours: 5 }], criteriaC1: [{ id: 'C1_05', name: 'Xóa ca', completed: true }] })
  });
  project.init();
  assert.equal(project.tasks.length, 64);
  assert.equal(project.tasks[0].name, base.tasks[0].name);
  assert.equal(project.tasks[0].owner, 'TV01');
  assert.equal(project.tasks[0].status, 'done');
  assert.equal(project.tasks[0].actualHours, 5);
  assert.equal(project.tasks[0].notes, 'Minh chứng thật');
  assert.equal(project.criteriaC1.find(c => c.id === 'C1_05').completed, true);
  assert.doesNotMatch(project.criteriaC1.find(c => c.id === 'C1_05').desc, /xóa ca/);
});

test('syncing zero actual hours never replaces them with planned hours', async () => {
  const { sandbox } = runtime();
  const payloads = [];
  sandbox.fetch = async (url, options) => {
    payloads.push(JSON.parse(options.body));
    return { ok: true };
  };
  vm.runInContext(readFileSync(resolve(root, 'src/models/CloudSyncService.js'), 'utf8'), sandbox);
  const cloud = sandbox.window.CloudSyncService;
  const task = { id: 'T001', hours: 4, actualHours: 0, status: 'todo' };
  await cloud.pushTask(task);
  await cloud.pushAllTasks([task]);
  assert.equal(payloads.length, 2);
  assert.equal(payloads[0][0].actual_hours, 0);
  assert.equal(payloads[1][0].actual_hours, 0);
});

test('lecturer refresh uses only GET, preserves the last snapshot on failure and recovers', async () => {
  const { sandbox, writes } = runtime();
  const nodes = Object.fromEntries(['lecturer-refresh', 'lecturer-sync-status', 'lecturer-sync-detail'].map(id => [id, {}]));
  const panel = { dataset: {} };
  const requests = [];
  let offline = true;
  sandbox.document = { getElementById: id => nodes[id], querySelector: () => panel };
  sandbox.AbortSignal = AbortSignal;
  sandbox.window.CloudSyncService = { url: 'https://example.test', isConfigured: () => true, getHeaders: () => ({}) };
  sandbox.fetch = async (url, options) => {
    requests.push({ url, method: options.method });
    if (offline) throw new Error('Mất kết nối');
    return { ok: true, json: async () => [{ task_id: 'T001', status: 'done', actual_hours: 4 }] };
  };
  const controllerSource = readFileSync(resolve(root, 'src/controllers/LecturerController.js'), 'utf8');
  vm.runInContext(controllerSource.replace('window.LecturerController.init();', ''), sandbox);
  const controller = sandbox.window.LecturerController;
  controller.model.applySnapshot([{ task_id: 'T002', status: 'review' }], new Date('2026-11-15T00:00:00Z'));
  controller.render = () => {};
  await controller.refresh();
  assert.equal(panel.dataset.state, 'error');
  assert.equal(controller.model.summary().review, 1);
  assert.match(nodes['lecturer-sync-detail'].textContent, /Đang giữ dữ liệu đã tải/);
  assert.equal(nodes['lecturer-refresh'].disabled, false);
  offline = false;
  await controller.refresh();
  assert.equal(panel.dataset.state, 'connected');
  assert.equal(controller.model.summary().done, 1);
  assert.ok(requests.every(request => request.method === 'GET' && !request.url.includes('updated_by')));
  assert.equal(writes.length, 0);
});
