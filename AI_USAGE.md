# AI Usage Disclosure

## Tools Used

| Tool | How it was used |
|---|---|
| Cursor AI | Generated and revised React/Express code, especially CSV import handling and UI wiring |
| ChatGPT-4 | Discussed architecture, anomaly policies, debugging approaches, and documentation structure |
| GitHub Copilot | Suggested local completions and repetitive JSX/JavaScript code |
| OpenAI Codex | Audited the submitted repository against the attached CSV and generated `SCOPE.md`, `DECISIONS.md`, `IMPORT_REPORT.md`, and this disclosure |

All AI output was treated as a draft. I reviewed source code, API behavior, the Mongoose models, and the supplied CSV before accepting it.

## Key Prompts

The following are representative reconstructions of the prompts used during development; wording may differ from the original conversations.

1. `Design a MERN Splitwise-style application with JWT authentication, groups, expenses, balances, settlements, and activity history.`
2. `Create Express endpoints that validate an uploaded expense CSV, detect anomalies, return a detailed report, and import approved rows.`
3. `Handle missing payers, negative refunds, comma-formatted amounts, malformed dates, missing currency, zero values, duplicates, and inconsistent names.`
4. `Build a React modal that shows total, valid, skipped, and anomalous rows, lists each issue and action, previews clean data, and lets the user approve import.`
5. `Review this CSV import error and explain why JavaScript date parsing fails for Mar-14.`
6. `Document the anomaly policy, MongoDB schema, major implementation decisions, import report, and AI usage for the assignment.`

## Concrete AI Errors and Corrections

### 1. Incorrect date handling for `Mar-14`

**AI output:** Suggested relying on `new Date("Mar-14")` or loosely recognizing the string as valid.

**Why it was wrong:** The value has no unambiguous year and the current validator marks it valid without converting it. The approval parser then cannot split it as `DD-MM-YYYY` and falls back to the current date.

**How I caught it:** I traced `isValidDate`, `fixDate`, and the approval date parser against CSV row 27.

**What changed:** Added explicit date-handling logic during development and documented the remaining mismatch. The correct policy is strict parsing plus user review for ambiguous dates, not silent fallback to today.

### 2. Duplicate detection was too narrow

**AI output:** Proposed `date + description + amount` as complete duplicate detection.

**Why it was wrong:** It only catches exact text. Rows 5-6 describe the same restaurant/date/payer/amount with different capitalization and wording, while rows 24-25 are a possible conflicting duplicate with different payer and amount.

**How I caught it:** I compared the composite-key rule with the actual CSV rows.

**What changed:** Kept exact matching only for deterministic automatic skips and classified fuzzy or conflicting matches as review-required. The limitation is explicitly documented.

### 3. The AI overstated anomaly coverage

**AI output:** Produced a summary claiming 15 anomaly categories and a run with 45 rows, 33 imports, and 18 anomalies.

**Why it was wrong:** The attached CSV has 42 data rows. The current validator explicitly emits only six anomaly events for that file and implements fewer categories than the summary claimed.

**How I caught it:** I counted the CSV rows and manually executed each branch of the validation code against them.

**What changed:** Replaced the unsupported claim with a reproducible import report and separated app-detected issues from known but undetected data problems.

### 4. Validation preview accidentally limited the real import

**AI output:** Used `uniqueResults.slice(0, 10)` to reduce response size, then reused that same array as the approval payload.

**Why it was wrong:** The UI can display `40 valid` while sending only 10 clean rows for import.

**How I caught it:** I followed `clean_data` from the validation response into `importReport.cleanData` and then into the approval request body.

**What changed:** Documented the defect and the required design correction: return all clean rows or persist an import session server-side, while slicing only the visual preview.

### 5. Split details were ignored

**AI output:** Generated support for split type labels but imported every CSV row by dividing equally among `split_with` users.

**Why it was wrong:** Unequal, percentage, and share rows have meaningful `split_details`. Some supplied percentages total 110%, and row 42 conflicts with its split type.

**How I caught it:** Compared CSV rows 12, 15, 22, 32, 35, and 42 with the approval loop.

**What changed:** Documented strict validation as the intended policy. Conflicting or invalid details must be reported and corrected rather than silently converted to equal splits.

## Verification Practice

- Compared AI claims with the actual CSV rather than relying on generated summaries.
- Traced data from upload, through validation, into the approval request and MongoDB models.
- Checked whether every documented anomaly type had a corresponding code branch.
- Recorded known limitations instead of presenting unfinished behavior as complete.
