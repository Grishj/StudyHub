// src/utils/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Type-safe wrapper for AsyncStorage.multiSet
 * Filters out null/undefined values automatically
 */
export const safeMultiSet = async (pairs: [string, string][]) => {
  try {
    // Filter out any pairs with empty strings as well
    const validPairs = pairs.filter(([_, value]) => value && value.length > 0);
    
    if (validPairs.length === 0) {
      console.warn("safeMultiSet: No valid pairs to store");
      return;
    }
    
    await AsyncStorage.multiSet(validPairs);
  } catch (error) {
    console.error("AsyncStorage multiSet failed:", error);
    throw error;
  }
};

/**
 * Type-safe wrapper for AsyncStorage.multiRemove
 */
export const safeMultiRemove = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error("AsyncStorage multiRemove failed:", error);
    throw error;
  }
};

/**
 * Helper to prepare data for storage, handling null/undefined values
 */
export const prepareStoragePairs = (
  data: Record<string, any>
): [string, string][] => {
  const pairs: [string, string][] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      continue;
    }
    
    let stringValue: string;
    
    if (typeof value === 'string') {
      stringValue = value;
    } else if (typeof value === 'object') {
      try {
        stringValue = JSON.stringify(value);
      } catch {
        console.warn(`Failed to stringify value for key: ${key}`);
        continue;
      }
    } else {
      stringValue = String(value);
    }
    
    if (stringValue) {
      pairs.push([key, stringValue]);
    }
  }
  
  return pairs;
};