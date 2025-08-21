import { ProductForm } from "./_components/product-form";

export default function NewProductPage() {
    return (
        <>
             <h1 className="text-3xl font-extrabold mb-6">إضافة منتج جديد</h1>
            <div className="bg-white rounded-2xl shadow-card p-6">
                <ProductForm />
            </div>
        </>
    )
}
