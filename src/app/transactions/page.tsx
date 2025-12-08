import Link from 'next/link';

export default function TransactionsPage() {
  return (
    <div className="container mx-auto p-6">
      <nav className="mb-6 flex gap-4 text-sm">
        <Link href="/" className="text-blue-600 hover:text-blue-800">
          Dashboard
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/properties" className="text-blue-600 hover:text-blue-800">
          Properties
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/transactions" className="font-semibold text-gray-900">
          Transactions
        </Link>
        <span className="text-gray-400">|</span>
        <Link href="/reports" className="text-blue-600 hover:text-blue-800">
          Reports
        </Link>
      </nav>
      
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      <p>Transaction tracking page - Coming soon</p>
    </div>
  );
}
