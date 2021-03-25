import puppeteer from "puppeteer"
const SCREENSHOTS_PATH = "screenshots/"

const bookPool = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let index = 0
    const start = new Date();
    {
        const targetPage = page;
        await targetPage.goto("https://demarches-montoulouse.eservices.toulouse-metropole.fr/loisirs/reserver-une-place-a-la-piscine/");
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("select#form_f8");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("select#form_f8");
        await element.type("6");
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("div#rub_service > form > div.widget.CheckboxWidget.widget-required.widget-prefilled > div.content > label > span");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Nom*");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Nom*");
        await element.type("Soto");
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Prénom*");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Prénom*");
        await element.type("Jonathan");
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Courriel");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Courriel");
        await element.type("jsotogaviard@gmail.com");
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Téléphone mobile");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/Téléphone mobile");
        await element.type("0678135845");
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("aria/→");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("div#form_f26_table");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    {
        const targetPage = page;
        const frame = targetPage.mainFrame();
        const element = await frame.waitForSelector("div#form_f26_table");
        await element.click();
        await targetPage.screenshot({ path: SCREENSHOTS_PATH + index++ + "_screenshot.png" })
    }
    await browser.close()
    end = new Date();
    var elapsed = end - start; //in ms
    // strip the ms
    elapsed /= 1000;

    // get seconds 
    var seconds = Math.round(elapsed);
    console.log(seconds + " seconds");
}

bookPool()