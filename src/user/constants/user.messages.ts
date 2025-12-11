export const USER_MESSAGES = {
  AUTH: {
    LOGOUT_SUCCESSFUL: 'Logged out successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    INVALID_TOKEN: 'Invalid token',
    INVALID_TOKEN_TYPE: 'Invalid token type',
    TOKEN_REFRESH_FAILED: 'Token refresh failed',
    TOKEN_EXPIRED: 'Refresh token has expired. Please login again.',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    ACCESS_DENIED: `You don't have permission to access this resource.`,
  },
  USER: {
    CREATED: 'User created successfully',
    NOT_FOUND: 'User not found',
    USER_NOT_FOUND_VERIFY_OTP: 'User not found. Please verify OTP first.',
    DELETED: 'User deleted successfully',
    FETCHED: 'User fetched successfully',
    LIST_FETCHED: 'Users fetched successfully',
    FAILED_TO_UPDATE: 'Failed to update user',
    PHONE_NUMBER_MISMATCH: 'Phone number mismatch',
    PHONE_NOT_VERIFIED:
      'Phone number is not verified. Please verify OTP first.',
    EMAIL_ALREADY_REGISTERED:
      'Email address is already registered with another user.',
    ALREADY_EXISTS: 'User exists, please login',
    ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
    ACCOUNT_INACTIVE: 'Your account is inactive. Please contact support.',
  },
  OTP: {
    SENT: 'OTP sent successfully',
    RESENT: 'OTP resent successfully',
    INVALID: 'Invalid OTP',
    INVALID_OR_EXPIRED: 'Invalid OTP code or OTP has expired',
    NO_VALID_OTP: 'No valid OTP found. Please request a new OTP.',
    EXPIRED: 'OTP has expired. Please request a new OTP.',
    ALREADY_USED: 'OTP has already been used. Please request a new OTP.',
    TOO_MANY_ATTEMPTS: 'Too many failed attempts. Please request a new OTP.',
    VALIDATED: 'OTP validated successfully',
    VALIDATED_NEW_USER: (role: string) =>
      `OTP validated successfully. User created with ${role} role.`,
    RATE_LIMITED: 'Please wait before requesting another code',
    MAX_ATTEMPTS:
      'Maximum OTP attempts exceeded. Please contact support for assistance',
    VERIFIED: 'OTP verified successfully',
    CLEANUP_COMPLETED: 'OTP cleanup completed successfully',
    INVALID_ROLE: 'Only USER and AGENT roles are allowed for registration',
  },
  OWNER: {
    CREATED: 'Owner account created successfully',
    UNAUTHORIZED: 'User is not authorized to create OWNER account.',
  },
  CHANNEL_PARTNER: {
    CREATED: 'Channel partner account created successfully',
    UNAUTHORIZED: 'User is not authorized to create CHANNEL_PARTNER account.',
    INVALID_CODE: 'Invalid channel partner code. Please provide a valid code.',
  },
  END_USER: {
    CREATED: 'End user account created successfully',
    UNAUTHORIZED: 'User is not authorized to create END_USER account.',
  },
  ERROR: {
    SOMETHING_WENT_WRONG: 'Something went wrong',
  },
} as const;
