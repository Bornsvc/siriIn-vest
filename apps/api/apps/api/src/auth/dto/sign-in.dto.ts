import { Rule } from '../../common/validation/rule.decorator';
import {
  validateEmail,
  validateGivenPassword,
} from '../validation/account-rules';

export class SignInDto {
  @Rule(validateEmail)
  email: string;

  /**
   * Only checked for presence. Applying the sign-up strength rule here would
   * lock out anyone whose password predates a change to that rule.
   */
  @Rule(validateGivenPassword)
  password: string;
}
