import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Original function
  multiply(a: number, b: number): number;
}

// Get the native module
const NativeModule = TurboModuleRegistry.getEnforcing<Spec>(
  'ActionsSheetReplacement'
);

export default NativeModule;
