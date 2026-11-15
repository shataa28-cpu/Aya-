# Product Requirements Document: Medara

**Product:** Medara — AI-Powered Smart Medicine Cabinet  
**Document status:** MVP definition  
**Initial market:** Households in Jeddah, Saudi Arabia  
**Primary platform:** Responsive web application, designed mobile-first

## 1. Product Summary

Medara helps households identify medicines from their packaging, review source-backed product information, and manage their medicine inventory. Users can scan or upload a medicine image, review possible matches, confirm the correct product, and save one or more package records with their own quantities and expiration dates.

The product must distinguish AI-extracted information from verified catalog data and user-entered details. It must report uncertainty rather than guess, and it must not provide diagnosis, personalized treatment recommendations, or dosage advice.

**Core workflow:** Scan → Recognize → Verify → Explain → Save → Monitor

## 2. Problem

Medicine packaging can be difficult to read, especially for older adults, caregivers, and people managing several household medicines. Households may also lose track of expiration dates, storage requirements, or what they have on hand.

Existing medicine information and inventory tools may not connect package recognition with reliable product information and practical household tracking. Medara aims to make that process more accessible and organized without presenting uncertain identification as fact.

## 3. Goals and Success Measures

### Product goals

- Let users create an account and maintain a private, persistent medicine cabinet.
- Identify supported medicines from images using a real OCR service and a product catalog.
- Show possible matches with their verification status and require user confirmation.
- Present product information with traceable sources.
- Track separate packages or batches independently, including different expiration dates.
- Surface expiration alerts and basic inventory insights.
- Support accessible use on smartphones and desktop browsers.

### Success measures

Measure during the initial household usability test:

- Account creation, sign-in, and return-session success.
- OCR extraction and candidate-match accuracy on supported packaging.
- Rate of uncertain or unsupported images correctly reported as unverified.
- User-confirmation and cabinet-entry completion rates.
- Accuracy of saved quantities and expiration dates.
- Successful retrieval, editing, and deletion of records after signing out and back in.
- Alert accuracy for approaching and expired products.
- Usability feedback from households, caregivers, and older adults.

Targets should be set after baseline testing with representative packaging and users.

## 4. Users

- **Household member:** Tracks medicines kept at home and monitors expiration dates.
- **Caregiver:** Manages records for a household while needing clear, readable information.
- **Older adult or low-vision user:** Benefits from accessible text and reduced need to read small labels.
- **Research participant:** Consents to contribute limited, anonymized usage data for product evaluation.

The MVP does not include shared household accounts or permission-based multi-user access unless separately prioritized.

## 5. MVP Scope

### P0: Required for initial usability testing

- Account registration, sign-in, sign-out, and password recovery.
- Empty and populated home dashboard based on the signed-in user’s actual records.
- Camera capture where supported, image upload, and manual medicine search.
- OCR-based text extraction from medicine packaging.
- Candidate matching against a documented, verified medicine catalog.
- User review and confirmation before a product is treated as identified.
- Medicine profile with available source-backed information and verification status.
- Persistent personal inventory with create, view, edit, and delete actions.
- Independent package or batch records with individual expiration dates.
- Expiration calculations and in-app alerts.
- User data access controls and privacy protections.

### P1: Include where feasible after P0 works

- Barcode scanning where supported by available data.
- Inventory search, filtering, and sorting.
- Possible duplicate-entry detection.
- Reminder preferences of 7, 14, or 30 days.
- Verified storage requirements and official safety notices.
- Basic disposal guidance from official sources.
- Accessibility improvements and improved Arabic packaging recognition.

### Out of scope for the MVP

- Diagnosis, prescribing, dosage guidance, or personalized suitability advice.
- Email or push notifications.
- Full bilingual interface and right-to-left localization.
- Household sharing and permission management.
- A comprehensive Saudi medicine catalog if authorized data access is unavailable.
- A disposal-location directory without verified program and location data.
- Generative AI answers that are not grounded in documented sources.

## 6. Functional Requirements

### 6.1 Welcome and Authentication

- Present Medara’s purpose and allow account creation or sign-in.
- Support secure registration, login, logout, and password recovery through the selected authentication provider.
- Keep account and inventory data private to the authenticated user.
- Provide an initially empty cabinet for a new account.

### 6.2 Home Dashboard

- Show a welcome message and counts based on the user’s saved inventory:
  - Package or inventory-record count.
  - Products approaching expiration.
  - Expired products.
  - Possible duplicate entries, when implemented.
- Provide a prominent **Scan Medicine** action and access to **My Cabinet**, **Alerts**, and **Search Medicines**.
- Do not use hardcoded or simulated statistics.

### 6.3 Scan and Recognition

- Allow users to capture a package image or upload an existing image.
- Provide an upload alternative if camera access is unavailable or denied.
- Provide manual medicine search as an alternative to image recognition.
- Display a processing state while OCR and matching run.
- Extract visible identifying text where possible, including product name, strength, dosage form, manufacturer, and expiration date.
- Support Arabic and English OCR where technically available.
- Do not infer unreadable fields. Ask the user to enter unclear expiration dates manually or leave them unknown.
- If no reliable match exists, display **Medicine not verified** and offer manual search.

### 6.4 Candidate Review and Confirmation

- Display extracted fields separately from catalog information.
- Show one or more potential matches with the available matching details and verification status.
- Do not treat a partial name match as confirmed identification.
- Allow users to correct extracted fields and select a candidate.
- Require explicit user confirmation before saving a product as identified.
- Record recognition status and the user-selected match for product improvement and troubleshooting, subject to privacy controls.

