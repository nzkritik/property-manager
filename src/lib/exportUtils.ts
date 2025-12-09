import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(value);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatPercentage = (value: number) => {
  return `${value.toFixed(2)}%`;
};

// Export Portfolio Overview to PDF
export const exportPortfolioToPDF = (data: any) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Portfolio Overview Report', 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 28);
  
  // Summary metrics
  doc.setFontSize(12);
  doc.text('Portfolio Summary', 14, 40);
  
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Properties', data.propertyCount.toString()],
    ['Portfolio Value', formatCurrency(data.totalValue)],
    ['Total Cost', formatCurrency(data.totalCost)],
    ['Total Debt', formatCurrency(data.totalDebt)],
    ['Total Equity', formatCurrency(data.totalEquity)],
    ['Capital Gain', formatCurrency(data.capitalGain)],
    ['Return on Investment', formatPercentage(data.capitalGainPercent)],
    ['Loan to Value (LTV)', formatPercentage(data.ltv)],
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [summaryData[0]],
    body: summaryData.slice(1),
    theme: 'grid',
  });
  
  doc.save('portfolio-overview.pdf');
};

// Export Cash Flow to PDF
export const exportCashFlowToPDF = (data: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Cash Flow Analysis Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 28);
  
  doc.setFontSize(12);
  doc.text('Cash Flow Summary', 14, 40);
  
  const cashFlowData = [
    ['Description', 'Amount'],
    ['Monthly Rental Income', formatCurrency(data.monthlyRent)],
    ['Monthly Mortgage Payments', formatCurrency(data.monthlyMortgage)],
    ['Monthly Expenses', formatCurrency(data.monthlyExpenses)],
    ['Total Monthly Expenses', formatCurrency(data.totalMonthlyExpenses)],
    ['Net Monthly Cash Flow', formatCurrency(data.netCashFlow)],
    ['Annual Cash Flow', formatCurrency(data.annualCashFlow)],
    ['Cash Flow Yield', formatPercentage(data.cashFlowYield)],
  ];
  
  autoTable(doc, {
    startY: 45,
    head: [cashFlowData[0]],
    body: cashFlowData.slice(1),
    theme: 'grid',
  });
  
  doc.save('cash-flow-analysis.pdf');
};

// Export Property Performance to PDF
export const exportPropertyPerformanceToPDF = (properties: any[]) => {
  const doc = new jsPDF('landscape');
  
  doc.setFontSize(20);
  doc.text('Property Performance Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 28);
  
  const tableData = properties.map(p => [
    p.street || 'N/A',
    p.city,
    formatCurrency(p.estimatedValue),
    formatCurrency(p.equity),
    formatCurrency(p.capitalGain),
    formatCurrency(p.monthlyRent),
    formatCurrency(p.netCashFlow),
    formatPercentage(p.rentalYield),
    formatPercentage(p.roi),
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Property', 'City', 'Value', 'Equity', 'Capital Gain', 'Rent', 'Cash Flow', 'Yield', 'ROI']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 8 },
  });
  
  doc.save('property-performance.pdf');
};

// Export Transaction Summary to PDF
export const exportTransactionsToPDF = (transactions: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Transaction Summary Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 28);
  
  const tableData = transactions.map(t => [
    t.type,
    formatCurrency(t.income),
    formatCurrency(t.expense),
    formatCurrency(t.net),
    t.count.toString(),
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Type', 'Income', 'Expense', 'Net', 'Count']],
    body: tableData,
    theme: 'grid',
  });
  
  doc.save('transaction-summary.pdf');
};

// Export Expense Breakdown to PDF
export const exportExpenseBreakdownToPDF = (expenses: any[]) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Expense Breakdown Report', 14, 20);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 14, 28);
  
  const tableData = expenses.map(e => [
    e.type,
    formatCurrency(e.amount),
    formatPercentage(e.percentage),
  ]);
  
  autoTable(doc, {
    startY: 35,
    head: [['Expense Type', 'Annual Amount', 'Percentage']],
    body: tableData,
    theme: 'grid',
  });
  
  doc.save('expense-breakdown.pdf');
};

// Export to CSV
export const exportToCSV = (data: any[], filename: string) => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Portfolio to CSV
export const exportPortfolioToCSV = (data: any) => {
  const csvData = [
    { Metric: 'Total Properties', Value: data.propertyCount },
    { Metric: 'Portfolio Value', Value: data.totalValue },
    { Metric: 'Total Cost', Value: data.totalCost },
    { Metric: 'Total Debt', Value: data.totalDebt },
    { Metric: 'Total Equity', Value: data.totalEquity },
    { Metric: 'Capital Gain', Value: data.capitalGain },
    { Metric: 'Return on Investment (%)', Value: data.capitalGainPercent.toFixed(2) },
    { Metric: 'Loan to Value (%)', Value: data.ltv.toFixed(2) },
  ];
  
  exportToCSV(csvData, 'portfolio-overview.csv');
};

// Export Cash Flow to CSV
export const exportCashFlowToCSV = (data: any) => {
  const csvData = [
    { Description: 'Monthly Rental Income', Amount: data.monthlyRent },
    { Description: 'Monthly Mortgage Payments', Amount: data.monthlyMortgage },
    { Description: 'Monthly Expenses', Amount: data.monthlyExpenses },
    { Description: 'Total Monthly Expenses', Amount: data.totalMonthlyExpenses },
    { Description: 'Net Monthly Cash Flow', Amount: data.netCashFlow },
    { Description: 'Annual Cash Flow', Amount: data.annualCashFlow },
    { Description: 'Cash Flow Yield (%)', Amount: data.cashFlowYield.toFixed(2) },
  ];
  
  exportToCSV(csvData, 'cash-flow-analysis.csv');
};

// Export Property Performance to CSV
export const exportPropertyPerformanceToCSV = (properties: any[]) => {
  const csvData = properties.map(p => ({
    Property: p.street || 'N/A',
    City: p.city,
    Value: p.estimatedValue,
    Equity: p.equity,
    'Capital Gain': p.capitalGain,
    'Monthly Rent': p.monthlyRent,
    'Net Cash Flow': p.netCashFlow,
    'Rental Yield (%)': p.rentalYield.toFixed(2),
    'ROI (%)': p.roi.toFixed(2),
  }));
  
  exportToCSV(csvData, 'property-performance.csv');
};

// Export Transactions to CSV
export const exportTransactionsToCSV = (transactions: any[]) => {
  const csvData = transactions.map(t => ({
    Type: t.type,
    Income: t.income,
    Expense: t.expense,
    Net: t.net,
    Count: t.count,
  }));
  
  exportToCSV(csvData, 'transaction-summary.csv');
};

// Export Expense Breakdown to CSV
export const exportExpenseBreakdownToCSV = (expenses: any[]) => {
  const csvData = expenses.map(e => ({
    'Expense Type': e.type,
    'Annual Amount': e.amount,
    'Percentage': e.percentage.toFixed(2),
  }));
  
  exportToCSV(csvData, 'expense-breakdown.csv');
};
