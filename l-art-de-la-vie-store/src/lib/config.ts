const env = import.meta.env;

export const config = {
  apiUrl:
    (env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, "") ||
    "https://l-art-de-la-vie.onrender.com/api",
  whatsappNumber: (env.VITE_WHATSAPP_NUMBER as string | undefined) ?? "",
  whatsappDisplay: (env.VITE_WHATSAPP_DISPLAY as string | undefined) ?? "",
  bankName: (env.VITE_BANK_NAME as string | undefined) ?? "",
  bankAccountName: (env.VITE_BANK_ACCOUNT_NAME as string | undefined) ?? "",
  bankAccountNumber: (env.VITE_BANK_ACCOUNT_NUMBER as string | undefined) ?? "",
  storeAddress:
    (env.VITE_STORE_ADDRESS as string | undefined) ?? "Siguatepeque, Comayagua, Honduras",
  storeHours: (env.VITE_STORE_HOURS as string | undefined) ?? "Lun a Sáb · 9:00 a.m. – 6:00 p.m.",
  googleMapsUrl:
    (env.VITE_GOOGLE_MAPS_URL as string | undefined) ??
    "https://maps.google.com/?q=Siguatepeque+Comayagua+Honduras",
  tiktokProfileUrl: (env.VITE_TIKTOK_PROFILE_URL as string | undefined) ?? "",
  instagramUrl: (env.VITE_INSTAGRAM_URL as string | undefined) ?? "",
};

export const hasWhatsapp = () => config.whatsappNumber.length > 0;
export const hasBank = () => config.bankName && config.bankAccountName && config.bankAccountNumber;
