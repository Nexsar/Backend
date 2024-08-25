"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.format_pinata_url = void 0;
const constants_1 = require("../constants/constants");
const format_pinata_url = (url) => {
    const uid = url.split("/")[4];
    const formated_url = `${constants_1.PINATA_URL_PREFIX}${uid}?${constants_1.PINATA_URL_SUFFIX}`;
    return formated_url;
};
exports.format_pinata_url = format_pinata_url;
