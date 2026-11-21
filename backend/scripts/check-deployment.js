// Read-only checks. Never creates users, seeds data or updates the project board.
const fs = require('node:fs/promises');
const path = require('node:path');
async function main() {
  const base = process.argv[2];
  if (!base || !/^https:\/\//.test(base)) throw new Error('Usage: npm run check:deploy -- https://your-api-host');
  const results = [];
  for (const endpoint of ['/health', '/ready', '/api/jobs/categories', '/api/jobs']) {
    try {
      const response = await fetch(new URL(endpoint, base), { signal: AbortSignal.timeout(20000) });
      let data; try { data = await response.json(); } catch { data = null; }
      const shape = endpoint === '/health' ? data?.status === 'ok'
        : endpoint === '/ready' ? data?.status === 'ready' && data?.database === 'ok'
          : Array.isArray(data);
      results.push({ endpoint, status: response.status, passed: response.ok && shape });
    } catch { results.push({ endpoint, status: null, passed: false }); }
  }
  const report = { checkedAt: new Date().toISOString(), baseUrl: base, results };
  console.log(JSON.stringify(report, null, 2));
  if (process.argv[3]) await fs.writeFile(path.resolve(process.argv[3]), JSON.stringify(report, null, 2) + '\n');
  if (results.some(r => !r.passed)) process.exitCode = 1;
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
