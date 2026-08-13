const SendResponse = (res, statusCode, message, data = null, meta = null) => {
  if (!res || typeof res.status !== 'function') {
    console.error('Invalid res object passed to sendResponse');
    return;
  }
  const response = {
    success: statusCode >= 200 && statusCode <= 400,
    message,
    ...(data !== null && { data }),
    ...(meta && { meta }),
  };
  return res.status(statusCode).json(response);
};

// ===============================================
// 2xx SUCCESS
// ===============================================
// Success (200)
const success = (res, message = "Success", data = null, meta = null) =>
  SendResponse(res, 200, message, data, meta);
// // Created (201)
const created = (res, message = "Created", data = null, meta = null) =>
  SendResponse(res, 201, message, data, meta);
// Request Accepted
const accepted = (res, message = "Request accepted", data = null) =>
  SendResponse(res, 202, message, data);
// No Content Returned (204)
const noContent = (res, message = "No content") =>
  SendResponse(res, 204, message); // No body returned

// ===============================================
// 4xx CLIENT ERRORS
// ===============================================
// Bad Request (400)
const badRequest = (res, message = "Bad Request", errors = null) =>
  SendResponse(res, 400, message, null, errors ? { errors } : null);
// Unauthorized (401)
const unauthorized = (res, message = "Unauthorized") =>
  SendResponse(res, 401, message);
// Forbidden
const forbidden = (res, message = "Forbidden") =>
  SendResponse(res, 403, message);

// // Not Found (404)
const notFound = (res, message = "Not Found") =>
  SendResponse(res, 404, message);
// Conflict like user exist or email
const conflict = (res, message = "Conflict", errors = null) =>
  SendResponse(res, 409, message, null, errors ? { errors } : null);
// To Many Requests
const tooManyRequests = (
  res,
  message = "Too many requests",
  retryAfter = null
) => {
  const meta = retryAfter ? { retryAfter } : null;
  return SendResponse(res, 429, message, null, meta);
};

// ===============================================
// 5xx SERVER ERRORS
// ===============================================
// Server Error (500)
const serverError = (res, message = "Server Error", error = null) => {
  console.error("[Server Error]", error);
  return SendResponse(res, 500, message);
};
// Bad Gateway
const badGateway = (res, message = "Bad Gateway") =>
  SendResponse(res, 502, message);
// Service Unavailable
const serviceUnavailable = (
  res,
  message = "Service Unavailable",
  retryAfter = null
) => {
  const meta = retryAfter ? { retryAfter } : null;
  return SendResponse(res, 503, message, null, meta);
};

// ===============================================
// PAGINATION HELPER
// ===============================================

const paginatedSuccess = (res, message, doc = [], pagination = {}) => {
  const {
    page = 1,
    limit = 10,
    totalDocs = 0,
    totalPages = 1,
    hasNextPage = false,
    hasPreviousPage = false,
  } = pagination;

  const meta = {
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalDocs: Number(totalDocs),
      totalPages: Number(totalPages),
      hasNextPage,
      hasPreviousPage,
    },
  };
  return success(res, message, doc, meta);
};

export {
  // 2xx
  success,
  created,
  noContent,

  // 4xx
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  tooManyRequests,

  // 5xx
  serverError,
  badGateway,
  serviceUnavailable,

  // Paginated helper
  paginatedSuccess,
};
