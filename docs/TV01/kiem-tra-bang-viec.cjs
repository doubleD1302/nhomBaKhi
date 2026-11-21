// Read-only snapshot of the public project board. Does not save credentials or role codes.
const fs = require('node:fs/promises');
const path = require('node:path');
const vm = require('node:vm');
async function get(url, headers) {
  const response = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Read failed: HTTP ${response.status}`);
  return response.text();
}
async function main() {
  const base = 'https://doubled1302.github.io/nhomBaKhi/';
  const sandbox = { window: {} };
  vm.runInNewContext(await get(base + 'tasks-data.js'), sandbox, { timeout: 1000 });
  const data = sandbox.window.PROJECT_DATA;
  const cloudSource = await get(base + 'src/models/CloudSyncService.js');
  const url = cloudSource.match(/DEFAULT_PROJECT_URL\s*=\s*'([^']+)'/)[1];
  const publicKey = cloudSource.match(/DEFAULT_ANON_KEY\s*=\s*'([^']+)'/)[1];
  const records = JSON.parse(await get(url + '/rest/v1/bang_cong_viec?select=*', {
    apikey: publicKey, Authorization: 'Bearer ' + publicKey,
  }));
  const view = await get(base + 'src/views/UrgentTasksHubView.js');
  const currentWeek = Number(view.match(/this.currentWeek\s*=\s*(\d+)/)[1]);
  const tasks = data.tasks.filter(t => t.owner === 'TV01' && t.end <= currentWeek).map(t => {
    const record = records.find(r => r.task_id === t.id);
    return { id: t.id, name: t.name, week: t.end, plannedHours: t.hours,
      deadlineGroup: t.end < currentWeek ? 'overdue' : 'due', acceptance: t.done, dependencies: t.deps,
      remote: record ? { status: record.status, progressPercent: record.progress_percent,
        reportedActualHours: record.actual_hours, notes: record.notes,
        updatedAt: record.updated_at, updatedBy: record.updated_by } : null };
  });
  const snapshot = { assessmentDate: '2026-11-15', checkedAt: new Date().toISOString(),
    sourceUrl: base, memberMapping: 'TV001 -> TV01', currentWeek,
    weekBasis: 'Hardcoded default on public dashboard, not a verified academic calendar', tasks };
  await fs.writeFile(path.join(__dirname, 'bang-viec-online.json'), JSON.stringify(snapshot, null, 2) + '\n');
  console.log(JSON.stringify({ currentWeek, tasks: tasks.map(t => ({ id: t.id, group: t.deadlineGroup, status: t.remote?.status })) }));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
