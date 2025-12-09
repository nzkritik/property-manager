'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/dateUtils';
import {
  exportPortfolioToPDF,
  exportCashFlowToPDF,
  exportPropertyPerformanceToPDF,
  exportTransactionsToPDF,
  exportExpenseBreakdownToPDF,
  exportPortfolioToCSV,
  exportCashFlowToCSV,
  exportPropertyPerformanceToCSV,
  exportTransactionsToCSV,
  exportExpenseBreakdownToCSV,
} from '@/lib/exportUtils';

interface Property {
  id: string;
  street: string | null;
  city: string;
  purchasePrice: number;
  estimatedValue: number;
  purchaseDate: string;
  monthlyRent: number | null;
}

interface Mortgage {
  propertyId: string;
  outstandingBalance: number;
  monthlyPayment: number;
  interestRate: number;
}

interface Expense {
  propertyId: string;
  amount: number;
  frequency: string;
  expenseType: string;
}

interface Transaction {
  propertyId: string;
  amount: number;
  date: string;
  status: string;
  isIncome: boolean;
  transactionType: string;
}

export default function ReportsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<string>('portfolio');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('ytd');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [propsRes, mortsRes, expsRes, transRes] = await Promise.all([
        fetch('/api/properties'),
        fetch('/api/mortgages'),
        fetch('/api/expenses'),
        fetch('/api/transactions'),
      ]);

      const [propsData, mortsData, expsData, transData] = await Promise.all([
        propsRes.json(),
        mortsRes.json(),
        expsRes.json(),
        transRes.json(),
      ]);

      setProperties(propsData);
      setMortgages(mortsData);
      setExpenses(expsData);
      setTransactions(transData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Portfolio Overview Calculations
  const calculatePortfolioMetrics = () => {
    const totalValue = properties.reduce((sum, p) => sum + p.estimatedValue, 0);
    const totalCost = properties.reduce((sum, p) => sum + p.purchasePrice, 0);
    const totalDebt = mortgages.reduce((sum, m) => sum + m.outstandingBalance, 0);
    const totalEquity = totalValue - totalDebt;
    const capitalGain = totalValue - totalCost;
    const capitalGainPercent = totalCost > 0 ? (capitalGain / totalCost) * 100 : 0;
    const ltv = totalValue > 0 ? (totalDebt / totalValue) * 100 : 0;

    return {
      propertyCount: properties.length,
      totalValue,
      totalCost,
      totalDebt,
      totalEquity,
      capitalGain,
      capitalGainPercent,
      ltv,
    };
  };

  // Cash Flow Analysis
  const calculateCashFlow = () => {
    const monthlyRent = properties.reduce((sum, p) => sum + (p.monthlyRent || 0), 0);
    const monthlyMortgage = mortgages.reduce((sum, m) => sum + m.monthlyPayment, 0);
    const monthlyExpenses = expenses.reduce((sum, e) => {
      if (e.frequency === 'Monthly') return sum + e.amount;
      if (e.frequency === 'Quarterly') return sum + (e.amount / 3);
      if (e.frequency === 'Annually') return sum + (e.amount / 12);
      return sum;
    }, 0);

    const totalMonthlyExpenses = monthlyMortgage + monthlyExpenses;
    const netCashFlow = monthlyRent - totalMonthlyExpenses;
    const cashFlowYield = monthlyRent > 0 ? (netCashFlow / monthlyRent) * 100 : 0;

    return {
      monthlyRent,
      monthlyMortgage,
      monthlyExpenses,
      totalMonthlyExpenses,
      netCashFlow,
      annualCashFlow: netCashFlow * 12,
      cashFlowYield,
    };
  };

  // Property Performance
  const calculatePropertyPerformance = () => {
    return properties.map(property => {
      const propertyMortgages = mortgages.filter(m => m.propertyId === property.id);
      const propertyExpenses = expenses.filter(e => e.propertyId === property.id);
      
      const debt = propertyMortgages.reduce((sum, m) => sum + m.outstandingBalance, 0);
      const equity = property.estimatedValue - debt;
      const capitalGain = property.estimatedValue - property.purchasePrice;
      const capitalGainPercent = (capitalGain / property.purchasePrice) * 100;
      
      const monthlyMortgage = propertyMortgages.reduce((sum, m) => sum + m.monthlyPayment, 0);
      const monthlyExpenses = propertyExpenses.reduce((sum, e) => {
        if (e.frequency === 'Monthly') return sum + e.amount;
        if (e.frequency === 'Quarterly') return sum + (e.amount / 3);
        if (e.frequency === 'Annually') return sum + (e.amount / 12);
        return sum;
      }, 0);
      
      const totalMonthlyExpenses = monthlyMortgage + monthlyExpenses;
      const monthlyRent = property.monthlyRent || 0;
      const netCashFlow = monthlyRent - totalMonthlyExpenses;
      const rentalYield = property.estimatedValue > 0 ? (monthlyRent * 12 / property.estimatedValue) * 100 : 0;
      const roi = property.purchasePrice > 0 ? ((netCashFlow * 12) / property.purchasePrice) * 100 : 0;

      return {
        ...property,
        debt,
        equity,
        capitalGain,
        capitalGainPercent,
        monthlyRent,
        totalMonthlyExpenses,
        netCashFlow,
        rentalYield,
        roi,
      };
    });
  };

  // Transaction Summary by Type
  const calculateTransactionSummary = () => {
    const completeTransactions = transactions.filter(t => t.status === 'Complete');
    
    const summary: { [key: string]: { income: number; expense: number; count: number } } = {};
    
    completeTransactions.forEach(t => {
      if (!summary[t.transactionType]) {
        summary[t.transactionType] = { income: 0, expense: 0, count: 0 };
      }
      if (t.isIncome) {
        summary[t.transactionType].income += t.amount;
      } else {
        summary[t.transactionType].expense += t.amount;
      }
      summary[t.transactionType].count++;
    });

    return Object.entries(summary).map(([type, data]) => ({
      type,
      ...data,
      net: data.income - data.expense,
    }));
  };

  // Expense Breakdown
  const calculateExpenseBreakdown = () => {
    const breakdown: { [key: string]: number } = {};
    
    expenses.forEach(e => {
      const annualAmount = e.frequency === 'Monthly' ? e.amount * 12 :
                          e.frequency === 'Quarterly' ? e.amount * 4 :
                          e.frequency === 'Annually' ? e.amount : 0;
      
      breakdown[e.expenseType] = (breakdown[e.expenseType] || 0) + annualAmount;
    });

    const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(breakdown).map(([type, amount]) => ({
      type,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);
  };

  const portfolioMetrics = calculatePortfolioMetrics();
  const cashFlow = calculateCashFlow();
  const propertyPerformance = calculatePropertyPerformance();
  const transactionSummary = calculateTransactionSummary();
  const expenseBreakdown = calculateExpenseBreakdown();

  const handleExportPDF = () => {
    switch (selectedReport) {
      case 'portfolio':
        exportPortfolioToPDF(portfolioMetrics);
        break;
      case 'cashflow':
        exportCashFlowToPDF(cashFlow);
        break;
      case 'performance':
        exportPropertyPerformanceToPDF(propertyPerformance);
        break;
      case 'transactions':
        exportTransactionsToPDF(transactionSummary);
        break;
      case 'expenses':
        exportExpenseBreakdownToPDF(expenseBreakdown);
        break;
    }
  };

  const handleExportCSV = () => {
    switch (selectedReport) {
      case 'portfolio':
        exportPortfolioToCSV(portfolioMetrics);
        break;
      case 'cashflow':
        exportCashFlowToCSV(cashFlow);
        break;
      case 'performance':
        exportPropertyPerformanceToCSV(propertyPerformance);
        break;
      case 'transactions':
        exportTransactionsToCSV(transactionSummary);
        break;
      case 'expenses':
        exportExpenseBreakdownToCSV(expenseBreakdown);
        break;
    }
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
        <Link href="/expenses" className="text-blue-600 hover:text-blue-800">Expenses</Link>
        <span className="text-gray-400">|</span>
        <Link href="/transactions" className="text-blue-600 hover:text-blue-800">Transactions</Link>
        <span className="text-gray-400">|</span>
        <Link href="/reports" className="font-semibold text-gray-900">Reports</Link>
      </nav>

      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedReport('portfolio')}
            className={`px-4 py-2 rounded ${selectedReport === 'portfolio' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Portfolio Overview
          </button>
          <button
            onClick={() => setSelectedReport('cashflow')}
            className={`px-4 py-2 rounded ${selectedReport === 'cashflow' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Cash Flow Analysis
          </button>
          <button
            onClick={() => setSelectedReport('performance')}
            className={`px-4 py-2 rounded ${selectedReport === 'performance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Property Performance
          </button>
          <button
            onClick={() => setSelectedReport('transactions')}
            className={`px-4 py-2 rounded ${selectedReport === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Transaction Summary
          </button>
          <button
            onClick={() => setSelectedReport('expenses')}
            className={`px-4 py-2 rounded ${selectedReport === 'expenses' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Expense Breakdown
          </button>
        </div>
      </div>

      {/* Portfolio Overview Report */}
      {selectedReport === 'portfolio' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-500">Total Properties</div>
                <div className="text-2xl font-bold">{portfolioMetrics.propertyCount}</div>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-sm text-gray-500">Portfolio Value</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(portfolioMetrics.totalValue)}</div>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <div className="text-sm text-gray-500">Total Debt</div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(portfolioMetrics.totalDebt)}</div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="text-sm text-gray-500">Total Equity</div>
                <div className="text-2xl font-bold text-purple-600">{formatCurrency(portfolioMetrics.totalEquity)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Capital Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Purchase Cost</span>
                  <span className="font-semibold">{formatCurrency(portfolioMetrics.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Current Value</span>
                  <span className="font-semibold">{formatCurrency(portfolioMetrics.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Capital Gain</span>
                  <span className={`font-semibold ${portfolioMetrics.capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(portfolioMetrics.capitalGain)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Return on Investment</span>
                  <span className={`font-semibold text-lg ${portfolioMetrics.capitalGainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentage(portfolioMetrics.capitalGainPercent)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Leverage Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Debt</span>
                  <span className="font-semibold">{formatCurrency(portfolioMetrics.totalDebt)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Loan to Value (LTV)</span>
                  <span className={`font-semibold ${portfolioMetrics.ltv > 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercentage(portfolioMetrics.ltv)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Equity</span>
                  <span className="font-semibold text-green-600">{formatCurrency(portfolioMetrics.totalEquity)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Equity Ratio</span>
                  <span className="font-semibold text-lg text-green-600">
                    {formatPercentage(100 - portfolioMetrics.ltv)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cash Flow Analysis Report */}
      {selectedReport === 'cashflow' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Cash Flow Analysis</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-green-50 rounded">
                <span className="text-lg font-medium text-gray-700">Monthly Rental Income</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(cashFlow.monthlyRent)}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Mortgage Payments</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(cashFlow.monthlyMortgage)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="text-gray-700">Other Expenses</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(cashFlow.monthlyExpenses)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded border-t-2 border-blue-500">
                <span className="text-lg font-medium text-gray-700">Net Monthly Cash Flow</span>
                <span className={`text-2xl font-bold ${cashFlow.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashFlow.netCashFlow)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-purple-50 rounded">
                <span className="text-lg font-medium text-gray-700">Annual Cash Flow</span>
                <span className={`text-2xl font-bold ${cashFlow.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(cashFlow.annualCashFlow)}
                </span>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded">
                <span className="text-lg font-medium text-gray-700">Cash Flow Yield</span>
                <span className="text-2xl font-bold text-yellow-700">{formatPercentage(cashFlow.cashFlowYield)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Property Performance Report */}
      {selectedReport === 'performance' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Property Performance Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capital Gain</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Cash Flow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Yield</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propertyPerformance.map((property) => (
                  <tr key={property.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{property.street || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{property.city}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(property.estimatedValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(property.equity)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={property.capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(property.capitalGain)}
                      </span>
                      <div className="text-xs text-gray-500">{formatPercentage(property.capitalGainPercent)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(property.monthlyRent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={property.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(property.netCashFlow)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {formatPercentage(property.rentalYield)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={property.roi >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatPercentage(property.roi)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transaction Summary Report */}
      {selectedReport === 'transactions' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Transaction Summary by Type</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactionSummary.map((item) => (
                  <tr key={item.type}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      {item.income > 0 ? formatCurrency(item.income) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      {item.expense > 0 ? formatCurrency(item.expense) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={item.net >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatCurrency(item.net)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expense Breakdown Report */}
      {selectedReport === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Annual Expense Breakdown</h2>
            <div className="space-y-3">
              {expenseBreakdown.map((item) => (
                <div key={item.type} className="border-b pb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-700">{item.type}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">{formatPercentage(item.percentage)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow p-4 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Export this report:</span>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export to PDF
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
