import { Rule } from '../../common/validation/rule.decorator';
import {
  DocumentKindValue,
  validateDocumentKind,
  validateImageContentType,
} from '../validation/kyc-rules';

/**
 * Asks for somewhere to put one photo. The answer names the key — the client
 * never chooses where in the bucket its file lands.
 */
export class RequestUploadDto {
  @Rule(validateDocumentKind)
  kind: DocumentKindValue;

  @Rule(validateImageContentType)
  contentType: string;
}
