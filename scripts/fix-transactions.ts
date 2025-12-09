import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTransactions() {
  console.log('🔧 Fixing transaction data...');

  try {
    // Update transactions with null status
    const statusFixed = await prisma.transaction.updateMany({
      where: { status: null },
      data: { status: 'Complete' },
    });
    console.log(`✅ Fixed ${statusFixed.count} transactions with null status`);

    // Update transactions with null transactionType
    const typeFixed = await prisma.transaction.updateMany({
      where: { transactionType: null },
      data: { transactionType: 'Other' },
    });
    console.log(`✅ Fixed ${typeFixed.count} transactions with null type`);

    // Check all transactions
    const allTransactions = await prisma.transaction.findMany();
    console.log(`\n📊 Total transactions: ${allTransactions.length}`);
    
    const incomplete = allTransactions.filter(t => 
      !t.propertyId || !t.transactionType || t.amount === null || !t.date || !t.status
    );
    
    if (incomplete.length > 0) {
      console.log(`⚠️  Found ${incomplete.length} incomplete transactions:`);
      incomplete.forEach(t => {
        console.log(`  - ID: ${t.id}, Missing:`, {
          propertyId: !t.propertyId,
          type: !t.transactionType,
          amount: t.amount === null,
          date: !t.date,
          status: !t.status,
        });
      });
    } else {
      console.log('✅ All transactions are complete!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTransactions();
