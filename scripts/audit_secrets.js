import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SUSPICIOUS_FILES = ['.env', 'config.js', 'credentials.json', 'secrets.json'];

function runCommand(command) {
    try {
        return execSync(command, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 10 }).trim();
    } catch (error) {
        return '';
    }
}

console.log('🔍 Starting Security Audit...');
console.log('--------------------------------------------------');

// 1. Check for suspicious files in current HEAD
console.log('\n📂 Checking current files...');
const currentFiles = runCommand('git ls-files').split('\n');
const suspiciousCurrent = currentFiles.filter(file =>
    SUSPICIOUS_FILES.some(pattern => file.endsWith(pattern))
);

if (suspiciousCurrent.length > 0) {
    console.log('⚠️  Found suspicious files in current HEAD:');
    suspiciousCurrent.forEach(file => console.log(`   - ${file}`));
} else {
    console.log('✅ No obvious secret files found in tracked files.');
}

// 2. Check history for deleted .env files
console.log('\n📜 Checking git history for deleted .env files...');
// This command lists all file paths ever committed
const allFileHistory = runCommand('git log --all --pretty=format: --name-only --diff-filter=A');
const uniqueFiles = [...new Set(allFileHistory.split('\n').filter(Boolean))];

const sensitiveHistoryFiles = uniqueFiles.filter(file =>
    file.toLowerCase().includes('.env') ||
    file.toLowerCase().includes('credential')
);

if (sensitiveHistoryFiles.length > 0) {
    console.log('⚠️  Found sensitive files in git history (may be deleted now):');
    sensitiveHistoryFiles.forEach(file => console.log(`   - ${file}`));
} else {
    console.log('✅ No .env or credential files found in git history filenames.');
}

console.log('\n--------------------------------------------------');
console.log('audit complete.');
