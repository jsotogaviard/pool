// Imports
import puppeteer from "puppeteer"
import ObjectsToCsv from 'objects-to-csv'
import csvParser from 'csvtojson'
import fs from 'fs'

// Constants
const TIMEOUT_MS = 3000
const POOLS = {
    bellevue: 6,
    castex: 5
}
const START_TIME = new Date();

/**
 * Prepare debug path fonction 
 * 
 * @param {*} poolName 
 * @returns 
 */
const prepareDebugPath = async (poolName) => {
    console.log(START_TIME.toLocaleString())
    const debugPath = "./data/" + START_TIME.toLocaleString().replaceAll("/", "_").replaceAll(", ", "_").replaceAll(":", "_").replaceAll(" ", "_") + "_" + new Date().getMilliseconds() + "_" + poolName + '/'
    fs.mkdirSync(debugPath);
    return debugPath
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

/**
 * Get free slots from url
 * 
 * @param {*} freeSlotsUrl 
 * @param {*} poolName 
 * 
 * Returns an object with three attributes : slotTime, dataIdx, pool
 */
const getFreeSlots = async (debugPath, freeSlotsUrl, poolName) => {
    // Make sur pool is knwon
    const poolId = POOLS[poolName]
    if (!poolId) {
        console.log(poolName + " not known. No work")
        return
    }

    // Start browser
    const browser = await puppeteer.launch({ headless: true, devtools: false, slowMo: 0, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let index = 0

    // Go to web page
    await wrapper(page, index++, debugPath, async _ => { await page.goto(freeSlotsUrl, { waitUntil: 'networkidle2' }); })

    // Select the pool
    await wrapper(page, index++, debugPath, async (frame) => { await frame.select('select#form_f8', poolId.toString()), await sleep(2500);})
   
    const freeSlots = await page.$$eval('span[class=\"selectable\"]', options => options.map(
        option => (
            {
                slotTime: option.parentElement.firstChild.innerText.replace(/(\r\n|\n|\r)/gm, " ") + "@" + option.innerHTML,
                dataIdx: option.getAttribute("data-idx"),
            }
        )
    ));
    freeSlots.forEach((freeSlot) => {
        freeSlot.pool = poolName
    })
    console.log("# of free slots " + freeSlots.length)
    if (freeSlots.length > 0) {
        console.log("Free slots : " + freeSlots.map((slot => { return JSON.stringify(slot) })).join("\r\n"))
    }
    browser.close()
    return freeSlots
}



/**
 * Booked slots path
 * 
 * @param {*} bookedSlotsPath 
 * @returns an object with the following fields :
 * bookingTime
 * duration
 * slotTime
 * pool
 */
const getBookedSlots = async (bookedSlotsPath) => {
    return await csvParser().fromFile(bookedSlotsPath);
}

/**
 * Chose first free not booked slot
 * 
 * @param {*} freeSlots contains slotTime pool dataIdx
 * @param {*} bookedSlots contains bookingTime duration slotTime pool
 * 
 * @returns an object with slotTime pool dataIdx
 */
const chooseSlot = async (freeSlots, bookedSlots) => {

    // No free slots... no work
    if (!freeSlots || freeSlots.length == 0) return

    // Remove booked slots from free slots
    const freeNotBookedSlots = freeSlots.filter(free => {

        // If free is among booked slots, tmp will have a size of one
        // If free is not among the booked slots, tmp will be 0
        const tmp = bookedSlots.filter(booked => {
            return (booked.slotTime == free.slotTime && booked.pool == free.pool)
        })
        return tmp.length == 0
    })
    // Chose the first one
    if (freeNotBookedSlots && freeNotBookedSlots.length > 0) {
        console.log(JSON.stringify(freeNotBookedSlots))
        return freeNotBookedSlots[0]
    } else {
        return
    }
}

/**
 * Confirm with the server the slot
 * 
 * @param {*} chosenSlot 
 * @returns 
 */
const confirmSlot = async (debugPath, freeSlotsUrl, chosenSlot) => {

    // No chosen slot..., no work
    if (!chosenSlot) return chosenSlot

    const browser = await puppeteer.launch({ headless: true, devtools: false, slowMo: 0, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let index = 0

    // Go to web page
    await wrapper(page, index++, debugPath, async _ => { await page.goto(freeSlotsUrl, { waitUntil: 'networkidle2' }); })

    // Select THE pool
    const poolId = POOLS[chosenSlot.pool]
    await wrapper(page, index++, debugPath, async (frame) => { await frame.select('select#form_f8', poolId.toString()); })

    // Click on accept checkbox
    await wrapper(page, index++, debugPath, async (frame) => { const element = await frame.waitForSelector("#form_f16"); await element.click(); })

    // Fill name, surname, email and phone
    await wrapper(page, index++, debugPath, async (frame) => { const element = await frame.waitForSelector("#form_f1", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Soto") })
    await wrapper(page, index++, debugPath, async (frame) => { const element = await frame.waitForSelector("#form_f2", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Jonathan") })
    await wrapper(page, index++, debugPath, async (frame) => { const element = await frame.waitForSelector("#form_f21", { timeout: TIMEOUT_MS }); await element.click(); await element.type("jsotogaviard@gmail.com") })
    await wrapper(page, index++, debugPath, async (frame) => { const element = await frame.waitForSelector("#form_f4", { timeout: TIMEOUT_MS }); await element.click(); await element.type("0678135845") })
    
    // Click on chosen slot
    const dataIdx = 'span[data-idx=\"' + chosenSlot.dataIdx + '\"]'
    console.log(dataIdx)
    await sleep(2500)
    page.$eval(dataIdx, elem => elem.click());
    /**await wrapper(page, index++, debugPath, async (frame) => { 
        const element = await frame.waitForSelector(dataIdx, { timeout: TIMEOUT_MS }); 
        page.hover(dataIdx);
        await sleep(2500)
        await element.click() 
    })*/

    // Selectable class must change in selectable on class
    // Retrieve class and make sure the new class is selectable on
    const classAttributeChosenSlot = await page.$$eval(dataIdx, el => el.map(x => x.getAttribute("class")));
    console.log("Class of chosen slot after click " + JSON.stringify(classAttributeChosenSlot))
    if (classAttributeChosenSlot && classAttributeChosenSlot.length > 0 && classAttributeChosenSlot[0] == "selectable on") {

        // We can proceed. Validate the form
        await wrapper(page, index++, debugPath, async (frame) => { const element = await frame.waitForSelector('button[value=\"Valider\"]', { timeout: TIMEOUT_MS }); await element.click(); await page.waitForNavigation(); })

        // Make sure we receive confirmation from the server
        const body = await page.evaluate(() => { return document.body.innerText });
        if (body.includes("Le créneau est réservé")) {
            return chosenSlot
        } else {
            console.log("Wrong confirmation page...")
        }
    }

    browser.close()
    // If we make it here, it means that confirmation was not received
    return
}

/**
 * Store it in database
 * 
 * @param {*} bookedSlotsPath 
 * @param {*} confirmedSlot 
 * @returns 
 */
const storeSlot = async (bookedSlotsPath, confirmedSlot) => {

    // No confirmed slot..., no work
    if (!confirmedSlot) return confirmedSlot

    const seconds = Math.round((new Date() - START_TIME) / 1000);
    const storedSlot = {
        currentTime: START_TIME,
        duration: seconds,
        slotTime: confirmedSlot.slotTime,
        pool: confirmedSlot.pool
    };
    const csv = new ObjectsToCsv([storedSlot])
    await csv.toDisk(bookedSlotsPath, { append: true })
    console.log("Stored slot " + JSON.stringify(storedSlot))
    return storedSlot
}

/**
 * Wrap actions puppeteer action
 * 
 * @param {*} page 
 * @param {*} index 
 * @param {*} action 
 */
const wrapper = async (page, index, debugPath, action) => {
    try {
        const frame = page.mainFrame();
        await action(frame)
        //await page.screenshot({ path: debugPath + index + "_screenshot.png" })
        //const html = await page.evaluate(() => document.querySelector('*').outerHTML);
        //fs.writeFileSync(debugPath + index + "_page.html", html);
    } catch (error) {
        console.log(error)
    }
}

/**
 * Main function 
 * 
 * @param {*} poolName 
 * @param {*} bookedSlotsPath 
 * @param {*} freeSlotsUrl 
 * @returns 
 */
const main = async (poolName, bookedSlotsPath, freeSlotsUrl, confirmSlotFunction = confirmSlot) => {

    // Prepare debug path
    const debugPath = await prepareDebugPath(poolName)

    // Retrieve free slots from url
    const freeSlots = await getFreeSlots(debugPath, freeSlotsUrl, poolName)

    // Retrieve booked slots from csv file path
    const bookedSlots = await getBookedSlots(bookedSlotsPath)

    // Find first slot that is available and not yet booked
    const chosenSlot = await chooseSlot(freeSlots, bookedSlots)

    // Confirm chosen slot with external server
    const confirmedSlot = await confirmSlotFunction(debugPath, freeSlotsUrl, chosenSlot)

    // Store in database if confirmed slot is confirmed
    const storedSlot = await storeSlot(bookedSlotsPath, confirmedSlot)

    return {
        freeSlots: freeSlots,
        bookedSlots: bookedSlots,
        chosenSlot: chosenSlot,
        confirmedSlot: confirmedSlot,
        storedSlot: storedSlot,
    }
}

export { main }