import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const androidDir = path.join(__dirname, 'android');

console.log('=== RUNNING GRADLE DIAGNOSTIC IN NODE ===');
const isWin = process.platform === 'win32';
const gradlewCmd = isWin ? 'gradlew.bat' : './gradlew';

try {
  if (!isWin) {
    execSync('chmod +x gradlew gradlew.bat', { cwd: androidDir });
  }
} catch (e) {}

try {
  const output = execSync(`${gradlewCmd} assembleDebug --no-daemon --stacktrace`, {
    cwd: androidDir,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('=== GRADLE BUILD SUCCEEDED ===');
  console.log(output);
} catch (error) {
  const out = (error.stderr || error.stdout || error.message || '').toString();
  // Find lines with FAILURE, ERROR, or Exception
  const keyLines = out
    .split('\n')
    .filter((l) => /FAILURE|ERROR|Exception|caused by|failed/i.test(l))
    .slice(0, 10)
    .join(' --- ');

  console.error('DIAGNOSTIC ERROR SUMMARY:', keyLines);
  throw new Error(`GRADLE_FAIL: ${keyLines || out.slice(-500)}`);
}
