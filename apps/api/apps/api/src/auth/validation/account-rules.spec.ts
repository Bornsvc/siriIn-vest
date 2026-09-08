import {
  laoPhoneToE164,
  normalizeEmail,
  normalizeFullName,
  toE164LaoPhone,
  validateEmail,
  validateFullName,
  validateGivenPassword,
  validateLaoPhone,
  validatePassword,
  validateSignInIdentifier,
} from './account-rules';

/**
 * These assertions are the contract with the web forms: same input, same
 * sentence. If a message changes on one side, this fails on the other.
 */
describe('account rules', () => {
  describe('full name', () => {
    it('accepts a name', () => {
      expect(validateFullName('Sayasith Souvannachack')).toBeNull();
    });

    it.each([
      ['', 'Enter your full name.'],
      ['   ', 'Enter your full name.'],
      [undefined, 'Enter your full name.'],
      [42, 'Enter your full name.'],
      ['S', 'Enter your name as it appears on your ID.'],
    ])('rejects %p', (value, message) => {
      expect(validateFullName(value)).toBe(message);
    });
  });

  describe('email', () => {
    it('accepts an address', () => {
      expect(validateEmail('name@example.com')).toBeNull();
    });

    it.each([
      ['', 'Enter your email address.'],
      [null, 'Enter your email address.'],
      ['name@example', 'Enter an email address like name@example.com.'],
      ['name at example.com', 'Enter an email address like name@example.com.'],
    ])('rejects %p', (value, message) => {
      expect(validateEmail(value)).toBe(message);
    });
  });

  describe('Lao phone', () => {
    it('accepts the national part, spaced the way it is written', () => {
      expect(validateLaoPhone('20 5551 8842')).toBeNull();
    });

    it.each([
      ['', 'Enter your phone number.'],
      [undefined, 'Enter your phone number.'],
      ['020 5551 8842', 'Drop the leading 0 — +856 replaces it.'],
      ['2055', 'Enter 8 to 10 digits after +856, like 20 5551 8842.'],
      ['20555188421', 'Enter 8 to 10 digits after +856, like 20 5551 8842.'],
    ])('rejects %p', (value, message) => {
      expect(validateLaoPhone(value)).toBe(message);
    });

    it('stores E.164', () => {
      expect(toE164LaoPhone('20 5551 8842')).toBe('+8562055518842');
    });
  });

  describe('password', () => {
    it('accepts eight characters mixing two kinds', () => {
      expect(validatePassword('vientiane1')).toBeNull();
    });

    it.each([
      ['', 'Create a password.'],
      [undefined, 'Create a password.'],
      ['short1', 'Use at least 8 characters.'],
      ['vientianes', 'Mix in a capital letter, a number or a symbol.'],
    ])('rejects %p', (value, message) => {
      expect(validatePassword(value)).toBe(message);
    });

    it('only asks that a sign-in password was typed', () => {
      expect(validateGivenPassword('a')).toBeNull();
      expect(validateGivenPassword('')).toBe('Enter your password.');
    });
  });

  describe('signing in', () => {
    it('takes an email or a phone in the one field', () => {
      expect(validateSignInIdentifier('name@example.com')).toBeNull();
      expect(validateSignInIdentifier('20 5551 8842')).toBeNull();
    });

    it.each([
      ['', 'Enter your email or phone number.'],
      ['   ', 'Enter your email or phone number.'],
      [undefined, 'Enter your email or phone number.'],
      ['name@example', 'Enter an email address like name@example.com.'],
      ['12', 'Enter the email or phone number you signed up with.'],
    ])('rejects %p', (value, message) => {
      expect(validateSignInIdentifier(value)).toBe(message);
    });

    it.each([
      ['20 5551 8842', '+8562055518842'],
      ['2055518842', '+8562055518842'],
      ['020 5551 8842', '+8562055518842'],
      ['+856 20 5551 8842', '+8562055518842'],
      ['8562055518842', '+8562055518842'],
      ['008562055518842', '+8562055518842'],
      ['(020) 5551-8842', '+8562055518842'],
    ])('reads %p as %p', (typed, e164) => {
      expect(laoPhoneToE164(typed)).toBe(e164);
    });

    it.each(['', '12', 'not a number', '20555188421234'])(
      'makes nothing of %p',
      (typed) => {
        expect(laoPhoneToE164(typed)).toBeNull();
      },
    );
  });

  describe('normalization', () => {
    it('folds case and whitespace on email', () => {
      expect(normalizeEmail('  Name@Example.COM ')).toBe('name@example.com');
    });

    it('collapses runs of whitespace in a name', () => {
      expect(normalizeFullName('  Sayasith   Souvannachack ')).toBe(
        'Sayasith Souvannachack',
      );
    });
  });
});
