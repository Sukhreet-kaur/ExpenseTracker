# 💰 SplitSmart - Shared Expense Management System

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A modern, full-stack expense tracking application similar to Splitwise. Split bills, track expenses, and settle balances with friends and family effortlessly.

---

## 🚀 Live Demo

**Frontend:** [https://ExpenseTracker/](https://sukhreet-kaur.github.io/ExpenseTracker/)
**Backend API:** [https://splitsmart-api.onrender.com](https://expensetrackbackend-2q0m.onrender.com)

### Test Credentials

---

## ✨ Features

### Core Features
- ✅ **User Authentication** - Secure JWT-based login/signup
- ✅ **Group Management** - Create and manage multiple expense groups
- ✅ **Expense Tracking** - Add expenses with 4 split types (Equal, Unequal, Percentage, Share)
- ✅ **Balance Calculation** - Automatic debt/credit calculations in real-time
- ✅ **Settlement System** - Simplify debts and record payments
- ✅ **CSV Import** - Smart import with anomaly detection (15+ data issues handled)

### Advanced Features
- 🎯 **Real-time Balance Updates** - Balances update instantly when expenses are added
- 📊 **Interactive Dashboard** - View all groups and financial summary at a glance
- 👥 **Member Management** - Add/remove members, track who left
- 📈 **Drill-down Reports** - Click on any balance to see expense breakdown
- 💱 **Multi-currency Support** - INR, USD, EUR, GBP with automatic conversion
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### CSV Import Intelligence
The CSV importer detects and handles **15+ data anomalies**:

| Anomaly | Detection | Action |
|---------|-----------|--------|
| Missing paid_by | ✓ | Skip row |
| Negative amounts | ✓ | Treat as refund |
| Commas in amount | ✓ | Auto-remove |
| Invalid date format | ✓ | Auto-correct |
| Missing currency | ✓ | Default INR |
| Missing split type | ✓ | Default equal |
| Zero amount | ✓ | Skip row |
| Duplicate entries | ✓ | Keep first, skip rest |
| Future dates | ✓ | Warning only |
| High precision | ✓ | Round to 2 decimals |
| Case mismatch | ✓ | Auto-capitalize |
| Extra spaces | ✓ | Auto-trim |
| Invalid members | ✓ | Skip from split |
| Empty rows | ✓ | Skip |
| Conflicting amounts | ✓ | User prompt |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| React Router DOM | 6.14.0 | Navigation |
| Lucide React | 0.263.0 | Icons |
| CSS3 | - | Styling (No Tailwind) |
| Vite | 5.0 | Build Tool |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime |
| Express.js | 4.18.2 | API Framework |
| MongoDB | 6.0 | Database |
| Mongoose | 8.0 | ODM |
| JWT | 9.0 | Authentication |
| bcryptjs | 2.4 | Password Hashing |
| csv-parser | 3.0 | CSV Processing |

---

## 📂 Project Structure
ExpenseTracker/
├── frontend/ # React Application
│ ├── src/
│ │ ├── components/
│ │ │ ├── Login.jsx
│ │ │ ├── Login.css
│ │ │ ├── Signup.jsx
│ │ │ ├── Signup.css
│ │ │ ├── Dashboard.jsx
│ │ │ ├── Dashboard.css
│ │ │ ├── GroupDetail.jsx
│ │ │ ├── GroupDetail.css
│ │ │ └── AddExpenseModal.jsx
│ │ ├── App.jsx
│ │ ├── App.css
│ │ └── main.jsx
│ └── package.json
│
├── backend/ # Node.js API
│ ├── models/
│ │ ├── User.js
│ │ ├── Group.js
│ │ ├── Expense.js
│ │ └── Activity.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── dashboard.js
│ │ └── groups.js
│ ├── middleware/
│ │ └── auth.js
│ ├── config/
│ │ └── db.js
│ ├── server.js
│ └── package.json
│
├── README.md
├── SCOPE.md
├── DECISIONS.md
├── AI_USAGE.md
└── IMPORT_REPORT.md

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn


🎯 Usage Guide
1. Create an Account
Sign up with phone number and email

Verify your credentials

2. Create a Group
Click "Create New Group"

Add group name and icon

Invite members by email

3. Add Expenses
Click "Add Expense"

Enter description and amount

Select who paid

Choose split type:

Equal: Everyone pays equally

Unequal: Custom amounts per person

Percentage: Split by percentage

Share: Split by share ratio

4. Track Balances
View who owes whom

Click on any balance to see expense breakdown

Settle up with one click

5. Import CSV
Go to "Import CSV" tab

Upload your expenses CSV

Review anomaly report

Approve import
