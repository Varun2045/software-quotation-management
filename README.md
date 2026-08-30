# Software Quotation Management System

A modern, full-featured web application developed for **Triple S Software Solutions** to create, calculate, manage, export, and delete software quotations with automated tax & discount calculations, Supabase authentication & database integration, and PDF generation.

---

## 🚀 Live Demo & Repository

- **GitHub Repository**: [Your GitHub Repo URL]
- **Live Vercel Deployment**: [Your Vercel Deployment URL]
- **Default Test Credentials**:
  - **Email**: `demo@triples.software`
  - **Password**: `DemoPassword123!`
  - *(Alternatively, use the 1-Click "Instant Demo Login" on the login page)*

---

## 🌟 Key Features

### 1. 🔐 Authentication & Session Management
- **Supabase Auth**: Secure Email & Password login and sign up.
- **Session Persistence**: Protected application routes and logout capability.
- **1-Click Demo Evaluation**: Quick demo sign-in for seamless testing without configuring third-party providers.

### 2. ⚡ Dynamic Quotation Builder & Automatic Calculation
- Real-time calculations with instant reactive updates as items, quantities, prices, or discounts change:
  - **$\text{Gross Amount} = \text{Quantity} \times \text{Unit Price}$**
  - **$\text{Discount Amount} = \text{Gross Amount} \times (\text{Discount \%} / 100)$**
  - **$\text{Net Amount} = \text{Gross Amount} - \text{Discount Amount}$**
  - **$\text{Subtotal} = \sum \text{Net Amounts}$**
  - **$\text{GST} = \text{Subtotal} \times (\text{GST \%} / 100)$**
  - **$\text{Grand Total} = \text{Subtotal} + \text{GST}$**
- Add / Remove unlimited product or service rows dynamically.
- Form validations (customer name required, valid email format, positive quantity, non-negative price, required quotation date).

### 3. 📊 Quotation Management & Dashboard
- **Quotation List**: View all quotations with Quotation #, Customer Name, Company, Date, Grand Total, and Status.
- **Search & Filter**: Real-time multi-attribute search (by quotation number, customer name, company) and status filtering.
- **Interactive Dashboard**: Summary metrics including Total Quotations, Gross Pipeline Value, Average Quote Value, and Monthly Volume.

### 4. 📄 Professional Quotation View, Print & PDF Export
- **Clean Invoice Layout**: Detailed item breakdown, company header, customer details, tax rates, and terms & conditions.
- **One-Click PDF Generation**: Client-side vectorized PDF export using `jsPDF` and `jspdf-autotable`.
- **Print Optimization**: Dedicated `@media print` styling for standard A4 paper printing.

### 5. ✏️ Full CRUD & Bonus Features
- **Create Quotation**: Rich form with dynamic items and live preview.
- **View Quotation**: Printable document preview.
- **Edit Quotation**: Modify existing quotation details and line items.
- **Delete Quotation**: Confirmation modal dialog with cascading item cleanup.
- **Configurable GST Rates**: Support for 18%, 12%, 5%, 0%, 28%.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [Next.js 14/15](https://nextjs.org/) (App Router, Server & Client Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) with custom UI components |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Backend** | [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security) |
| **Authentication** | Supabase Auth |
| **PDF Engine** | `jspdf` & `jspdf-autotable` |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 🗄️ Database Architecture

The application uses two primary relational tables in PostgreSQL on Supabase:

### `public.quotations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier (`gen_random_uuid()`) |
| `user_id` | UUID | REFERENCES auth.users | Owner of the quotation |
| `quotation_number`| TEXT | UNIQUE NOT NULL | Human-readable quotation code (e.g., `QT-202608-1001`) |
| `customer_name` | TEXT | NOT NULL | Customer or client contact name |
| `company_name` | TEXT | NULL | Organization or corporate name |
| `email` | TEXT | NOT NULL | Customer email address |
| `phone` | TEXT | NULL | Customer phone number |
| `quotation_date` | DATE | NOT NULL | Date of issuance |
| `valid_until` | DATE | NULL | Expiration date |
| `gst_rate` | NUMERIC | NOT NULL (default 18.00) | Tax percentage |
| `subtotal` | NUMERIC | NOT NULL | Net sum of all line items |
| `gst` | NUMERIC | NOT NULL | Computed tax amount |
| `total` | NUMERIC | NOT NULL | Grand total inclusive of tax |
| `status` | TEXT | NOT NULL (default 'draft') | 'draft', 'sent', 'approved', 'rejected' |
| `notes` | TEXT | NULL | Payment terms and instructions |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

### `public.quotation_items`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `quotation_id` | UUID | REFERENCES quotations(id) ON DELETE CASCADE | Parent quotation foreign key |
| `product_name` | TEXT | NOT NULL | Item name or service description |
| `quantity` | NUMERIC | NOT NULL (> 0) | Units or hours |
| `unit_price` | NUMERIC | NOT NULL (>= 0) | Unit rate |
| `discount` | NUMERIC | NOT NULL (0 - 100) | Line item discount percentage |
| `amount` | NUMERIC | NOT NULL | Net line total after discount |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp |

---

## ⚙️ Installation & Local Setup

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, or pnpm

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd "Triple S"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** tab.
3. Open `supabase/schema.sql` from this project and paste its contents into the SQL editor.
4. Click **Run** to execute the script and create all tables, indexes, and RLS policies.
5. In Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **Providers**, ensure **Email** is enabled.

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Mathematical Verification & Testing

To test and verify the mathematical formulas against the assignment's benchmark example (Gross: 50,000, Discount 5%: 2,500, Subtotal: 47,500, GST 18%: 8,550, Grand Total: 56,050):

```bash
node scripts/verify-calculations.js
```

---

## 🚢 Deployment to Vercel

1. Push your repository to **GitHub**.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Add the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

---

## 📂 Project Structure

```
├── .env.example                 # Example environment variables
├── README.md                    # Project documentation
├── package.json                 # Node dependencies and scripts
├── supabase/
│   └── schema.sql               # Supabase PostgreSQL tables & RLS policies
├── scripts/
│   └── verify-calculations.js   # Automated calculation verification script
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/page.tsx   # Supabase Auth Login & Sign up
    │   ├── (dashboard)/
    │   │   ├── layout.tsx       # Dashboard layout with Navbar & Footer
    │   │   ├── page.tsx         # Dashboard metrics and recent quotations
    │   │   └── quotations/
    │   │       ├── page.tsx     # Quotation table with search & filter
    │   │       ├── new/page.tsx # Create quotation form
    │   │       └── [id]/
    │   │           ├── page.tsx # View individual quotation & PDF export
    │   │           └── edit/    # Edit quotation
    │   ├── globals.css          # Styling & print media CSS
    │   └── layout.tsx           # Root HTML layout
    ├── components/
    │   ├── Navbar.tsx           # Header navigation
    │   ├── QuotationForm.tsx    # Reactive quotation form with live totals
    │   ├── QuotationPreview.tsx # Invoice document preview & print
    │   ├── StatCard.tsx         # Metric summary cards
    │   └── DeleteModal.tsx      # Confirmation dialog for quotation deletion
    └── lib/
        ├── calculations.ts      # Pure business formulas & formatting
        ├── pdf-generator.ts     # Client-side PDF generation
        ├── storage.ts           # Unified data layer (Supabase + Local fallback)
        ├── types.ts             # TypeScript interfaces
        └── supabase/
            ├── client.ts        # Browser client
            └── server.ts        # Server component client
```

---

## 👤 Author
Developed for the **Software Developer Intern Technical Assignment**.
