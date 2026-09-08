import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * A field rule: returns the message to show, or null when the value is fine.
 * The same signature the web forms use, so one rule can be read side by side
 * with its counterpart in `apps/web/src/features/auth/lib/validation.ts`.
 */
export type FieldRule = (value: unknown) => string | null;

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
        validate: (value: unknown) => rule(value) === null,
        defaultMessage: (args?: ValidationArguments) =>
          rule(args?.value) ?? 'Check this field.',
      },
    });
  };
}
