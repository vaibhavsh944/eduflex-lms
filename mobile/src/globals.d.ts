declare module '@react-native-async-storage/async-storage' {
  import { NativeModules } from 'react-native';
  export interface AsyncStorageStatic {
    getItem(key: string, callback?: (error?: Error, result?: string) => void): Promise<string | null>;
    setItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
    removeItem(key: string, callback?: (error?: Error) => void): Promise<void>;
    mergeItem(key: string, value: string, callback?: (error?: Error) => void): Promise<void>;
    clear(callback?: (error?: Error) => void): Promise<void>;
    getAllKeys(callback?: (error?: Error, keys?: string[]) => void): Promise<string[]>;
    multiGet(keys: string[], callback?: (errors?: Error[], result?: [string, string | null][]) => void): Promise<[string, string | null][]>;
    multiSet(keyValuePairs: [string, string][], callback?: (errors?: Error[]) => void): Promise<void>;
    multiRemove(keys: string[], callback?: (errors?: Error[]) => void): Promise<void>;
    multiMerge(keyValuePairs: [string, string][], callback?: (errors?: Error[]) => void): Promise<void>;
    flushGetRequests(): void;
  }
  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process;
