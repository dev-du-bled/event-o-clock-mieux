export default interface AddressFeature {
  properties: {
    label: string;
    postcode: string;
    city: string;
    housenumber?: string;
    street: string;
  };
}
