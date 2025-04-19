import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Modal,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  PanResponder,
  Platform,
  BackHandler,
} from 'react-native';
import type { ActionSheetProps, ActionSheetRef } from './types';

// Constants
const SCREEN_HEIGHT = Dimensions.get('window').height;
const DEFAULT_ANIMATION_DURATION = 300;

// Counter for generating unique z-indices
let sheetZIndexCounter = 99999;

// Simple ActionSheet component
const ActionSheet = forwardRef<ActionSheetRef, ActionSheetProps>(
  (props, ref) => {
    // Separate unused props with rest operator
    const {
      children,
      containerStyle,
      headerStyle,
      contentContainerStyle,
      indicatorStyle,
      indicatorColor = '#DDDDDD',
      gestureEnabled = true,
      closeOnPressBack = true,
      closeOnTouchBackdrop = true,
      useBottomSafeAreaPadding = true,
      overdrawColor = 'rgba(0, 0, 0, 0.5)',
      statusBarTranslucent = true,
      openAnimationDuration = DEFAULT_ANIMATION_DURATION,
      closeAnimationDuration = DEFAULT_ANIMATION_DURATION,
      ExtraOverlayComponent,
      onOpen,
      onClose,
      isModal = true, // Default to using Modal component
    } = props;

    // State
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Generate a unique z-index for this sheet instance to ensure proper stacking
    const sheetZIndex = useRef(sheetZIndexCounter++).current;

    // Animation values
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    // Track if the sheet is being dragged
    const isDragging = useRef(false);
    const initialDragY = useRef(0);

    // Close the sheet
    const close = useCallback(() => {
      if (!isVisible || isClosing) return;

      setIsClosing(true);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: closeAnimationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: closeAnimationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
        setIsClosing(false);
        onClose?.();
      });
    }, [
      isVisible,
      isClosing,
      translateY,
      backdropOpacity,
      closeAnimationDuration,
      onClose,
    ]);

    // Handle back button press on Android
    React.useEffect(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (isVisible && closeOnPressBack) {
            close();
            return true;
          }
          return false;
        }
      );

      return () => backHandler.remove();
    }, [isVisible, closeOnPressBack, close]);

    // Open the sheet
    const open = () => {
      if (isVisible || isClosing) return;

      setIsVisible(true);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: openAnimationDuration,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: openAnimationDuration,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onOpen?.();
      });
    };

    // Check if sheet is open
    const isOpen = () => isVisible && !isClosing;

    // Handle snap points
    const snapToIndex = (index: number) => {
      // This is a simplified implementation
      // In a real component, this would handle snapping to different heights
      if (index === 0) {
        // Fully open
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      } else {
        // Fully closed
        close();
      }
    };

    // Configure pan responder for gesture handling
    const panResponder = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => gestureEnabled,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureEnabled && gestureState.dy > 0;
        },
        onPanResponderGrant: (_, gestureState) => {
          isDragging.current = true;
          initialDragY.current = gestureState.y0;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          isDragging.current = false;

          // If dragged down far enough, close the sheet
          if (gestureState.dy > SCREEN_HEIGHT * 0.2 || gestureState.vy > 0.5) {
            close();
          } else {
            // Otherwise, snap back to open position
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      open,
      close,
      isOpen,
      snapToIndex,
    }));

    // If not visible, don't render anything
    if (!isVisible) return null;

    // The sheet content (used in both modal and non-modal versions)
    const sheetContent = (
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
            zIndex: sheetZIndex, // Use consistent z-index across different render methods
          },
          containerStyle,
        ]}
        {...(gestureEnabled ? panResponder.panHandlers : {})}
      >
        {/* Sheet header / drag indicator */}
        <View style={[styles.header, headerStyle]}>
          <View
            style={[
              styles.indicator,
              { backgroundColor: indicatorColor },
              indicatorStyle,
            ]}
          />
        </View>

        {/* Sheet content */}
        <View style={[styles.content, contentContainerStyle]}>{children}</View>

        {/* Safe area padding for iOS */}
        {useBottomSafeAreaPadding && Platform.OS === 'ios' && (
          <View style={styles.safeAreaPadding} />
        )}
      </Animated.View>
    );

    // Conditional rendering based on isModal
    if (isModal) {
      // Render with React Native's Modal component
      return (
        <Modal
          transparent
          visible={isVisible}
          animationType="none"
          onRequestClose={close}
          statusBarTranslucent={statusBarTranslucent}
          // On iOS, this is critical for nested modals
          presentationStyle={
            Platform.OS === 'ios' ? 'overFullScreen' : undefined
          }
          hardwareAccelerated={true}
        >
          {/* Backdrop */}
          <TouchableWithoutFeedback
            onPress={closeOnTouchBackdrop ? close : undefined}
          >
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: backdropOpacity, backgroundColor: overdrawColor },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Extra overlay component if provided */}
          {ExtraOverlayComponent && <ExtraOverlayComponent />}

          {/* Sheet content */}
          {sheetContent}
        </Modal>
      );
    } else {
      // Direct rendering without Modal component (for nested scenarios)
      return (
        <View
          style={[
            styles.directContainer,
            { zIndex: sheetZIndex + 10 }, // Ensure this layer is above any previously rendered sheets
          ]}
        >
          {/* Backdrop */}
          <TouchableWithoutFeedback
            onPress={closeOnTouchBackdrop ? close : undefined}
          >
            <Animated.View
              style={[
                styles.backdrop,
                { opacity: backdropOpacity, backgroundColor: overdrawColor },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Extra overlay component if provided */}
          {ExtraOverlayComponent && <ExtraOverlayComponent />}

          {/* Sheet content */}
          {sheetContent}
        </View>
      );
    }
  }
);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  directContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  header: {
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 40,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
  },
  content: {
    padding: 15,
  },
  safeAreaPadding: {
    height: 34, // Approximate safe area padding for bottom
  },
});

export default ActionSheet;
