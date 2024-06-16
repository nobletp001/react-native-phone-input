import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { getCountriesAsync } from "@/services/CountryService";
import { useContext } from "./useCountryContext";
import {
  Country,
  CountryCode,
  FlagType,
  Region,
  Subregion,
} from "../types/type";
import { CountryFilter } from "./CountryFilter";
import { CountryItem } from "./CountryItem";

export type Ref = BottomSheetModal; // Update Ref type to include all required methods

interface CountryPickerProps {
  allowFontScaling?: boolean;
  countryCode?: CountryCode;
  region?: Region;
  subregion?: Subregion;
  countryCodes?: CountryCode[];
  excludeCountries?: CountryCode[];
  preferredCountries?: CountryCode[];
  withEmoji?: boolean;
  withCountryNameButton?: boolean;
  withCurrencyButton?: boolean;
  withCallingCodeButton?: boolean;
  withFlagButton?: boolean;
  withCloseButton?: boolean;
  withFilter?: boolean;
  withAlphaFilter?: boolean;
  withCallingCode?: boolean;
  withCurrency?: boolean;
  withFlag?: boolean;
  withModal?: boolean;
  disableNativeModal?: boolean;
  visible?: boolean;
  placeholder?: string;
  onOpen?(): void;
  onClose?(): void;
}

interface State {
  visible: boolean;
  countries: any[];
  filter?: string;
  filterFocus?: boolean;
}

const CountryBottomSheet = forwardRef<Ref, CountryPickerProps>((props, ref) => {
  const snapPoints = useMemo(() => ["90%", "90%"], []);

  const {
    allowFontScaling,
    countryCode,
    region,
    subregion,
    countryCodes,
    withEmoji,
    withFilter,
    withCloseButton,
    withCountryNameButton,
    withCallingCodeButton,
    withCurrencyButton,
    withAlphaFilter,
    withCallingCode,
    withCurrency,
    withFlag,
    withModal,
    disableNativeModal,
    withFlagButton,
    excludeCountries,
    placeholder,
    preferredCountries,
  } = props;
  const { translation, getCountriesAsync, getLetters, search } = useContext();
  const [state, setState] = useState<State>({
    visible: false,
    countries: [],
    filter: "",
    filterFocus: false,
  });
  const { visible, filter, countries, filterFocus } = state;
  const setFilter = (filter: string) => setState({ ...state, filter });
  const setCountries = (countries: any[]) => setState({ ...state, countries });

  useEffect(() => {
    let cancel = false;
    getCountriesAsync(
      withEmoji ? FlagType.EMOJI : FlagType.FLAT,
      translation,
      region,
      subregion,
      countryCodes,
      excludeCountries,
      preferredCountries,
      withAlphaFilter
    )
      .then((countries: any) => (cancel ? null : setCountries(countries)))
      .catch(console.warn);

    return () => {
      cancel = true;
    };
  }, []);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        {...props}
      />
    ),
    []
  );
  const renderComment = useMemo(
    () =>
      ({ item }: any) => {
        return <>
        <CountryItem country={item} onSelect={()=>{
            
        }} />
        </>;
      },
    []
  );


  const ListHeaderComponent =useMemo(() => <CountryFilter/>, [])
  return (
    <BottomSheetModal
      backgroundStyle={{ borderRadius: 0, backgroundColor: "#fff" }}
      overDragResistanceFactor={0}
      handleIndicatorStyle={{ display: "none" }}
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        <BottomSheetFlatList
          data={search(filter, countries)}
          renderItem={renderComment}
          keyExtractor={(item, i) => i.toString()}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={100}
          ListFooterComponent={ListHeaderComponent}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CountryBottomSheet;
