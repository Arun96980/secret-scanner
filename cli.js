import { scanRepository, scanFolder } from './index.js';
import chalk from 'chalk';

// Get the folder path argument (if provided)
const folderPath = process.argv[2];

try {
  if (folderPath) {
    console.log(chalk.blue.bold(`Scanning folder: ${folderPath}`));
    scanFolder(folderPath);
  } else {
    console.log(chalk.blue.bold('Scanning Git repository...'));
    scanRepository();
  }
} catch (error) {
  console.error(chalk.red.bold('Error:'), error.message);
  process.exit(1);
}
