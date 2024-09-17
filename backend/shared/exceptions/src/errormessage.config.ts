export const ERROR_MESSAGES = {
  // General errors
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred.',
  NOT_FOUND: 'Resource not found.',

  // Validation errors
  VALIDATION_FAILED: 'Validation failed.',

  // Custom errors
  USER_NOT_FOUND: 'User not found.',
  INVALID_CREDENTIALS: 'Invalid credentials provided.',

  //mongo errors
  MONGO_DUPLICATE_KEY: 'A record with this value already exists. Please use a unique value.',
  MONGO_DOCUMENT_VALIDATION: 'The provided data does not match the required format or schema.',
  MONGO_NETWORK_TIMEOUT: 'The request timed out due to network issues. Please try again later.',
  MONGO_UNAUTHORIZED: 'You are not authorized to perform this action.',
  MONGO_NOT_MASTER: 'This operation must be performed on the primary node.',
  MONGO_EXCEEDED_MEMORY_LIMIT: 'The operation exceeded the allowed memory limit. Please reduce the amount of data.',
  MONGO_KEY_TOO_LONG: 'The value for this field exceeds the maximum allowed length.',
  MONGO_CURSOR_NOT_FOUND: 'The requested cursor was not found. It may have expired or been closed.',
  MONGO_WRITE_CONFLICT: 'A write conflict occurred. Please try the operation again.',
  MONGO_GENERAL_ERROR: 'An unexpected database error occurred. Please contact support if this issue persists.',
  

  //http error codes
  400: 'Bad Request: The request could not be understood or was missing required parameters.',
  401: 'Unauthorized: Authentication is required to access this resource.',
  403: 'Forbidden: You do not have permission to access this resource.',
  404: 'Not Found: The requested resource could not be found.',
  405: 'Method Not Allowed: The request method is not supported for this resource.',
  406: 'Not Acceptable: The requested resource is not capable of generating content acceptable according to the Accept headers sent in the request.',
  408: 'Request Timeout: The server timed out waiting for the request.',
  409: 'Conflict: The request could not be completed due to a conflict with the current state of the resource.',
  410: 'Gone: The requested resource is no longer available and will not be available again.',
  411: 'Length Required: The request did not specify the length of its content, which is required by the resource.',
  412: 'Precondition Failed: One or more conditions in the request header fields evaluated to false when tested by the server.',
  413: 'Payload Too Large: The request is larger than the server is willing or able to process.',
  414: 'URI Too Long: The URI provided was too long for the server to process.',
  415: 'Unsupported Media Type: The request entity has a media type which the server or resource does not support.',
  416: 'Range Not Satisfiable: The server cannot provide the portion of the file requested.',
  417: 'Expectation Failed: The server could not meet the requirements of the Expect request-header field.',
  426: 'Upgrade Required: The client should switch to a different protocol.',
  500: 'Internal Server Error: The server encountered an unexpected condition that prevented it from fulfilling the request.',
  501: 'Not Implemented: The server does not support the functionality required to fulfill the request.',
  502: 'Bad Gateway: The server, while acting as a gateway or proxy, received an invalid response from the upstream server.',
  503: 'Service Unavailable: The server is currently unable to handle the request due to temporary overloading or maintenance.',
  504: 'Gateway Timeout: The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server.',
  505: 'HTTP Version Not Supported: The server does not support the HTTP protocol version that was used in the request.',

  // Authentication error 
  SESSION_EXPIRED :'Session has expired or is invalid.',
  REFRESH_EXPIRED :'Refresh token is required.',
  INVALID_ACCESSTOKEN:'Invalid access token.',
  INVALID_SESSION:'Invalid Session',
  USER_EXIST:'User with already exists for GST Number : ',
  USET_NOTFOUND:'User Not Fount',
  UNAUTTHORIZED_ACCESS:"You are unauthorized to access other's information"



};
