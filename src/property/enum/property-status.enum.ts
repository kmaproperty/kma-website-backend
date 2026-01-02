export enum PropertyStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  DEACTIVATED = 'deactivated',
}

export const PropertyStatusLabels = {
  [PropertyStatus.DRAFT]: 'Draft',
  [PropertyStatus.PENDING_REVIEW]: 'Pending Review',
  [PropertyStatus.ACTIVE]: 'Active',
  [PropertyStatus.REJECTED]: 'Rejected',
  [PropertyStatus.DEACTIVATED]: 'Deactivated',
};

export enum DeactivationReason {
  SOLD = 'sold',
  RENTED = 'rented',
  HOLD = 'hold',
  OWNER_REQUEST = 'owner_request',
}

export const DeactivationReasonLabels = {
  [DeactivationReason.SOLD]: 'Sold',
  [DeactivationReason.RENTED]: 'Rented',
  [DeactivationReason.HOLD]: 'Hold',
  [DeactivationReason.OWNER_REQUEST]: 'Owner Request',
};

export enum VerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
}

export const VerificationStatusLabels = {
  [VerificationStatus.VERIFIED]: 'Verified',
  [VerificationStatus.UNVERIFIED]: 'Unverified',
  [VerificationStatus.PENDING]: 'Pending',
};