### 6.5 Medicine Information

- Display available trade name, scientific or generic name, active ingredients, strength, dosage form, manufacturer, storage conditions, and safety notices.
- Show source references, verification status, and the source record’s last-checked date.
- Clearly differentiate verified catalog information, AI-extracted text, and user-entered information.
- Use expandable sections where helpful.
- Do not generate unsupported medical facts, personalized treatment advice, or dosage recommendations.
- Provide **Add to My Cabinet** after the user has reviewed and confirmed the product.

### 6.6 Cabinet Records

- Let users record quantity, expiration date, date added, optional storage location, notes, and package photograph.
- Treat each separately tracked package or batch as its own record so expiration dates can differ.
- Do not derive an individual package’s expiration date from product registration or printed shelf-life information.
- Let users search by product name; filter by expiration status; and sort by name or expiration date.
- Allow users to view, edit, and remove records.
- Allow users to mark records as used, discarded, expired, or no longer needed.
- Persist changes across sign-out and sign-in.
- Confirm successful saves and explain errors in actionable language.

### 6.7 Alerts and Monitoring

- Calculate expiration status from the package’s user-confirmed expiration date.
- Show approaching-expiration and expired records in an alerts view, with links to the relevant cabinet record.
- Let users select an initial reminder window of 7, 14, or 30 days.
- Identify records with missing expiration dates.
- Detect possible duplicates using conventional inventory logic; label them as possible rather than definitive.
- Show storage alerts only when supported by verified catalog data.
- Show safety notices only when the product match and notice source are reliable. Do not imply a batch-specific recall applies without matching batch details.

### 6.8 Disposal and Waste Awareness

- Provide disposal guidance only when it comes from a verified official source.
- Clearly state when guidance or approved collection information is unavailable.
- Do not invent collection locations or imply all pharmacies accept returned medicines.
- Allow users to mark items as discarded or unused.
- Collect basic anonymized usage statistics only with appropriate consent.

## 7. Data and Verification Requirements

The system should support these entities:

- **Users:** Authentication reference, preferred language, reminder preferences, creation date.
- **Medicine catalog:** Product names, ingredients, strength, dosage form, manufacturer, verified identifiers, storage details, source, last-checked date.
- **Household inventory:** User, catalog reference where available, quantity, expiration date, location, date added, notes, image reference, status.
- **Alerts:** User, inventory record, alert type, message, alert date, read status.
- **Safety notices:** Source, affected product or batch identifiers, publication date, summary, applicable guidance.
- **Recognition results:** User, extracted fields, candidate matches, selected match, status, timestamp.

Prioritize SFDA data and investigate its access conditions and technical feasibility. If an official integration is unavailable, use a limited local catalog of carefully verified products. Document its sources and limitations. Never present simulated or unverified data as current official information.

## 8. Safety, Privacy, and Accessibility

- Product recognition remains unconfirmed until the user verifies it.
- Uncertain OCR or matching must produce an uncertainty state, not a guessed answer.
- No diagnosis, prescribing, personalized dosage advice, or advice to start or stop medication.
- Protect inventory through authenticated access controls; one user must not be able to access another user’s records.
- Do not expose API secrets in frontend code or sensitive user data in logs.
- Collect only information needed for cabinet management and product evaluation.
- Let users access, correct, and delete their inventory data.
- Use readable typography, accessible contrast, clear labels, and keyboard-accessible controls.
- Start in English while keeping the interface architecture ready for future Arabic localization and right-to-left layouts.

## 9. Dependencies and Risks

- **OCR and AI credentials:** Recognition requires a real OCR or AI service. If credentials are unavailable, clearly disclose that recognition is unavailable and retain manual search; do not fabricate results.
- **Medicine data access:** SFDA data access, coverage, and permitted use may constrain catalog scope. A local verified catalog is the fallback.
- **Recognition quality:** Packaging variation, lighting, orientation, and Arabic text may reduce accuracy. User confirmation and an explicit unverified state are required mitigations.
- **Expiration alerts:** Reliable alerts depend on users entering accurate package expiration dates.
- **Safety notices:** Product and batch matching must be sufficiently reliable before presenting a notice as applicable.
- **Privacy and consent:** Research analytics require appropriate consent and data minimization.

## 10. Acceptance Criteria

The MVP is ready for initial household testing when:

1. A user can register, sign in, and see an empty cabinet.
2. A clear image of a supported medicine produces extracted text and a suitable candidate from the verified catalog.
3. An unclear image or unsupported product is reported as uncertain or unverified, without invented facts.
4. A user can confirm a product and save quantity, expiration date, and optional storage location.
5. Saved records remain available after sign-out and sign-in.
6. A user can edit and delete a record, and the changes persist.
7. A record within the configured reminder window appears in alerts; expired records are identified correctly.
8. Two packages of the same product can have different quantities and expiration dates.
9. An unverified product does not receive invented ingredients, storage information, or safety notices.
10. One user cannot read or modify another user’s private inventory.

## 11. Delivery Priorities

1. Authentication, database access controls, and persistent inventory.
2. Scan/upload flow, OCR, verified catalog matching, and user confirmation.
3. Medicine profile, cabinet management, and expiration monitoring.
4. Focused usability and accessibility testing; fix safety and reliability gaps.
5. Add secondary capabilities such as duplicate detection, broader Arabic recognition, disposal guidance, and official safety-notice integration as data access permits.
