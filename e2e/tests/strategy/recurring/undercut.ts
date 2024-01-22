import { expect, test } from '@playwright/test';
import {
  CreateStrategyTestCase,
  MyStrategyDriver,
  assertRecurringTestCase,
} from './../../../utils/strategy';
import { NotificationDriver } from './../../../utils/NotificationDriver';
import { ManageStrategyDriver } from './../../../utils/strategy/ManageStrategyDriver';
import { waitModalOpen } from '../../../utils/modal';

export const undercutStrategyTest = (testCase: CreateStrategyTestCase) => {
  assertRecurringTestCase(testCase);
  const { base, quote } = testCase.input;
  const output = testCase.output.undercut;
  return test('Undercut', async ({ page }) => {
    const manage = new ManageStrategyDriver(page);
    const strategy = await manage.createStrategy(testCase.input);
    await strategy.clickManageEntry('manage-strategy-duplicateStrategy');

    const modal = await waitModalOpen(page);
    await modal.getByTestId('undercut-strategy-btn').click();

    await page.waitForURL('/strategies/create?strategy=*', {
      timeout: 10_000,
    });

    await page.getByText('Create Strategy').click();
    await page.waitForURL('/', { timeout: 10_000 });

    const notif = new NotificationDriver(page, 'create-strategy');
    await expect(notif.getTitle()).toHaveText('Success');
    await expect(notif.getDescription()).toHaveText(
      'New strategy was successfully created.'
    );

    const myStrategies = new MyStrategyDriver(page);
    const strategies = await myStrategies.getAllStrategies();
    await expect(strategies).toHaveCount(2);

    const strategyUndercut = await myStrategies.getStrategy(2);
    await expect(strategyUndercut.pair()).toHaveText(`${base}/${quote}`);
    await expect(strategyUndercut.status()).toHaveText('Active');
    await expect(strategyUndercut.totalBudget()).toHaveText(output.totalFiat);
    await expect(strategyUndercut.buyBudget()).toHaveText(output.buy.budget);
    await expect(strategyUndercut.buyBudgetFiat()).toHaveText(output.buy.fiat);
    await expect(strategyUndercut.sellBudget()).toHaveText(output.sell.budget);
    await expect(strategyUndercut.sellBudgetFiat()).toHaveText(
      output.sell.fiat
    );

    const buyTooltip = await strategyUndercut.priceTooltip('buy');
    await expect(buyTooltip.startPrice()).toHaveText(output.buy.min);
    await buyTooltip.waitForDetached();

    const sellTooltip = await strategyUndercut.priceTooltip('sell');
    await expect(sellTooltip.startPrice()).toHaveText(output.sell.min);
    await sellTooltip.waitForDetached();
  });
};