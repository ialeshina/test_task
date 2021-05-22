/* global fixture */
import { Selector } from "testcafe";

/* User credentials */
const standardUser = "standard_user";
const lockedOutUser = "locked_out_user";
const problemUser = "problem_user";
const performanceGlitchUser = "performance_glitch_user";
const userPassword = "secret_sauce";

/* Helper functions */
const login = async (username, password, t) => {
  await t
    .typeText('[data-test="username"]', username)
    .typeText('[data-test="password"]', password)
    .click('[data-test="login-button"]');
};

const verifyThreshold = (expected, threshold) => {
  const diff = Date.now() - expected;
  if (diff > threshold) {
    throw new Error(`\nActual: ${diff} ms\nExpected: ${threshold} ms`);
  }
};
const threshold = 1000; // ms

/* Selectors */
const shoppingCartLink = Selector(".shopping_cart_link");

/* The fixture will go to the correct website
at the login page you will find all the different users and pw for
the assigments, Good luck! */
fixture`Lets go to SwagLabs and test`.page`https://www.saucedemo.com/`;

/* Run it and correct this test */
test("Check the title", async (t) => {
  await t.expect(Selector("title").innerText).eql("Swag Labs");
});

/* Use the locked_out_user and check if you get a error msg */
test("cannot login with locked out user", async (t) => {
  await login(lockedOutUser, userPassword, t);
  await t
    .expect(Selector('[data-test="error"]').innerText)
    .contains("Epic sadface: Sorry, this user has been locked out.");
});

/* Login with problem_user
 and add the 'Sauce Labs Onesie' item to the cart,
 Go through the buy process,
 When the item is bought check if the cart is empty after,
 and then logout (HINT: test should fail) */
test("can add 'Sauce Labs Onesie' and go through the buy process", async (t) => {
  await login(problemUser, userPassword, t);

  await t
    .click('[data-test="add-to-cart-sauce-labs-onesie"]')
    .click(shoppingCartLink)
    .expect(Selector('[data-test="remove-sauce-labs-onesie"]').exists)
    .ok()
    .click('[data-test="checkout"]')
    .typeText('[data-test="firstName"]', "John")
    .typeText('[data-test="lastName"]', "Doe")
    .typeText('[data-test="postalCode"]', "11122")
    // Test fails here due to bug in input component for lastName
    .click('[data-test="continue"]')
    .click('[data-test="finish"]')
    .click(shoppingCartLink)
    .expect(Selector('div[class="cart_item"]').exists)
    .notOk();
});

/* Login with standard_user
 change the sorting of products
 to 'Price (Low to High)'
 verify if its correct */
test("can sort products using 'Price (Low to High)' as standard_user", async (t) => {
  const priceLowHigh = Selector("option").withAttribute("value", "lohi");

  await login(standardUser, userPassword, t);

  await t.click('[data-test="product_sort_container"]').click(priceLowHigh);

  /*
  This solution is adapted to the test page and expects more than 2 price items.
  */
  const itemPriceCount = await Selector(".inventory_item_price").count;
  const firstItemPrice = await Selector(".inventory_item_price").nth(0)
    .innerText;
  const lastItemPrice = await Selector(".inventory_item_price").nth(
    itemPriceCount - 1
  ).innerText;
  // Remove $ sign and convert string to float
  const firstItemPriceFloat = parseFloat(firstItemPrice.substring(1));
  const lastItemPriceFloat = parseFloat(lastItemPrice.substring(1));

  await t.expect(firstItemPriceFloat).lte(lastItemPriceFloat);
});

/* Login with standard_user
 and add the 'Sauce Labs Onesie' item to the cart,
 Go through the buy process,
 When the item is bought check if the cart is empty after,
 and then logout */
test("can buy 'Sauce Labs Onesie' as standard_user, verify empty cart and logout", async (t) => {
  await login(standardUser, userPassword, t);

  await t
    .click('[data-test="add-to-cart-sauce-labs-onesie"]')
    .click(shoppingCartLink)
    .expect(Selector('[data-test="remove-sauce-labs-onesie"]').exists)
    .ok()
    .click('[data-test="checkout"]')
    .typeText('[data-test="firstName"]', "John")
    .typeText('[data-test="lastName"]', "Doe")
    .typeText('[data-test="postalCode"]', "11122")
    .click('[data-test="continue"]')
    .click('[data-test="finish"]')
    .click(shoppingCartLink)
    .expect(Selector('div[class="cart_item"]').exists)
    .notOk()
    .click('button[id="react-burger-menu-btn"]')
    .click('a[id="logout_sidebar_link"]')
    .expect(Selector('[data-test="login-button"]').exists)
    .ok();
});

/* BONUS 1: Use problem_user and see if all
images render properly. (Hint: test should fail */
test("all images should render as problem_user", async (t) => {
  const imgArray = [
    "sauce-backpack-1200x1500.34e7aa42.jpg",
    "bike-light-1200x1500.a0c9caae.jpg",
    "bolt-shirt-1200x1500.c0dae290.jpg",
    "sauce-pullover-1200x1500.439fc934.jpg",
    "red-onesie-1200x1500.1b15e1fa.jpg",
    "red-tatt-1200x1500.e32b4ef9.jpg",
  ];

  await login(problemUser, userPassword, t);

  for (let i = 0; i < imgArray.length; i++) {
    await t
      .expect(Selector(`img[src="/static/media/${imgArray[i]}"]`).exists)
      .ok();
  }
});

/* BONUS 2: Use performance_glitch_user
and verify that the website have good performance.
(Hint: set a threshold, test should fail with
performance_glitch_user and it should succeed
with standard_user */
test("performance as performance_glitch_user", async (t) => {
  await t
    .typeText('[data-test="username"]', performanceGlitchUser)
    .typeText('[data-test="password"]', userPassword);
  const expectedLoadTimeGlitchUser = Date.now() + threshold;
  await t.click('[data-test="login-button"]');
  await verifyThreshold(expectedLoadTimeGlitchUser, threshold);
});

test("performance as standard_user", async (t) => {
  await t
    .typeText('[data-test="username"]', standardUser)
    .typeText('[data-test="password"]', userPassword);
  const expectedLoadTimeStandardUser = Date.now() + threshold;
  await t.click('[data-test="login-button"]');
  await verifyThreshold(expectedLoadTimeStandardUser, threshold);
});
