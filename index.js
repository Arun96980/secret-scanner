import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { execSync } from 'child_process';

// Define patterns for detecting secrets
const patterns = {
  apiKey: /(?:api[_-]?key|api|token|secret)[^a-zA-Z0-9]*[=:]\s*["']?[a-zA-Z0-9_-]{32,}["']?/gi,
  password: /(?:password|pass|pwd)[^a-zA-Z0-9]*[=:]\s*["'].+["']/gi,
  dbUrl: /(?:postgres|postgresql|mysql|mongodb):\/\/[^:]+:[^@]+@/gi,
  jwt: /eyJ[a-zA-Z0-9]{10,}\.[a-zA-Z0-9]{10,}\.[a-zA-Z0-9_-]{10,}/gi,
  awsAccessKeyId: /AKIA[0-9A-Z]{16}/gi,
  awsSecretAccessKey: /[0-9a-zA-Z/+]{40}/gi,
  stripeApiKey: /sk_(live|test)_[0-9a-zA-Z-]{24,}/gi,
  githubToken: /ghp_[0-9a-zA-Z]{36}/,
  slackToken: /xox[baprs]-[0-9a-zA-Z-]{10,48}/,
  googleApiKey: /AIza[0-9A-Za-z_-]{35}/,
  sshPrivateKey: /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  ipAddress: /(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/,
  basicAuth: /https?:\/\/[^:]+:[^@]+@/,
  oauthToken: /[0-9a-fA-F]{32}-[0-9a-fA-F]{32}/,
  genericSecret: /(?:secret|key|token)[^a-zA-Z0-9]{0,20}["'][0-9a-zA-Z]{16,}["']/,
};

// Function to scan a file for secrets
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let foundSecrets = [];

    for (const [type, regex] of Object.entries(patterns)) {
      const matches = content.match(regex);
      if (matches) {
        foundSecrets.push({ type, matches });
      }
    }

    return foundSecrets;
  } catch (error) {
    console.error(chalk.yellow(`Warning: Could not read file ${filePath} (skipping): ${error.message}`));
    return [];
  }
}

// Function to recursively get all files in a folder
function getAllFiles(dirPath, fileList = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else {
      fileList.push(fullPath);
    }
  });

  return fileList;
}

// Function to scan a specific folder
function scanFolder(folderPath) {
  try {
    const files = getAllFiles(folderPath);
    let foundSecrets = false;

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const secrets = scanFile(file);
        if (secrets.length > 0) {
          console.log(chalk.red.bold(`Secrets found in ${file}:`));
          secrets.forEach((secret) => {
            console.log(chalk.yellow(`- ${secret.type}: ${secret.matches.join(', ')}`));
          });
          foundSecrets = true;
        }
      }
    });

    if (foundSecrets) {
      console.log(chalk.red.bold('Secrets detected. Scan failed.'));
      process.exit(1);
    } else {
      console.log(chalk.green('No secrets detected.'));
    }
  } catch (error) {
    console.error(chalk.red.bold(`Error: ${error.message}`));
    process.exit(1);
  }
}

// Function to scan all tracked files in the repository
function scanRepository() {
  try {
    const files = execSync('git ls-files').toString().trim().split('\n').filter(Boolean);
    let foundSecrets = false;

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const secrets = scanFile(file);
        if (secrets.length > 0) {
          console.log(chalk.red.bold(`Secrets found in ${file}:`));
          secrets.forEach((secret) => {
            console.log(chalk.yellow(`- ${secret.type}: ${secret.matches.join(', ')}`));
          });
          foundSecrets = true;
        }
      }
    });

    if (foundSecrets) {
      console.log(chalk.red.bold('Secrets detected. Commit blocked.'));
      process.exit(1);
    } else {
      console.log(chalk.green('No secrets detected. Commit allowed.'));
    }
  } catch (error) {
    console.error(chalk.red.bold(`Error scanning repository: ${error.message}`));
    process.exit(1);
  }
}

export { scanRepository, scanFolder };
