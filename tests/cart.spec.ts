import { test, expect } from "@playwright/test";
import { Shoppingcart } from "../objects/shoppingcart";

test("remove item from cart", async ({ page }) => {
  const shoppingCart = new Shoppingcart(page);

  await shoppingCart.removeItemFromCart("Item 1");

  const itemCount = await page.locator("tbody tr").count();
  expect(itemCount).toBe(2); // 1 item + 1 tax row
});

test("Validate Cart Total", async ({ page }) => {
  const shoppingCart = new Shoppingcart(page);
  await shoppingCart.validateCartTotal();
});

test("proceed to payment", async ({ page }) => {
  const shoppingCart = new Shoppingcart(page);
  await shoppingCart.proceedPayment();
});


test("cancel order", async ({ page }) => {
  const shoppingCart = new Shoppingcart(page);
  await shoppingCart.cancelOrder();
});
