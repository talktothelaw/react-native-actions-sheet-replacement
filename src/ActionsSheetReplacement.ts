export interface ActionSheetTurboSpec {
  // ActionSheet specific methods
  performSpringAnimation(callback: () => void): void;
  isAvailable: boolean;
  setGestureEnabled(enabled: boolean): void;
  snapToPosition(position: number, animated: boolean): void;
}
