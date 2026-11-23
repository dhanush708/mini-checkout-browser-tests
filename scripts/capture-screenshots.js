import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function main() {
  const evidenceDir = path.resolve('docs/evidence');
  if (!fs.existsSync(evidenceDir)) {
    fs.mkdirSync(evidenceDir, { recursive: true });
  }

  // Remove old screenshots, keeping def-02-before-* files
  const existingFiles = fs.readdirSync(evidenceDir);
  existingFiles.forEach(file => {
    if (file.endsWith('.png') && !file.startsWith('def-02-before-')) {
      fs.unlinkSync(path.join(evidenceDir, file));
    }
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseURL = 'http://127.0.0.1:8080';

  const viewports = [
    { name: '375px', width: 375, height: 812 },
    { name: '768px', width: 768, height: 1024 },
    { name: '1280px', width: 1280, height: 800 }
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // 1. Empty cart state
    await page.goto(baseURL);
    await page.screenshot({ path: path.join(evidenceDir, `empty-cart-${vp.name}.png`), fullPage: true });

    // 2. Filled cart state
    await page.getByRole('listitem').filter({ hasText: 'A5 Dotted Notebook' }).getByRole('button', { name: 'Add to cart' }).click();
    await page.getByRole('listitem').filter({ hasText: 'Brass Fountain Pen' }).getByRole('button', { name: 'Add to cart' }).click();
    await page.screenshot({ path: path.join(evidenceDir, `filled-cart-${vp.name}.png`), fullPage: true });

    // 3. Validation errors state
    await page.goto(baseURL);
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.screenshot({ path: path.join(evidenceDir, `validation-errors-${vp.name}.png`), fullPage: true });

    // 4. Confirmation state
    await page.getByRole('listitem').filter({ hasText: 'A5 Dotted Notebook' }).getByRole('button', { name: 'Add to cart' }).click();
    await page.getByLabel('Full name').fill('Asha Verma');
    await page.getByRole('button', { name: 'Place Order' }).click();
    await page.screenshot({ path: path.join(evidenceDir, `confirmation-${vp.name}.png`), fullPage: true });
  }

  await browser.close();
  console.log('Screenshots captured successfully in docs/evidence/');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
