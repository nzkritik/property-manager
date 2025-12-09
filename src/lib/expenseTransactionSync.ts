import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function syncRecurringExpensesToTransactions() {
  console.log('🔄 Checking for recurring expenses to sync...');

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get all recurring expenses
    const recurringExpenses = await prisma.expense.findMany({
      where: {
        isRecurring: true,
      },
    });

    let addedCount = 0;
    let skippedCount = 0;

    for (const expense of recurringExpenses) {
      const expenseStartDate = new Date(expense.startDate);
      const expenseEndDate = expense.endDate ? new Date(expense.endDate) : null;

      // Skip if expense hasn't started yet
      if (expenseStartDate > now) {
        continue;
      }

      // Skip if expense has ended before this year
      if (expenseEndDate && expenseEndDate < startOfYear) {
        continue;
      }

      // Generate transactions based on frequency
      const transactionDates = generateTransactionDates(
        expense,
        expenseStartDate,
        expenseEndDate,
        currentYear
      );

      for (const transactionDate of transactionDates) {
        // Check if transaction already exists for this expense on this date
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            propertyId: expense.propertyId,
            transactionType: expense.expenseType,
            amount: expense.amount,
            date: {
              gte: new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate()),
              lt: new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate() + 1),
            },
          },
        });

        if (!existingTransaction) {
          // Create pending transaction
          await prisma.transaction.create({
            data: {
              propertyId: expense.propertyId,
              transactionType: expense.expenseType,
              amount: expense.amount,
              date: transactionDate,
              description: expense.description || `Recurring ${expense.expenseType}`,
              status: 'Pending',
              isIncome: false,
            },
          });
          addedCount++;
        } else {
          skippedCount++;
        }
      }
    }

    console.log(`✅ Sync complete: ${addedCount} transactions added, ${skippedCount} duplicates skipped`);
    return { added: addedCount, skipped: skippedCount };
  } catch (error) {
    console.error('❌ Error syncing recurring expenses:', error);
    throw error;
  }
}

function generateTransactionDates(
  expense: any,
  startDate: Date,
  endDate: Date | null,
  year: number
): Date[] {
  const dates: Date[] = [];
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31, 23, 59, 59);

  // Determine the effective start date for this year
  const effectiveStart = startDate > yearStart ? startDate : yearStart;
  
  // Determine the effective end date (use year end, not current date)
  let effectiveEnd = yearEnd;
  if (endDate && endDate < yearEnd) {
    effectiveEnd = endDate;
  }

  const currentDate = new Date(effectiveStart);

  switch (expense.frequency) {
    case 'Monthly':
      // Generate monthly transactions for entire year
      while (currentDate <= effectiveEnd) {
        dates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      break;

    case 'Quarterly':
      // Generate quarterly transactions for entire year
      while (currentDate <= effectiveEnd) {
        dates.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 3);
      }
      break;

    case 'Annually':
      // Generate annual transaction (once per year)
      if (currentDate <= effectiveEnd) {
        dates.push(new Date(currentDate));
      }
      break;

    case 'One-time':
      // One-time expenses are not recurring, skip
      break;

    default:
      console.warn(`Unknown frequency: ${expense.frequency}`);
      break;
  }

  return dates;
}
