import React, { useState } from "react";
import { TextInput } from "./TextInput";

interface PasswordInputProps {
  label?: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  containerStyle?: any;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = "Password",
  error,
  value,
  onChangeText,
  placeholder = "Enter your password",
  containerStyle,
}) => {
  const [isSecure, setIsSecure] = useState(true);

  return (
    <TextInput
      label={label}
      error={error}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={isSecure}
      icon="lock-closed-outline"
      rightIcon={isSecure ? "eye-outline" : "eye-off-outline"}
      onRightIconPress={() => setIsSecure(!isSecure)}
      containerStyle={containerStyle}
    />
  );
};
