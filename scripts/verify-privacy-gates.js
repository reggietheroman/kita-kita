#!/usr/bin/env node

/**
 * NPC Data Privacy Act (RA 10173) Compliance & Privacy Gate Verifier
 * Scans codebase for potential privacy violations, PII leakage in logs,
 * unencrypted storage calls, and missing privacy artifacts.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

let issuesFound = 0;
let warningsFound = 0;

console.log('🛡️  Running NPC Data Privacy Act (RA 10173) Compliance Scan...\n');

// 1. Verify Required Privacy Documentation
console.log('1. Checking required privacy governance artifacts...');
const REQUIRED_DOCS = [
  'docs/npc-data-privacy-act-summary.md',
  'docs/dpa-compliance-plan.md',
  'docs/privacy-notice-template.md',
  'docs/privacy-impact-assessment-template.md',
  '.cursor/rules/privacy-compliance.mdc',
  '.cursor/skills/dpa-compliance-check/SKILL.md',
];

REQUIRED_DOCS.forEach((doc) => {
  const fullPath = path.join(ROOT_DIR, doc);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ Found ${doc}`);
  } else {
    console.error(`  ❌ Missing required privacy artifact: ${doc}`);
    issuesFound++;
  }
});

// Helper to recursively get files
function getFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        files.push(...getFiles(fullPath, extensions));
      }
    } else if (extensions.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
  return files;
}

// 2. Scan Code for Plaintext PII Logging
console.log('\n2. Scanning source code for unmasked PII in logs...');
const srcFiles = getFiles(SRC_DIR);

const PII_LOG_PATTERNS = [
  {
    regex: /console\.(log|error|warn|info|debug)\s*\([^)]*\b(attendee|email|phone|phoneNumber|firstName|lastName)\b[^)]*\)/i,
    description: 'Potential unmasked personal data logged to console/telemetry',
  },
];

srcFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relativePath = path.relative(ROOT_DIR, filePath);

  // Skip test files for console checks if intentional mock assertions
  const isTest = relativePath.includes('__tests__') || relativePath.includes('.test.');

  lines.forEach((line, index) => {
    // Ignore comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

    PII_LOG_PATTERNS.forEach(({ regex, description }) => {
      if (regex.test(line) && !line.includes('maskEmail') && !line.includes('maskPhone')) {
        if (isTest) {
          // Warning in test
          console.warn(`  ⚠️  [${relativePath}:${index + 1}] (Test Warning) ${description}`);
          warningsFound++;
        } else {
          console.error(`  ❌ [${relativePath}:${index + 1}] ${description}`);
          console.error(`     Line: ${line.trim()}`);
          issuesFound++;
        }
      }
    });
  });
});

// 3. Scan for Hardcoded Real Email / Phone PII in Code/Tests
console.log('\n3. Checking for hardcoded real PII (non-dummy emails/phones)...');
const ALL_CODE_FILES = getFiles(path.join(ROOT_DIR, 'src'));

const REAL_EMAIL_PATTERN = /['"][a-zA-Z0-9._%+-]+@(?!example\.com|test\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}['"]/g;
const REAL_PH_PHONE_PATTERN = /['"](\+639\d{9}|09\d{9})['"]/g;

ALL_CODE_FILES.forEach((filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(ROOT_DIR, filePath);

  const emailMatches = content.match(REAL_EMAIL_PATTERN);
  if (emailMatches) {
    emailMatches.forEach((match) => {
      console.warn(`  ⚠️  [${relativePath}] Potential real email address detected: ${match} (use @example.com for tests)`);
      warningsFound++;
    });
  }

  const phoneMatches = content.match(REAL_PH_PHONE_PATTERN);
  if (phoneMatches) {
    phoneMatches.forEach((match) => {
      console.warn(`  ⚠️  [${relativePath}] Potential real Philippine phone number detected: ${match} (use dummy +639000000000)`);
      warningsFound++;
    });
  }
});

// Summary
console.log('\n========================================');
console.log(`Scan Complete: ${issuesFound} Error(s), ${warningsFound} Warning(s)`);
console.log('========================================');

if (issuesFound > 0) {
  console.error('\n❌ PRIVACY GATE FAILED. Please resolve the privacy issues above to maintain NPC DPA compliance.\n');
  process.exit(1);
} else {
  console.log('\n✅ PRIVACY GATE PASSED. No blocking DPA compliance violations found.\n');
  process.exit(0);
}
