import { strict as assert } from 'node:assert';

interface ResultResponse {
  readonly result: { readonly case: unknown };
}

type SuccessResponse<Response extends ResultResponse> = Response & {
  readonly result: Extract<Response['result'], { readonly case: 'success' }>;
};

export function assertSuccess<Response extends ResultResponse>(
  response: Response,
): asserts response is SuccessResponse<Response> {
  assert.equal(response.result.case, 'success');
}
