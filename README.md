# React Native ActionSheet Replacement

A cross-platform (Android & iOS) ActionSheet component with a robust and flexible API, native performance, and zero dependencies for React Native. Create anything you want inside an ActionSheet - from simple option menus to complex custom UIs.

**This is a drop-in replacement for [react-native-actions-sheet](https://github.com/ammarahm-ed/react-native-actions-sheet) by ammarahm-ed with additional features and improvements.**

![ActionSheet Demo](https://via.placeholder.com/600x400.png?text=ActionSheet+Demo)

## Features

- **Highly Customizable**: Style your sheets any way you want
- **SheetManager**: Show sheets from anywhere in your app without passing refs
- **Cross Platform**: Works on both iOS and Android with consistent behavior
- **Nested Sheets**: Support for opening sheets on top of other sheets
- **Memory Optimized**: Careful management of sheet instances and rendering
- **Typescript Support**: Complete type definitions for all components and APIs
- **Drop-in Replacement**: Compatible API with the original react-native-actions-sheet

## Installation

```sh
npm install react-native-actions-sheet-replacement
```

or using yarn:

```sh
yarn add react-native-actions-sheet-replacement
```

## Basic Usage

### Using `ActionSheet` with Refs

```jsx
import React, { useRef } from 'react';
import { View, Button, Text } from 'react-native';
import { ActionSheet } from 'react-native-actions-sheet-replacement';

export default function App() {
  // Create a ref for the ActionSheet
  const actionSheetRef = useRef(null);

  // Open the ActionSheet
  const openActionSheet = () => {
    actionSheetRef.current?.open();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open ActionSheet" onPress={openActionSheet} />

      <ActionSheet ref={actionSheetRef}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>ActionSheet Title</Text>
          <Text style={{ marginTop: 10 }}>This is a basic ActionSheet</Text>
          <Button 
            title="Close" 
            onPress={() => actionSheetRef.current?.close()} 
          />
        </View>
      </ActionSheet>
    </View>
  );
}
```

## Advanced Usage with SheetManager

The SheetManager allows you to show sheets from anywhere in your app without passing refs!

### Step 1: Wrap your app with SheetProvider

```jsx
import React from 'react';
import { SheetProvider } from 'react-native-actions-sheet-replacement';

export default function App() {
  return (
    <SheetProvider>
      {/* Your app content */}
    </SheetProvider>
  );
}
```

### Step 2: Define and Register Sheets

```jsx
import React, { forwardRef } from 'react';
import { View, Text, Button } from 'react-native';
import { ActionSheet, SheetManager, type ActionSheetRef } from 'react-native-actions-sheet-replacement';

// Define your sheet component
const MySheet = forwardRef((props, ref) => {
  const { sheetId, payload } = props;
  
  return (
    <ActionSheet ref={ref}>
      <View style={{ padding: 20 }}>
        <Text>Sheet Content</Text>
        {payload && (
          <Text>Payload: {JSON.stringify(payload)}</Text>
        )}
        <Button 
          title="Close" 
          onPress={() => SheetManager.hide(sheetId)} 
        />
      </View>
    </ActionSheet>
  );
});

// Register the sheet
SheetManager.register('mySheet', MySheet);
```

### Step 3: Show and Hide Sheets

```jsx
// Show a sheet with optional payload
SheetManager.show('mySheet', {
  payload: {
    data: 'Hello World!',
    timestamp: Date.now(),
  },
}).then(result => {
  console.log('Sheet closed with result:', result);
});

// Hide a sheet with optional result data
SheetManager.hide('mySheet', { success: true, data: 'Some result data' });
```

## Nested Sheets

You can open sheets on top of other sheets using the SheetManager. There are two ways to handle nested sheets:

### 1. Using Modal-Based Nesting (Default)

By default, each sheet uses React Native's Modal component, which works well for basic scenarios:

```jsx
const ParentSheet = forwardRef((props, ref) => {
  const { sheetId } = props;
  
  const openChildSheet = () => {
    SheetManager.show('childSheet', {
      payload: { parentId: sheetId }
    });
  };
  
  return (
    <ActionSheet ref={ref} sheetId={sheetId}>
      <View style={{ padding: 20 }}>
        <Text>Parent Sheet</Text>
        <Button title="Open Child Sheet" onPress={openChildSheet} />
        <Button 
          title="Close" 
          onPress={() => SheetManager.hide(sheetId)} 
        />
      </View>
    </ActionSheet>
  );
});
```

### 2. Using Direct Rendering for Complex Nesting

For more complex nesting scenarios, especially on iOS, you can disable the Modal component and use direct rendering:

```jsx
const ParentSheet = forwardRef((props, ref) => {
  const { sheetId } = props;
  
  const openChildSheet = () => {
    SheetManager.show('childSheet', {
      payload: { parentId: sheetId }
    });
  };
  
  return (
    <ActionSheet ref={ref} sheetId={sheetId} isModal={false}>
      <View style={{ padding: 20 }}>
        <Text>Parent Sheet</Text>
        <Button title="Open Child Sheet" onPress={openChildSheet} />
        <Button 
          title="Close" 
          onPress={() => SheetManager.hide(sheetId)} 
        />
      </View>
    </ActionSheet>
  );
});

const ChildSheet = forwardRef((props, ref) => {
  const { sheetId } = props;
  
  return (
    <ActionSheet ref={ref} sheetId={sheetId} isModal={false}>
      <View style={{ padding: 20 }}>
        <Text>Child Sheet</Text>
        <Button 
          title="Close" 
          onPress={() => SheetManager.hide(sheetId)} 
        />
      </View>
    </ActionSheet>
  );
});
```

The `isModal={false}` prop bypasses React Native's Modal component and uses direct rendering, which can provide better stacking behavior for complex nested sheets.

## ActionSheet Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | Optional identifier for the sheet |
| containerStyle | ViewStyle | - | Style for the sheet container |
| headerStyle | ViewStyle | - | Style for the header |
| indicatorStyle | ViewStyle | - | Style for the drag indicator |
| indicatorColor | string | '#DDDDDD' | Color of the drag indicator |
| gestureEnabled | boolean | true | Enable drag gesture to close sheet |
| closeOnPressBack | boolean | true | Close on back button press (Android) |
| closeOnTouchBackdrop | boolean | true | Close on backdrop touch |
| useBottomSafeAreaPadding | boolean | true | Add safe area padding at bottom (iOS) |
| statusBarTranslucent | boolean | true | Make status bar translucent |
| isModal | boolean | true | Use React Native's Modal component (true) or direct rendering (false) |
| onOpen | () => void | - | Callback when sheet opens |
| onClose | () => void | - | Callback when sheet closes |

## SheetManager API

| Method | Parameters | Returns | Description |
|--------|------------|---------|-------------|
| register | (id: string, component: Component) | void | Register a sheet component |
| show | (id: string, options?: any) | Promise<any> | Show a registered sheet |
| hide | (id: string, result?: any) | void | Hide a sheet with optional result |

## Special Considerations for Nested Sheets

When working with nested sheets, consider these tips:

1. For parent sheets that will contain child sheets, set `isModal={false}` to avoid z-index stacking issues
2. For deeply nested hierarchies, consider using `isModal={false}` for all sheets in the hierarchy
3. When closing multiple sheets, add a small delay between closing operations for better visual transitions:

```jsx
// Close child sheet first, then parent with a slight delay
const closeBothSheets = () => {
  SheetManager.hide('childSheetId');
  
  setTimeout(() => {
    SheetManager.hide('parentSheetId');
  }, 300);
};
```

## Example

Check out the [example](example/) folder for a working demo, including nested sheet examples.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT