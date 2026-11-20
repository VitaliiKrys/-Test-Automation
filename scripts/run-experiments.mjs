import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const rows = [];
const modes = [
  { key: 'short', label: 'Пауза 1000 мс' },
  { key: 'auto', label: 'Твердження очікування' },
  { key: 'long', label: 'Пауза 5000 мс' },
];
const cli = process.platform === 'win32' ? 'npx.cmd' : 'npx';
mkdirSync('results', { recursive: true });

for (const mode of modes) {
  console.log(`\n==== ${mode.label}: 10 прогонів, Chromium ====\n`);
  const start = performance.now();
  const result = spawnSync(cli, [
    'playwright', 'test', '--config=playwright.experiment.config.ts',
    '--repeat-each=10', '--workers=1', '--reporter=json',
  ], { env: { ...process.env, PW_WAIT_MODE: mode.key }, encoding: 'utf8', maxBuffer: 20_000_000, shell: process.platform === 'win32' });
  const seconds = Math.round((performance.now() - start) / 10) / 100;
  let failed = null;
  let passed = null;
  let error = '';
  try {
    const report = JSON.parse(result.stdout);
    failed = report.stats?.unexpected ?? null;
    passed = report.stats?.expected ?? null;
  } catch {
    error = result.error?.message || result.stderr || 'Не вдалося прочитати звіт JSON';
  }
  rows.push({ mode: mode.key, description: mode.label, repeats: 10, failed, passed, total_seconds: seconds, error });
  console.log(`Невдалих: ${failed ?? 'н/в'} з 10; пройдено: ${passed ?? 'н/в'}; час: ${seconds} с`);
  if (error) console.error(error.slice(0, 700));
}

writeFileSync(join('results', 'experiment-results.json'), JSON.stringify(rows, null, 2) + '\n');
const csv = ['Режим,Невдалих прогонів із 10,Успішних прогонів із 10,Загальний час (с)',
  ...rows.map(row => `"${row.description}",${row.failed ?? ''},${row.passed ?? ''},${row.total_seconds}`)];
writeFileSync(join('results', 'experiment-results.csv'), '\ufeff' + csv.join('\n') + '\n');
console.log('\nТаблицю записано в results/experiment-results.csv та .json');
if (rows.some(row => row.failed === null)) process.exitCode = 1;
