"use server";

import type { Prisma } from "../../../generated/prisma";
import { db } from "~/server/db";

/** Fields accepted by `upsertBusinessProfile` (maps to `BusinessProfile` columns). */
export type UpsertBusinessProfileData = {
  companyName: string;
  industry: string;
  suppliers: Prisma.JsonValue;
  mission: string;
  description: string;
};

/**
 * Loads the business profile for a user, or `null` if none exists.
 */
export async function getBusinessProfile(userId: string) {
  return db.businessProfile.findUnique({
    where: { userId },
  });
}

/**
 * Creates or updates the `BusinessProfile` for this user.
 *
 * **Happy path:** First-time create or update of existing row for `userId`.
 * **Error cases:** Prisma validation / constraint errors propagate.
 */
export async function upsertBusinessProfile(
  userId: string,
  data: UpsertBusinessProfileData,
) {
  return db.businessProfile.upsert({
    where: { userId },
    create: {
      userId,
      companyName: data.companyName,
      industry: data.industry,
      suppliers: data.suppliers as Prisma.InputJsonValue,
      mission: data.mission,
      description: data.description,
    },
    update: {
      companyName: data.companyName,
      industry: data.industry,
      suppliers: data.suppliers as Prisma.InputJsonValue,
      mission: data.mission,
      description: data.description,
    },
  });
}

/**
 * Lists saved news reports for a business profile, newest first.
 */
export async function getBusinessReports(businessId: string) {
  return db.businessNewsReport.findMany({
    where: { businessId },
    orderBy: { createdAt: "desc" },
  });
}
