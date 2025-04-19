import { forwardRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import {
  ActionSheet,
  SheetManager,
} from 'react-native-actions-sheet-replacement';

// Parent Sheet Component
const ParentSheet = forwardRef((props: any, ref: any) => {
  const { sheetId, payload } = props;

  const openChildSheet = () => {
    console.log('Opening child sheet from parent');

    SheetManager.show('childSheet', {
      payload: {
        parentId: sheetId,
        message: 'Hello from Parent Sheet!',
        timestamp: new Date().toISOString(),
      },
    });
  };

  const openNonModalChildSheet = () => {
    console.log('Opening non-modal child sheet from parent');

    SheetManager.show('nonModalChildSheet', {
      payload: {
        parentId: sheetId,
        message: 'Hello from Parent Sheet!',
        timestamp: new Date().toISOString(),
      },
    });
  };

  const closeSheet = () => {
    SheetManager.hide(sheetId);
  };

  return (
    <ActionSheet ref={ref} sheetId={sheetId} isModal={false}>
      <View style={styles.sheetContainer}>
        <Text style={styles.title}>Parent Sheet</Text>

        {payload && (
          <View style={styles.payloadContainer}>
            <Text style={styles.payloadTitle}>Payload:</Text>
            <Text>{JSON.stringify(payload, null, 2)}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Open Child Sheet (with Modal)"
            onPress={openChildSheet}
          />

          <View style={styles.buttonSpacer} />

          <Button
            title="Open Child Sheet (without Modal)"
            onPress={openNonModalChildSheet}
          />

          <View style={styles.buttonSpacer} />

          <Button
            title="Close Parent Sheet"
            onPress={closeSheet}
            color="#d9534f"
          />
        </View>
      </View>
    </ActionSheet>
  );
});

// Child Sheet Component (Using Modal)
const ChildSheet = forwardRef((props: any, ref: any) => {
  const { sheetId, payload } = props;

  const closeChildSheet = () => {
    SheetManager.hide(sheetId);
  };

  const closeBothSheets = () => {
    SheetManager.hide(sheetId);

    if (payload?.parentId) {
      setTimeout(() => {
        SheetManager.hide(payload.parentId);
      }, 300); // Small delay for better UX
    }
  };

  return (
    <ActionSheet
      ref={ref}
      sheetId={sheetId}
      isModal={true} // Using React Native's Modal component
    >
      <View style={styles.sheetContainer}>
        <Text style={styles.title}>Child Sheet</Text>
        <Text style={styles.subtitle}>(Using React Native Modal)</Text>

        {payload && (
          <View style={styles.payloadContainer}>
            <Text style={styles.payloadTitle}>Payload from Parent:</Text>
            <Text>{JSON.stringify(payload, null, 2)}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Close Child Sheet" onPress={closeChildSheet} />

          <View style={styles.buttonSpacer} />

          <Button
            title="Close Both Sheets"
            onPress={closeBothSheets}
            color="#d9534f"
          />
        </View>
      </View>
    </ActionSheet>
  );
});

// Non-Modal Child Sheet Component
const NonModalChildSheet = forwardRef((props: any, ref: any) => {
  const { sheetId, payload } = props;

  const closeChildSheet = () => {
    SheetManager.hide(sheetId);
  };

  const closeBothSheets = () => {
    SheetManager.hide(sheetId);

    if (payload?.parentId) {
      setTimeout(() => {
        SheetManager.hide(payload.parentId);
      }, 300); // Small delay for better UX
    }
  };

  return (
    <ActionSheet
      ref={ref}
      sheetId={sheetId}
      isModal={false} // Direct rendering without Modal component
      containerStyle={styles.nonModalContainer}
    >
      <View style={styles.sheetContainer}>
        <Text style={styles.title}>Child Sheet</Text>
        <Text style={styles.subtitle}>(Direct Rendering - No Modal)</Text>

        {payload && (
          <View style={styles.payloadContainer}>
            <Text style={styles.payloadTitle}>Payload from Parent:</Text>
            <Text>{JSON.stringify(payload, null, 2)}</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button title="Close Child Sheet" onPress={closeChildSheet} />

          <View style={styles.buttonSpacer} />

          <Button
            title="Close Both Sheets"
            onPress={closeBothSheets}
            color="#d9534f"
          />
        </View>
      </View>
    </ActionSheet>
  );
});

// Register the example sheets
SheetManager.register('parentSheet', ParentSheet);
SheetManager.register('childSheet', ChildSheet);
SheetManager.register('nonModalChildSheet', NonModalChildSheet);

// Main Component for the Example
const NestedSheetExample = () => {
  const openParentSheet = () => {
    console.log('Opening parent sheet');

    SheetManager.show('parentSheet', {
      payload: {
        message: 'Hello from App!',
        timestamp: new Date().toISOString(),
      },
    });
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Nested Sheet Example</Text>
      <Text style={styles.description}>
        Shows how to open sheets from within other sheets
      </Text>
      <Button title="Open Parent Sheet" onPress={openParentSheet} />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#666',
    marginBottom: 15,
  },
  sheetContainer: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  payloadContainer: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  payloadTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  buttonContainer: {
    marginTop: 16,
  },
  buttonSpacer: {
    height: 12,
  },
  nonModalContainer: {
    // Special styling for non-modal sheets
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    borderWidth: 1,
  },
});

export default NestedSheetExample;
