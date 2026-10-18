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
    street: "7440 Telmill Gali, Ram Nagar, Paharganj",
    city: "New Delhi",
    postalCode: "110055",
    region: "Delhi",
    country: "IN",
  },
  addressLine: "7440 Telmill Gali, Ram Nagar, Paharganj, New Delhi 110055",
  hours: "Monday–Saturday, 10:00 AM – 8:00 PM",
  hoursSchema: "Mo-Sa 10:00-20:00",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=7440%20Telmill%20Gali%2C%20Ram%20Nagar%2C%20Paharganj%2C%20New%20Delhi%20110055&output=embed",
  mapLinkUrl:
    "https://www.google.com/maps/search/?api=1&query=7440+Telmill+Gali+Ram+Nagar+Paharganj+New+Delhi+110055",
  googleReviewUrl:
    "https://search.google.com/local/writereview?placeid=ChIJS5vBMBP9DDkRYMrjRIwHCq4",
} as const;
