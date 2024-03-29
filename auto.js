const puppeteer = require('puppeteer')
const makes = require('./makes.json')
const chevrolet = require('./makes/chevrolet.json')
const fs = require('fs')



async function scrapeData(year) {
  const makeId = makes[0].Id
    const modelArray = chevrolet[year]
  console.log(year)
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

  await page.locator('#pcCWYear').fill(year.toString())

  await page.locator('#pcCWMake').fill(makeId)

  const getModel = async () => {for (const model of modelArray){    
    const modelId = model.Id;
    await page.locator('#pcCWModel').fill(modelId)
    const response = await page.waitForResponse(async (response) => {
      return (await response.text()).includes('decals')
    })
    const rawData = await response.text();
    const truckObject = await makeTruckObject(rawData);
    await appendData(truckObject);
  }}

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

const scrape = async () => {
for (i = 2019; i<2023; i++){
  const year = i
  await scrapeData(year)
}
}

scrape()
  
