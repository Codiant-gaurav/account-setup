import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
} from 'react-native';

interface FormTextInputProps extends TextInputProps {
  error?: string;
  touched?: boolean;
}

const FormTextInput = React.forwardRef<TextInput, FormTextInputProps>(
  ({ error, touched, style, ...props }, ref) => {
    return (
      <View style={styles.container}>
        <TextInput ref={ref} style={[styles.input, style]} {...props} />
        {touched && error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

FormTextInput.displayName = 'FormTextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default FormTextInput;
