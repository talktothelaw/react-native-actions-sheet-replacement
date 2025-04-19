import React, {
  createContext,
  useContext,
  useRef,
  useState,
  type ReactNode,
  useCallback,
} from 'react';
import type { ActionSheetRef } from './types';

// Global registry of sheets
const registeredSheets: Record<string, React.ComponentType<any>> = {};

// Global references to store context functions
let contextSheetOpener: ((id: string, props?: any) => Promise<any>) | null =
  null;
let contextSheetCloser: ((id: string, result?: any) => void) | null = null;

// Type for the sheet instance
interface SheetInstance {
  id: string;
  ref: React.RefObject<ActionSheetRef | null>;
  props: any;
  isOpen: boolean;
}

// Context type definition
interface SheetManagerContextType {
  sheets: Record<string, SheetInstance>;
  registerSheetInstance: (
    id: string,
    ref: React.RefObject<ActionSheetRef | null>
  ) => void;
  unregisterSheetInstance: (id: string) => void;
  updateSheetProps: (id: string, props: any) => void;
  openSheet: (id: string, props?: any) => Promise<any>;
  closeSheet: (id: string, result?: any) => void;
}

// Create context with default values
const SheetManagerContext = createContext<SheetManagerContextType>({
  sheets: {},
  registerSheetInstance: () => {},
  unregisterSheetInstance: () => {},
  updateSheetProps: () => {},
  openSheet: () => Promise.resolve({}),
  closeSheet: () => {},
});

// Individual sheet wrapper component to avoid hook conditionals
const SheetWrapper = React.memo(
  ({
    id,
    Component,
    sheet,
    registerSheetInstance,
    unregisterSheetInstance,
  }: {
    id: string;
    Component: React.ComponentType<any>;
    sheet?: SheetInstance;
    registerSheetInstance: (
      id: string,
      ref: React.RefObject<ActionSheetRef | null>
    ) => void;
    unregisterSheetInstance: (id: string) => void;
  }) => {
    // Always create a ref
    const sheetRef = useRef<ActionSheetRef | null>(null);

    // Register on mount, unregister on unmount
    React.useEffect(() => {
      registerSheetInstance(id, sheetRef);
      return () => {
        unregisterSheetInstance(id);
      };
    }, [id, registerSheetInstance, unregisterSheetInstance]);

    // If we have an existing sheet instance, use its props
    const props = sheet?.props || {};

    return <Component ref={sheetRef} {...props} sheetId={id} />;
  }
);

