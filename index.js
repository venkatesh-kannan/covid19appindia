const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const momenttz = require('moment-timezone');
var moment = require('moment');
const axios = require('axios');
const { STATES } = require('mongoose');
const zoneFile = [
    {
      "value": "Dateline Standard Time",
      "abbr": "DST",
      "offset": -12,
      "isdst": false,
      "text": "(UTC-12:00) International Date Line West",
      "utc": [
        "Etc/GMT+12"
      ]
    },
    {
      "value": "UTC-11",
      "abbr": "U",
      "offset": -11,
      "isdst": false,
      "text": "(UTC-11:00) Coordinated Universal Time-11",
      "utc": [
        "Etc/GMT+11",
        "Pacific/Midway",
        "Pacific/Niue",
        "Pacific/Pago_Pago"
      ]
    },
    {
      "value": "Hawaiian Standard Time",
      "abbr": "HST",
      "offset": -10,
      "isdst": false,
      "text": "(UTC-10:00) Hawaii",
      "utc": [
        "Etc/GMT+10",
        "Pacific/Honolulu",
        "Pacific/Johnston",
        "Pacific/Rarotonga",
        "Pacific/Tahiti"
      ]
    },
    {
      "value": "Alaskan Standard Time",
      "abbr": "AKDT",
      "offset": -8,
      "isdst": true,
      "text": "(UTC-09:00) Alaska",
      "utc": [
        "America/Anchorage",
        "America/Juneau",
        "America/Nome",
        "America/Sitka",
        "America/Yakutat"
      ]
    },
    {
      "value": "Pacific Standard Time (Mexico)",
      "abbr": "PDT",
      "offset": -7,
      "isdst": true,
      "text": "(UTC-08:00) Baja California",
      "utc": [
        "America/Santa_Isabel"
      ]
    },
    {
      "value": "Pacific Daylight Time",
      "abbr": "PDT",
      "offset": -7,
      "isdst": true,
      "text": "(UTC-07:00) Pacific Time (US & Canada)",
      "utc": [
        "America/Dawson",
        "America/Los_Angeles",
        "America/Tijuana",
        "America/Vancouver",
        "America/Whitehorse"
      ]
    },
    {
      "value": "Pacific Standard Time",
      "abbr": "PST",
      "offset": -8,
      "isdst": false,
      "text": "(UTC-08:00) Pacific Time (US & Canada)",
      "utc": [
        "America/Dawson",
        "America/Los_Angeles",
        "America/Tijuana",
        "America/Vancouver",
        "America/Whitehorse",
        "PST8PDT"
      ]
    },
    {
      "value": "US Mountain Standard Time",
      "abbr": "UMST",
      "offset": -7,
      "isdst": false,
      "text": "(UTC-07:00) Arizona",
      "utc": [
        "America/Creston",
        "America/Dawson_Creek",
        "America/Hermosillo",
        "America/Phoenix",
        "Etc/GMT+7"
      ]
    },
    {
      "value": "Mountain Standard Time (Mexico)",
      "abbr": "MDT",
      "offset": -6,
      "isdst": true,
      "text": "(UTC-07:00) Chihuahua, La Paz, Mazatlan",
      "utc": [
        "America/Chihuahua",
        "America/Mazatlan"
      ]
    },
    {
      "value": "Mountain Standard Time",
      "abbr": "MDT",
      "offset": -6,
      "isdst": true,
      "text": "(UTC-07:00) Mountain Time (US & Canada)",
      "utc": [
        "America/Boise",
        "America/Cambridge_Bay",
        "America/Denver",
        "America/Edmonton",
        "America/Inuvik",
        "America/Ojinaga",
        "America/Yellowknife",
        "MST7MDT"
      ]
    },
    {
      "value": "Central America Standard Time",
      "abbr": "CAST",
      "offset": -6,
      "isdst": false,
      "text": "(UTC-06:00) Central America",
      "utc": [
        "America/Belize",
        "America/Costa_Rica",
        "America/El_Salvador",
        "America/Guatemala",
        "America/Managua",
        "America/Tegucigalpa",
        "Etc/GMT+6",
        "Pacific/Galapagos"
      ]
    },
    {
      "value": "Central Standard Time",
      "abbr": "CDT",
      "offset": -5,
      "isdst": true,
      "text": "(UTC-06:00) Central Time (US & Canada)",
      "utc": [
        "America/Chicago",
        "America/Indiana/Knox",
        "America/Indiana/Tell_City",
        "America/Matamoros",
        "America/Menominee",
        "America/North_Dakota/Beulah",
        "America/North_Dakota/Center",
        "America/North_Dakota/New_Salem",
        "America/Rainy_River",
        "America/Rankin_Inlet",
        "America/Resolute",
        "America/Winnipeg",
        "CST6CDT"
      ]
    },
    {
      "value": "Central Standard Time (Mexico)",
      "abbr": "CDT",
      "offset": -5,
      "isdst": true,
      "text": "(UTC-06:00) Guadalajara, Mexico City, Monterrey",
      "utc": [
        "America/Bahia_Banderas",
        "America/Cancun",
        "America/Merida",
        "America/Mexico_City",
        "America/Monterrey"
      ]
    },
    {
      "value": "Canada Central Standard Time",
      "abbr": "CCST",
      "offset": -6,
      "isdst": false,
      "text": "(UTC-06:00) Saskatchewan",
      "utc": [
        "America/Regina",
        "America/Swift_Current"
      ]
    },
    {
      "value": "SA Pacific Standard Time",
      "abbr": "SPST",
      "offset": -5,
      "isdst": false,
      "text": "(UTC-05:00) Bogota, Lima, Quito",
      "utc": [
        "America/Bogota",
        "America/Cayman",
        "America/Coral_Harbour",
        "America/Eirunepe",
        "America/Guayaquil",
        "America/Jamaica",
        "America/Lima",
        "America/Panama",
        "America/Rio_Branco",
        "Etc/GMT+5"
      ]
    },
    {
      "value": "Eastern Standard Time",
      "abbr": "EDT",
      "offset": -4,
      "isdst": true,
      "text": "(UTC-05:00) Eastern Time (US & Canada)",
      "utc": [
        "America/Detroit",
        "America/Havana",
        "America/Indiana/Petersburg",
        "America/Indiana/Vincennes",
        "America/Indiana/Winamac",
        "America/Iqaluit",
        "America/Kentucky/Monticello",
        "America/Louisville",
        "America/Montreal",
        "America/Nassau",
        "America/New_York",
        "America/Nipigon",
        "America/Pangnirtung",
        "America/Port-au-Prince",
        "America/Thunder_Bay",
        "America/Toronto",
        "EST5EDT"
      ]
    },
    {
      "value": "US Eastern Standard Time",
      "abbr": "UEDT",
      "offset": -4,
      "isdst": true,
      "text": "(UTC-05:00) Indiana (East)",
      "utc": [
        "America/Indiana/Marengo",
        "America/Indiana/Vevay",
        "America/Indianapolis"
      ]
    },
    {
      "value": "Venezuela Standard Time",
      "abbr": "VST",
      "offset": -4.5,
      "isdst": false,
      "text": "(UTC-04:30) Caracas",
      "utc": [
        "America/Caracas"
      ]
    },
    {
      "value": "Paraguay Standard Time",
      "abbr": "PYT",
      "offset": -4,
      "isdst": false,
      "text": "(UTC-04:00) Asuncion",
      "utc": [
        "America/Asuncion"
      ]
    },
    {
      "value": "Atlantic Standard Time",
      "abbr": "ADT",
      "offset": -3,
      "isdst": true,
      "text": "(UTC-04:00) Atlantic Time (Canada)",
      "utc": [
        "America/Glace_Bay",
        "America/Goose_Bay",
        "America/Halifax",
        "America/Moncton",
        "America/Thule",
        "Atlantic/Bermuda"
      ]
    },
    {
      "value": "Central Brazilian Standard Time",
      "abbr": "CBST",
      "offset": -4,
      "isdst": false,
      "text": "(UTC-04:00) Cuiaba",
      "utc": [
        "America/Campo_Grande",
        "America/Cuiaba"
      ]
    },
    {
      "value": "SA Western Standard Time",
      "abbr": "SWST",
      "offset": -4,
      "isdst": false,
      "text": "(UTC-04:00) Georgetown, La Paz, Manaus, San Juan",
      "utc": [
        "America/Anguilla",
        "America/Antigua",
        "America/Aruba",
        "America/Barbados",
        "America/Blanc-Sablon",
        "America/Boa_Vista",
        "America/Curacao",
        "America/Dominica",
        "America/Grand_Turk",
        "America/Grenada",
        "America/Guadeloupe",
        "America/Guyana",
        "America/Kralendijk",
        "America/La_Paz",
        "America/Lower_Princes",
        "America/Manaus",
        "America/Marigot",
        "America/Martinique",
        "America/Montserrat",
        "America/Port_of_Spain",
        "America/Porto_Velho",
        "America/Puerto_Rico",
        "America/Santo_Domingo",
        "America/St_Barthelemy",
        "America/St_Kitts",
        "America/St_Lucia",
        "America/St_Thomas",
        "America/St_Vincent",
        "America/Tortola",
        "Etc/GMT+4"
      ]
    },
    {
      "value": "Pacific SA Standard Time",
      "abbr": "PSST",
      "offset": -4,
      "isdst": false,
      "text": "(UTC-04:00) Santiago",
      "utc": [
        "America/Santiago",
        "Antarctica/Palmer"
      ]
    },
    {
      "value": "Newfoundland Standard Time",
      "abbr": "NDT",
      "offset": -2.5,
      "isdst": true,
      "text": "(UTC-03:30) Newfoundland",
      "utc": [
        "America/St_Johns"
      ]
    },
    {
      "value": "E. South America Standard Time",
      "abbr": "ESAST",
      "offset": -3,
      "isdst": false,
      "text": "(UTC-03:00) Brasilia",
      "utc": [
        "America/Sao_Paulo"
      ]
    },
    {
      "value": "Argentina Standard Time",
      "abbr": "AST",
      "offset": -3,
      "isdst": false,
      "text": "(UTC-03:00) Buenos Aires",
      "utc": [
        "America/Argentina/La_Rioja",
        "America/Argentina/Rio_Gallegos",
        "America/Argentina/Salta",
        "America/Argentina/San_Juan",
        "America/Argentina/San_Luis",
        "America/Argentina/Tucuman",
        "America/Argentina/Ushuaia",
        "America/Buenos_Aires",
        "America/Catamarca",
        "America/Cordoba",
        "America/Jujuy",
        "America/Mendoza"
      ]
    },
    {
      "value": "SA Eastern Standard Time",
      "abbr": "SEST",
      "offset": -3,
      "isdst": false,
      "text": "(UTC-03:00) Cayenne, Fortaleza",
      "utc": [
        "America/Araguaina",
        "America/Belem",
        "America/Cayenne",
        "America/Fortaleza",
        "America/Maceio",
        "America/Paramaribo",
        "America/Recife",
        "America/Santarem",
        "Antarctica/Rothera",
        "Atlantic/Stanley",
        "Etc/GMT+3"
      ]
    },
    {
      "value": "Greenland Standard Time",
      "abbr": "GDT",
      "offset": -3,
      "isdst": true,
      "text": "(UTC-03:00) Greenland",
      "utc": [
        "America/Godthab"
      ]
    },
    {
      "value": "Montevideo Standard Time",
      "abbr": "MST",
      "offset": -3,
      "isdst": false,
      "text": "(UTC-03:00) Montevideo",
      "utc": [
        "America/Montevideo"
      ]
    },
    {
      "value": "Bahia Standard Time",
      "abbr": "BST",
      "offset": -3,
      "isdst": false,
      "text": "(UTC-03:00) Salvador",
      "utc": [
        "America/Bahia"
      ]
    },
    {
      "value": "UTC-02",
      "abbr": "U",
      "offset": -2,
      "isdst": false,
      "text": "(UTC-02:00) Coordinated Universal Time-02",
      "utc": [
        "America/Noronha",
        "Atlantic/South_Georgia",
        "Etc/GMT+2"
      ]
    },
    {
      "value": "Mid-Atlantic Standard Time",
      "abbr": "MDT",
      "offset": -1,
      "isdst": true,
      "text": "(UTC-02:00) Mid-Atlantic - Old",
      "utc": []
    },
    {
      "value": "Azores Standard Time",
      "abbr": "ADT",
      "offset": 0,
      "isdst": true,
      "text": "(UTC-01:00) Azores",
      "utc": [
        "America/Scoresbysund",
        "Atlantic/Azores"
      ]
    },
    {
      "value": "Cape Verde Standard Time",
      "abbr": "CVST",
      "offset": -1,
      "isdst": false,
      "text": "(UTC-01:00) Cape Verde Is.",
      "utc": [
        "Atlantic/Cape_Verde",
        "Etc/GMT+1"
      ]
    },
    {
      "value": "Morocco Standard Time",
      "abbr": "MDT",
      "offset": 1,
      "isdst": true,
      "text": "(UTC) Casablanca",
      "utc": [
        "Africa/Casablanca",
        "Africa/El_Aaiun"
      ]
    },
    {
      "value": "UTC",
      "abbr": "UTC",
      "offset": 0,
      "isdst": false,
      "text": "(UTC) Coordinated Universal Time",
      "utc": [
        "America/Danmarkshavn",
        "Etc/GMT"
      ]
    },
    {
      "value": "GMT Standard Time",
      "abbr": "GMT",
      "offset": 0,
      "isdst": false,
      "text": "(UTC) Edinburgh, London",
      "utc": [
        "Europe/Isle_of_Man",
        "Europe/Guernsey",
        "Europe/Jersey",
        "Europe/London"
      ]
    },
    {
      "value": "British Summer Time",
      "abbr": "BST",
      "offset": 1,
      "isdst": true,
      "text": "(UTC+01:00) Edinburgh, London",
      "utc": [
        "Europe/Isle_of_Man",
        "Europe/Guernsey",
        "Europe/Jersey",
        "Europe/London"
      ]
    },
    {
      "value": "GMT Standard Time",
      "abbr": "GDT",
      "offset": 1,
      "isdst": true,
      "text": "(UTC) Dublin, Lisbon",
      "utc": [
        "Atlantic/Canary",
        "Atlantic/Faeroe",
        "Atlantic/Madeira",
        "Europe/Dublin",
        "Europe/Lisbon"
      ]
    },
    {
      "value": "Greenwich Standard Time",
      "abbr": "GST",
      "offset": 0,
      "isdst": false,
      "text": "(UTC) Monrovia, Reykjavik",
      "utc": [
        "Africa/Abidjan",
        "Africa/Accra",
        "Africa/Bamako",
        "Africa/Banjul",
        "Africa/Bissau",
        "Africa/Conakry",
        "Africa/Dakar",
        "Africa/Freetown",
        "Africa/Lome",
        "Africa/Monrovia",
        "Africa/Nouakchott",
        "Africa/Ouagadougou",
        "Africa/Sao_Tome",
        "Atlantic/Reykjavik",
        "Atlantic/St_Helena"
      ]
    },
    {
      "value": "W. Europe Standard Time",
      "abbr": "WEDT",
      "offset": 2,
      "isdst": true,
      "text": "(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
      "utc": [
        "Arctic/Longyearbyen",
        "Europe/Amsterdam",
        "Europe/Andorra",
        "Europe/Berlin",
        "Europe/Busingen",
        "Europe/Gibraltar",
        "Europe/Luxembourg",
        "Europe/Malta",
        "Europe/Monaco",
        "Europe/Oslo",
        "Europe/Rome",
        "Europe/San_Marino",
        "Europe/Stockholm",
        "Europe/Vaduz",
        "Europe/Vatican",
        "Europe/Vienna",
        "Europe/Zurich"
      ]
    },
    {
      "value": "Central Europe Standard Time",
      "abbr": "CEDT",
      "offset": 2,
      "isdst": true,
      "text": "(UTC+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
      "utc": [
        "Europe/Belgrade",
        "Europe/Bratislava",
        "Europe/Budapest",
        "Europe/Ljubljana",
        "Europe/Podgorica",
        "Europe/Prague",
        "Europe/Tirane"
      ]
    },
    {
      "value": "Romance Standard Time",
      "abbr": "RDT",
      "offset": 2,
      "isdst": true,
      "text": "(UTC+01:00) Brussels, Copenhagen, Madrid, Paris",
      "utc": [
        "Africa/Ceuta",
        "Europe/Brussels",
        "Europe/Copenhagen",
        "Europe/Madrid",
        "Europe/Paris"
      ]
    },
    {
      "value": "Central European Standard Time",
      "abbr": "CEDT",
      "offset": 2,
      "isdst": true,
      "text": "(UTC+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
      "utc": [
        "Europe/Sarajevo",
        "Europe/Skopje",
        "Europe/Warsaw",
        "Europe/Zagreb"
      ]
    },
    {
      "value": "W. Central Africa Standard Time",
      "abbr": "WCAST",
      "offset": 1,
      "isdst": false,
      "text": "(UTC+01:00) West Central Africa",
      "utc": [
        "Africa/Algiers",
        "Africa/Bangui",
        "Africa/Brazzaville",
        "Africa/Douala",
        "Africa/Kinshasa",
        "Africa/Lagos",
        "Africa/Libreville",
        "Africa/Luanda",
        "Africa/Malabo",
        "Africa/Ndjamena",
        "Africa/Niamey",
        "Africa/Porto-Novo",
        "Africa/Tunis",
        "Etc/GMT-1"
      ]
    },
    {
      "value": "Namibia Standard Time",
      "abbr": "NST",
      "offset": 1,
      "isdst": false,
      "text": "(UTC+01:00) Windhoek",
      "utc": [
        "Africa/Windhoek"
      ]
    },
    {
      "value": "GTB Standard Time",
      "abbr": "GDT",
      "offset": 3,
      "isdst": true,
      "text": "(UTC+02:00) Athens, Bucharest",
      "utc": [
        "Asia/Nicosia",
        "Europe/Athens",
        "Europe/Bucharest",
        "Europe/Chisinau"
      ]
    },
    {
      "value": "Middle East Standard Time",
      "abbr": "MEDT",
      "offset": 3,
      "isdst": true,
      "text": "(UTC+02:00) Beirut",
      "utc": [
        "Asia/Beirut"
      ]
    },
    {
      "value": "Egypt Standard Time",
      "abbr": "EST",
      "offset": 2,
      "isdst": false,
      "text": "(UTC+02:00) Cairo",
      "utc": [
        "Africa/Cairo"
      ]
    },
    {
      "value": "Syria Standard Time",
      "abbr": "SDT",
      "offset": 3,
      "isdst": true,
      "text": "(UTC+02:00) Damascus",
      "utc": [
        "Asia/Damascus"
      ]
    },
    {
      "value": "E. Europe Standard Time",
      "abbr": "EEDT",
      "offset": 3,
      "isdst": true,
      "text": "(UTC+02:00) E. Europe",
      "utc": [
        "Asia/Nicosia",
        "Europe/Athens",
        "Europe/Bucharest",
        "Europe/Chisinau",
        "Europe/Helsinki",
        "Europe/Kiev",
        "Europe/Mariehamn",
        "Europe/Nicosia",
        "Europe/Riga",
        "Europe/Sofia",
        "Europe/Tallinn",
        "Europe/Uzhgorod",
        "Europe/Vilnius",
        "Europe/Zaporozhye"
  
      ]
    },
    {
      "value": "South Africa Standard Time",
      "abbr": "SAST",
      "offset": 2,
      "isdst": false,
      "text": "(UTC+02:00) Harare, Pretoria",
      "utc": [
        "Africa/Blantyre",
        "Africa/Bujumbura",
        "Africa/Gaborone",
        "Africa/Harare",
        "Africa/Johannesburg",
        "Africa/Kigali",
        "Africa/Lubumbashi",
        "Africa/Lusaka",
        "Africa/Maputo",
        "Africa/Maseru",
        "Africa/Mbabane",
        "Etc/GMT-2"
      ]
    },
    {
      "value": "FLE Standard Time",
      "abbr": "FDT",
      "offset": 3,
      "isdst": true,
      "text": "(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
      "utc": [
        "Europe/Helsinki",
        "Europe/Kiev",
        "Europe/Mariehamn",
        "Europe/Riga",
        "Europe/Sofia",
        "Europe/Tallinn",
        "Europe/Uzhgorod",
        "Europe/Vilnius",
        "Europe/Zaporozhye"
      ]
    },
    {
      "value": "Turkey Standard Time",
      "abbr": "TDT",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+03:00) Istanbul",
      "utc": [
        "Europe/Istanbul"
      ]
    },
    {
      "value": "Israel Standard Time",
      "abbr": "JDT",
      "offset": 3,
      "isdst": true,
      "text": "(UTC+02:00) Jerusalem",
      "utc": [
        "Asia/Jerusalem"
      ]
    },
    {
      "value": "Libya Standard Time",
      "abbr": "LST",
      "offset": 2,
      "isdst": false,
      "text": "(UTC+02:00) Tripoli",
      "utc": [
        "Africa/Tripoli"
      ]
    },
    {
      "value": "Jordan Standard Time",
      "abbr": "JST",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+03:00) Amman",
      "utc": [
        "Asia/Amman"
      ]
    },
    {
      "value": "Arabic Standard Time",
      "abbr": "AST",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+03:00) Baghdad",
      "utc": [
        "Asia/Baghdad"
      ]
    },
    {
      "value": "Kaliningrad Standard Time",
      "abbr": "KST",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+02:00) Kaliningrad",
      "utc": [
        "Europe/Kaliningrad"
      ]
    },
    {
      "value": "Arab Standard Time",
      "abbr": "AST",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+03:00) Kuwait, Riyadh",
      "utc": [
        "Asia/Aden",
        "Asia/Bahrain",
        "Asia/Kuwait",
        "Asia/Qatar",
        "Asia/Riyadh"
      ]
    },
    {
      "value": "E. Africa Standard Time",
      "abbr": "EAST",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+03:00) Nairobi",
      "utc": [
        "Africa/Addis_Ababa",
        "Africa/Asmera",
        "Africa/Dar_es_Salaam",
        "Africa/Djibouti",
        "Africa/Juba",
        "Africa/Kampala",
        "Africa/Khartoum",
        "Africa/Mogadishu",
        "Africa/Nairobi",
        "Antarctica/Syowa",
        "Etc/GMT-3",
        "Indian/Antananarivo",
        "Indian/Comoro",
        "Indian/Mayotte"
      ]
    },
    {
      "value": "Moscow Standard Time",
      "abbr": "MSK",
      "offset": 3,
      "isdst": false,
      "text": "(UTC+03:00) Moscow, St. Petersburg, Volgograd, Minsk",
      "utc": [
          "Europe/Kirov",
        "Europe/Moscow",
        "Europe/Simferopol",
        "Europe/Volgograd",
        "Europe/Minsk"
      ]
    },
    {
      "value": "Samara Time",
      "abbr": "SAMT",
      "offset": 4,
      "isdst": false,
      "text": "(UTC+04:00) Samara, Ulyanovsk, Saratov",
      "utc": [
          "Europe/Astrakhan",
        "Europe/Samara",
          "Europe/Ulyanovsk"
      ]
    },
    {
      "value": "Iran Standard Time",
      "abbr": "IDT",
      "offset": 4.5,
      "isdst": true,
      "text": "(UTC+03:30) Tehran",
      "utc": [
        "Asia/Tehran"
      ]
    },
    {
      "value": "Arabian Standard Time",
      "abbr": "AST",
      "offset": 4,
      "isdst": false,
      "text": "(UTC+04:00) Abu Dhabi, Muscat",
      "utc": [
        "Asia/Dubai",
        "Asia/Muscat",
        "Etc/GMT-4"
      ]
    },
    {
      "value": "Azerbaijan Standard Time",
      "abbr": "ADT",
      "offset": 5,
      "isdst": true,
      "text": "(UTC+04:00) Baku",
      "utc": [
        "Asia/Baku"
      ]
    },
    {
      "value": "Mauritius Standard Time",
      "abbr": "MST",
      "offset": 4,
      "isdst": false,
      "text": "(UTC+04:00) Port Louis",
      "utc": [
        "Indian/Mahe",
        "Indian/Mauritius",
        "Indian/Reunion"
      ]
    },
    {
      "value": "Georgian Standard Time",
      "abbr": "GET",
      "offset": 4,
      "isdst": false,
      "text": "(UTC+04:00) Tbilisi",
      "utc": [
        "Asia/Tbilisi"
      ]
    },
    {
      "value": "Caucasus Standard Time",
      "abbr": "CST",
      "offset": 4,
      "isdst": false,
      "text": "(UTC+04:00) Yerevan",
      "utc": [
        "Asia/Yerevan"
      ]
    },
    {
      "value": "Afghanistan Standard Time",
      "abbr": "AST",
      "offset": 4.5,
      "isdst": false,
      "text": "(UTC+04:30) Kabul",
      "utc": [
        "Asia/Kabul"
      ]
    },
    {
      "value": "West Asia Standard Time",
      "abbr": "WAST",
      "offset": 5,
      "isdst": false,
      "text": "(UTC+05:00) Ashgabat, Tashkent",
      "utc": [
        "Antarctica/Mawson",
        "Asia/Aqtau",
        "Asia/Aqtobe",
        "Asia/Ashgabat",
        "Asia/Dushanbe",
        "Asia/Oral",
        "Asia/Samarkand",
        "Asia/Tashkent",
        "Etc/GMT-5",
        "Indian/Kerguelen",
        "Indian/Maldives"
      ]
    },
    {
      "value": "Yekaterinburg Time",
      "abbr": "YEKT",
      "offset": 5,
      "isdst": false,
      "text": "(UTC+05:00) Yekaterinburg",
      "utc": [
        "Asia/Yekaterinburg"
      ]
    },
    {
      "value": "Pakistan Standard Time",
      "abbr": "PKT",
      "offset": 5,
      "isdst": false,
      "text": "(UTC+05:00) Islamabad, Karachi",
      "utc": [
        "Asia/Karachi"
      ]
    },
    {
      "value": "India Standard Time",
      "abbr": "IST",
      "offset": 5.5,
      "isdst": false,
      "text": "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
      "utc": [
        "Asia/Kolkata"
      ]
    },
    {
      "value": "Sri Lanka Standard Time",
      "abbr": "SLST",
      "offset": 5.5,
      "isdst": false,
      "text": "(UTC+05:30) Sri Jayawardenepura",
      "utc": [
        "Asia/Colombo"
      ]
    },
    {
      "value": "Nepal Standard Time",
      "abbr": "NST",
      "offset": 5.75,
      "isdst": false,
      "text": "(UTC+05:45) Kathmandu",
      "utc": [
        "Asia/Kathmandu"
      ]
    },
    {
      "value": "Central Asia Standard Time",
      "abbr": "CAST",
      "offset": 6,
      "isdst": false,
      "text": "(UTC+06:00) Nur-Sultan (Astana)",
      "utc": [
        "Antarctica/Vostok",
        "Asia/Almaty",
        "Asia/Bishkek",
        "Asia/Qyzylorda",
        "Asia/Urumqi",
        "Etc/GMT-6",
        "Indian/Chagos"
      ]
    },
    {
      "value": "Bangladesh Standard Time",
      "abbr": "BST",
      "offset": 6,
      "isdst": false,
      "text": "(UTC+06:00) Dhaka",
      "utc": [
        "Asia/Dhaka",
        "Asia/Thimphu"
      ]
    },
    {
      "value": "Myanmar Standard Time",
      "abbr": "MST",
      "offset": 6.5,
      "isdst": false,
      "text": "(UTC+06:30) Yangon (Rangoon)",
      "utc": [
        "Asia/Rangoon",
        "Indian/Cocos"
      ]
    },
    {
      "value": "SE Asia Standard Time",
      "abbr": "SAST",
      "offset": 7,
      "isdst": false,
      "text": "(UTC+07:00) Bangkok, Hanoi, Jakarta",
      "utc": [
        "Antarctica/Davis",
        "Asia/Bangkok",
        "Asia/Hovd",
        "Asia/Jakarta",
        "Asia/Phnom_Penh",
        "Asia/Pontianak",
        "Asia/Saigon",
        "Asia/Vientiane",
        "Etc/GMT-7",
        "Indian/Christmas"
      ]
    },
    {
      "value": "N. Central Asia Standard Time",
      "abbr": "NCAST",
      "offset": 7,
      "isdst": false,
      "text": "(UTC+07:00) Novosibirsk",
      "utc": [
        "Asia/Novokuznetsk",
        "Asia/Novosibirsk",
        "Asia/Omsk"
      ]
    },
    {
      "value": "China Standard Time",
      "abbr": "CST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
      "utc": [
        "Asia/Hong_Kong",
        "Asia/Macau",
        "Asia/Shanghai"
      ]
    },
    {
      "value": "North Asia Standard Time",
      "abbr": "NAST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Krasnoyarsk",
      "utc": [
        "Asia/Krasnoyarsk"
      ]
    },
    {
      "value": "Singapore Standard Time",
      "abbr": "MPST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Kuala Lumpur, Singapore",
      "utc": [
        "Asia/Brunei",
        "Asia/Kuala_Lumpur",
        "Asia/Kuching",
        "Asia/Makassar",
        "Asia/Manila",
        "Asia/Singapore",
        "Etc/GMT-8"
      ]
    },
    {
      "value": "W. Australia Standard Time",
      "abbr": "WAST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Perth",
      "utc": [
        "Antarctica/Casey",
        "Australia/Perth"
      ]
    },
    {
      "value": "Taipei Standard Time",
      "abbr": "TST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Taipei",
      "utc": [
        "Asia/Taipei"
      ]
    },
    {
      "value": "Ulaanbaatar Standard Time",
      "abbr": "UST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Ulaanbaatar",
      "utc": [
        "Asia/Choibalsan",
        "Asia/Ulaanbaatar"
      ]
    },
    {
      "value": "North Asia East Standard Time",
      "abbr": "NAEST",
      "offset": 8,
      "isdst": false,
      "text": "(UTC+08:00) Irkutsk",
      "utc": [
        "Asia/Irkutsk"
      ]
    },
    {
      "value": "Japan Standard Time",
      "abbr": "JST",
      "offset": 9,
      "isdst": false,
      "text": "(UTC+09:00) Osaka, Sapporo, Tokyo",
      "utc": [
        "Asia/Dili",
        "Asia/Jayapura",
        "Asia/Tokyo",
        "Etc/GMT-9",
        "Pacific/Palau"
      ]
    },
    {
      "value": "Korea Standard Time",
      "abbr": "KST",
      "offset": 9,
      "isdst": false,
      "text": "(UTC+09:00) Seoul",
      "utc": [
        "Asia/Pyongyang",
        "Asia/Seoul"
      ]
    },
    {
      "value": "Cen. Australia Standard Time",
      "abbr": "CAST",
      "offset": 9.5,
      "isdst": false,
      "text": "(UTC+09:30) Adelaide",
      "utc": [
        "Australia/Adelaide",
        "Australia/Broken_Hill"
      ]
    },
    {
      "value": "AUS Central Standard Time",
      "abbr": "ACST",
      "offset": 9.5,
      "isdst": false,
      "text": "(UTC+09:30) Darwin",
      "utc": [
        "Australia/Darwin"
      ]
    },
    {
      "value": "E. Australia Standard Time",
      "abbr": "EAST",
      "offset": 10,
      "isdst": false,
      "text": "(UTC+10:00) Brisbane",
      "utc": [
        "Australia/Brisbane",
        "Australia/Lindeman"
      ]
    },
    {
      "value": "AUS Eastern Standard Time",
      "abbr": "AEST",
      "offset": 10,
      "isdst": false,
      "text": "(UTC+10:00) Canberra, Melbourne, Sydney",
      "utc": [
        "Australia/Melbourne",
        "Australia/Sydney"
      ]
    },
    {
      "value": "West Pacific Standard Time",
      "abbr": "WPST",
      "offset": 10,
      "isdst": false,
      "text": "(UTC+10:00) Guam, Port Moresby",
      "utc": [
        "Antarctica/DumontDUrville",
        "Etc/GMT-10",
        "Pacific/Guam",
        "Pacific/Port_Moresby",
        "Pacific/Saipan",
        "Pacific/Truk"
      ]
    },
    {
      "value": "Tasmania Standard Time",
      "abbr": "TST",
      "offset": 10,
      "isdst": false,
      "text": "(UTC+10:00) Hobart",
      "utc": [
        "Australia/Currie",
        "Australia/Hobart"
      ]
    },
    {
      "value": "Yakutsk Standard Time",
      "abbr": "YST",
      "offset": 9,
      "isdst": false,
      "text": "(UTC+09:00) Yakutsk",
      "utc": [
        "Asia/Chita",
        "Asia/Khandyga",
        "Asia/Yakutsk"
      ]
    },
    {
      "value": "Central Pacific Standard Time",
      "abbr": "CPST",
      "offset": 11,
      "isdst": false,
      "text": "(UTC+11:00) Solomon Is., New Caledonia",
      "utc": [
        "Antarctica/Macquarie",
        "Etc/GMT-11",
        "Pacific/Efate",
        "Pacific/Guadalcanal",
        "Pacific/Kosrae",
        "Pacific/Noumea",
        "Pacific/Ponape"
      ]
    },
    {
      "value": "Vladivostok Standard Time",
      "abbr": "VST",
      "offset": 11,
      "isdst": false,
      "text": "(UTC+11:00) Vladivostok",
      "utc": [
        "Asia/Sakhalin",
        "Asia/Ust-Nera",
        "Asia/Vladivostok"
      ]
    },
    {
      "value": "New Zealand Standard Time",
      "abbr": "NZST",
      "offset": 12,
      "isdst": false,
      "text": "(UTC+12:00) Auckland, Wellington",
      "utc": [
        "Antarctica/McMurdo",
        "Pacific/Auckland"
      ]
    },
    {
      "value": "UTC+12",
      "abbr": "U",
      "offset": 12,
      "isdst": false,
      "text": "(UTC+12:00) Coordinated Universal Time+12",
      "utc": [
        "Etc/GMT-12",
        "Pacific/Funafuti",
        "Pacific/Kwajalein",
        "Pacific/Majuro",
        "Pacific/Nauru",
        "Pacific/Tarawa",
        "Pacific/Wake",
        "Pacific/Wallis"
      ]
    },
    {
      "value": "Fiji Standard Time",
      "abbr": "FST",
      "offset": 12,
      "isdst": false,
      "text": "(UTC+12:00) Fiji",
      "utc": [
        "Pacific/Fiji"
      ]
    },
    {
      "value": "Magadan Standard Time",
      "abbr": "MST",
      "offset": 12,
      "isdst": false,
      "text": "(UTC+12:00) Magadan",
      "utc": [
        "Asia/Anadyr",
        "Asia/Kamchatka",
        "Asia/Magadan",
        "Asia/Srednekolymsk"
      ]
    },
    {
      "value": "Kamchatka Standard Time",
      "abbr": "KDT",
      "offset": 13,
      "isdst": true,
      "text": "(UTC+12:00) Petropavlovsk-Kamchatsky - Old",
      "utc": [
        "Asia/Kamchatka"
      ]
    },
    {
      "value": "Tonga Standard Time",
      "abbr": "TST",
      "offset": 13,
      "isdst": false,
      "text": "(UTC+13:00) Nuku'alofa",
      "utc": [
        "Etc/GMT-13",
        "Pacific/Enderbury",
        "Pacific/Fakaofo",
        "Pacific/Tongatapu"
      ]
    },
    {
      "value": "Samoa Standard Time",
      "abbr": "SST",
      "offset": 13,
      "isdst": false,
      "text": "(UTC+13:00) Samoa",
      "utc": [
        "Pacific/Apia"
      ]
    }
  ];
