import { Builder, By } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome.js";

async function escribirEnIonInput(driver, id, texto) {
  const ionInput = await driver.findElement(By.id(id));
  const realInput = await ionInput.findElement(By.css("input.native-input"));
  await realInput.clear();
  await realInput.sendKeys(texto);
}

async function testLogin() {
  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(new chrome.Options())
    .build();

  try {
    await driver.get("http://localhost:8100/");
    await driver.sleep(1500);

    await escribirEnIonInput(driver, "input-usuario", "admin");
    await escribirEnIonInput(driver, "input-password", "1234");

    const btnLogin = await driver.findElement(By.id("btn-login"));
    await btnLogin.click();

    console.log("✅ Prueba de login ejecutada correctamente");

  } catch (e) {
    console.error("❌ Error durante la prueba:", e);
  } finally {
    await driver.quit();
  }
}

testLogin();



