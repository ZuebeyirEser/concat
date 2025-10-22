import { test as setup } from '@playwright/test'
import { firstSuperuser, firstSuperuserPassword } from './config.ts'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.getByPlaceholder('m@example.com').fill(firstSuperuser)
  await page.getByPlaceholder('Password').fill(firstSuperuserPassword)
  await page.getByRole('button', { name: 'Log In' }).click()
  
  // Wait for navigation away from login page with shorter timeout
  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 10000 })
  
  await page.context().storageState({ path: authFile })
})
