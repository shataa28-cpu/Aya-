# SFDA Medicine Lookup Source

Checked: 2026-11-08
Search term shown in SDI: Panadol

## Official sources

- Public Saudi Drug Information System (SDI): https://sdi.sfda.gov.sa/
- Current search URL: https://sdi.sfda.gov.sa/Home/AdvancedSearch?textFilter=Panadol&TradName=&scientificName=&PharmaceuticalFormId=&PackageTypeId=&LegalStatusId=&therapeuticIndicationsFilter=&atcCodeFilter=
- SFDA service description for SDI: https://www.sfda.gov.sa/en/eservices/saudi-drugs-information-system-sdi

SFDA describes SDI as a reference for registered medicines. Its public service page links to SDI, but the documentation reviewed did not describe a public API or data export for application integration.

## Lookup result

The page currently shows the SDI advanced-search form with “Panadol” entered. It did not provide a product detail record in this session. The automated search request returned a `404`/`forbidden` response, so no registration number, strength, dosage form, manufacturer, or product leaflet was captured here.

This is a source and lookup note, not a verified medicine record. Do not mark a cabinet entry verified from this search page alone. A candidate must match the package details against an actual SDI product record. Automatic matching requires documented, authorized API or data access; this prototype does not bypass the SDI site's access controls.

## Current Medara behavior

Medara links to the official SDI site from the scan and cabinet screens. OCR only extracts package text. Product entries remain unverified until an authorized source integration and reliable product-matching flow are available.
