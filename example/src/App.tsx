import { useRef } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Button } from 'react-native';
import {
  ActionSheet,
  SheetManager,
  SheetProvider,
} from 'react-native-actions-sheet-replacement';
import type { ActionSheetRef } from 'react-native-actions-sheet-replacement';

// Import example components
import SheetManagerExample from './SheetManagerExample';
import NestedSheetExample from './NestedSheetExample';

// Example sheet component
const ExampleSheet = (props: { sheetId: string; payload?: any }) => {
  return (
    <View style={styles.sheetContent}>
      <Text style={styles.title}>Example Sheet</Text>
      <Text style={styles.description}>
        This is a simple example of an ActionSheet
      </Text>
      {props.payload && (
        <View style={styles.payloadContainer}>
          <Text style={styles.payloadLabel}>Payload:</Text>
          <Text style={styles.payloadValue}>
            {JSON.stringify(props.payload, null, 2)}
          </Text>
        </View>
      )}
      <Button
        title="Close Sheet"
        onPress={() => {
          SheetManager.hide(props.sheetId);
        }}
      />
    </View>
  );
};

const App = () => {
  // Create reference to control ActionSheet directly
  const actionSheetRef = useRef<ActionSheetRef>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>ActionSheet Examples</Text>

        {/* Direct ActionSheet usage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Direct Reference Example</Text>
          <Button
            title="Open Sheet via Ref"
            onPress={() => actionSheetRef.current?.open()}
          />
        </View>

        {/* SheetManagerExample component */}
        <SheetManagerExample />

        {/* Nested Sheet Example */}
        <NestedSheetExample />
      </View>
      {/* Direct ActionSheet instance */}
      <ActionSheet ref={actionSheetRef} containerStyle={styles.actionSheet}>
        <View style={styles.sheetContent}>
          <Text style={styles.title}>Direct Ref Sheet</Text>
          <Text style={styles.description}>
            This sheet is controlled directly via a ref
          </Text>
          <Button
            title="Close"
            onPress={() => actionSheetRef.current?.close()}
          />
        </View>
      </ActionSheet>
      {/* Register a sheet with SheetManager to use later */}
      <SheetProvider>
        <ActionSheet sheetId="exampleSheet">
          <ExampleSheet sheetId="exampleSheet" />
        </ActionSheet>
      </SheetProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  sheetContent: {
    padding: 20,
    minHeight: 200,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  payloadContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  payloadLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  payloadValue: {
    fontSize: 14,
    color: '#333',
  },
});

export default App;
