'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, formatCurrency, formatPercentage } from '@/lib/dateUtils';

interface Property {
  id: string;
  street: string | null;
  city: string;
  state: string;
  zipCode: string;
  purchasePrice: number;
  purchaseDate: string;
  estimatedValue: number;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  monthlyRent: number | null;
  isRented: boolean;
  tenantName: string | null;
  leaseStart: string | null;
  leaseEnd: string | null;
  annualPropertyTax: number;
  insurance: number;
  hoaFees: number | null;
  maintenanceBudget: number;
}

interface Mortgage {
  id: string;
  lender: string;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  startDate: string;
  monthlyPayment: number;
  outstandingBalance: number;
  mortgageType: string;
}

interface Expense {
  id: string;
  expenseType: string;
  amount: number;
  frequency: string;
  description: string | null;
  startDate: string;
}

interface Transaction {
  id: string;
  transactionType: string;
  amount: number;
  date: string;
  status: string;
  isIncome: boolean;
  description: string | null;
}

export default function PropertyReportPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchPropertyDetails(selectedPropertyId);
    }
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      setProperties(data);
      if (data.length > 0) {
        setSelectedPropertyId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetails = async (propertyId: string) => {
    try {
      const [propRes, mortRes, expRes, transRes] = await Promise.all([
        fetch(`/api/properties`),
        fetch('/api/mortgages'),
        fetch('/api/expenses'),
        fetch('/api/transactions'),
      ]);

      const [propsData, mortsData, expsData, transData] = await Promise.all([
        propRes.json(),
        mortRes.json(),
        expRes.json(),
        transRes.json(),
      ]);

      const property = propsData.find((p: Property) => p.id === propertyId);
      setSelectedProperty(property);
      
      setMortgages(mortsData.filter((m: any) => m.propertyId === propertyId));
      setExpenses(expsData.filter((e: any) => e.propertyId === propertyId));
      setTransactions(transData.filter((t: any) => t.propertyId === propertyId));
    } catch (error) {
      console.error('Failed to fetch property details:', error);
    }
  };

  const calculateMetrics = () => {
    if (!selectedProperty) return null;

    const totalDebt = mortgages.reduce((sum, m) => sum + m.outstandingBalance, 0);
    const equity = selectedProperty.estimatedValue - totalDebt;
    const capitalGain = selectedProperty.estimatedValue - selectedProperty.purchasePrice;
    const capitalGainPercent = (capitalGain / selectedProperty.purchasePrice) * 100;
    const ltv = selectedProperty.estimatedValue > 0 ? (totalDebt / selectedProperty.estimatedValue) * 100 : 0;

    const monthlyMortgagePayment = mortgages.reduce((sum, m) => sum + m.monthlyPayment, 0);
    const monthlyExpenses = expenses.reduce((sum, e) => {
      if (e.frequency === 'Monthly') return sum + e.amount;
      if (e.frequency === 'Quarterly') return sum + (e.amount / 3);
      if (e.frequency === 'Annually') return sum + (e.amount / 12);
      return sum;
    }, 0);

    const totalMonthlyExpenses = monthlyMortgagePayment + monthlyExpenses;
    const monthlyRent = selectedProperty.monthlyRent || 0;
    const netCashFlow = monthlyRent - totalMonthlyExpenses;
    const rentalYield = selectedProperty.estimatedValue > 0 ? (monthlyRent * 12 / selectedProperty.estimatedValue) * 100 : 0;
    const cashOnCashReturn = selectedProperty.purchasePrice > 0 ? ((netCashFlow * 12) / selectedProperty.purchasePrice) * 100 : 0;

    const completeTransactions = transactions.filter(t => t.status === 'Complete');
    const totalIncome = completeTransactions.filter(t => t.isIncome).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = completeTransactions.filter(t => !t.isIncome).reduce((sum, t) => sum + t.amount, 0);

    const daysOwned = Math.floor((new Date().getTime() - new Date(selectedProperty.purchaseDate).getTime()) / (1000 * 60 * 60 * 24));
    const yearsOwned = daysOwned / 365;

    return {
      totalDebt,
      equity,
      capitalGain,
      capitalGainPercent,
      ltv,
      monthlyRent,
      monthlyMortgagePayment,
      monthlyExpenses,
      totalMonthlyExpenses,
      netCashFlow,
      annualCashFlow: netCashFlow * 12,
      rentalYield,
      cashOnCashReturn,
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      daysOwned,
      yearsOwned,
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const metrics = calculateMetrics();

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <nav className="mb-6 flex gap-4 text-sm print:hidden">
        <Link href="/" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
        <span className="text-gray-400">|</span>
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">Properties</Link>
        <span className="text-gray-400">|</span>
        <Link href="/reports" className="text-blue-600 hover:text-blue-800">Reports</Link>
        <span className="text-gray-400">|</span>
        <Link href="/property-report" className="font-semibold text-gray-900">Property Report</Link>
      </nav>

      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-3xl font-bold">Property Report</h1>
        <div className="flex gap-2">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2"
          >
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.street || 'N/A'} - {property.city}
              </option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      {selectedProperty && metrics && (
        <div className="space-y-6">
          {/* Property Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Property Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Address</div>
                <div className="font-semibold">{selectedProperty.street || 'N/A'}</div>
                <div className="text-sm text-gray-600">{selectedProperty.city}, {selectedProperty.state} {selectedProperty.zipCode}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Property Type</div>
                <div className="font-semibold">{selectedProperty.propertyType.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Purchase Date</div>
                <div className="font-semibold">{formatDate(selectedProperty.purchaseDate)}</div>
                <div className="text-sm text-gray-600">{metrics.daysOwned} days ({metrics.yearsOwned.toFixed(1)} years)</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Bedrooms / Bathrooms</div>
                <div className="font-semibold">{selectedProperty.bedrooms || 'N/A'} / {selectedProperty.bathrooms || 'N/A'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Square Feet</div>
                <div className="font-semibold">{selectedProperty.sqft ? selectedProperty.sqft.toLocaleString() : 'N/A'} sqft</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Year Built</div>
                <div className="font-semibold">{selectedProperty.yearBuilt || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Value & Equity</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Purchase Price</span>
                  <span className="font-semibold">{formatCurrency(selectedProperty.purchasePrice)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Current Value</span>
                  <span className="font-semibold text-green-600">{formatCurrency(selectedProperty.estimatedValue)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Total Debt</span>
                  <span className="font-semibold text-red-600">{formatCurrency(metrics.totalDebt)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Equity</span>
                  <span className="font-semibold text-blue-600">{formatCurrency(metrics.equity)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Capital Gain</span>
                  <span className={`font-semibold ${metrics.capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.capitalGain)} ({formatPercentage(metrics.capitalGainPercent)})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">LTV Ratio</span>
                  <span className={`font-semibold ${metrics.ltv > 80 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercentage(metrics.ltv)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Cash Flow Analysis</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-semibold text-green-600">{formatCurrency(metrics.monthlyRent)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Mortgage Payment</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(metrics.monthlyMortgagePayment)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Other Expenses</span>
                  <span className="font-semibold text-red-600">-{formatCurrency(metrics.monthlyExpenses)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b bg-blue-50 p-2 rounded">
                  <span className="font-medium">Net Monthly Cash Flow</span>
                  <span className={`font-bold text-lg ${metrics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.netCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-gray-600">Annual Cash Flow</span>
                  <span className={`font-semibold ${metrics.annualCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(metrics.annualCashFlow)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rental Yield</span>
                  <span className="font-semibold text-blue-600">{formatPercentage(metrics.rentalYield)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border-l-4 border-green-500 pl-4">
                <div className="text-sm text-gray-500">Total Income</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalIncome)}</div>
              </div>
              <div className="border-l-4 border-red-500 pl-4">
                <div className="text-sm text-gray-500">Total Expenses</div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</div>
              </div>
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="text-sm text-gray-500">Net Profit</div>
                <div className={`text-2xl font-bold ${metrics.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.netProfit)}
                </div>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="text-sm text-gray-500">Cash on Cash Return</div>
                <div className="text-2xl font-bold text-purple-600">{formatPercentage(metrics.cashOnCashReturn)}</div>
              </div>
            </div>
          </div>

          {/* Rental Information */}
          {selectedProperty.isRented && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Rental Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <div className="font-semibold text-green-600">Currently Rented</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tenant</div>
                  <div className="font-semibold">{selectedProperty.tenantName || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Monthly Rent</div>
                  <div className="font-semibold">{formatCurrency(selectedProperty.monthlyRent || 0)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Lease Start</div>
                  <div className="font-semibold">{selectedProperty.leaseStart ? formatDate(selectedProperty.leaseStart) : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Lease End</div>
                  <div className="font-semibold">{selectedProperty.leaseEnd ? formatDate(selectedProperty.leaseEnd) : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* Mortgages */}
          {mortgages.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Mortgages ({mortgages.length})</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loan Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mortgages.map((mortgage) => (
                    <tr key={mortgage.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{mortgage.lender}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{mortgage.mortgageType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(mortgage.loanAmount)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{mortgage.interestRate}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(mortgage.monthlyPayment)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(mortgage.outstandingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Recurring Expenses */}
          {expenses.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Recurring Expenses ({expenses.length})</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Equivalent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.map((expense) => {
                    const monthlyEquiv = expense.frequency === 'Monthly' ? expense.amount :
                                       expense.frequency === 'Quarterly' ? expense.amount / 3 :
                                       expense.frequency === 'Annually' ? expense.amount / 12 : 0;
                    return (
                      <tr key={expense.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{expense.expenseType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(expense.amount)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{expense.frequency}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatCurrency(monthlyEquiv)}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{expense.description || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Recent Transactions */}
          {transactions.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Recent Transactions (Last 10)</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(transaction.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            transaction.isIncome ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transactionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={transaction.isIncome ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                            {transaction.isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            transaction.status === 'Complete' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{transaction.description || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
