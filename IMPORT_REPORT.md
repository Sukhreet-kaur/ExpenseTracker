# CSV Import Report

**Application:** SplitSmart  
**Source file:** `Expenses Export.csv`  
**Report date:** June 14, 2026  
**Report basis:** Reproduction of the current `/api/groups/:id/import-csv/validate` logic

## Validation Summary

| Metric | Result |
|---|---:|
| CSV data rows processed | 42 |
| Rows marked valid by validator | 40 |
| Rows skipped by validator | 2 |
| Anomaly events reported | 6 |
| Silent name normalizations | 2 |
| Clean rows returned for approval | 10 |

The current code returns `uniqueResults.slice(0, 10)`. Consequently, although the modal says **Import 40 Expenses**, approval sends only 10 rows to the server. This is a known reporting/import mismatch.

## Every App-Detected Anomaly

| CSV row | Type | Detected value/problem | Action taken |
|---:|---|---|---|
| 7 | `comma_in_amount` | Amount `"1,200"` contains a comma | Removed comma and changed amount to `1200`; row retained |
| 13 | `missing_paid_by` | Payer is blank | Row skipped |
| 14 | `invalid_split_type` | Split type is blank | Defaulted to `equal`; row retained |
| 26 | `negative_amount` | Amount is `-30` | Retained as a refund; approval stores amount `30` and `is_refund: true` |
| 28 | `missing_currency` | Currency is blank | Defaulted to `INR`; row retained |
| 31 | `zero_amount` | Amount is `0` | Row skipped |

## Silent Transformations

These changes are performed by the app but are not added to its anomaly array.

| CSV row | Original | Result | Action |
|---:|---|---|---|
| 9 | `paid_by = priya` | `Priya` | Trimmed and capitalization normalized |
| 27 | `paid_by = "rohan "` | `Rohan` | Trailing space removed and capitalization normalized |

## Important Issues Not Detected by the Current App

| CSV row(s) | Issue | Current outcome |
|---:|---|---|
| 5-6 | Near-duplicate Marina Bites expenses | Both accepted |
| 10 | More than two decimal places | `899.995` accepted unchanged |
| 11 | Payer `Priya S` may not resolve | Accepted by validation; may fail during approval |
| 14 | Settlement represented as an expense | Imported as an expense if payer resolves |
| 15, 32 | Percentages total 110% | Accepted; details ignored and split equally |
| 23 | Unknown participant `Dev's friend Kabir` | Unknown member omitted during approval |
| 24-25 | Conflicting possible duplicate | Both accepted |
| 27 | `Mar-14` is not parsed into a complete transaction date | Validation accepts it; approval uses the current date |
| 34 | Ambiguous date meaning | Accepted as `DD-MM-YYYY` without warning |
| 36 | Possibly inactive member Meera | Accepted without date-aware membership validation |
| 38 | Possibly unresolved payer Sam | Accepted by validation; approval depends on database state |
| 42 | Equal split conflicts with share details | Accepted; details ignored |

## Approval-Stage Behavior

The exact number of database inserts depends on which users and group members exist at approval time. For each of the 10 rows sent by the current UI, the backend:

1. Resolves `paid_by` case-insensitively against users and group members.
2. Splits the absolute amount equally among resolvable `split_with` names.
3. Omits unresolved split participants and records only a server console warning.
4. Stores negative input as a positive amount with `is_refund: true`.
5. Returns `imported`, an `errors` array, and a completion message.

## Reconciliation Note

The previously supplied summary stated 45 processed rows, 33 imports, and 18 anomalies. Those numbers cannot be reproduced from the attached CSV and current source code: the CSV contains 42 data rows and the validator emits 6 anomaly events. This report uses the attached file and implementation as the source of truth.
