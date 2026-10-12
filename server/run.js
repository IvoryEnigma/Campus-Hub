import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('[AIT Campus Hub] Starting fullstack services...');

// 1. Start Express Server
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

// 2. Start Vite Dev Server
const viteProcess = spawn('npx', ['vite', '--host'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  console.log('\n[AIT Campus Hub] Shutting down services...');
  serverProcess.kill();
  viteProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
