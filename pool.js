import puppeteer from "puppeteer"
const SCREENSHOTS_PATH = "screenshots/"
const TIMEOUT_MS = 3000

const wrapper = async (page, index, action) => {
    try {
        console.log(index)
        const frame = page.mainFrame();
        await action(frame)
        await page.screenshot({ path: SCREENSHOTS_PATH + index + "_screenshot.png" })    
    } catch (error) {
        console.log(error)
    }
    
}

const bookPool = async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    let index = 0
    const start = new Date();
    const targetPage = page;
    await targetPage.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/", {waitUntil: 'networkidle2'});
    await wrapper(targetPage, index++, async () => {})
    await wrapper(targetPage, index++, async (frame) => { await frame.select('select#form_f8', '6');})
    await wrapper(targetPage, index++, async (frame) => {
        let element = await frame.waitForSelector("div#rub_service > form > div.widget.CheckboxWidget.widget-required.widget-prefilled > div.content > label > span");
        await element.click();
    })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/Nom*", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Soto") })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/Prénom*", { timeout: TIMEOUT_MS }); await element.click(); await element.type("Jonathan") })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/Courriel", { timeout: TIMEOUT_MS }); await element.click(); await element.type("jsotogaviard@gmail.com") })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/Téléphone mobile", { timeout: TIMEOUT_MS }); await element.click(); await element.type("0678135845") })
    for (let i = 0; i < 5; i++) {
        await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/→", { timeout: TIMEOUT_MS }); await element.click()  })
    }
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("div#form_f26_table", { timeout: TIMEOUT_MS }); await element.click(); })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/VALIDER", { timeout: TIMEOUT_MS });await element.click(); })
    await wrapper(targetPage, index++, async () => {})
    await page.screenshot({ path: SCREENSHOTS_PATH + index + "_screenshot.png" })
    await browser.close()
    const end = new Date();
    let elapsed = end - start; elapsed /= 1000;let seconds = Math.round(elapsed);
    console.log(seconds + " seconds");
}

bookPool()