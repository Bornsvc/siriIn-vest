"use client";

import { Field, Input, Select } from "@/shared/ui";
import { FUND_SOURCES, type DetailErrors, type Details } from "../lib/verify";
import type { Province } from "../lib/provinces";

/**
 * Everything the reviewer compares against the document photo, plus the one
 * question anti-money-laundering rules actually ask: where the money is from.
 */
export function VerifyDetailsStep({
  value,
  errors,
  provinces,
  onChange,
}: {
  value: Details;
  errors: DetailErrors;
  /** From the API. Empty means the call failed, which the field says out loud. */
  provinces: Province[];
  onChange: (patch: Partial<Details>) => void;
}) {
  const unavailable = provinces.length === 0;

  return (
    <div className="space-y-5">
      <Field
        label="Full legal name"
        htmlFor="verify-name"
        hint="Including any middle names printed on the document."
        error={errors.name ? <span id="verify-name-error">{errors.name}</span> : null}
      >
        <Input
          id="verify-name"
          name="name"
          autoComplete="name"
          placeholder="Sayasith Souvannachack"
          value={value.name}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "verify-name-error" : undefined}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </Field>

      <Field
        label="Date of birth"
        htmlFor="verify-dob"
        hint="You have to be 18 or older to hold a brokerage account."
        error={errors.dob ? <span id="verify-dob-error">{errors.dob}</span> : null}
      >
        <Input
          id="verify-dob"
          name="dob"
          type="date"
          autoComplete="bday"
          className="font-mono"
          data-numeric
          value={value.dob}
          aria-invalid={errors.dob ? true : undefined}
          aria-describedby={errors.dob ? "verify-dob-error" : undefined}
          onChange={(event) => onChange({ dob: event.target.value })}
        />
      </Field>

      <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2">
        <Field
          label="Village"
          htmlFor="verify-village"
          error={
            errors.village ? (
              <span id="verify-village-error">{errors.village}</span>
            ) : null
          }
        >
          <Input
            id="verify-village"
            name="village"
            autoComplete="address-line1"
            placeholder="Ban Sisaket"
            value={value.village}
            aria-invalid={errors.village ? true : undefined}
            aria-describedby={errors.village ? "verify-village-error" : undefined}
            onChange={(event) => onChange({ village: event.target.value })}
          />
        </Field>

        <Field
          label="District"
          htmlFor="verify-district"
          error={
            errors.district ? (
              <span id="verify-district-error">{errors.district}</span>
            ) : null
          }
        >
          <Input
            id="verify-district"
            name="district"
            autoComplete="address-level2"
            placeholder="Chanthabouly"
            value={value.district}
            aria-invalid={errors.district ? true : undefined}
            aria-describedby={
              errors.district ? "verify-district-error" : undefined
            }
            onChange={(event) => onChange({ district: event.target.value })}
          />
        </Field>
      </div>

      <Field
        label="Province"
        htmlFor="verify-province"
        hint={
          unavailable ? (
            <span id="verify-province-hint">
              The province list could not be loaded. Reload the page to try
              again.
            </span>
          ) : null
        }
        error={
          errors.province ? (
            <span id="verify-province-error">{errors.province}</span>
          ) : null
        }
      >
        {/* The value is the province code; the name is only ever displayed. */}
        <Select
          id="verify-province"
          name="province"
          autoComplete="address-level1"
          value={value.province}
          disabled={unavailable}
          aria-invalid={errors.province ? true : undefined}
          aria-describedby={
            errors.province
              ? "verify-province-error"
              : unavailable
                ? "verify-province-hint"
                : undefined
          }
          onChange={(event) => onChange({ province: event.target.value })}
        >
          <option value="">
            {unavailable ? "Unavailable" : "Select a province"}
          </option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Source of the money you invest"
        htmlFor="verify-funds"
        hint="Lao anti-money-laundering rules require this before an account can hold money."
        error={
          errors.funds ? <span id="verify-funds-error">{errors.funds}</span> : null
        }
      >
        <Select
          id="verify-funds"
          name="funds"
          value={value.funds}
          aria-invalid={errors.funds ? true : undefined}
          aria-describedby={errors.funds ? "verify-funds-error" : undefined}
          onChange={(event) => onChange({ funds: event.target.value })}
        >
          <option value="">Select a source</option>
          {FUND_SOURCES.map((source) => (
            <option key={source.value} value={source.value}>
              {source.label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
