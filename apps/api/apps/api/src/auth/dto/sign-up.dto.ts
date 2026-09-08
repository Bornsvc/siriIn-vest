import { Equals } from 'class-validator';
import { Rule } from '../../common/validation/rule.decorator';
import {
  validateEmail,
  validateFullName,
  validateLaoPhone,
  validatePassword,
} from '../validation/account-rules';

/**
 * The register form's four fields, in the order the eye reads them, plus the
 * consent the form will not submit without.
 */
export class SignUpDto {
  /** As it appears on their ID. */
  @Rule(validateFullName)
  name: string;

  @Rule(validateEmail)
  email: string;

  /**
   * The national part only. +856 is furniture on the form, not a value the
   * customer types, so it is not a value the API accepts either.
   */
  @Rule(validateLaoPhone)
  phone: string;

  @Rule(validatePassword)
  password: string;

  /** The terms checkbox. An account cannot exist without it. */
  @Equals(true, { message: 'Accept the terms to create your account.' })
  acceptedTerms: boolean;
}
