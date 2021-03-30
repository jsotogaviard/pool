import puppeteer from "puppeteer"
import ObjectsToCsv from 'objects-to-csv'
import csvParser from 'csvtojson'
import fs from 'fs'
const RESERVED_SLOTS = "reserved_slots.csv"
const TIMEOUT_MS = 3000
const DEBUG_PATH = "./data/" + new Date().toLocaleString().replaceAll("/", "_").replaceAll(", ", "_").replaceAll(":", "_") + "/" 

const wrapper = async (page, index, action) => {
    try {
        console.log(index)
        const frame = page.mainFrame();
        await action(frame)
        await page.screenshot({ path: DEBUG_PATH +  index + "_screenshot.png" })
        const html = await page.content();
        fs.writeFileSync(DEBUG_PATH + index + "_page.html", html);
    } catch (error) {
        console.log(error)
    }

}

const compare = (b) => {
    return function (a) {
        return b.filter(function (other) {
            return other.date == a.date
        }).length == 0;
    }
}

const chooseSlot = async (availableSlots) => {
    const reservedSlots = await csvParser().fromFile(RESERVED_SLOTS);
    var result = availableSlots.filter(compare(reservedSlots));
    if (result && result.length > 0) {
        return result[0]
    } else {
        return null
    }

}

const bookPool = async () => {

 
    if (!fs.existsSync(DEBUG_PATH)){
        fs.mkdirSync(DEBUG_PATH);
    }
    const browser = await puppeteer.launch({ headless: true, devtools: false, slowMo: 0, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    let index = 0
    const start = new Date();
    // Go to web page
    await wrapper(page, index++, async _ => { await page.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/", { waitUntil: 'networkidle2' }); })
    // Select bellevue piscine
    await wrapper(page, index++, async (frame) => { await frame.select('select#form_f8', '6'); })
    // click on accept checkbox
    await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector("#form_f16");await element.click();})
    // Fill name, surname, email and phone
    await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector("#form_f1", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Soto") })
    await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector("#form_f2", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Jonathan") })
    await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector("#form_f21", { timeout: TIMEOUT_MS }); await element.click(); await element.type("jsotogaviard@gmail.com") })
    await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector("#form_f4", { timeout: TIMEOUT_MS }); await element.click(); await element.type("0678135845") })
    
    // Look for available slots
    const availableSlots = await page.$$eval('span[class=\"selectable\"]', options => options.map(option => ({//FIXME selectable
        date: option.parentElement.firstChild.innerText.replace(/(\r\n|\n|\r)/gm, "") + "@" + option.innerHTML,
        dataIdx: option.getAttribute("data-idx")
    })));
    console.log("Number of slots " + availableSlots.length)
    console.log("Available slots " + availableSlots.map((slot => { return JSON.stringify(slot) })).join("\r\n"))
    if (availableSlots && availableSlots.length > 0) {

        // Select first one and click on it
        const chosenSlot = await chooseSlot(availableSlots)
        if (chosenSlot) {
            console.log("Chosen slot " + JSON.stringify(chosenSlot))
            await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector('span[data-idx=\"' + chosenSlot.dataIdx + '\"]', { timeout: TIMEOUT_MS }); await element.click() })
            const attr = await page.$$eval('span[data-idx=\"' + chosenSlot.dataIdx + '\"]', el => el.map(x => x.getAttribute("class")));
            console.log(JSON.stringify(attr))
            if (attr && attr.length > 0 && attr[0] == "selectable on") { //FIXME selectable on
                // We can proceed
                // Validate
                await wrapper(page, index++, async (frame) => { let element = await frame.waitForSelector('button[value=\"Valider\"]', { timeout: TIMEOUT_MS }); await element.click(); await page.waitForNavigation(); })

                // Make sure we receive confirmation from the server
                const body = await page.evaluate(() => { return document.body.innerText });
                if (!body.includes("Vérifiez que vous avez rempli tous les champs correctement")) { //FIXME add !
                    console.log("Confirmed chosen slot " + JSON.stringify(chosenSlot))
                    const csv = new ObjectsToCsv([chosenSlot])
                    await csv.toDisk(RESERVED_SLOTS, { append: true })
                    console.log("Confirmed chosen slot and written to csv file" + JSON.stringify(chosenSlot))
                }
            }
        }
    }
    await browser.close()
    const end = new Date();
    let elapsed = end - start; elapsed /= 1000; let seconds = Math.round(elapsed);
    console.log(seconds + " seconds");
}

bookPool()