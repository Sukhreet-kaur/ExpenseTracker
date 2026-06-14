# SplitSmart Decision Log

## D1. Two-stage CSV import

**Decision:** Validate and preview the CSV before writing expenses.

**Options considered:** Import immediately; reject the whole file on any issue; validate, show a report, and require approval.

**Reason:** A preview gives users visibility into corrections and skipped rows while preserving control over the final write.

## D2. Stream CSV parsing in memory

**Decision:** Use `multer.memoryStorage()`, a Node `Readable`, and `csv-parser`.

**Options considered:** Save uploads to disk; parse manually; use a streaming parser.

**Reason:** The assignment file is small, and streaming avoids permanent upload files and hand-written CSV parsing errors. A production version should also enforce file-size limits.

## D3. Missing payer rows

**Decision:** Skip rows without `paid_by`.

**Options considered:** Assign the uploader; assign the group owner; import an incomplete record; skip.

**Reason:** Guessing a payer changes balances and creates false debt. Skipping is safer and is reported to the user.

## D4. Negative amounts

**Decision:** Treat negative values as refunds.

**Options considered:** Reject negatives; store a negative expense; store the absolute amount plus `is_refund`.

**Reason:** The dataset explicitly contains a refund. The chosen schema keeps the amount positive for calculations and preserves intent with `is_refund` and `original_amount`.

## D5. Missing currency

**Decision:** Default missing currency to INR.

**Options considered:** Reject the row; infer from surrounding rows; use the application's default currency.

**Reason:** INR is the product default and the dominant currency in the supplied file. The correction is deterministic and is shown in the report.

## D6. Missing split type

**Decision:** Default a blank split type to `equal`.

**Options considered:** Reject; infer from `split_details`; default to equal.

**Reason:** Equal is the model default and gives predictable behavior. However, settlement-like rows still need semantic review.

## D7. Zero-value rows

**Decision:** Skip zero amounts.

**Options considered:** Import for audit history; convert to a note; skip.

**Reason:** A zero expense does not affect balances and the supplied note indicates it was a correction placeholder.

## D8. Duplicate identity

**Decision:** Use exact `date + description + amount` identity and keep the first exact occurrence.

**Options considered:** No duplicate detection; exact composite key; fuzzy text and payer matching.

**Reason:** Exact matching is deterministic and avoids deleting legitimate similar purchases. Fuzzy matches should be surfaced for review, not automatically removed.

## D9. Name normalization and identity resolution

**Decision:** Trim payer names, normalize capitalization, and resolve users case-insensitively.

**Options considered:** Require exact text; normalize names; create users automatically.

**Reason:** Normalization handles harmless formatting differences. Unknown users are not auto-created because similar names may refer to different people.

## D10. Ambiguous or malformed dates

**Decision:** Attempt deterministic repair only for recognized short month forms; otherwise skip or request review.

**Options considered:** Let JavaScript parse any date; replace invalid dates with today; strict parsing with explicit review.

**Reason:** Transaction dates affect reports and membership history. The current `Mar-14` path does not fully honor this decision and is recorded as a known defect.

## D11. Conflicting split information

**Decision:** Treat disagreement between `split_type` and `split_details`, or invalid percentage totals, as review-required.

**Options considered:** Trust `split_type`; trust details; silently use equal splits; block pending correction.

**Reason:** Silently choosing one source can alter who owes money. The present importer uses equal shares and should be strengthened to enforce this decision.

## D12. MongoDB with embedded split records

**Decision:** Use separate User, Group, Expense, and Activity collections, with group membership and expense splits embedded.

**Options considered:** Fully normalized relational schema; one large group document; separate MongoDB collections with embedded subdocuments.

**Reason:** Expenses and activities have independent lifecycles, while members and split allocations are naturally read with their parent records.

## D13. Money representation

**Decision:** Keep the existing Mongoose `Number` representation for assignment scope.

**Options considered:** Floating-point numbers; integer minor units; Decimal128.

**Reason:** `Number` matched the existing application and minimized change. Integer paise or Decimal128 would be safer for production, especially for `899.995` and currency conversion.

## D14. Import reporting

**Decision:** Return summary counts, every detected anomaly, its action, and clean preview data from the validation API.

**Options considered:** Console logs only; summary only; detailed API report.

**Reason:** The assignment requires anomalies to be visible and explainable. The report should eventually be persisted and downloadable for auditability.
