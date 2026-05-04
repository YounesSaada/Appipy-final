/**
 * Verification Store
 * Dedicated KV store wrapper for verification data operations
 */

import * as kv from "./kv_store.tsx";

export type VerificationStatus = "pending" | "approved" | "rejected" | "needs_more_info" | "not_submitted";

export interface EarnerVerificationData {
  userId: string;
  userType: "earner";
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  documents: {
    governmentId: string;
    proofOfAddress: string;
  };
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
}

export interface AdvertiserVerificationData {
  userId: string;
  userType: "advertiser";
  businessAddress: string;
  taxId: string;
  websiteUrl: string | null;
  documents: {
    businessLicense: string;
    taxDocument: string;
    proofOfAddress: string;
    ownershipDocument: string;
  };
  status: VerificationStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
}

export type VerificationData = EarnerVerificationData | AdvertiserVerificationData;

/**
 * Save earner verification data
 */
export async function saveEarnerVerification(
  userId: string,
  data: Omit<EarnerVerificationData, "userId" | "userType">
): Promise<void> {
  const verificationData: EarnerVerificationData = {
    userId,
    userType: "earner",
    ...data,
  };
  
  await kv.set(`verification:earner:${userId}`, verificationData);
}

/**
 * Save advertiser verification data
 */
export async function saveAdvertiserVerification(
  userId: string,
  data: Omit<AdvertiserVerificationData, "userId" | "userType">
): Promise<void> {
  const verificationData: AdvertiserVerificationData = {
    userId,
    userType: "advertiser",
    ...data,
  };
  
  await kv.set(`verification:advertiser:${userId}`, verificationData);
}

/**
 * Get earner verification by user ID
 */
export async function getEarnerVerification(
  userId: string
): Promise<EarnerVerificationData | null> {
  return await kv.get(`verification:earner:${userId}`) as EarnerVerificationData | null;
}

/**
 * Get advertiser verification by user ID
 */
export async function getAdvertiserVerification(
  userId: string
): Promise<AdvertiserVerificationData | null> {
  return await kv.get(`verification:advertiser:${userId}`) as AdvertiserVerificationData | null;
}

/**
 * Get verification data for any user type
 */
export async function getVerification(
  userId: string,
  userType: "earner" | "advertiser"
): Promise<VerificationData | null> {
  if (userType === "earner") {
    return await getEarnerVerification(userId);
  } else {
    return await getAdvertiserVerification(userId);
  }
}

/**
 * Update verification status
 */
export async function updateVerificationStatus(
  userId: string,
  userType: "earner" | "advertiser",
  status: VerificationStatus,
  reviewedBy?: string,
  reviewNotes?: string
): Promise<void> {
  const existingData = await getVerification(userId, userType);
  
  if (!existingData) {
    throw new Error(`Verification data not found for user ${userId}`);
  }

  const updatedData = {
    ...existingData,
    status,
    reviewedAt: new Date().toISOString(),
    reviewedBy: reviewedBy || null,
    reviewNotes: reviewNotes || null,
  };

  await kv.set(`verification:${userType}:${userId}`, updatedData);
}

/**
 * Get all pending earner verifications
 */
export async function getPendingEarnerVerifications(): Promise<EarnerVerificationData[]> {
  const allEarnerVerifications = await kv.getByPrefix("verification:earner:") as EarnerVerificationData[];
  return allEarnerVerifications.filter(v => v.status === "pending");
}

/**
 * Get all pending advertiser verifications
 */
export async function getPendingAdvertiserVerifications(): Promise<AdvertiserVerificationData[]> {
  const allAdvertiserVerifications = await kv.getByPrefix("verification:advertiser:") as AdvertiserVerificationData[];
  return allAdvertiserVerifications.filter(v => v.status === "pending");
}

/**
 * Get all pending verifications (both types)
 */
export async function getAllPendingVerifications(): Promise<VerificationData[]> {
  const earners = await getPendingEarnerVerifications();
  const advertisers = await getPendingAdvertiserVerifications();
  return [...earners, ...advertisers];
}

/**
 * Get all verifications by status
 */
export async function getVerificationsByStatus(
  userType: "earner" | "advertiser",
  status: VerificationStatus
): Promise<VerificationData[]> {
  const allVerifications = await kv.getByPrefix(`verification:${userType}:`) as VerificationData[];
  return allVerifications.filter(v => v.status === status);
}

/**
 * Delete verification data
 */
export async function deleteVerification(
  userId: string,
  userType: "earner" | "advertiser"
): Promise<void> {
  await kv.del(`verification:${userType}:${userId}`);
}

/**
 * Check if user has submitted verification
 */
export async function hasSubmittedVerification(
  userId: string,
  userType: "earner" | "advertiser"
): Promise<boolean> {
  const data = await getVerification(userId, userType);
  return data !== null;
}

/**
 * Check if user verification is approved
 */
export async function isVerificationApproved(
  userId: string,
  userType: "earner" | "advertiser"
): Promise<boolean> {
  const data = await getVerification(userId, userType);
  return data?.status === "approved";
}
