import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Rule } from '../../common/validation/rule.decorator';
import {
  DocumentKindValue,
  DocumentTypeValue,
  validateDateOfBirth,
  validateDistrict,
  validateDocumentKind,
  validateDocumentNumber,
  validateDocumentType,
  validateFundSourceCode,
  validateProvinceCode,
  validateStorageKey,
  validateVillage,
} from '../validation/kyc-rules';
import { validateFullName } from '../../auth/validation/account-rules';

/**
 * One photo already in the bucket, named by the key `POST /kyc/uploads` handed
 * out. Nothing else about the file is taken on the client's word — its type,
 * its size and its checksum are read back from the bucket at submission.
 */
export class KycPhotoDto {
  @Rule(validateDocumentKind)
  kind: DocumentKindValue;

  @Rule(validateStorageKey)
  storageKey: string;
}

/** The three steps of the identity form, in one request. */
export class SubmitKycDto {
  @Rule(validateFullName)
  fullName: string;

  /** ISO date, `1994-07-21`. */
  @Rule(validateDateOfBirth)
  dateOfBirth: string;

  @Rule(validateVillage)
  village: string;

  @Rule(validateDistrict)
  district: string;

  /** A `provinces.code`, not a name. */
  @Rule(validateProvinceCode)
  provinceCode: string;

  /** A `fund_sources.code`. */
  @Rule(validateFundSourceCode)
  fundSourceCode: string;

  @Rule(validateDocumentType)
  documentType: DocumentTypeValue;

  @Rule(validateDocumentNumber)
  documentNumber: string;

  @IsArray({ message: 'Add the photos this check asks for.' })
  @ArrayNotEmpty({ message: 'Add the photos this check asks for.' })
  @ValidateNested({ each: true })
  @Type(() => KycPhotoDto)
  photos: KycPhotoDto[];
}
