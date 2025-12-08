'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Property {
  id: string;
  estimatedValue: number;
  purchasePrice: number;
}

interface Mortgage {
  outstandingBalance: number;
  monthlyPayment: number;
}

interface Expense {
  amount: number;
  frequency: string;
}

export default function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [propertiesRes, mortgagesRes, expensesRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/mortgages'),
        fetch('/api/expenses'),
      ]);

      const propertiesData = await propertiesRes.json();
      const mortgagesData = await mortgagesRes.json();
      const expensesData = await expensesRes.json();

      setProperties(propertiesData);
      setMortgages(mortgagesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return properties.reduce((sum, prop) => sum + prop.estimatedValue, 0);
  };

  const calculateTotalMortgageDebt = () => {
    return mortgages.reduce((sum, mort) => sum + mort.outstandingBalance, 0);
  };

  const calculateTotalEquity = () => {
    return calculateTotalValue() - calculateTotalMortgageDebt();
  };

  const calculateMonthlyMortgagePayments = () => {
    return mortgages.reduce((sum, mort) => sum + mort.monthlyPayment, 0);
  };

  const calculateMonthlyExpenses = () => {
    return expenses.reduce((sum, exp) => {
      if (exp.frequency === 'Monthly') return sum + exp.amount;
      if (exp.frequency === 'Quarterly') return sum + (exp.amount / 3);
      if (exp.frequency === 'Annually') return sum + (exp.amount / 12);
      return sum;
    }, 0);
  };

  const calculateTotalMonthlyOutgoings = () => {
    return calculateMonthlyMortgagePayments() + calculateMonthlyExpenses();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your property portfolio
        </p>
      </div>

      {/* Navigation */}
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/" className="font-semibold text-gray-900">Dashboard</Link>
        <span className="text-gray-400">|</span>
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">Properties</Link>
        <span className="text-gray-400">|</span>
        <Link href="/mortgages" className="text-blue-600 hover:text-blue-800">Mortgages</Link>
        <span className="text-gray-400">|</span>
        <Link href="/expenses" className="text-blue-600 hover:text-blue-800">Expenses</Link>
        <span className="text-gray-400">|</span>
        <Link href="/transactions" className="text-blue-600 hover:text-blue-800">Transactions</Link>
        <span className="text-gray-400">|</span>
        <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
      </nav>

      <h1 className="text-3xl font-bold mb-8">Property Portfolio Dashboard</h1>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Properties</div>
          <div className="text-3xl font-bold text-gray-900">{properties.length}</div>
          <Link href="/properties" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
            View All →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Portfolio Value</div>
          <div className="text-3xl font-bold text-green-600">{formatCurrency(calculateTotalValue())}</div>
          <div className="text-sm text-gray-500 mt-2">Total estimated value</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Total Equity</div>
          <div className="text-3xl font-bold text-blue-600">{formatCurrency(calculateTotalEquity())}</div>
          <div className="text-sm text-gray-500 mt-2">Value - Mortgages</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500 mb-1">Active Mortgages</div>
          <div className="text-3xl font-bold text-gray-900">{mortgages.length}</div>
          <Link href="/mortgages" className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Manage →
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Mortgage Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            Mortgage Overview
            <Link href="/mortgages" className="text-sm text-blue-600 hover:text-blue-800 font-normal">
              View Details →
            </Link>
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Debt</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(calculateTotalMortgageDebt())}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Monthly Payments</span>
              <span className="text-xl font-bold text-gray-900">{formatCurrency(calculateMonthlyMortgagePayments())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Number of Loans</span>
              <span className="text-xl font-bold text-gray-900">{mortgages.length}</span>
            </div>
          </div>
        </div>

        {/* Expenses Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
            Expenses Overview
            <Link href="/expenses" className="text-sm text-blue-600 hover:text-blue-800 font-normal">
              View Details →
            </Link>
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Monthly Expenses</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(calculateMonthlyExpenses())}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Total Monthly Outgoings</span>
              <span className="text-xl font-bold text-red-600">{formatCurrency(calculateTotalMonthlyOutgoings())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Expenses</span>
              <span className="text-xl font-bold text-gray-900">{expenses.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href="/properties"
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Properties</span>
          </Link>

          <Link
            href="/mortgages"
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Mortgages</span>
          </Link>

          <Link
            href="/expenses"
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Expenses</span>
          </Link>

          <Link
            href="/transactions"
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Transactions</span>
          </Link>

          <Link
            href="/reports"
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Reports</span>
          </Link>

          <button
            className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            onClick={() => window.location.reload()}
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Refresh</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {properties.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Get Started</h3>
          <p className="text-gray-600 mb-4">
            Start managing your property portfolio by adding your first property.
          </p>
          <Link
            href="/properties"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Add Your First Property
          </Link>
        </div>
      )}
    </div>
  );
}
