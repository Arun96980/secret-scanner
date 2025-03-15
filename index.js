const fs = require('fs');
const { execSync } = require('child_process');

// Define patterns for detecting secrets
const patterns = {
  // API Keys (e.g., Google, AWS, Stripe)
  apiKey: /(?:api[_-]?key|api|token|secret)[^a-zA-Z0-9]*[=:]\s*["']?[a-zA-Z0-9_-]{32,}["']?/gi,

  // Passwords (e.g., in connection strings or config files)
  password: /(?:password|pass|pwd)[^a-zA-Z0-9]*[=:]\s*["'].+["']/gi,

  // Database URLs (e.g., MongoDB, PostgreSQL, MySQL)
  dbUrl: /(?:postgres|postgresql|mysql|mongodb):\/\/[^:]+:[^@]+@/gi,

  // JSON Web Tokens (JWT)
  jwt: /eyJ[a-zA-Z0-9]{10,}\.[a-zA-Z0-9]{10,}\.[a-zA-Z0-9_-]{10,}/gi,

  // AWS Access Key IDs and Secret Access Keys
  awsAccessKeyId: /AKIA[0-9A-Z]{16}/gi,
  awsSecretAccessKey: /[0-9a-zA-Z/+]{40}/gi,

  // Stripe API Keys
  stripeApiKey: /sk_(live|test)_[0-9a-zA-Z-]{24,}/gi,

  // GitHub Personal Access Tokens
  githubToken: /ghp_[0-9a-zA-Z]{36}/,

  // Slack Tokens
  slackToken: /xox[baprs]-[0-9a-zA-Z-]{10,48}/,

  // Google API Keys
  googleApiKey: /AIza[0-9A-Za-z_-]{35}/,

  // SSH Private Keys
  sshPrivateKey: /-----BEGIN (RSA|DSA|EC|OPENSSH) PRIVATE KEY-----/,

  // Credit Card Numbers
  creditCard: /(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})/gi,

  // Email Addresses (often used in credentials)
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,

  // IP Addresses (e.g., in config files)
  ipAddress: /(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/,

  // Basic Auth Credentials (e.g., in URLs)
  basicAuth: /https?:\/\/[^:]+:[^@]+@/,

  // OAuth Tokens
  oauthToken: /[0-9a-fA-F]{32}-[0-9a-fA-F]{32}/,

  // Firebase API Keys
  firebaseApiKey: /AAAA[0-9A-Za-z_-]{7}:[0-9A-Za-z_-]{140}/,

  // Heroku API Keys
  herokuApiKey: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,

  // Twilio API Keys
  twilioApiKey: /SK[0-9a-fA-F]{32}/,

  // PayPal API Keys
  paypalApiKey: /access_token\$production\$[0-9a-z]{16}\$[0-9a-f]{32}/,

  // Azure Storage Account Keys
  azureStorageKey: /[a-zA-Z0-9+/]{88}=/,

  // Docker Registry Credentials
  dockerRegistryAuth: /"auth"\s*:\s*"[a-zA-Z0-9+/=]+"/,

  // Generic Secrets (e.g., "secret=...")
  genericSecret: /(?:secret|key|token)[^a-zA-Z0-9]{0,20}["'][0-9a-zA-Z]{16,}["']/,
};

// Function to scan a file for secrets
function scanFile(filePath, patterns) {
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
    console.error(`Warning: Could not read file ${filePath} (skipping): ${error.message}`);
    return [];
  }
}

// Function to scan all files in the repository
function scanRepository() {
  try {
    const files = execSync('git diff --cached --name-only').toString().split('\n');
    let foundSecrets = false;

    files.forEach((file) => {
      if (fs.existsSync(file)) {
        const secrets = scanFile(file, patterns);
        if (secrets.length > 0) {
          console.log(`Secrets found in ${file}:`);
          secrets.forEach((secret) => {
            console.log(`- ${secret.type}: ${secret.matches.join(', ')}`);
          });
          foundSecrets = true;
        }
      }
    });

    if (foundSecrets) {
      console.log('Secrets detected. Commit blocked.');
      process.exit(1); // Block the commit
    } else {
      console.log('No secrets detected. Commit allowed.');
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Export the scanRepository function
module.exports = { scanRepository };