import fs from 'fs';
import path from 'path';

const CYPRESS_OUTPUT_DIR = 'web/cypress';
const SCREENSHOTS_DIR = path.join(CYPRESS_OUTPUT_DIR, 'screenshots', 'tour.cy.ts');
const VIDEOS_DIR = path.join(CYPRESS_OUTPUT_DIR, 'videos');
const REPORT_FILE = 'e2e-tour-report.md';

async function generateReport() {
    console.log('Generating E2E Tour Report...');
    
    let report = '# E2E Game Tour Report\n\n';
    report += `Date: ${new Date().toLocaleString()}\n\n`;

    // Check if screenshots exist
    if (fs.existsSync(SCREENSHOTS_DIR)) {
        const screenshots = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png')).sort();
        report += '## Screenshots taken during the tour:\n\n';
        for (const screenshot of screenshots) {
            report += `### ${screenshot}\n`;
            report += `![${screenshot}](web/cypress/screenshots/tour.cy.ts/${screenshot})\n\n`;
        }
    } else {
        report += '## No screenshots found.\n\n';
    }

    // Capture logs/errors (this assumes we output cypress stdout to a file)
    const logFile = 'tour-output.log';
    if (fs.existsSync(logFile)) {
        const logs = fs.readFileSync(logFile, 'utf8');
        const errors = logs.split('\n').filter(line => line.toLowerCase().includes('error') || line.toLowerCase().includes('fail'));
        
        if (errors.length > 0) {
            report += '## Errors/Console Messages Detected:\n\n';
            report += '```\n' + errors.join('\n') + '\n```\n\n';
        } else {
            report += '## No errors detected in console output.\n\n';
            // User requested to delete the file if no issues
            console.log('No issues found. Deleting report as requested.');
            if (fs.existsSync(REPORT_FILE)) fs.unlinkSync(REPORT_FILE);
            return;
        }
    }

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Report generated: ${REPORT_FILE}`);
}

generateReport().catch(console.error);
