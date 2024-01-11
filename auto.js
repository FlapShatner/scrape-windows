const puppeteer = require('puppeteer');
const makes = require('./makes.json');
const chevrolet = require('./chevrolet.json');
const test = require('./test.json');
const fs = require('fs');

async function scrapeData(year, makeId, modelId) {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 40,
    });
    const page = await browser.newPage();
    await page.goto('https://www.signazon.com/car-window-decals/',  { waitUntil: 'networkidle0' }) 

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
   
    await page.waitForSelector('#buttonMobile-trigger', { visible: true });
    await page.click('#buttonMobile-trigger');

    await page.waitForSelector('[data-style="Cover"]', { visible: true });
    await page.click('[data-style="Cover"]');
    
    await page.waitForNetworkIdle()
    await page.click('#PCcwSelect[data-select="Make"]');

    await page.waitForSelector('#pcCWYear', { visible: true });
    await page.select('#pcCWYear', year);

   

    await page.waitForNetworkIdle()
    await page.select('#pcCWMake', makeId);
   
    
    await page.waitForNetworkIdle()
    // console.log(model)
    await page.select('#pcCWModel', modelId);
    await page.waitForFunction()
    const response = await page.waitForResponse(async response => {
        response.url().includes('decals')
        console.log(response.url())
        return (await response.text())
    });

    await page.waitForNetworkIdle()
    await browser.close();
    return response;

}

const year = "2022"
const makeId = makes[0].Id;

// const modelArray = test[2022];
// const model = test[2022][1];

function getSizes (modelArray) {
    modelArray.forEach((model) => {
        const modelId = model.Id;
        scrapeData(year, makeId, modelId).then(async (values) => {
            const data = await values.text();
            const trimmedData =JSON.parse(data.split('=')[1].trim());
            fs.appendFileSync('./data/data.json', trimmedData, (err) => {
                if (err) {
                    console.error('Error writing to file:', err);
                } else {
                    console.log('Data written to file successfully.');
                }
            });
        });
    })
}

getSizes(test[2022]);


