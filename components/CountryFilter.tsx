import React from 'react'
import { TextInput, StyleSheet, TextInputProps, Platform } from 'react-native'


const styles = StyleSheet.create({
  input: {
    height: 48,
    width: '70%',
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineColor: 'transparent',
        outlineOffset: 0,
      },
    }),
  },
})

export type CountryFilterProps = TextInputProps

export const CountryFilter = (props: CountryFilterProps) => {

  return (
    <TextInput
      testID='text-input-country-filter'
      autoCorrect={false}
      {...props}
    />
  )
}

CountryFilter.defaultProps = {
  autoFocus: false,
  placeholder: 'Enter country name',
}