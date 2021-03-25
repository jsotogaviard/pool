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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let index = 0
    const start = new Date();
    const targetPage = page;
    await targetPage.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/", {waitUntil: 'networkidle2'});
    await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png", fullPage: true })   
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForXPath("//*[@id=\"form_f8\"]", { timeout: TIMEOUT_MS }); await element.click() })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("select#form_f8", { timeout: TIMEOUT_MS }); await element.type("6"); await element.click()})
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
    const body = await targetPage.evaluate(() => { return {'body': document.body.innerText }; }); console.log('body:', body);
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("div#form_f26_table", { timeout: TIMEOUT_MS }); await element.click(); })
    await wrapper(targetPage, index++, async (frame) => { let element = await frame.waitForSelector("aria/VALIDER", { timeout: TIMEOUT_MS });await element.click(); })
    
    await browser.close()
    const end = new Date();
    let elapsed = end - start; elapsed /= 1000;let seconds = Math.round(elapsed);
    console.log(seconds + " seconds");
}

bookPool()

/**const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/");
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("select#form_f8");
        await element.click();
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("select#form_f8");
        await element.type("6");
    }
    await browser.close();
})();

const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/");
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/VALIDER");await element.click();
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("input#form_f4");
        await element.click();
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("input#form_f4");
        await element.type("0678135845");
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("div#form_f26_table > div:nth-child(3) > span.selectable");
        await element.click();
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/VALIDER");
        await element.click();
    }
 */