#!/usr/bin/env node

const { scanRepository } = require('./index');

// Run the secret scanner
try {
  scanRepository();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}