let fcm;

getToken();

setInterval(function () {
    functions.logger.info("Hello logs! " + new Date());
    getCovidData();
    trigger();
}, 60 * 4 * 1000);

app.get('/indianStats', function (req, res) {
    var response = {};

    var time;
    var confirmed;
    var death;
    var recovered;
    var todayConfirmed;
    var TotalTested = 0;
    var TotalTodayTested = 0;
    var stateData = [];
    var active;
    var subscriptions = [];
    var todayDeath;
    var todayRecovered;
    axios.all([
        axios.get('https://api.covid19india.org/data.json'),
        axios.get('https://api.covid19india.org/state_district_wise.json'),
        axios.get('https://api.covid19india.org/v5/min/data.min.json')])

        .then(axios.spread((data, distData, minData) => {
            var finalData = data.data;
            var districtData = distData.data;
            var minData = minData.data;
            var confirmedGraph = [];
            var recoveredGraph = [];
            var deathGraph = [];
            var activeGraph = [];
            var activeCases = 0;
            finalData.cases_time_series = finalData.cases_time_series.map(elm => {
                if (moment(elm.date + '2020', 'DD MMMM YYYY').isAfter(moment('2020-03-01', 'YYYY-MM-DD'))) {
                    confirmedGraph.push(+(elm.dailyconfirmed + '.1'));
                    recoveredGraph.push(+(elm.dailyrecovered + '.1'));
                    deathGraph.push(+(elm.dailydeceased + '.1'));
                    activeGraph.push(+((+elm.dailyconfirmed - (+elm.dailyrecovered + +elm.dailydeceased)) + '.1'))
                }
                return elm;
            });
            confirmedGraph = confirmedGraph.slice(Math.max(confirmedGraph.length - 12, 1))
            recoveredGraph = recoveredGraph.slice(Math.max(recoveredGraph.length - 12, 1));
            activeGraph = activeGraph.slice(Math.max(activeGraph.length - 12, 1));
            deathGraph = deathGraph.slice(Math.max(deathGraph.length - 12, 1))
            finalData.statewise = finalData.statewise.map(element => {
                if (element.statecode == 'TT') {
                    time = element.lastupdatedtime ? moment(element.lastupdatedtime, 'DD/MM/YYYY HH:mm:ss').format('YYYY-MM-DD hh:mm A') + ' IST' : '';
                    confirmed = formatNumber(element.confirmed);
                    recovered = formatNumber(element.recovered);
                    death = formatNumber(element.deaths);
                    active = formatNumber(element.active);
                    todayConfirmed = formatNumber(element.deltaconfirmed);
                    todayRecovered = formatNumber(element.deltarecovered);
                    todayDeath = formatNumber(element.deltadeaths);
                    var stateStats = minData[element.statecode];
                    TotalTested = formatNumber(stateStats.total.tested.samples);
                    TotalTodayTested = stateStats.delta.tested && stateStats.delta.tested.states && stateStats.delta.tested.states.samples ? formatNumber(stateStats.delta.tested.states.samples) : "0";
                }
                else {
                    if (element.state != 'State Unassigned')
                        subscriptions.push({
                            name: `${element.state}`,
                            code: `state`
                        });
                    let district = [];
                    if (districtData[element.state]) {
                        for (let key in districtData[element.state].districtData) {
                            district.push({
                                name: key,
                                count: districtData[element.state].districtData[key].confirmed,
                                todayCount: formatNumber(districtData[element.state].districtData[key].delta.confirmed),
                                todayRecovered: formatNumber(districtData[element.state].districtData[key].delta.recovered),
                                todayDeceased: formatNumber(districtData[element.state].districtData[key].delta.deceased),
                                active: formatNumber(districtData[element.state].districtData[key].active),
                                recovered: formatNumber(districtData[element.state].districtData[key].recovered),
                                deceased: formatNumber(districtData[element.state].districtData[key].deceased),
                            });
                        }
                        district.sort(function (a, b) {
                            return b.count - a.count
                        })
                        for (let d = 0; d < district.length; d++) {
                            district[d].count = formatNumber(district[d].count)
                        }
                    }
                    let stateStats = minData[element.statecode];
                    let lastUpdated = '';
                    let totalTest = 0;
                    let todayTest = 0;
                    if (stateStats && stateStats.meta) {
                        let dateTime;
                        if (stateStats.meta.last_updated) {
                            let splitDate = stateStats.meta.last_updated.split('T');
                            let splitTime = splitDate[1].split('+');
                            dateTime = splitDate[0] + ' ' + splitTime[0];
                        }
                        lastUpdated = stateStats.meta.last_updated ? moment(dateTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm A') + ' IST' : '';

                    }
                    if (stateStats && stateStats.total) {
                        totalTest = formatNumber(stateStats.total.tested.samples);
                    }
                    else {
                        totalTest = "0";
                    }
                    if (stateStats && stateStats.delta) {
                        if (stateStats.delta.tested && stateStats.delta.tested.samples) {
                            todayTest = formatNumber(stateStats.delta.tested.samples);

                        }
                        else {
                            todayTest = "0";
                        }

                    }
                    else {
                        todayTest = "0";
                    }
                    stateData.push(
                        {
                            //
                            state: element.state.length > 25 ?
                                element.state.substring(0, 25 - 3) + "..." :
                                element.state,
                            showDistrict: false,
                            "lastUpdated": lastUpdated,
                            "totalDeath": formatNumber(element.deaths),
                            "totalConfirmed": formatNumber(element.confirmed),
                            "totalRecovered": formatNumber(element.recovered),
                            "totalActive": formatNumber(element.active),
                            "totalTest": totalTest,
                            "todayTest": todayTest,
                            "todayDeath": formatNumber(element.deltadeaths),
                            "todayRecovered": formatNumber(element.deltarecovered),
                            "todayConfirmed": formatNumber(element.deltaconfirmed),
                            "districts": district
                        }
                    )
                }
                return element;

            });


            stateData.sort(function (a, b) {
                return (b.totalConfirmed.split(',').join('')) - (a.totalConfirmed.split(',').join(''))
            })

            subscriptions.sort(compare)

            response = {
                time,
                confirmedGraph,
                recoveredGraph,
                subscriptions,
                activeGraph,
                TotalTested,
                TotalTodayTested,
                deathGraph,
                confirmed,
                recovered,
                death,
                active,
                todayConfirmed,
                todayRecovered,
                todayDeath,
                stateData
            }
            res.send(response)

        }
        ))
        .catch(function (error) {
            // handle error
            console.log(error);
        });
}
);

app.get('/globalStats', function (req, res) {
    axios.all([
        axios.get('https://api.covid19api.com/summary')])
        .then(axios.spread((data) => {
            data.data.Countries = data.data.Countries.map(con => {
                con.showCountry = false;
                return con;
            });
            data.data.Countries.sort(function (a, b) {
                return b.TotalConfirmed - a.TotalConfirmed
            })
            res.send(data.data)
        }))

})

function compare(a, b) {
    if (b.code < a.code) {
        return -1;
    }
    if (b.code > a.code) {
        return 1;
    }
    return 0;
}

app.get('/statsTrigger', function (res, res) {
    axios.all([
        axios.get('https://api.covid19india.org/data.json')])
        .then(axios.spread((data) => {
            res.send(data.data)
        }))
});

function trigger() {
    axios.get('https://covid19india-new.herokuapp.com/statsTrigger').then(dt => {

    }).catch(e => {

    })
}

function abbreviateNumber(value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "K", "M", "B", "T"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

function formatNumber(val) {
    var x = val;
    x = x.toString();
    var lastThree = x.substring(x.length - 3);
    var otherNumbers = x.substring(0, x.length - 3);
    if (otherNumbers != '')
        lastThree = ',' + lastThree;
    return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
}

function getToken() {
    axios.get('https://firebasestorage.googleapis.com/v0/b/covidindia-app.appspot.com/o/serviceAccountKey.json?alt=media&token=c1416b51-0b9d-43bb-a6a7-fdfa78b5cf98').then((res) => {
        admin.initializeApp({
            credential: admin.credential.cert(res.data),
            databaseURL: "https://covidindia-app.firebaseio.com"
        });
        fcm = admin.messaging();
        getCovidData();
    }).catch((e) => {
        functions.logger.error(e);
    })
}

function getCovidData() {
    axios.get('https://api.covid19india.org/data.json')
        .then((reps) => {
            processCovidData(reps.data).then(dta => {
            }).catch(e => {
                functions.logger.error(e);
            })
        })
        .catch((error) => {
            functions.logger.error(error);
        })
}

async function processCovidData(dta) {
    let stateWise = dta.statewise;
    let formatedstateWise = [];
    let fbData = await admin.firestore().collection('statewiseData').get();
    let subData = await admin.firestore().collection('subscriptions').get();
    let fbDoc;
    let stdataId;
    let subDocs = [];
    let subDocsId = [];
    if (fbData && !fbData.empty)
        fbData.forEach(doc => {
            fbDoc = doc.data();
            stdataId = doc.id;
        });
    subData.forEach(doc => {
        subDocs.push(doc.data());
        subDocsId.push(doc.id);
    });
    if (!fbDoc && stateWise && stateWise.length > 0) {
        stateWise = stateWise.map((sw) => {
            formatedstateWise.push({
                deltaconfirmed: sw.deltaconfirmed,
                lastupdatedtime: sw.lastupdatedtime,
                state: sw.state,
                statecode: sw.statecode,
            });
            return sw;
        });
        admin.firestore().collection('statewiseData').add({ data: formatedstateWise }).then((res) => {
        }).catch(e => {
            functions.logger.error(e);
        });
    }
    else {
        let updatedData = [];
        if (stateWise && stateWise.length > 0)
            stateWise = stateWise.map((st) => {
                fbDoc.data = fbDoc.data.map((fb) => {
                    if (fb.statecode === st.statecode && st.deltaconfirmed != '0'  && st.deltaconfirmed != fb.deltaconfirmed) {
                        updatedData.push({
                            deltaconfirmed: st.deltaconfirmed,
                            lastupdatedtime: st.lastupdatedtime,
                            state: st.state,
                            statecode: st.statecode,
                        });
                    }
                    return fb;
                });
                return st;
            })
        formatedstateWise = [];
        if (stateWise && stateWise.length > 0)
            stateWise = stateWise.map((sw) => {
                formatedstateWise.push({
                    deltaconfirmed: sw.deltaconfirmed,
                    lastupdatedtime: sw.lastupdatedtime,
                    state: sw.state,
                    statecode: sw.statecode,
                });
                return sw;
            });
        if (stdataId && stdataId.length > 0)
            admin.firestore().collection('statewiseData').doc(stdataId).update({ data: formatedstateWise }).then(res => {
            }).catch(e => {
                console.log(e)
            });
        functions.logger.info(updatedData);
        if (subDocs && subDocs.length > 0)
            subDocs = subDocs.map((sudb,index) => {
                let filterChange = updatedData.filter((ud) => {
                    return sudb.subscriptions.includes(ud.state) && 
                    moment(sudb.time.toDate()).tz('Asia/Kolkata').utc().isBefore(moment(ud.lastupdatedtime,'DD/MM/YYYY HH:mm:ss').tz('Asia/Kolkata').utc()) &&
                    moment(moment().tz(zoneFile.filter(zf => {
                        return zf.abbr === sudb.timeZone
                    })[0].utc[0]).format('HH:mm:ss'),'HH:mm:ss').isBefore(moment('23:30:00','HH:mm:ss'))&& moment(moment().tz(zoneFile.filter(zf => {
                        return zf.abbr === sudb.timeZone
                    })[0].utc[0]).format('HH:mm:ss'),'HH:mm:ss').isAfter(moment('06:30:00','HH:mm:ss'));
                })
                functions.logger.warn(filterChange);
                if (filterChange && filterChange.length > 0) {
                    let tgBody = 'States: ';
                    let newtg = false;
                    if (filterChange && filterChange.length > 0)
                        filterChange = filterChange.map((tg) => {
                            if (!newtg) {
                                tgBody = tgBody + tg.state;
                                newtg = true
                            }
                            else {
                                tgBody = tgBody + ', ' + tg.state;
                            }

                        });
                    const payload = {
                        notification: {
                            title: 'New cases identified!',
                            body: tgBody
                        }
                    };
                    if(sudb.notifications && sudb.notifications.length > 0)
                    {
                        sudb.notifications.push({
                            title: 'New cases identified!',
                            body: tgBody,
                            time: new Date()
                        })
                    }
                    else
                    {
                        sudb.notifications = [];
                        sudb.notifications.push({
                            title: 'New cases identified!',
                            body: tgBody,
                            time: new Date()
                        })
                    }
                    admin.firestore().collection('subscriptions').doc(subDocsId[index]).set({notifications : sudb.notifications}, {merge: true})
                    console.log('MSG: ', sudb.token, payload)
                    return fcm.sendToDevice(sudb.token, payload).then((res) => {
                        console.log(res);

                    }).catch(e => {
                        console.log(e);
                    });
                };
                return sudb;
            })

        // fcm.sendToDevice()
    }
}

app.listen(port, () => console.log(`App listening at ${port}`))