import { type ConflictMap } from "@/types";

export const reverseConflicts = (conflictMap: ConflictMap): ConflictMap => {
  const reversedMap: ConflictMap = {};

  for (const [filter, conflicts] of Object.entries(conflictMap)) {
    for (const conflict of conflicts) {
      reversedMap[conflict] = reversedMap[conflict] || [];
      if (!reversedMap[conflict].includes(filter)) {
        reversedMap[conflict].push(filter);
      }
      reversedMap[filter] = reversedMap[filter] || [];
      if (!reversedMap[filter].includes(conflict)) {
        reversedMap[filter].push(conflict);
      }
    }
  }

  return reversedMap;
};
