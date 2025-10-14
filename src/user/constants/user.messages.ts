export const USER_MESSAGES = {
  AUTH: {
    LOGOUT_SUCCESSFUL: 'Logged out successfully',
    TOKEN_REFRESHED: 'Token refreshed successfully',
    INVALID_TOKEN: 'Invalid token',
    ACCESS_DENIED: `You don't have permission to access this resource.`,
  },
  USER: {
    CREATED: 'User created successfully',
    NOT_FOUND: 'User not found',
    DELETED: 'User deleted successfully',
    FETCHED: 'User fetched successfully',
    LIST_FETCHED: 'Users fetched successfully',
  },
  OTP: {
    SENT: 'OTP sent successfully',
    INVALID: 'Invalid OTP code or OTP has expired',
    RATE_LIMITED: 'Please wait before requesting another code',
    MAX_ATTEMPTS:
      'Maximum OTP attempts exceeded. Please contact support for assistance',
    VERIFIED: 'OTP verified successfully',
    CLEANUP_COMPLETED: 'OTP cleanup completed successfully',
    INVALID_ROLE: 'Only USER and AGENT roles are allowed for registration',
  },
  ERROR: {
    SOMETHING_WENT_WRONG: 'Something went wrong',
  },
} as const;
