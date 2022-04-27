const xpath = require('xpath')
const dom = require('xmldom').DOMParser
const fs = require('fs');

const prefix = "/html/body/table/tbody/tr/td/table[2]/tbody/tr[2]/td/table/tbody/tr[2]/td/table[3]/tbody/"

function getPostal(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[2]/a`, element).firstChild.nodeValue
}

function getVillage(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[3]/a`, element).firstChild.nodeValue
}

function getRegionCode(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[4]/a`, element).firstChild.nodeValue
}

function getDistrict(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[5]/a`, element).firstChild.nodeValue
}

function getDT2(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[6]`, element).firstChild.nodeValue
}

function getCity(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[7]/a`, element).firstChild.nodeValue
}

function getProvince(element, row) {
    return xpath.select1(`${prefix}tr[${row+2}]/td[8]/a`, element).firstChild.nodeValue
}

async function getTotalNumberOfCities(browser) {
    let result = await browser.getText("/html/body/table/tbody/tr/td/table[2]/tbody/tr[2]/td/table/tbody/tr[2]/td/center/table/tbody/tr[2]/td/div/b/font")
    result = result.replaceAll(',', '')
    return parseInt(result)
}

async function scrapePage(source, fromRow, toRow) {
    await fs.writeFileSync(`./source_${fromRow}_${toRow}.html`, source)
    const element = new dom().parseFromString(source)
    const data = []
    for(let row = fromRow; row < toRow; row++) {
        data.push({
            postal: getPostal(element, row),
            village: getVillage(element, row),
            regionCode: getRegionCode(element, row),
            district: getDistrict(element, row),
            dt2: getDT2(element, row),
            city: getCity(element, row),
            getProvince: getProvince(element, row),
        })
    }

    return data;
}

module.exports = {
    scrape: async function (browser) {
        await browser.init().useXpath()
        const numberOfCities = await getTotalNumberOfCities(browser)
        console.log(`scraping ${numberOfCities} of cities`)
        const increment = 1000
        let cursor = 83001
        while(cursor < numberOfCities) {
            let to = cursor + increment - 1;
            if(to > numberOfCities) {
                to = numberOfCities
            }
            console.log(`scraping from ${cursor} to ${to}`)
            const source = await browser.source()
            await fs.writeFileSync(`./source_${cursor}_${to}.html`, source)
            const toRow = (numberOfCities - to > increment) ? increment : numberOfCities - cursor
            console.log(toRow)
            const data = await scrapePage(source, 1, toRow)
            await fs.writeFileSync(`./post_${cursor}_${to}.json`, JSON.stringify(data))
            console.log('finished')
            console.log(`moving to next page from ${cursor} to ${to}`)
            if(data.length < numberOfCities) {
                await browser.url(`https://www.nomor.net/_kodepos.php?_i=desa-kodepos&daerah=&jobs=&perhal=${increment}&urut=1&asc=000101&sby=000000&_en=ENGLISH&no1=${cursor}&no2=${to}`)
            }
            cursor += increment
            to = cursor + increment - 1;
        }
    }
};
