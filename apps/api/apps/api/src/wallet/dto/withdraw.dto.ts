import { Rule } from '../../common/validation/rule.decorator';
import { validateWithdrawAmount } from '../validation/money-rules';

export class WithdrawDto {
  /** Withdrawals come out of the dollar balance, so they are quoted in it. */
  @Rule(validateWithdrawAmount)
  amountUsd: number;
}
