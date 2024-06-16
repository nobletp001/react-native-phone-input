import Fuse from 'fuse.js';
import {
  CountryCode,
  Country,
  TranslationLanguageCode,
  TranslationLanguageCodeMap,
  FlagType,
  CountryCodeList,
  Region,
  Subregion,
} from '../types/type';

const imageJsonUrl = 'https://xcarpentier.github.io/react-native-country-picker-modal/countries/';

type CountryMap = { [key in CountryCode]: Country };

interface DataCountry {
  emojiCountries?: CountryMap;
  imageCountries?: CountryMap;
}

const localData: DataCountry = {
  emojiCountries: undefined,
  imageCountries: undefined,
};

const loadDataAsync = (data: DataCountry) => async (dataType: FlagType = FlagType.EMOJI): Promise<CountryMap> => {
  switch (dataType) {
    case FlagType.FLAT:
      if (!data.imageCountries) {
        const response = await fetch(imageJsonUrl);
        const remoteData: CountryMap = await response.json();
        data.imageCountries = remoteData;
      }
      return data.imageCountries!;
    default:
      if (!data.emojiCountries) {
        data.emojiCountries = require('../assets/countries-emoji.json');
      }
      return data.emojiCountries!;
  }
};

const getEmojiFlagAsync = async (countryCode: CountryCode = 'FR'): Promise<string> => {
  const countries = await loadDataAsync(localData)();
  if (!countries) {
    throw new Error('Unable to find emoji because emojiCountries is undefined');
  }
  return countries[countryCode].flag;
};

const getImageFlagAsync = async (countryCode: CountryCode = 'FR'): Promise<string> => {
  const countries = await loadDataAsync(localData)(FlagType.FLAT);
  if (!countries) {
    throw new Error('Unable to find image because imageCountries is undefined');
  }
  return countries[countryCode].flag;
};

const getCountryNameAsync = async (
  countryCode: CountryCode = 'FR',
  translation: TranslationLanguageCode = 'common',
): Promise<string> => {
  const countries = await loadDataAsync(localData)();
  if (!countries) {
    throw new Error('Unable to find image because imageCountries is undefined');
  }
  return countries[countryCode].name
    ? (countries[countryCode].name as TranslationLanguageCodeMap)[translation]
    : (countries[countryCode].name as TranslationLanguageCodeMap)['common'];
};

const getCountryCallingCodeAsync = async (countryCode: CountryCode): Promise<string> => {
  const countries = await loadDataAsync(localData)();
  if (!countries) {
    throw new Error('Unable to find image because imageCountries is undefined');
  }
  return countries[countryCode].callingCode[0];
};

const getCountryCurrencyAsync = async (countryCode: CountryCode): Promise<string> => {
  const countries = await loadDataAsync(localData)();
  if (!countries) {
    throw new Error('Unable to find image because imageCountries is undefined');
  }
  return countries[countryCode].currency[0];
};

const isCountryPresent = (countries: CountryMap) => (countryCode: CountryCode): boolean =>
  !!countries[countryCode];

const isRegion = (region?: Region) => (country: Country): boolean => (region ? country.region === region : true);

const isSubregion = (subregion?: Subregion) => (country: Country): boolean =>
  subregion ? country.subregion === subregion : true;

const isIncluded = (countryCodes?: CountryCode[]) => (country: Country): boolean =>
  countryCodes && countryCodes.length > 0 ? countryCodes.includes(country.cca2) : true;

const isExcluded = (excludeCountries?: CountryCode[]) => (country: Country): boolean =>
  excludeCountries && excludeCountries.length > 0 ? !excludeCountries.includes(country.cca2) : true;

const getCountriesAsync = async (
  flagType: FlagType,
  translation: TranslationLanguageCode = 'common',
  region?: Region,
  subregion?: Subregion,
  countryCodes?: CountryCode[],
  excludeCountries?: CountryCode[],
  preferredCountries?: CountryCode[],
  withAlphaFilter?: boolean,
): Promise<Country[]> => {
  const countriesRaw = await loadDataAsync(localData)(flagType);
  if (!countriesRaw) {
    return [];
  }

  if (preferredCountries && !withAlphaFilter) {
    const newCountryCodeList = [
      ...preferredCountries,
      ...CountryCodeList.filter((code) => !preferredCountries.includes(code)),
    ];

    const countries = newCountryCodeList
      .filter(isCountryPresent(countriesRaw))
      .map((cca2: CountryCode) => ({
        ...{
          ...countriesRaw[cca2],
          name:
            (countriesRaw[cca2].name as TranslationLanguageCodeMap)[translation] ||
            (countriesRaw[cca2].name as TranslationLanguageCodeMap)['common'],
        },
        cca2,
      }))
      .filter(isRegion(region))
      .filter(isSubregion(subregion))
      .filter(isIncluded(countryCodes))
      .filter(isExcluded(excludeCountries));

    return countries;
  } else {
    const countries = CountryCodeList.filter(isCountryPresent(countriesRaw))
      .map((cca2: CountryCode) => ({
        ...{
          ...countriesRaw[cca2],
          name:
            (countriesRaw[cca2].name as TranslationLanguageCodeMap)[translation] ||
            (countriesRaw[cca2].name as TranslationLanguageCodeMap)['common'],
        },
        cca2,
      }))
      .filter(isRegion(region))
      .filter(isSubregion(subregion))
      .filter(isIncluded(countryCodes))
      .filter(isExcluded(excludeCountries))
      .sort((country1: Country, country2: Country) =>
        (country1.name as string).localeCompare(country2.name as string),
      );

    return countries;
  }
};

const DEFAULT_FUSE_OPTION = {
  keys: ['name', 'cca2', 'callingCode'],
  threshold: 0.3,
};

type FuseType = Fuse<Country>;

let fuse: FuseType | null = null;

const search = (
  filter: string = '',
  data: Country[] = [],
  options = DEFAULT_FUSE_OPTION,
): Country[] => {
  if (data.length === 0) {
    return [];
  }
  if (!fuse) {
    fuse = new Fuse(data, options);
  } else {
    fuse.setCollection(data); // Update the collection if data changes
  }
  if (filter && filter !== '') {
    const result = fuse.search(filter);
    return result.map(res => res.item); // Extract the original items from the search results
  } else {
    return data;
  }
};

const uniq = (arr: string[]): string[] => Array.from(new Set(arr));

const getLetters = (countries: Country[]): string[] => {
  return uniq(
    countries
      .map((country: Country) => (country.name as string).substr(0, 1).toLocaleUpperCase())
      .sort((l1: string, l2: string) => l1.localeCompare(l2)),
  );
};

interface CountryInfo {
  countryName: string;
  currency: string;
  callingCode: string;
}

const getCountryInfoAsync = async ({
  countryCode,
  translation,
}: {
  countryCode: CountryCode;
  translation?: TranslationLanguageCode;
}): Promise<CountryInfo> => {
  const countryName = await getCountryNameAsync(countryCode, translation || 'common');
  const currency = await getCountryCurrencyAsync(countryCode);
  const callingCode = await getCountryCallingCodeAsync(countryCode);
  return { countryName, currency, callingCode };
};

export {
  getEmojiFlagAsync,
  getImageFlagAsync,
  getCountryNameAsync,
  getCountryCallingCodeAsync,
  getCountryCurrencyAsync,
  getCountriesAsync,
  search,
  getLetters,
  getCountryInfoAsync,
};
