import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(__dirname, 'android');

console.log('=== RUNNING GRADLE DIAGNOSTIC IN NODE ===');
const isWin = process.platform === 'win32';
const gradlewCmd = isWin ? 'gradlew.bat' : './gradlew';

try {
  if (!isWin) {
    execSync('chmod +x gradlew gradlew.bat', { cwd: androidDir });
  }
} catch (e) {}

let logContent = '';
let buildSuccess = false;

try {
  const output = execSync(`${gradlewCmd} assembleDebug --no-daemon --stacktrace`, {
    cwd: androidDir,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('=== GRADLE BUILD SUCCEEDED ===');
  logContent = `BUILD SUCCESSFUL\n${output}`;
  buildSuccess = true;
} catch (error) {
  console.error('=== GRADLE BUILD FAILED ===');
  if (error.stdout) logContent += `STDOUT:\n${error.stdout}\n`;
  if (error.stderr) logContent += `STDERR:\n${error.stderr}\n`;
  logContent += `ERROR: ${error.message}\n`;
}

// Write to gradle-ci.log
const logPath = path.join(rootDir, 'gradle-ci.log');
fs.writeFileSync(logPath, logContent);

// Push to branch ci-logs
if (process.env.GITHUB_ACTIONS === 'true') {
  try {
    execSync('git config user.name "CI Bot"', { cwd: rootDir });
    execSync('git config user.email "ci-bot@dhanya.local"', { cwd: rootDir });
    execSync('git checkout -B ci-logs', { cwd: rootDir });
    execSync('git add gradle-ci.log', { cwd: rootDir });
    execSync('git commit -m "CI gradle build log [skip ci]"', { cwd: rootDir });
    execSync('git push origin ci-logs -f', { cwd: rootDir });
    console.log('Successfully pushed gradle-ci.log to branch ci-logs!');
  } catch (pushErr) {
    console.error('Failed to push ci-logs branch:', pushErr.message);
  }
}

if (!buildSuccess) {
  console.log('Proceeding despite diagnostic failure...');
}
