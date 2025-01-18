import { expect, Page } from "@playwright/test";
import path from "path";

export class Shoppingcart {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async removeItemFromCart(itemName: string) {
    const rowSelector = `tbody tr:has(td:text-is("${itemName}"))`;

    const itemExists = await this.page.locator(rowSelector).count();
    if (itemExists === 0) {
      throw new Error(`Item "${itemName}" not found in the cart.`);
    }

    await this.page.locator(`${rowSelector} .removeBtn`).click();

    await expect(this.page.locator(rowSelector)).toHaveCount(0);
  }

  async proceedPayment() {
    const itemCount = await this.page.locator("tbody tr").count();
    if (itemCount > 0) {
      await this.page.locator("#proceedBtn").click();
      this.page.on("dialog", async (dialog) => {
        expect(dialog.message()).toBe("Redirecting to payment page...");
        await dialog.accept();
      });
    } else {
      throw new Error("No items in the cart to proceed to payment.");
    }
  }

  async cancelOrder() {
    await this.page.locator("#cancelBtn").click();
    this.page.on("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Order canceled.");
      await dialog.accept();
    });
  }

  async validateCartTotal() {
    const itemPrices = await this.page
      .locator(
        'tbody tr:not(.total):not(:has(td:contains("Taxes"))) td:nth-child(2)'
      )
      .allTextContents();
    const taxText = await this.page
      .locator('tbody tr:has(td:contains("Taxes")) td:nth-child(2)')
      .textContent();
    const totalText = await this.page
      .locator(".total td:nth-child(2)")
      .textContent();

    if (!totalText) {
      throw new Error("Total text is not available.");
    }

    const itemTotal = itemPrices.reduce(
      (sum, price) => sum + parseFloat(price.replace("$", "")),
      0
    );
    const tax = taxText ? parseFloat(taxText.replace("$", "")) : 0;
    const total = parseFloat(totalText.replace("$", ""));

    expect(total).toBeCloseTo(itemTotal + tax, 2);
  }
}
