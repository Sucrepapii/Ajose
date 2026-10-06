/* eslint-disable @typescript-eslint/no-require-imports */
const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      headless: true
    });
    
    const page = await browser.newPage();
    const htmlPath = 'file:///' + path.resolve('C:\\Users\\icmas\\OneDrive\\Documents\\ajocore\\Styled_Summary.html').replace(/\\/g, '/');
    
    await page.goto(htmlPath, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: 'C:\\Users\\icmas\\Downloads\\Ajose_Executive_Summary.pdf',
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();
    console.log('PDF generated successfully at C:\\Users\\icmas\\Downloads\\Ajose_Executive_Summary.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
})();