// Provider component for SheetManager
export function SheetProvider({ children }: { children: ReactNode }) {
  // State to track all sheet instances
  const [sheets, setSheets] = useState<Record<string, SheetInstance>>({});

  // Map to store promises for each sheet
  const sheetPromises = useRef<
    Record<
      string,
      { resolve: (value: any) => void; reject: (reason?: any) => void }
    >
  >({}).current;

  // Memoize callback functions to prevent recreating them on each render
  const registerSheetInstance = useCallback(
    (id: string, ref: React.RefObject<ActionSheetRef | null>) => {
      setSheets((prev) => {
        // Skip if the same ref is already registered
        if (prev[id]?.ref === ref) return prev;

        const initialState: SheetInstance = {
          id,
          ref,
          props: prev[id]?.props || {},
          isOpen: prev[id]?.isOpen || false,
        };
        const newSheets: Record<string, SheetInstance> = { ...prev };
        newSheets[id] = initialState;
        return newSheets;
      });
    },
    []
  );

  const unregisterSheetInstance = useCallback((id: string) => {
    setSheets((prev) => {
      const newSheets = { ...prev };
      delete newSheets[id];
      return newSheets;
    });
  }, []);

  const updateSheetProps = useCallback((id: string, props: any) => {
    setSheets((prev) => {
      // Only update if the sheet exists
      if (!prev[id]) return prev;

      const newSheets = { ...prev };
      const existingSheet = prev[id]; // Use prev[id] which we already checked exists
      newSheets[id] = {
        id, // Explicit id to satisfy TypeScript
        ref: existingSheet.ref,
        isOpen: existingSheet.isOpen,
        props, // New props passed in
      };
      return newSheets;
    });
  }, []);

  // Open a sheet
  const openSheet = useCallback(
    (id: string, props?: any): Promise<any> => {
      return new Promise((resolve, reject) => {
        if (!sheets[id] && !registeredSheets[id]) {
          const errorMsg = `Sheet with id "${id}" is not registered.`;
          reject(errorMsg);
          return;
        }

        // Store the promise callbacks
        sheetPromises[id] = { resolve, reject };

        // Update props and open state
        setSheets((prev) => {
          const newSheets: Record<string, SheetInstance> = { ...prev };
          // If sheet exists, update it
          if (newSheets[id]) {
            const existingSheet = newSheets[id];
            const updatedSheet: SheetInstance = {
              id,
              ref: existingSheet.ref,
              props: props || {},
              isOpen: true,
            };
            newSheets[id] = updatedSheet;
          }
          // Otherwise create a placeholder until the ref is registered
          else if (registeredSheets[id]) {
            const newSheet: SheetInstance = {
              id,
              ref: React.createRef<ActionSheetRef | null>(),
              props: props || {},
              isOpen: true,
            };
            newSheets[id] = newSheet;
          }
          return newSheets;
        });

        // Wait a bit to ensure the component has time to render and register
        setTimeout(() => {
          try {
            // Get latest sheets state
            const currentSheet = sheets[id];
            if (currentSheet?.ref?.current) {
              currentSheet.ref.current.open();
            } else {
              // It's possible the ref isn't ready yet
              setTimeout(() => {
                const latestSheet = sheets[id];
                if (latestSheet?.ref?.current) {
                  latestSheet.ref.current.open();
                } else {
                  reject(`Failed to open sheet "${id}". Ref is not available.`);
                }
              }, 100);
            }
          } catch (error) {
            reject(error);
          }
        }, 50);
      });
    },
    [sheets, sheetPromises]
  );

  // Close a sheet
  const closeSheet = useCallback(
    (id: string, result?: any) => {
      if (!sheets[id]) {
        return;
      }

      try {
        // Close the sheet
        if (sheets[id]?.ref?.current) {
          sheets[id].ref.current.close();
        }

        // Update state
        setSheets((prev) => {
          const newSheets: Record<string, SheetInstance> = { ...prev };
          if (newSheets[id]) {
            const existingSheet = newSheets[id];
            const updatedSheet: SheetInstance = {
              id,
              ref: existingSheet.ref,
              props: existingSheet.props,
              isOpen: false,
            };
            newSheets[id] = updatedSheet;
          }
          return newSheets;
        });

        // Resolve the promise
        if (sheetPromises[id]) {
          sheetPromises[id].resolve(result);
          delete sheetPromises[id];
        }
      } catch (error) {
        if (sheetPromises[id]) {
          sheetPromises[id].reject(error);
          delete sheetPromises[id];
        }
      }
    },
    [sheets, sheetPromises]
  );

  // Set global references to these functions for use by static methods
  React.useEffect(() => {
    contextSheetOpener = openSheet;
    contextSheetCloser = closeSheet;

    return () => {
      contextSheetOpener = null;
      contextSheetCloser = null;
    };
  }, [openSheet, closeSheet]);

  // Context value - memoize to avoid unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      sheets,
      registerSheetInstance,
      unregisterSheetInstance,
      updateSheetProps,
      openSheet,
      closeSheet,
    }),
    [
      sheets,
      registerSheetInstance,
      unregisterSheetInstance,
      updateSheetProps,
      openSheet,
      closeSheet,
    ]
  );

  // Create stable sheet entries outside of render for registered sheets
  const sheetEntries = React.useMemo(() => {
    return Object.entries(registeredSheets).map(([id, Component]) => ({
      id,
      Component,
      sheet: sheets[id],
    }));
  }, [sheets]);

  return (
    <SheetManagerContext.Provider value={contextValue}>
      {children}

      {/* Render all registered sheets */}
      {sheetEntries.map(({ id, Component, sheet }) => (
        <React.Fragment key={id}>
          <SheetWrapper
            id={id}
            Component={Component}
            sheet={sheet}
            registerSheetInstance={registerSheetInstance}
            unregisterSheetInstance={unregisterSheetInstance}
          />
        </React.Fragment>
      ))}
    </SheetManagerContext.Provider>
  );
}

// Use SheetManager context hook
export function useSheetManager() {
  return useContext(SheetManagerContext);
}

// Static API for SheetManager
export const SheetManager = {
  // Register a sheet component
  register: (id: string, component: React.ComponentType<any>) => {
    registeredSheets[id] = component;
  },

  // Show a sheet - uses global reference instead of hooks
  show: (id: string, props?: any): Promise<any> => {
    if (!contextSheetOpener) {
      return Promise.reject('SheetProvider not initialized');
    }

    return contextSheetOpener(id, props);
  },

  // Hide a sheet - uses global reference instead of hooks
  hide: (id: string, result?: any) => {
    if (!contextSheetCloser) {
      return;
    }

    contextSheetCloser(id, result);
  },
};

// Alias for register for backward compatibility
export const registerSheet = SheetManager.register;
