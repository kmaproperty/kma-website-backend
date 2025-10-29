/**
 * Enum to track the completion step of property posting process
 * Step 1: Basic property details (listing type, category, location, BHK, etc.)
 * Step 2: Additional property details (pricing, amenities, etc.)
 * Step 3: Media and photos
 * Step 4: Review and publish
 * etc.
 */
export enum PropertyCompletionStep {
  STEP_1 = 1,  // Basic details completed
  STEP_2 = 2,  // Additional details completed
  STEP_3 = 3,  // Media/photos completed
  STEP_4 = 4,  // Review and ready to publish
  COMPLETED = 5, // All steps completed, property ready to publish
}

/**
 * Helper function to get step name
 */
export function getCompletionStepName(step: PropertyCompletionStep): string {
  const stepNames: Record<PropertyCompletionStep, string> = {
    [PropertyCompletionStep.STEP_1]: 'Basic Details',
    [PropertyCompletionStep.STEP_2]: 'Additional Details',
    [PropertyCompletionStep.STEP_3]: 'Media & Photos',
    [PropertyCompletionStep.STEP_4]: 'Review',
    [PropertyCompletionStep.COMPLETED]: 'Completed',
  };
  return stepNames[step] || 'Unknown';
}

