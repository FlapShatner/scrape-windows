const puppeteer = require('puppeteer')
const makes = require('./makes.json')
const chevrolet = require('./chevrolet.json')
const test = require('./test.json')
const fs = require('fs')



async function scrapeData(year) {
  const modelArray = chevrolet[year]
// const year = '2022'
const makeId = makes[0].Id
  const browser = await puppeteer.launch({
    // devtools: true,
    headless: false,
    // slowMo: 40,
  })
  const page = await browser.newPage()
  await page.goto('https://www.signazon.com/car-window-decals/', { waitUntil: 'networkidle0' })

  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))

  await page.locator('#buttonMobile-trigger').click()

  await page.locator('[data-style="Cover"]').click()

  await page.locator('#PCcwSelect[data-select="Make"]').click()

  await page.locator('#pcCWYear').fill(year)

  await page.locator('#pcCWMake').fill(makeId)

  // await page.waitForNetworkIdle()
  const getModel = async () => {for (const model of modelArray){
    const modelId = model.Id;
    await page.locator('#pcCWModel').fill(modelId)
    // await page.waitForNetworkIdle()
    const response = await page.waitForResponse(async (response) => {
      return (await response.text()).includes('decals')
    })
    // return response
    // console.log('response', await response.text())
    const rawData = await response.text();
    // const data = await rawData;
    const truckObject = await makeTruckObject(rawData);
    await appendData(truckObject);
  }}

  // await page.locator('#pcCWModel').fill(modelId)
  // // await page.evaluate(() => {
  // //   debugger;
  // // });

  // const response = await page.waitForResponse(async (response) => {
  //   return (await response.text()).includes('decals')
  // })

//   await page.waitForNetworkIdle()
// await page.evaluate(() => {
//   debugger;
// });
  // await browser.close()
  const response = await getModel()
  return response
}



function writeData(filePath, data) {
  fs.writeFile(filePath, data, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err)
      return
    }
  })
  console.log('Data written to file successfully.')
}

const makeTruckObject = async (data) => {
  const trimmedData = data.split('=')[1].trim()
  const adjustedData = `${trimmedData}"}}`
  const parsedData = await JSON.parse(adjustedData)
  console.log('parsedData', parsedData)
  const configData = parsedData.CartItem.ConfigurationData
  const windowSizes = configData.CarWindowSizeString
  const truckMake = configData.CarWindowMake
  const truckModel = configData.CarWindowModel
  const truckYear = configData.CarWindowYear
  return {
    truckMake,
    truckModel,
    truckYear,
    windowSizes,
  }
}

async function appendData(data) {
  const previousData = fs.readFileSync('./data/data.json', 'utf8')
  const tempObj = JSON.parse(previousData)
  tempObj.push(data)
  const json = JSON.stringify(tempObj)
  writeData('./data/data.json', json)
  return
}

// async function getSizes(modelArray) {
//     // for (const model of modelArray) {
//     //   const modelId = model.Id;
//     //   console.log('modelId', modelId);
//       try {
//         const rawData = await scrapeData(year, makeId,  modelArray);
//         // const data = await rawData.text();
//         // const truckObject = await makeTruckObject(data);
//         // console.log('truckObject', truckObject);
//         // await appendData(truckObject);
//       } catch (error) {
//         console.error('Error during scraping for modeelArray', error);
//       }
//     // }
//   }
  for (const year of  chevrolet) {
    scrapeData(year)
  }
// getSizes(chevrolet[2022])
