import type {
  BusinessNewsReport,
  BusinessProfile,
  NewsArticle,
  Product,
  Review,
  User,
} from "../../generated/prisma";

/** Matches `UserRole` in Prisma; use for app-level typing without importing the enum. */
export type UserRole = "BUSINESS" | "CUSTOMER";

/** Product with its owning business (e.g. marketplace listing). */
export type ProductWithBusiness = Product & {
  business: BusinessProfile;
};

/** Review with the customer who wrote it. */
export type ReviewWithAuthor = Review & {
  customer: Pick<User, "id" | "name" | "email">;
};

/** Persisted report plus resolved source articles (IDs also live on `BusinessNewsReport.sourceArticleIds` as JSON). */
export type NewsReportWithSources = BusinessNewsReport & {
  sources: NewsArticle[];
};
