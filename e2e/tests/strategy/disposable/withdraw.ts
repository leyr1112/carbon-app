import { expect, test } from '@playwright/test';
import { waitModalOpen } from './../../../utils/modal';
import { NotificationDriver } from './../../../utils/NotificationDriver';
import { ManageStrategyDriver } from './../../../utils/strategy/ManageStrategyDriver';
import {
  assertDisposableTestCase,
  CreateStrategyTestCase,
  EditStrategyDriver,
} from '../../../utils/strategy';

export const withdraw = (testCase: CreateStrategyTestCase) => {
  assertDisposableTestCase(testCase);
  const { direction } = testCase;
  const output = testCase.output.withdraw;
  return test('Withdraw', async ({ page }) => {
    const manage = new ManageStrategyDriver(page);
    const strategy = await manage.createStrategy(testCase);
    await strategy.clickManageEntry('withdrawFunds');

    const modal = await waitModalOpen(page);
    await modal.getByTestId('withdraw-strategy-btn').click();

    const edit = new EditStrategyDriver(page, testCase);
    await edit.waitForPage('withdraw');
    await edit.fillDisposableBudget('withdraw');

    await edit.submit('withdraw');
    await page.waitForURL('/', { timeout: 20_000 });

    const notif = new NotificationDriver(page, 'withdraw-strategy');
    await expect(notif.getTitle()).toHaveText('Success');
    await expect(notif.getDescription()).toHaveText(
      'Your withdrawal request was successfully completed.'
    );

    await expect(strategy.budget(direction)).toHaveText(output);
  });
};
