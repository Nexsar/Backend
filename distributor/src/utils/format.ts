import { PINATA_URL_PREFIX, PINATA_URL_SUFFIX } from "../constants/constants";

export const format_pinata_url = (url: string) => {
  const uid = url.split("/")[4];
  const formated_url = `${PINATA_URL_PREFIX}${uid}?${PINATA_URL_SUFFIX}`;

  return formated_url;
};
