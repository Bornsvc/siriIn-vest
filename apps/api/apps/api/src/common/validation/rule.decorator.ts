import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * A field rule: returns the message to show, or null when the value is fine.
 * The same signature the web forms use, so one rule can be read side by side
 * with its counterpart in `apps/web/src/features/auth/lib/validation.ts`.
 *
 * The second argument is the whole object, for the rules that cannot judge a
 * field alone — an ID number means one thing on a passport and another on a
 * Lao ID card.
 */
export type FieldRule = (value: unknown, object?: unknown) => string | null;

/**
 * Turns a rule into a class-validator decorator. The rule owns its wording —
 * which failed and what to do about it — instead of the decorator flattening
 * every fault into one generic message.
 */
export function Rule(
  rule: FieldRule,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target: object, propertyName: string | symbol): void => {
    registerDecorator({
      name: 'rule',
      target: target.constructor,
      propertyName: propertyName as string,
      options,
      validator: {
        validate: (value: unknown, args?: ValidationArguments) =>
          rule(value, args?.object) === null,
        defaultMessage: (args?: ValidationArguments) =>
          rule(args?.value, args?.object) ?? 'Check this field.',
      },
    });
  };
}
