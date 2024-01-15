const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeData() { 
    const browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
    });

    const page = await browser.newPage();
    try {
        await page.goto('https://www.signazon.com/designerservice/service.asmx/GetModels?ID=66&Year=2022', { waitUntil: 'networkidle0' });
        
        // Extracting XML data from the page
        const xmlData = await page.evaluate(() => {
            return new XMLSerializer().serializeToString(document);
        });

        // Optionally, write data to a file or process it as needed
        fs.writeFileSync('data/models.xml', xmlData);

        console.log('Data scraped successfully');
    } catch (error) {
        console.error('Error occurred:', error);
    }

    await browser.close();
}

scrapeData();
