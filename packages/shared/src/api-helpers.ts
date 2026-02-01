import type { ApiResponse } from './types';
import { ERROR_CODES } from './constants';

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: ApiResponse['meta']
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta && { meta }),
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  notFound: (resource: string) =>
    createErrorResponse(
      ERROR_CODES.NOT_FOUND,
      `${resource} not found`
    ),

  unauthorized: (message = 'Authentication required') =>
    createErrorResponse(ERROR_CODES.UNAUTHORIZED, message),

  forbidden: (message = 'You do not have permission to perform this action') =>
    createErrorResponse(ERROR_CODES.FORBIDDEN, message),

  invalidInput: (message: string) =>
    createErrorResponse(ERROR_CODES.INVALID_INPUT, message),

  databaseError: (message = 'Database operation failed') =>
    createErrorResponse(ERROR_CODES.DATABASE_ERROR, message),

  internalError: (message = 'An unexpected error occurred') =>
    createErrorResponse(ERROR_CODES.INTERNAL_ERROR, message),
} as const;

/**
 * Create a JSON response with appropriate status code
 */
export function jsonResponse<T>(
  response: ApiResponse<T>,
  status: number = 200
): Response {
  return Response.json(response, { status });
}
