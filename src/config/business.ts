/** Single source of truth for approved business facts. Do not add unverified claims here. */
export const BUSINESS = {
  name: "Urban Craft & Co.",
  tagline: "Gifts That Mean More",
  siteUrl: "https://urbancraftgifts.com",
  email: "info@urbancraftgifts.com",
  phoneDisplay: "+91 92661 29456",
  phoneE164: "+919266129456",
  whatsappNumber: "919266129456",
  address: {
    street: "Ground Floor, 724, Shivaji Rd, Azad Market, Fyaz Ganj, Sadar Bazar",
    city: "New Delhi",
    postalCode: "110006",
    region: "Delhi",
    country: "IN",
  },
  addressLine:
    "Ground Floor, 724, Shivaji Rd, Azad Market, Fyaz Ganj, Sadar Bazar, New Delhi 110006",
  plusCode: "M676+4Q New Delhi, Delhi",
  coordinates: {
    lat: 28.6627791,
    lng: 77.2119531,
  },
  hours: "Monday–Saturday, 10:00 AM – 8:00 PM",
  hoursSchema: "Mo-Sa 10:00-20:00",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Urban%20Craft%20%26%20Co.%2C%20Ground%20Floor%2C%20724%2C%20Shivaji%20Rd%2C%20Azad%20Market%2C%20Fyaz%20Ganj%2C%20Sadar%20Bazar%2C%20New%20Delhi%20110006&output=embed",
  mapLinkUrl: "https://maps.app.goo.gl/Mdrb5mJpzKCEvsVp6",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJS5vBMBP9DDkRYMrjRIwHCq4",
} as const;
