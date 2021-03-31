// Imports
import puppeteer from "puppeteer"
import ObjectsToCsv from 'objects-to-csv'
import csvParser from 'csvtojson'
import fs from 'fs'

// Constants
const BOOKED_SLOTS = "slots/slots.csv"
const TIMEOUT_MS = 3000
const CURRENT_TIME = new Date().toLocaleString().replaceAll("/", "_").replaceAll(", ", "_").replaceAll(":", "_").replaceAll(" ", "_")

const POOLS = {
    bellevue: 6,
    castex: 5
}
const CURRENT_POOL_NAME = process.argv[2]
const CURRENT_POOL_ID = POOLS[CURRENT_POOL_NAME]
const DEBUG_PATH = "./data/" + CURRENT_TIME + "_" + CURRENT_POOL_NAME + "/"

/**
 * Wrap actions 
 * @param {*} page 
 * @param {*} index 
 * @param {*} action 
 */
const wrapper = async (page, index, action) => {
    try {
        const frame = page.mainFrame();
        await action(frame)
        await page.screenshot({ path: DEBUG_PATH + index + "_screenshot.png" })
        const html = await page.evaluate(() => document.querySelector('*').outerHTML);
        fs.writeFileSync(DEBUG_PATH + index + "_page.html", html);
    } catch (error) {
        console.log(error)
    }

}

/**
 * Compare two arrays of objects on the date
 * 
 * @param {*} b 
 * @returns 
 */
const compare = (b) => {
    return function (a) {
        return b.filter(function (other) { return other.slotTime == a.slotTime }).length == 0;
    }
}

/**
 * Choose slot from available slots
 * The only condition is that we have not previously booked it
 * 
 * @param {*} availableSlots 
 * @returns 
 */
const chooseSlot = async (availableSlots) => {
    const bookedSlots = await csvParser().fromFile(BOOKED_SLOTS);
    console.log("booked Slots" + bookedSlots.map((slot => { return JSON.stringify(slot) })).join("\r\n"))
    var availableNotBookedSlots = availableSlots.filter(compare(bookedSlots));
    console.log("availableNotBookedSlots " + availableNotBookedSlots.map((slot => { return JSON.stringify(slot) })).join("\r\n"))
    if (availableNotBookedSlots && availableNotBookedSlots.length > 0) {
        return availableNotBookedSlots[0]
    } else {
        return null
    }

}

/**
 * Main function that does the work
 * 
 */
const bookPool = async () => {
    if(!CURRENT_POOL_ID){
        console.log(CURRENT_POOL_NAME + " pool does not exist ")
        return
    }
    console.log(CURRENT_POOL_NAME + " : " + CURRENT_TIME)
    // Create debug path because it does not exist
    fs.mkdirSync(DEBUG_PATH);
    
    // Start browser
    const browser = await puppeteer.launch({ headless: true, devtools: false, slowMo: 0, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let index = 0
    const start = new Date();

    // Go to web page
    await wrapper(page, index++, async _ => { await page.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/", { waitUntil: 'networkidle2' }); })
    
    // Select bellevue piscine
    await wrapper(page, index++, async (frame) => { await frame.select('select#form_f8', CURRENT_POOL_ID.toString()); })
    
    // Click on accept checkbox
    await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector("#form_f16"); await element.click(); })
    
    // Fill name, surname, email and phone
    await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector("#form_f1", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Soto") })
    await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector("#form_f2", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Jonathan") })
    await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector("#form_f21", { timeout: TIMEOUT_MS }); await element.click(); await element.type("jsotogaviard@gmail.com") })
    await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector("#form_f4", { timeout: TIMEOUT_MS }); await element.click(); await element.type("0678135845") })

    // Look for available slots
    const availableSlots = await page.$$eval('span[class=\"selectable\"]', options => options.map(option => ({
        slotTime: option.parentElement.firstChild.innerText.replace(/(\r\n|\n|\r)/gm, " ") + "@" + option.innerHTML,
        dataIdx: option.getAttribute("data-idx")
    })));
    console.log(CURRENT_POOL_NAME + ": # avalaible slots " + availableSlots.length)
    if (availableSlots && availableSlots.length > 0) {

        // Select first one and click on it
        console.log(CURRENT_POOL_NAME + ": Available slots list " + availableSlots.map((slot => { return JSON.stringify(slot) })).join("\r\n"))
        const chosenSlot = await chooseSlot(availableSlots)
        if (chosenSlot) {

            // Click on chosen slot
            console.log(CURRENT_POOL_NAME + ": Chosen slot " + JSON.stringify(chosenSlot))
            await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector('span[data-idx=\"' + chosenSlot.dataIdx + '\"]', { timeout: TIMEOUT_MS }); await element.click() })

            // Selectable class must change in selectable on class
            // Retrieve class and make sure the new class is selectable on
            const attr = await page.$$eval('span[data-idx=\"' + chosenSlot.dataIdx + '\"]', el => el.map(x => x.getAttribute("class")));
            console.log(CURRENT_POOL_NAME + ": Class of chosen slot after click " + JSON.stringify(attr))
            if (attr && attr.length > 0 && attr[0] == "selectable on") { 
               
                // We can proceed. Validate the form
                await wrapper(page, index++, async (frame) => { const element = await frame.waitForSelector('button[value=\"Valider\"]', { timeout: TIMEOUT_MS }); await element.click(); await page.waitForNavigation(); })

                // Make sure we receive confirmation from the server
                const body = await page.evaluate(() => { return document.body.innerText });
                fs.writeFileSync(DEBUG_PATH +  "confirmation.txt", body);
                if (body.includes("Le créneau est réservé")) {
                    console.log(CURRENT_POOL_NAME + ": Confirmed chosen slot " + JSON.stringify(chosenSlot))
                    let elapsed = new Date() - start; elapsed /= 1000; const seconds = Math.round(elapsed);
                    const bookedSlot = {
                        currentTime:CURRENT_TIME,
                        duration:seconds,
                        slotTime:chosenSlot.slotTime,
                        pool: CURRENT_POOL_NAME,
                        token:''
                    };
                    const csv = new ObjectsToCsv([bookedSlot])
                    await csv.toDisk(BOOKED_SLOTS, { append: true })
                    console.log(CURRENT_POOL_NAME + ": Confirmed chosen slot and written to csv file" + JSON.stringify(bookedSlot))
                } else {
                    console.log(CURRENT_POOL_NAME + ": Wrong confirmation page...")
                }
            }
        }
    }
    await browser.close()
    let elapsed = new Date() - start; elapsed /= 1000; const seconds = Math.round(elapsed);
    console.log(CURRENT_POOL_NAME + ": Duration " + seconds + " seconds");
}

bookPool()