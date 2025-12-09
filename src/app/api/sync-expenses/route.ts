import { NextResponse } from 'next/server';
import { syncRecurringExpensesToTransactions } from '@/lib/expenseTransactionSync';

export async function POST() {
  try {
    const result = await syncRecurringExpensesToTransactions();
    return NextResponse.json({
      success: true,
      message: `Sync complete: ${result.added} transactions added, ${result.skipped} duplicates skipped`,
      ...result,
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
