export interface CountryFlags {
  svg: string;
  png: string;
}

export interface Country {
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  callingCodes: string[];
  flags: CountryFlags;
}
