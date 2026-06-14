# SplitSmart Scope and Data Anomaly Log

## Scope

SplitSmart is a full-stack expense-sharing application built with React, Vite, Node.js, Express, MongoDB, Mongoose, JWT, `multer`, and `csv-parser`.

The implemented scope includes:

- User registration and login.
- Group creation and member management.
- Expense creation using equal, unequal, percentage, and share labels.
- Group balances, settlements, and activity history.
- Two-stage CSV ingestion: validate and preview, followed by user-approved import.
- An import report containing row counts, detected anomalies, actions, and a preview.

The CSV reviewed for this document is `Expenses Export.csv`, dated June 14, 2026. It contains one header row and 42 data rows.

## Expected CSV Contract

| Column | Purpose |
|---|---|
| `date` | Expense date, normally `DD-MM-YYYY` |
| `description` | Human-readable expense description |
| `paid_by` | Payer name |
| `amount` | Numeric amount; negative values represent refunds |
| `currency` | `INR`, `USD`, `EUR`, or `GBP` |
| `split_type` | `equal`, `unequal`, `percentage`, or `share` |
| `split_with` | Semicolon-separated participant names |
| `split_details` | Optional percentages, shares, or unequal amounts |
| `notes` | Optional free-text context |

## Anomaly Policy

Actions used below:

- **Auto-fix:** deterministic correction that does not require business judgment.
- **Keep with flag:** retain the row while recording its special meaning.
- **Skip:** do not import because required information is absent or the amount is zero.
- **Review required:** the application cannot safely infer intent.
- **Not currently detected:** a real data issue that the present validator does not report.

## Dataset Anomaly Log

CSV row numbers include the header as row 1.

| CSV row(s) | Data problem | Current application behavior | Handling policy |
|---|---|---|---|
| 5-6 | Likely semantic duplicate: same date, payer, amount, and restaurant with differently worded descriptions | Not detected because duplicate identity uses exact `date + description + amount` | Review required; do not auto-delete fuzzy matches |
| 7 | Amount contains a thousands separator: `"1,200"` | Removes the comma and reports `comma_in_amount` | Auto-fix to `1200` |
| 9 | Payer is lowercase: `priya` | Silently normalizes to `Priya` | Auto-fix; should also be included in the report |
| 10 | Amount has more than two decimal places: `899.995` | Imported without rounding | Round using a documented two-decimal money rule before storage |
| 11 | Payer `Priya S` does not exactly match `Priya` | Validation accepts it; approval may reject it as an unknown user | Review required; never guess a person's identity |
| 13 | Missing `paid_by` | Reports `missing_paid_by` and skips the row | Skip because a payer is required |
| 14 | Settlement is represented as an expense and `split_type` is blank | Defaults `split_type` to `equal`; does not classify the settlement | Review required; settlement rows should use the settlement workflow |
| 15 | Percentage details total 110%, not 100% | Not detected; importer ignores `split_details` and divides equally | Reject or request correction before import |
| 23 | `Dev's friend Kabir` may not be a registered group member | Not detected during validation; unknown names are omitted during approval | Report the invalid member and require review |
| 24-25 | Possible duplicate/conflicting Thalassa expenses with different payer and amount | Not detected by exact duplicate rule | Review required; retain both until a user resolves the conflict |
| 26 | Negative amount `-30` | Reports `negative_amount`; stores absolute amount and sets `is_refund: true` | Keep as refund with an explicit flag |
| 27 | Ambiguous short date `Mar-14`, lowercase payer, and trailing payer whitespace | Date is incorrectly accepted as valid; payer is silently normalized to `Rohan`; approval falls back to the import date because it cannot parse the date | Review date; trim and normalize payer; do not invent the transaction date |
| 28 | Missing currency | Reports `missing_currency` and defaults to `INR` | Auto-fix to INR under the assignment's default-currency policy |
| 31 | Zero amount | Reports `zero_amount` and skips the row | Skip because it has no financial effect |
| 32 | Percentage details total 110%, not 100% | Not detected; importer divides equally | Reject or request correction before import |
| 34 | `04-05-2026` is syntactically valid but semantically ambiguous, as confirmed by its note | Not detected | Review required; preserve raw value until clarified |
| 36 | Split includes Meera after the notes say she moved out | Not detected | Validate participants against membership active on the expense date |
| 38 | Payer `Sam` may not yet exist in the group | Validation accepts it; approval depends on database membership | Review required if the member cannot be resolved |
| 42 | `split_type` is `equal`, but `split_details` contains shares | Not detected; share details are ignored | Report a conflicting split definition and require one authoritative method |

The file has six events that the current validator explicitly reports: rows 7, 13, 14, 26, 28, and 31. It also performs two silent name normalizations on rows 9 and 27. The remaining issues require additional validation or human review.

## Database Schema

MongoDB is used through Mongoose. Monetary values are currently stored as JavaScript `Number` values.

### `users`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Primary identifier |
| `name` | String | Required, trimmed |
| `email` | String | Required, unique, lowercase, email pattern |
| `phoneNumber` | String | Required, unique, exactly 10 digits |
| `password` | String | Required, minimum 6 characters, bcrypt hash |
| `avatar` | String | Defaults to empty string |
| `createdAt` | Date | Defaults to current time |

### `groups`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Primary identifier |
| `name` | String | Required, trimmed |
| `icon` | String | Default group icon |
| `members[]` | Embedded documents | User reference, copied name/email, join/leave dates, active flag |
| `createdBy` | ObjectId -> User | Required |
| `totalExpenses` | Number | Defaults to `0` |
| `createdAt`, `updatedAt` | Date | Default to current time |

### `expenses`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Primary identifier |
| `description` | String | Required |
| `amount` | Number | Required; imported refunds are stored as an absolute value |
| `original_amount` | Number | Original imported amount |
| `currency` | String | `INR`, `USD`, `EUR`, or `GBP`; defaults to `INR` |
| `date` | Date | Defaults to current time |
| `paidBy` | ObjectId -> User | Required |
| `group` | ObjectId -> Group | Required |
| `split_type` | String | `equal`, `unequal`, `percentage`, or `share` |
| `splitBetween[]` | Embedded documents | User, amount, percentage, shares, settled flag |
| `split_details` | String | Optional raw split details |
| `notes` | String | Optional |
| `is_refund` | Boolean | Defaults to `false` |
| `createdAt` | Date | Defaults to current time |

### `activities`

| Field | Type | Rules |
|---|---|---|
| `_id` | ObjectId | Primary identifier |
| `user` | ObjectId -> User | Required |
| `action` | String | `paid`, `added`, `settled`, `joined`, `created`, or `left` |
| `amount` | Number | Optional |
| `description` | String | Optional |
| `withUser` | String | Optional display name |
| `group` | ObjectId -> Group | Optional |
| `createdAt` | Date | Defaults to current time |

## Known Scope Limitations

- Validation returns only the first 10 clean rows in `clean_data`; therefore approval can import at most 10 rows even when the report says more are valid.
- The UI displays only the first 20 anomaly entries.
- `split_details` is not applied during CSV import; all resolved participants receive equal amounts.
- Exact duplicate matching does not catch near-duplicates or conflicting records.
- Date validation checks shape rather than calendar validity or ambiguity.
- Row-level import reports are not persisted in MongoDB.
