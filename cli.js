#!/usr/bin/env node

const { scanRepository } = require('./index');

try {
  scanRepository();
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
