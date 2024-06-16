import React, { useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import CountryBottomSheet from "./CountryBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface CountryInputProps {
  countryCode?: string;
  onChangeText: (text: string) => void;
  value: string;
  placeholder?: string;
}

const PhoneInput: React.FC<CountryInputProps> = ({
  countryCode = "ng",
  onChangeText,
  value,
  placeholder,
}) => {
  const ref = useRef<BottomSheetModal | null>(null);
  const handleOpenModal = () => {
    if (ref?.current) {
      ref?.current.present();
    }
  };
  return (
    <>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleOpenModal}>
          <View style={styles.flagCon}>
            <CountryFlag isoCode={countryCode} size={22} />
            <Text style={styles.countryCode}>+234</Text>
          </View>
        </TouchableWithoutFeedback>
        <TextInput
          style={styles.textInput}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          keyboardType="phone-pad"
        />
      </View>
      <CountryBottomSheet ref={ref} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    gap: 10,
  },
  countryCode: {
    marginRight: 10,
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
  },
  flagCon: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
    gap: 5,
    padding: 5,
  },
});

export default PhoneInput;
