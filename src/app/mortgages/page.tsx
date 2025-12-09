'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency, convertToInputDate } from '@/lib/dateUtils';

interface Mortgage {
  id: string;
  propertyId: string;
  property: {
    id: string;
    street: string | null;
    city: string;
    state: string;
  };
  lender: string;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  startDate: string;
  monthlyPayment: number;
  outstandingBalance: number;
  mortgageType: string;
  notes: string | null;
}

interface Property {
  id: string;
  street: string | null;
  city: string;
  state: string;
}

export default function MortgagesPage() {
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState<Mortgage | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    lender: '',
    loanAmount: '',
    interestRate: '',
    termYears: '',
    startDate: '',
    monthlyPayment: '',
    outstandingBalance: '',
    mortgageType: 'Fixed',
    notes: '',
  });

  useEffect(() => {
    fetchMortgages();
    fetchProperties();
  }, []);

  const fetchMortgages = async () => {
    try {
      const res = await fetch('/api/mortgages');
      const data = await res.json();
      setMortgages(data);
    } catch (error) {
      console.error('Failed to fetch mortgages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const url = editingMortgage ? `/api/mortgages/${editingMortgage.id}` : '/api/mortgages';
      const method = editingMortgage ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save mortgage');
      }

      await fetchMortgages();
      closeModal();
    } catch (error) {
      console.error('Failed to save mortgage:', error);
      setError(error instanceof Error ? error.message : 'Failed to save mortgage');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mortgage?')) return;
    
    try {
      const res = await fetch(`/api/mortgages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchMortgages();
      }
    } catch (error) {
      console.error('Failed to delete mortgage:', error);
    }
  };

  const openAddModal = () => {
    setEditingMortgage(null);
    setFormData({
      propertyId: '',
      lender: '',
      loanAmount: '',
      interestRate: '',
      termYears: '',
      startDate: '',
      monthlyPayment: '',
      outstandingBalance: '',
      mortgageType: 'Fixed',
      notes: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMortgage(null);
    setError(null);
  };

  const openEditModal = (mortgage: Mortgage) => {
    setEditingMortgage(mortgage);
    setFormData({
      propertyId: mortgage.propertyId,
      lender: mortgage.lender,
      loanAmount: mortgage.loanAmount.toString(),
      interestRate: mortgage.interestRate.toString(),
      termYears: mortgage.termYears.toString(),
      startDate: convertToInputDate(mortgage.startDate),
      monthlyPayment: mortgage.monthlyPayment.toString(),
      outstandingBalance: mortgage.outstandingBalance.toString(),
      mortgageType: mortgage.mortgageType,
      notes: mortgage.notes || '',
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
        <span className="text-gray-400">|</span>
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">Properties</Link>
        <span className="text-gray-400">|</span>
        <Link href="/mortgages" className="font-semibold text-gray-900">Mortgages</Link>
        <span className="text-gray-400">|</span>
        <Link href="/expenses" className="text-blue-600 hover:text-blue-800">Expenses</Link>
        <span className="text-gray-400">|</span>
        <Link href="/transactions" className="text-blue-600 hover:text-blue-800">Transactions</Link>
        <span className="text-gray-400">|</span>
        <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mortgages</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Mortgage
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mortgages.map((mortgage) => (
              <tr key={mortgage.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{mortgage.property.street || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{mortgage.property.city}, {mortgage.property.state}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mortgage.lender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(mortgage.loanAmount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{mortgage.interestRate}%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(mortgage.monthlyPayment)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(mortgage.outstandingBalance)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openEditModal(mortgage)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button onClick={() => handleDelete(mortgage.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mortgages.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No mortgages found. Click "Add Mortgage" to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingMortgage ? 'Edit Mortgage' : 'Add New Mortgage'}</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                    <select
                      required
                      value={formData.propertyId}
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="">Select a property</option>
                      {properties.map((prop) => (
                        <option key={prop.id} value={prop.id}>
                          {prop.street || 'N/A'} - {prop.city}, {prop.state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lender *</label>
                    <input
                      type="text"
                      required
                      value={formData.lender}
                      onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mortgage Type *</label>
                    <select
                      required
                      value={formData.mortgageType}
                      onChange={(e) => setFormData({ ...formData, mortgageType: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="Fixed">Fixed Rate</option>
                      <option value="Variable">Variable Rate</option>
                      <option value="Interest-only">Interest-only</option>
                      <option value="Principal and Interest">Principal and Interest</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term (Years) *</label>
                    <input
                      type="number"
                      required
                      value={formData.termYears}
                      onChange={(e) => setFormData({ ...formData, termYears: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Payment *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.monthlyPayment}
                      onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Outstanding Balance *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.outstandingBalance}
                      onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : (editingMortgage ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
