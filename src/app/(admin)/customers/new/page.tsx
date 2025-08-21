
import { CustomerForm } from "./_components/customer-form";

export default function NewCustomerPage() {

    return (
        <>
            <h1 className="text-3xl font-extrabold mb-6">إضافة عميل جديد</h1>
            <div className="bg-white rounded-2xl shadow-card p-6">
                <CustomerForm />
            </div>
        </>
    )
}
