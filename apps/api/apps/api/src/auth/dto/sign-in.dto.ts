import { Rule } from '../../common/validation/rule.decorator';
import {
  validateGivenPassword,
  validateSignInIdentifier,
} from '../validation/account-rules';

export class SignInDto {
  /**
   * An email address or a Lao phone number — one field, because a customer
   * signing in knows which one they used and should not have to tell us.
   */
  @Rule(validateSignInIdentifier)
  identifier: string;

  /**
   * Only checked for presence. Applying the sign-up strength rule here would
   * lock out anyone whose password predates a change to that rule.
   */
  @Rule(validateGivenPassword)
  password: string;
}
