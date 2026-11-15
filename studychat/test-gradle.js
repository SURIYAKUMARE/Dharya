import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const androidDir = path.join(__dirname, 'android');
const logFile = path.join(androidDir, 'gradle-build.log');

console.log('=== RUNNING GRADLE DIAGNOSTIC IN NODE ===');
try {
  const isWin = process.platform === 'win32';
  const gradlewCmd = isWin ? 'gradlew.bat' : './gradlew';

  try {
    if (!isWin) {
      execSync('chmod +x gradlew gradlew.bat', { cwd: androidDir });
    }
  } catch (e) {}

  const output = execSync(`${gradlewCmd} assembleDebug --no-daemon --stacktrace`, {
    cwd: androidDir,
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('=== GRADLE BUILD SUCCEEDED ===');
  fs.writeFileSync(logFile, output);
} catch (error) {
  console.error('=== GRADLE DIAGNOSTIC LOGGED ===');
  let logContent = '';
  if (error.stdout) {
    console.log('STDOUT:\n', error.stdout);
    logContent += `STDOUT:\n${error.stdout}\n`;
  }
  if (error.stderr) {
    console.error('STDERR:\n', error.stderr);
    logContent += `STDERR:\n${error.stderr}\n`;
  }
  logContent += `ERROR: ${error.message}\n`;
  try {
    fs.writeFileSync(logFile, logContent);
  } catch (e) {}
}
