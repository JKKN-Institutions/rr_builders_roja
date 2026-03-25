# JICATE Solutions — Tally Bridge Statement of Work

---

**SOW No:** {SOW_NUMBER}
**Date:** {DATE}
**Delivery Model:** {DELIVERY_MODEL}

---

## 1. Parties

**Service Provider:**
JICATE Solutions Pvt Ltd
[TODO: Add registered address — contact accounts@jkkn.ac.in]
[TODO: Add GST Number — contact accounts@jkkn.ac.in]
D-U-N-S: 857957194

**Client:**
{CLIENT_COMPANY}
{CLIENT_NAME}
[Client Address Line 1]
[Client Address Line 2]

---

## 2. Service Description

JICATE Solutions will deliver the **Tally Bridge** service — an automated, real-time sync of accounting data from TallyPrime (India's leading accounting software) to a secure cloud dashboard.

The bridge reads voucher data from TallyPrime's API, securely transmits it to a cloud database, and presents it on a web-based dashboard accessible from any device, anywhere.

---

## 3. Scope of Work — What's INCLUDED

### 3.1 Setup & Installation

- [ ] Bridge software installation on the client's designated Windows computer
- [ ] Cloud account provisioning (secure database + web dashboard)
- [ ] Configuration for **{COMPANY_COUNT}** Tally company/companies
- [ ] Initial full data sync — all vouchers for the current financial year
- [ ] Automated sync setup — incremental sync every 60 seconds during business hours
- [ ] Auto-start configuration — bridge runs automatically on computer boot
- [ ] Nightly reconciliation — full data integrity check at 11:00 PM daily

### 3.2 Dashboard

- [ ] Cloud dashboard deployment with voucher data display
- [ ] Dashboard accessible via unique URL from any browser
- [ ] Real-time data refresh (new vouchers appear within 2 minutes)

### 3.3 Handover

- [ ] CBO walkthrough and live verification of the complete setup
- [ ] Setup documentation with credentials and support contacts

### 3.4 Support

**If Delivery Model is PaP (Plug and Play):**
- 30-day post-setup support via phone and remote access (AnyDesk/TeamViewer)
- Support covers: sync issues, bridge restarts, dashboard access problems
- Support hours: Monday to Saturday, 9:00 AM – 6:00 PM IST

**If Delivery Model is MO (Managed Operations):**
- Ongoing monitoring of sync health and bridge uptime
- Automated alerting for sync failures or connectivity issues
- Monthly health reports (sync uptime %, data volume, error summary)
- Priority support with response within 4 business hours
- Proactive issue resolution — JICATE identifies and fixes problems before the client notices
- Regular bridge software updates applied during non-business hours

---

## 4. Scope — What's NOT Included

The following items are expressly excluded from this engagement:

1. **TallyPrime software licence** — Client must hold a valid TallyPrime licence
2. **Internet connectivity** — Client is responsible for providing stable internet
3. **Computer hardware or upgrades** — No hardware procurement or modification
4. **Custom reports** beyond the standard dashboard views included in the setup
5. **Data migration** from other accounting software (e.g., Zoho Books, QuickBooks)
6. **TallyPrime training** — This service does not include training on how to use TallyPrime
7. **Modifications to client's TallyPrime data** — JICATE will not create, edit, or delete any entries in TallyPrime
8. **TallyPrime configuration changes** — Beyond enabling the API Server (Port 9000), no changes will be made to TallyPrime settings

Any of the above items may be provided as a separate engagement at additional cost upon request.

---

## 5. Prerequisites — Client Responsibilities

The client must ensure the following are in place before setup begins:

| # | Requirement | Details |
|:--|:------------|:--------|
| 1 | **TallyPrime installed and running** | With the relevant company/companies loaded |
| 2 | **Designated computer** | Windows 10 or Windows 11, minimum 4 GB RAM |
| 3 | **Stable internet connection** | Required for cloud sync (minimum 2 Mbps recommended) |
| 4 | **TallyPrime API Server enabled** | Port 9000 (JICATE will guide if needed) |
| 5 | **Remote access software** | AnyDesk or TeamViewer installed for remote setup |
| 6 | **Designated contact person** | Available during the setup window, reachable by phone |
| 7 | **Administrator access** | On the designated computer (for software installation and auto-start setup) |

> **Note:** If any prerequisite is not met at the time of setup, the session will be rescheduled at a mutually convenient time. Repeated rescheduling due to unmet prerequisites is subject to availability.

---

## 6. Acceptance Criteria

The setup will be considered complete and accepted when ALL of the following are verified:

- [ ] Bridge connects to TallyPrime and reads company data successfully
- [ ] All vouchers for the current financial year are synced to the cloud database
- [ ] Cloud dashboard is accessible via URL and displays voucher data correctly
- [ ] Auto-sync is operational — a new voucher created in TallyPrime appears on the dashboard within 2 minutes
- [ ] Auto-start is configured — bridge resumes operation after a computer restart
- [ ] Test voucher round-trip verified — voucher created in TallyPrime is visible on the dashboard

The CBO will perform these checks during the handover walkthrough. The client will be asked to confirm acceptance verbally or in writing.

---

## 7. Timeline

| Phase | Small (1–2 companies) | Medium (3–5 companies) | Large (6+ companies) |
|:------|:----------------------|:-----------------------|:---------------------|
| Cloud provisioning | 5 minutes | 5 minutes | 5 minutes |
| Bridge installation | 15–25 minutes | 15–25 minutes | 15–25 minutes |
| Initial data sync | 1–5 minutes | 5–15 minutes | 15–30 minutes |
| Verification & handover | 10 minutes | 10 minutes | 10 minutes |
| **Total estimated time** | **~1 hour** | **~1–2 hours** | **~2–3 hours** |

Setup is performed remotely via AnyDesk or TeamViewer. Times are estimates and may vary based on voucher volume and internet speed.

---

## 8. Change Request Process

1. Any changes to the scope defined in this SOW must be submitted as a written request (email is acceptable).
2. JICATE Solutions will provide an impact assessment within **2 business days**, including any effect on timeline or cost.
3. Additional charges may apply for work outside the defined scope.
4. No out-of-scope work will commence without written approval from both parties.
5. Changes to the project timeline will be communicated to the client in advance.

---

## 9. Confidentiality & Data Security

1. **Encryption:** All client financial data is encrypted in transit (HTTPS/TLS) and at rest (AES-256).
2. **Access Control:** Access to client data is restricted to authorised JICATE personnel only. No third-party access.
3. **Data Retention:** Client data is retained in the cloud database only for the duration of the active service. Upon termination, data is retained for 30 days and then permanently deleted.
4. **Data Deletion:** The client may request deletion of their cloud data at any time. JICATE will process the request within 5 business days.
5. **No Data Modification:** JICATE will never create, modify, or delete any data in the client's TallyPrime installation.
6. **Compliance:** JICATE follows industry-standard security practices for handling financial data.

---

## 10. Service Termination

**PaP (Plug and Play):**
- Service concludes after the 30-day support period.
- The bridge and dashboard remain operational. The client manages them independently.
- JICATE may be re-engaged for support or troubleshooting at prevailing rates.

**MO (Managed Operations):**
- Minimum commitment: 3 months from date of setup completion.
- Either party may terminate with 30 days' written notice (after the minimum commitment period).
- Upon termination, JICATE will provide a handover summary and disable monitoring.
- The bridge and dashboard remain operational; the client assumes responsibility for management.
- Outstanding monthly retainer fees (if any) become due upon termination.

---

## 11. Limitation of Liability

1. JICATE Solutions' total liability under this SOW shall not exceed the total fees paid by the client.
2. JICATE is not responsible for data loss caused by TallyPrime crashes, hardware failure, or internet outages on the client's end.
3. JICATE is not responsible for the accuracy of data within TallyPrime — the bridge syncs data as-is.
4. Downtime caused by TallyPrime not running, the computer being shut down, or internet disconnection is outside JICATE's control.

---

## 12. Signatures

By signing below, both parties agree to the scope, terms, and conditions outlined in this Statement of Work.

---

### JICATE Solutions (Service Provider)

| | |
|:--|:--|
| **Name** | _________________________________________ |
| **Designation** | _________________________________________ |
| **Signature** | _________________________________________ |
| **Date** | _________________________________________ |

---

### {CLIENT_COMPANY} (Client)

| | |
|:--|:--|
| **Name** | _________________________________________ |
| **Designation** | _________________________________________ |
| **Signature** | _________________________________________ |
| **Date** | _________________________________________ |

---

*JICATE Solutions | Tally Bridge Service*
*{CBO_EMAIL} | {CBO_PHONE}*
