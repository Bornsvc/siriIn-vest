import { Rule } from '../../common/validation/rule.decorator';
import {
  CurrencyValue,
  validateCurrency,
  validateDepositAmount,
} from '../validation/money-rules';

export class DepositDto {
  /**
   * Which side the customer typed. Kip is the default on the form because kip
   * is what they hold; the dollar figure is derived from the rate.
   */
  @Rule(validateCurrency)
  currency: CurrencyValue;

  @Rule(validateDepositAmount)
  amount: number;
}
