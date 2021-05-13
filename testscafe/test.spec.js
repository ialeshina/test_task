/* global fixture */

import { Selector } from 'testcafe'

const password = 'secret_sauce'


// selectors
const loginBtn = Selector('#login-button')
const classSelector = Selector(id => document.getElementsByClassName(id));
const idSelector = Selector(id => document.getElementsById(id));                                
//document.getElementsByClassName('product_sort_container')[0].value="lohi"
const usernameInput = Selector('#user-name')
const passwordInput = Selector('#password')

// errors
const errTemplate = `Error:`
const cartEmptyErr =  `${errTemplate} An error occurred when emptying the cart!`
const pageLoadErr = `${errTemplate} The page couldn't be loaded!`
const setFilterErr = `${errTemplate} An error occurred when setting sorting option!`
const err404 = `${errTemplate} 404 image was found!`
const performanceTestErr = `${errTemplate} The Performance test has failed!`

// performance thresholds
const loginThreshold = 1500

const timerThresholdCheck = (expected, threshold) => {
  const drift = Date.now() - expected
  if (drift > threshold) {
    throw `${performanceTestErr} The login test failed to complete within ${threshold}ms`;
  } 
  return
}

/* The fixture will go to the correct website
at the login page you will find all the different users and pw for 
the assigments, Good luck! */
fixture `Lets go to SwagLabs and test`
  .page `https://www.saucedemo.com/`

/* Run it and correect this test */
test('Check the title', async t => {
  await t.expect(Selector('title').innerText).eql('Swag Labs');
});

/* Use the locked_out_user and check if you get a error msg */
test(`Locked user can't login`, async t =>  {
  await t
    .typeText(usernameInput, 'locked_out_user')
    .typeText(passwordInput, password)
    .click(loginBtn)
    .expect(classSelector('error-message-container error').innerText).eql('Epic sadface: Sorry, this user has been locked out.');
})

/* Login with problem_user
 and add the 'Sauce Labs Onesie' item to the cart,
 Go through the buy process,
 When the item is bought check if the cart is empty after,
 and then logout (HINT: test should fail) */
 test('Problem user buy flow (should fail)', async t =>  {
  await t
    .typeText(usernameInput, 'problem_user')
    .typeText(passwordInput, password)
    .click(loginBtn)
    .click(Selector('#add-to-cart-sauce-labs-onesie'))
    .click(classSelector('shopping_cart_link'))
    .click(Selector('#checkout'))
    .typeText(Selector('#first-name'), 'test')
    .typeText(Selector('#last-name'), 'test')
    .typeText(Selector('#postal-code'), '1')
    .click(Selector('#continue'))
    .click(classSelector('shopping_cart_link'))
    .expect(classSelector('cart_quantity').textContent).contains('0', cartEmptyErr)
    .click(classSelector('bm-burger-button'))
    .click(Selector('#logout_sidebar_link'));
})

/* Login with standard_user
 change the sorting of products 
 to 'Price (Low to High)'
 verify if its correct */
 test('Test Low  sorting logic as standard user', async t =>  {
  await t
  .typeText(usernameInput, 'standard_user')
  .typeText(passwordInput, password)
  .click(loginBtn)
  .click('select')
  .click(Selector('option', { text: 'Price (low to high)' }))
  .expect(classSelector('active_option').withText('Price (low to high)'), setFilterErr).ok();
})

/* Login with standard_user
 and add the 'Sauce Labs Onesie' item to the cart,
 Go through the buy process,
 When the item is bought check if the cart is empty after,
 and then logout */
test('Standard user buy flow', async t =>  {
  await t
  .typeText(usernameInput, 'standard_user')
  .typeText(passwordInput, password)
  .click(loginBtn)
  .click(Selector('#add-to-cart-sauce-labs-onesie'))
  .click(classSelector('shopping_cart_link'))
  .click(Selector('#checkout'))
  .typeText(Selector('#first-name'), 'test')
  .typeText(Selector('#last-name'), 'test')
  .typeText(Selector('#postal-code'), '1')
  .click(Selector('#continue'))
  .click(Selector('#finish'))
  .click(classSelector('shopping_cart_link'))
  .expect(classSelector('cart_list')).notContains(classSelector('cart_item'), cartEmptyErr)
  .click(classSelector('bm-burger-button'))
  .click(Selector('#logout_sidebar_link'));
})

/* BONUS 1: Use problem_user and see if all
images render properly. (Hint: test should fail */
test('Verify that images render (should fail)', async t =>  {
  await t
  .typeText(usernameInput, 'problem_user')
  .typeText(passwordInput, password)
  .click(loginBtn)
  .click(classSelector('bm-burger-button'))
  .click(Selector('#about_sidebar_link'))
  .expect(classSelector('headerMainNav')).notContains(Selector('#template__page'), err404);
})

/* BONUS 2: Use performance_glitch_user
and verify that the website have good performance.
(Hint: set a threshold, test should fail with
performance_glitch_user and it should succeed 
with standard_user */
test('Test login performance performance_glitch_user', async t =>  {
  const expectedFinishTime = Date.now() + loginThreshold;
  await t
  .typeText(usernameInput, 'performance_glitch_user')
  .typeText(passwordInput, password)
  .click(loginBtn)

  timerThresholdCheck(expectedFinishTime, loginThreshold)
})
test('Test login performance standard_user', async t =>  {
  const expectedFinishTime = Date.now() + loginThreshold;

  await t
  .typeText(usernameInput, 'standard_user')
  .typeText(passwordInput, password)
  .click(loginBtn)

  timerThresholdCheck(expectedFinishTime, loginThreshold)
})