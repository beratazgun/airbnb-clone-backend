export interface ICreatePropertyRedis {
  description: string;
  isThereDangerousAnimals: boolean;
  isThereSecurityCameras: boolean;
  isThereWeapons: boolean;
  location: Location;
  nightlyPrice: number;
  numberOfBaths: number;
  numberOfBedrooms: number;
  numberOfBeds: number;
  numberOfGuests: number;
  opportunity: Opportunity[];
  placeType: string;
  propertyImages: string[];
  propertyOwnerID: number;
  propertyStatus: string;
  propertySubID: number;
  propertyType: string;
  title: string;
}

interface Location {
  addressLineFour: string;
  addressLineOne: string;
  addressLineThree: string;
  addressLineTwo: string;
  apartmentBuildingFloor: string;
  district: string;
  latitude: number;
  longitude: number;
  showClearLocation: boolean;
  street: string;
  zipCode: string;
}

interface Opportunity {
  oppurtunityID: number;
}
