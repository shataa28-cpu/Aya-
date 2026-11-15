# Medara Prototype

Mobile-first medicine-cabinet prototype built with React, Vite, and in-browser Tesseract.js OCR.

## Run locally

Requirements: Node.js and npm.

```powershell
cd medara-app
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. In PowerShell, use `npm.cmd` if the `npm` script shim is blocked by the machine's execution policy.

## Try it

1. Open **Scan medicine** and choose a package photo.
2. Review and correct the English text detected in the browser.
3. Enter the package name and any quantity, expiration date, or location you want to track.
4. Confirm the label was checked, then add it as unverified.
5. Open **My cabinet** to edit, discard, remove, search, or filter entries. **Alerts** uses the saved expiration dates and the selected 7-, 14-, or 30-day reminder window.

You can also add a record manually from **My cabinet**. Records are stored in this browser's local storage and survive a page reload, but do not sync between browsers or devices.

## Prototype boundaries

- This iteration has no accounts, server, database, or cross-device sync. Do not enter sensitive personal information.
- OCR runs in the browser and reads English text only. It extracts visible characters; it does not identify a medicine.
- The official SFDA Saudi Drug Information System (SDI) search is linked from the scan and cabinet screens. SFDA publishes no API documentation for this service, and automated search requests are blocked, so Medara cannot fetch or validate results. Every cabinet entry remains unverified; compare the exact name, strength, and dosage form in SDI yourself. No ingredient, storage, safety-notice, or treatment information is provided.
- The cabinet links to the SFDA contact page and call centre (19999) for local disposal guidance. A verified Jeddah drop-off directory is not available in this prototype; confirm the destination before taking medicine to a pharmacy.
- Expiration alerts are calculated from dates entered by the user. Confirm package dates directly from the label.
- Barcode reading, Arabic OCR, verified local disposal locations, and safety notices are not implemented.

## Development checklist

- [x] Responsive overview, cabinet, scan, and alerts screens
- [x] Browser-based OCR with editable extracted text and uncertainty handling
- [x] Persistent local cabinet with add, edit, remove, used, and discarded states
- [x] Per-package quantities and expiration monitoring
- [x] Link and call action for SFDA disposal-route inquiries
- [ ] Secure authentication and database with per-user access controls
- [x] Direct link to the official SFDA SDI search
- [ ] Authorized SFDA data/API access for automatic product matching and source references
- [ ] Arabic OCR and right-to-left interface
- [ ] Verified local disposal-location directory and official safety notices

Next priority: connect an authenticated backend and a documented, verified medicine catalog before testing product matching or storing real household data.