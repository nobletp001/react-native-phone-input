import { memo } from "react"
import { Platform, Text, TouchableOpacity, View } from "react-native"
import { Flag } from "./Flag"

interface CountryItemProps {
    country: any
    withFlag?: boolean
    withEmoji?: boolean
    withCallingCode?: boolean
    withCurrency?: boolean
    onSelect(country: any): void
  }
 export  const CountryItem = (props: CountryItemProps) => {
    const {
      country,
      onSelect,
      withFlag =true,
      withEmoji,
      withCallingCode,
      withCurrency,
    } = props
    const extraContent: string[] = []
    if (
      withCallingCode &&
      country.callingCode &&
      country.callingCode.length > 0
    ) {
      extraContent.push(`+${country.callingCode.join('|')}`)
    }
    if (withCurrency && country.currency && country.currency.length > 0) {
      extraContent.push(country.currency.join('|'))
    }
    const countryName =
      typeof country.name === 'string' ? country.name : country.name.common
  
    return (
      <TouchableOpacity
        key={country.cca2}
        testID={`country-selector-${country.cca2}`}
        onPress={() => onSelect(country)}
      >
        <View >
        <Flag
              {...{ withEmoji, countryCode: country.cca2, flagSize: Platform.select({ android: 20, default: 30 })!, withFlagButton:true }}
            />
          <View >
          <Text>{countryName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  const MemoCountryItem = memo<CountryItemProps>(CountryItem)