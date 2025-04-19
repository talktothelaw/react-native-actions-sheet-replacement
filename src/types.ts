import type { ReactNode, RefObject } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ActionSheetRef {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
  snapToIndex: (index: number) => void;
}

export interface SafeAreaInsets {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export interface SheetInstance {
  id: string;
  ref: RefObject<ActionSheetRef | null>;
  props: any;
  isOpen: boolean;
}

export interface ActionSheetProps {
  /**
   * Id of the ActionSheet. If not provided, sheetId will be used.
   */
  id?: string;

  /**
   * Children to render inside the ActionSheet
   */
  children?: ReactNode;

  /**
   * Unique id for the sheet when used with SheetManager.
   */
  sheetId?: string;

  /**
   * Optional payload/data to pass with the sheet
   */
  payload?: any;

  /**
   * Use React Native's Modal component (true) or direct rendering (false)
   */
  isModal?: boolean;

  /**
   * Style of the container that wraps the ActionSheet
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * Style of the header
   */
  headerStyle?: StyleProp<ViewStyle>;

  /**
   * Style of the content container
   */
  contentContainerStyle?: StyleProp<ViewStyle>;

  /**
   * Style of the indicator
   */
  indicatorStyle?: StyleProp<ViewStyle>;

  /**
   * Color of the indicator
   */
  indicatorColor?: string;

  /**
   * Whether gestures are enabled
   */
  gestureEnabled?: boolean;

  /**
   * Whether pressing the Android back button should close the ActionSheet
   */
  closeOnPressBack?: boolean;

  /**
   * Whether touching the backdrop should close the ActionSheet
   */
  closeOnTouchBackdrop?: boolean;

  /**
   * Whether to use safe area padding on the bottom (for iOS)
   */
  useBottomSafeAreaPadding?: boolean;

  /**
   * Optional safe area insets
   */
  safeAreaInsets?: SafeAreaInsets;

  /**
   * Whether the ActionSheet can be closed
   */
  closable?: boolean;

  /**
   * Color of the backdrop overlay
   */
  overdrawColor?: string;

  /**
   * Duration of open animation in ms
   */
  openAnimationDuration?: number;

  /**
   * Duration of close animation in ms
   */
  closeAnimationDuration?: number;

  /**
   * Whether overdraw is enabled
   */
  overdrawEnabled?: boolean;

  /**
   * Whether to use default overlay
   */
  defaultOverlay?: boolean;

  /**
   * Whether StatusBar is translucent
   */
  statusBarTranslucent?: boolean;

  /**
   * Whether to draw under StatusBar
   */
  drawUnderStatusBar?: boolean;

  /**
   * Elevation of the ActionSheet (Android)
   */
  elevation?: number;

  /**
   * Whether header should always be visible
   */
  headerAlwaysVisible?: boolean;

  /**
   * Snap points for the ActionSheet
   */
  snapPoints?: number[];

  /**
   * Custom overlay component
   */
  ExtraOverlayComponent?: React.ComponentType<any> | null;

  /**
   * Callback when ActionSheet is opened
   */
  onOpen?: () => void;

  /**
   * Callback when ActionSheet is closed
   */
  onClose?: () => void;
}

export interface SheetProviderProps {
  children: ReactNode;
}

export interface Sheets {
  [key: string]: {
    component: React.ComponentType<any>;
    props?: any;
  };
}

export interface SheetManagerContextType {
  registerSheet: (id: string, component: React.ComponentType<any>) => void;
  unregisterSheet: (id: string) => void;
  showSheet: (id: string, props?: any) => void;
  hideSheet: (id: string) => void;
}
