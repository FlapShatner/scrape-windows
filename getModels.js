const axios = require('axios');
const fs = require('fs');
const xml2js = require('xml2js');
const Ram = require('./data/Ram.json');
const years = Array.from({ length: 2023 - 2000 }, (v, k) => k + 2000);
const delay = 1000; // Delay in milliseconds (1 second)

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchModels(id, year) {
    const currentMake = Ram

    const {id:makeId, name} = id;
    const url = `https://www.signazon.com/designerservice/service.asmx/GetModels?ID=${makeId}&Year=${year}`;
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'

            }
        });
        // Parse the XML data
        // console.log(response.data)
    xml2js.parseString(response.data, (err, result) => {
    if (err) {
        throw err;
    }
    // Extracting the data
    const genericDataArray = result.ArrayOfGenericData.GenericData;
    const extractedData = genericDataArray.map(item => {
        return {
            year: year,
            name: name,
            make: makeId,
            id: item.Id[0],
            model: item.Data[0]
        };
    });

    // Convert JSON object to string
    const dataObject = {
        ...currentMake,
        [year]: extractedData
    }

    const dataJSON = JSON.stringify(dataObject, null, 4);

    fs.appendFileSync(`data/${name}.json`, dataJSON);
    console.log('Data saved to data.json');
});
        console.log(`Data for ID ${makeId}, Year ${year}:`, response.data);
    } catch (error) {
        console.error(`Error fetching data for ID ${makeId}, Year ${year}:`, error);
    }
}





async function processIdsAndYears() {
    const id = {
        name: 'Ram',
        id: 482,
    }        
        for (const year of years) {
            await fetchModels(id, year);
            await sleep(delay);
        }
}
processIdsAndYears();

