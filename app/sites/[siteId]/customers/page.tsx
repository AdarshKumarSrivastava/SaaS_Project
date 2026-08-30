"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type AdminCustomer = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
  };
};

export default function SiteCustomersPage() {
  const params = useParams();
  const siteId = params?.siteId as string;
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch(`/api/sites/${siteId}/customers`);
        const data = await res.json();
        if (res.ok) {
          setCustomers(data.customers || []);
        } else {
          setError(data.error || "Failed to load customers");
        }
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [siteId]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2 text-white">Customers</h1>
      <p className="text-white/60 mb-8">View and manage customers who have registered on your store.</p>
      
      {loading ? (
        <div className="text-white/60">Loading customers...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : customers.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-8 text-center text-white/50">
          No customers found. When a customer registers on your storefront, they will appear here.
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/50 bg-[#161616]">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Orders</th>
                <th className="p-4 font-medium">Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white text-sm font-medium">
                    {c.firstName || c.lastName ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Guest Customer'}
                  </td>
                  <td className="p-4 text-white/70 text-sm">
                    {c.email}
                  </td>
                  <td className="p-4 text-white/70 text-sm">
                    {c._count.orders}
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
