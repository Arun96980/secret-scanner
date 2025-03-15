# Secret Scanner CLI

## 📌 Overview
Secret Scanner is a CLI tool that helps developers detect and prevent accidental exposure of sensitive information such as API keys, passwords, database URLs, and more before committing code.

## 🚀 Installation

You can install Secret Scanner globally using npm:

```sh
npm install -g secret-scanner-cli
```

## 🛠 Usage

To scan for secrets in your repository, run:

```sh
npm scan
```

If secrets are detected, the commit will be blocked, and details of the exposed secrets will be displayed.

## 🎯 Features
- Detects common secrets including:
  - API Keys (AWS, Google, Stripe, etc.)
  - Passwords and Database URLs
  - JSON Web Tokens (JWTs)
  - OAuth and Slack Tokens
  - SSH Private Keys
  - Credit Card Numbers
  - Basic Auth Credentials
- Integrates with Git hooks to prevent secret leaks
- Supports customization for additional secret patterns

## 🔧 Configuration

You can define custom patterns by modifying the `patterns` object in `index.js`. Example:

```js
const patterns = {
  customSecret: /my-custom-pattern/gi,
};
```

## 💡 Example Output
If secrets are detected, you'll see:

```sh
Secrets found in config.js:
- apiKey: 1234567890abcdef1234567890abcdef
- password: D1fficultP@ssw0rd

Secrets detected. Commit blocked.
```

## 🏗 Development

Clone the repository and install dependencies:

```sh
git clone https://github.com/Arun96980/secret-scanner-cli.git
cd secret-scanner-cli
npm install
```

To test the scanner:

```sh
node index.js
```

## 📜 License
MIT License

