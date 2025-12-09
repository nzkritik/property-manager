'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency, convertToInputDate } from '@/lib/dateUtils';
import DateInput from '@/components/DateInput';

interface Expense {
  id: string;
  propertyId: string;
  property: {
    id: string;
    street: string | null;
    city: string;
    state: string;
  };
  expenseType: string;
  amount: number;
  frequency: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  isRecurring: boolean;
}

interface Property {
  id: string;
  street: string | null;
  city: string;
  state: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyId: '',
    expenseType: 'Rates',
    amount: '',
    frequency: 'Monthly',
    description: '',
    startDate: '',
    endDate: '',
    isRecurring: true,
  });
  const [syncing, setSyncing] = useState(false);

  const EXPENSE_TYPES = [
    'Rates',
    'Insurance',
    'Body Corporate',
    'Property Management',
    'Maintenance',
    'Repairs',
    'HOA Fees',
    'Utilities',
    'Other',
  ];

  const FREQUENCIES = ['Monthly', 'Quarterly', 'Annually', 'One-time'];

  useEffect(() => {
    fetchExpenses();
    fetchProperties();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
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
      const url = editingExpense ? `/api/expenses/${editingExpense.id}` : '/api/expenses';
      const method = editingExpense ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save expense');
      }

      await fetchExpenses();
      closeModal();
    } catch (error) {
      console.error('Failed to save expense:', error);
      setError(error instanceof Error ? error.message : 'Failed to save expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const handleSyncExpenses = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/sync-expenses', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to sync expenses:', error);
      alert('❌ Failed to sync expenses');
    } finally {
      setSyncing(false);
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      propertyId: '',
      expenseType: 'Rates',
      amount: '',
      frequency: 'Monthly',
      description: '',
      startDate: '',
      endDate: '',
      isRecurring: true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setError(null);
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      propertyId: expense.propertyId,
      expenseType: expense.expenseType,
      amount: expense.amount.toString(),
      frequency: expense.frequency,
      description: expense.description || '',
      startDate: convertToInputDate(expense.startDate),
      endDate: expense.endDate ? convertToInputDate(expense.endDate) : '',
      isRecurring: expense.isRecurring,
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
        <Link href="/mortgages" className="text-blue-600 hover:text-blue-800">Mortgages</Link>
        <span className="text-gray-400">|</span>
        <Link href="/expenses" className="font-semibold text-gray-900">Expenses</Link>
        <span className="text-gray-400">|</span>
        <Link href="/transactions" className="text-blue-600 hover:text-blue-800">Transactions</Link>
        <span className="text-gray-400">|</span>
        <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Property Expenses</h1>
        <div className="flex gap-2">
          <button
            onClick={handleSyncExpenses}
            disabled={syncing}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync to Transactions'}
          </button>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Expense
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{expense.property.street || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{expense.property.city}, {expense.property.state}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.expenseType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(expense.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.frequency}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(expense.startDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => openEditModal(expense)} className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {expenses.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No expenses found. Click "Add Expense" to get started.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
              
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type *</label>
                    <select
                      required
                      value={formData.expenseType}
                      onChange={(e) => setFormData({ ...formData, expenseType: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      {EXPENSE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                    <select
                      required
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      {FREQUENCIES.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <DateInput
                      required
                      value={formData.startDate}
                      onChange={(value) => setFormData({ ...formData, startDate: value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <DateInput
                      value={formData.endDate}
                      onChange={(value) => setFormData({ ...formData, endDate: value })}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Recurring Expense</span>
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    {saving ? 'Saving...' : (editingExpense ? 'Update' : 'Create')}
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
