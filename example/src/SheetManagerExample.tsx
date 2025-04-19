import { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import {
  ActionSheet,
  SheetManager,
  type ActionSheetRef,
} from 'react-native-actions-sheet-replacement';

// Define our custom sheet component with forwardRef
const CustomSheet = forwardRef<
  ActionSheetRef,
  { sheetId: string; payload?: any }
>((props, ref) => {
  // Create a local ref for the ActionSheet
  const actionSheetRef = useRef<ActionSheetRef>(null);

  // Forward ref methods to parent
  useImperativeHandle(ref, () => ({
    open: () => actionSheetRef.current?.open(),
    close: () => actionSheetRef.current?.close(),
    isOpen: () => actionSheetRef.current?.isOpen() || false,
    snapToIndex: (index: number) => actionSheetRef.current?.snapToIndex(index),
  }));

  // Extract payload from props
  const { payload } = props;

  return (
    <ActionSheet
      ref={actionSheetRef}
      containerStyle={styles.sheetContainer}
      headerStyle={styles.sheetHeader}
      indicatorStyle={styles.indicator}
      onClose={() => console.log('Sheet closed')}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Custom Action Sheet</Text>

        {payload && (
          <View style={styles.payloadContainer}>
            <Text style={styles.payloadTitle}>Payload Data:</Text>
            <Text style={styles.payloadText}>
              {JSON.stringify(payload, null, 2)}
            </Text>
          </View>
        )}

        <Button
          title="Close Sheet"
          onPress={() => {
            console.log('Closing sheet with ID:', props.sheetId);
            // Hide the sheet with SheetManager
            SheetManager.hide(props.sheetId, {
              customResult: 'Sheet closed by button',
            });
          }}
        />
      </View>
    </ActionSheet>
  );
});

// Register the sheet using SheetManager.register
SheetManager.register('customSheet', CustomSheet);

// Main example component
export default function SheetManagerExample() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>SheetManager Example</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Open Sheet with Data"
          onPress={() => {
            console.log('Opening customSheet with data');
            // Show the sheet with payload data
            SheetManager.show('customSheet', {
              payload: {
                message: 'Hello from SheetManager!',
                timestamp: new Date().toISOString(),
              },
            })
              .then((result) => {
                console.log('Sheet closed with result:', result);
              })
              .catch((error) => {
                console.error('Error showing sheet:', error);
              });
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Open Basic Sheet"
          onPress={() => {
            console.log('Opening customSheet without data');
            // Show the sheet without payload
            SheetManager.show('customSheet')
              .then((result) =>
                console.log('Sheet closed with result:', result)
              )
              .catch((error) => console.error('Error showing sheet:', error));
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
  },
  sheetContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  sheetHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingVertical: 10,
  },
  indicator: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DDDDDD',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  payloadContainer: {
    backgroundColor: '#F7F7F7',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  payloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  payloadText: {
    fontSize: 14,
    color: '#333',
  },
});
