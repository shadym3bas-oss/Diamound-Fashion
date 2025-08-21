# **App Name**: Diamond Fashion FactoryFlow

## Core Features:

- Executive Dashboard: KPIs and charts providing real-time insights into cash flow, sales, profitability, and critical alerts for low stock, overdue invoices, and production delays.
- Cash Control: Manages cash and bank accounts, tracks money movements (payments, receipts, transfers), and provides real-time balances and categorized expense lists.
- Procurement: Manages suppliers and purchase orders, tracks goods receipts, and automates the purchase order workflow from creation to payment.
- Manufacturing Lite: Manages product bills of materials (BOMs) and work orders, tracks material consumption and finished goods production, and calculates standard costs.
- Inventory Movements: Tracks all inventory movements (sales, purchases, production, adjustments) and provides a real-time view of stock balances with low-stock alerts and cycle count functionality.
- Accounting: Simplifies profit and loss (P&L) tracking by calculating cost of goods sold (COGS) upon order confirmation and providing monthly revenue, expense, and profit views.
- Reconciliation: Provides a daily/weekly reconciliation screen to track sales, receipts, expenses, and cash balances, with discrepancy logging in the audit log.
- Alerts & Automation: Delivers intelligent alerts for low stock, overdue invoices, and late purchase/work orders, implemented via Edge Functions, Supabase cron, or Realtime with web push notifications.
- Roles & Permissions: Implements role-based access control (admin, accountant, sales, warehouse) with row-level security (RLS) policies to protect sensitive data and operations. Since only a single user (the factory manager) will be using the dashboard, all permissions will be granted to that user. This effectively disables the role-based access control for now but keeps the feature available for future multi-user support.
- Manager Interfaces: Provides clear interfaces for finance (cash flow, expenses), procurement (purchase orders, receipts), manufacturing (work orders, costs), inventory (stock, movements), and closing (daily/weekly reports).
- Dashboard KPIs: Dashboard overview displaying key performance indicators (KPIs) like total sales, top-selling products, and customer statistics in an easily digestible format.
- Customer Management: Customer relationship management (CRM) system to manage customer data including adding, editing, and deleting customer profiles, complete with filtering capabilities by customer type (VIP, new, regular).
- Order & Inventory Tracking: Inventory and order management features that will help you to easily manage products including stock tracking and alerts for low stock items. Orders can be created, updated and managed, triggering automatic stock decreases when orders are confirmed.
- Invoice Generation: Dynamic invoice generation system that automatically generates an invoice from order information and places data correctly on an A4 format.
- Expense Tracking: Expense management module for tracking and categorizing factory expenses, ensuring accurate financial oversight and cost analysis.
- AI Sales Forecasting: An AI sales forecast that uses historical data and algorithms as a tool to predict future sales trends, integrated via a Supabase function to enable dynamic projections based on real-time insights.
- Role Based User management: Secure, role-based user access management controlling different permissions for user roles (Admin, Accountant, Sales, Warehouse). With only a single user (the factory manager), this feature essentially manages a single user profile with full administrative access.
- Priority Orders: Prioritize orders (normal / urgent / VIP). Urgent orders appear in the table in a different color or icon.
- Attachments: Upload files to each order (e.g., paper invoice, design image, product image).
- Customer Notifications: Send SMS or WhatsApp to the customer for each status update (confirmation - shipping - delivery).
- Smart Customer Classification: Automatically categorize customers: "Active" if they make 3 orders in the last month, "Inactive" if their last order was 6 months ago.
- Customer Record: Complete record for the customer: list of all orders + expenses + loyalty points, summary: “total purchases” + “total points”.
- Automatic Stock Alert: Automatic alert: if any product reaches below the limit (Low Stock) a red Badge will appear.
- Quick Inventory: Quick inventory (Cycle Count): record the actual stock → the difference is automatically recorded as “adjustment”.
- Multiple Payment Methods: Multiple payment methods in the same order: example: pay part cash + part Visa.
- Automatic Settlement: Automatic settlement: when Paid = Total → the order is converted to “fully paid” status.
- Automatic Reminder: Automatic reminder: if an invoice is not paid within X days → an alert appears or a message is sent.
- Order Report by Status: Order Report by Status: number of “Pending / Confirmed / Delivered”.
- Revenue Report: Daily/Weekly/Monthly Revenue Report: shows sales trend.
- Most Buying Customers Report: Most Buying Customers Report.
- Best Selling Products Report: Best Selling Products Report.
- Collection and Expenses Report: Collection and Expenses Report: gives you a clear picture of the cash.
- Activity Log: Activity Log (Audit Log): every modification or cancellation appears with the employee name + date.
- Precise Permissions: More precise permissions: Sales Officer → adds and modifies orders but cannot delete, Warehouse Officer → controls the stock only, Manager → controls everything.
- Google Sheets Integration: Linking with Google Sheets: automatic reports are exported to Sheet daily.
- Mail/WhatsApp Integration: Linking with mail/WhatsApp: sends a PDF invoice to the customer or a shipping tracking link.
- Smart Alerts: "There are 5 Pending orders from more than 3 days ago", "Product X is about to run out (stock less than 5)", "VIP customer made a new order", "There is an overdue invoice that must be collected".

## Style Guidelines:

- Primary color: #2E4057 (a desaturated indigo). Its calm vibe is right for professional users who may be dealing with production stresses.
- Background color: #F0F4F8 (very light desaturated indigo).
- Accent color: #5D7395 (a less-desaturated indigo analogous to the primary).
- Font: 'Cairo', sans-serif. Note: currently only Google Fonts are supported.
- Implement a responsive layout using Tailwind CSS to ensure seamless adaptability across various devices, offering a consistent user experience on desktops, tablets, and mobile phones.
- Utilize a consistent and modern icon set (e.g., Font Awesome or Remix Icon) to represent various actions and sections, enhancing usability and visual appeal.
- Use subtle transitions and animations to enhance user experience when navigating through the dashboard or submitting forms, creating a fluid and engaging interface.