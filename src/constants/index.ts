import { Filter, Status } from "@suwatte/daisuke";

export enum TachiStatus {
  UNKNOWN = "UNKNOWN",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  LICENSED = "LICENSED",
  PUBLISHING_FINISHED = "PUBLISHING_FINISHED",
  CANCELLED = "CANCELLED",
  ON_HIATUS = "ON_HIATUS",
}

export function convertStatus(s: TachiStatus) {
  switch (s) {
    case TachiStatus.UNKNOWN:
      return Status.UNKNOWN;
    case TachiStatus.CANCELLED:
      return Status.CANCELLED;
    case TachiStatus.COMPLETED:
    case TachiStatus.PUBLISHING_FINISHED:
      return Status.COMPLETED;
    case TachiStatus.ONGOING:
      return Status.ONGOING;
    case TachiStatus.ON_HIATUS:
      return Status.HIATUS;
  }

  return Status.UNKNOWN;
}

export const FILTER_CACHE: Record<string, Filter[]> = {};
