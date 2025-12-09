import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.mortgage.deleteMany();
  await prisma.property.deleteMany();

  console.log('✅ Existing data cleared');

  // Create Properties
  console.log('🏠 Creating sample properties...');

  const property1 = await prisma.property.create({
    data: {
      street: '123 Queen Street',
      city: 'Auckland',
      state: 'Auckland',
      zipCode: '1010',
      country: 'New Zealand',
      
      purchasePrice: 850000,
      purchaseDate: new Date('2020-03-15'),
      depositAmount: 170000,
      closingCosts: 8500,
      
      estimatedValue: 1050000,
      lastValuationDate: new Date('2024-11-01'),
      valuationSource: 'QV',
      
      outstandingBalance: 680000,
      interestRate: 6.5,
      monthlyPayment: 4280,
      lender: 'ANZ Bank',
      mortgageStartDate: new Date('2020-03-15'),
      termYears: 30,
      
      propertyType: 'SINGLE_FAMILY',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1500,
      yearBuilt: 2015,
      
      monthlyRent: 3200,
      isRented: true,
      tenantName: 'John and Mary Smith',
      leaseStart: new Date('2024-01-01'),
      leaseEnd: new Date('2024-12-31'),
      
      annualPropertyTax: 3200,
      insurance: 1800,
      hoaFees: null,
      maintenanceBudget: 2400,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      street: '45 Victoria Avenue',
      city: 'Wellington',
      state: 'Wellington',
      zipCode: '6011',
      country: 'New Zealand',
      
      purchasePrice: 650000,
      purchaseDate: new Date('2021-06-20'),
      depositAmount: 130000,
      closingCosts: 6500,
      
      estimatedValue: 720000,
      lastValuationDate: new Date('2024-10-15'),
      valuationSource: 'CoreLogic',
      
      outstandingBalance: 520000,
      interestRate: 6.75,
      monthlyPayment: 3400,
      lender: 'Westpac',
      mortgageStartDate: new Date('2021-06-20'),
      termYears: 30,
      
      propertyType: 'CONDO',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 1100,
      yearBuilt: 2018,
      
      monthlyRent: 2800,
      isRented: true,
      tenantName: 'Sarah Johnson',
      leaseStart: new Date('2024-02-01'),
      leaseEnd: new Date('2025-01-31'),
      
      annualPropertyTax: 2600,
      insurance: 1500,
      hoaFees: 1200,
      maintenanceBudget: 1800,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      street: '78 Beach Road',
      city: 'Tauranga',
      state: 'Bay of Plenty',
      zipCode: '3110',
      country: 'New Zealand',
      
      purchasePrice: 580000,
      purchaseDate: new Date('2022-09-10'),
      depositAmount: 116000,
      closingCosts: 5800,
      
      estimatedValue: 640000,
      lastValuationDate: new Date('2024-11-20'),
      valuationSource: 'Property Guru',
      
      outstandingBalance: 464000,
      interestRate: 7.0,
      monthlyPayment: 3088,
      lender: 'ASB Bank',
      mortgageStartDate: new Date('2022-09-10'),
      termYears: 30,
      
      propertyType: 'TOWNHOUSE',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1350,
      yearBuilt: 2020,
      
      monthlyRent: 2600,
      isRented: true,
      tenantName: 'David and Lisa Chen',
      leaseStart: new Date('2024-03-01'),
      leaseEnd: new Date('2025-02-28'),
      
      annualPropertyTax: 2800,
      insurance: 1600,
      hoaFees: 800,
      maintenanceBudget: 2000,
    },
  });

  console.log('✅ Created 3 properties');

  // Create Mortgages
  console.log('💰 Creating mortgages...');

  await prisma.mortgage.create({
    data: {
      propertyId: property1.id,
      lender: 'ANZ Bank',
      loanAmount: 680000,
      interestRate: 6.5,
      termYears: 30,
      startDate: new Date('2020-03-15'),
      monthlyPayment: 4280,
      outstandingBalance: 650000,
      mortgageType: 'Fixed',
      notes: 'Fixed rate for 2 years, ending March 2026',
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: property2.id,
      lender: 'Westpac',
      loanAmount: 520000,
      interestRate: 6.75,
      termYears: 30,
      startDate: new Date('2021-06-20'),
      monthlyPayment: 3400,
      outstandingBalance: 510000,
      mortgageType: 'Variable',
      notes: 'Variable rate, reviewed annually',
    },
  });

  await prisma.mortgage.create({
    data: {
      propertyId: property3.id,
      lender: 'ASB Bank',
      loanAmount: 464000,
      interestRate: 7.0,
      termYears: 30,
      startDate: new Date('2022-09-10'),
      monthlyPayment: 3088,
      outstandingBalance: 460000,
      mortgageType: 'Fixed',
      notes: 'Fixed rate for 3 years, ending September 2025',
    },
  });

  console.log('✅ Created 3 mortgages');

  // Create Expenses
  console.log('📋 Creating expenses...');

  // Property 1 Expenses
  await prisma.expense.create({
    data: {
      propertyId: property1.id,
      expenseType: 'Rates',
      amount: 3200,
      frequency: 'Annually',
      description: 'Auckland Council rates',
      startDate: new Date('2024-07-01'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property1.id,
      expenseType: 'Insurance',
      amount: 1800,
      frequency: 'Annually',
      description: 'Building and contents insurance',
      startDate: new Date('2024-03-15'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property1.id,
      expenseType: 'Property Management',
      amount: 256,
      frequency: 'Monthly',
      description: 'Property management fees (8% of rent)',
      startDate: new Date('2024-01-01'),
      isRecurring: true,
    },
  });

  // Property 2 Expenses
  await prisma.expense.create({
    data: {
      propertyId: property2.id,
      expenseType: 'Rates',
      amount: 2600,
      frequency: 'Annually',
      description: 'Wellington City Council rates',
      startDate: new Date('2024-07-01'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property2.id,
      expenseType: 'Insurance',
      amount: 1500,
      frequency: 'Annually',
      description: 'Building and contents insurance',
      startDate: new Date('2024-06-20'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property2.id,
      expenseType: 'Body Corp Fees',
      amount: 1200,
      frequency: 'Quarterly',
      description: 'Body corporate levies',
      startDate: new Date('2024-01-01'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property2.id,
      expenseType: 'Property Management',
      amount: 224,
      frequency: 'Monthly',
      description: 'Property management fees (8% of rent)',
      startDate: new Date('2024-02-01'),
      isRecurring: true,
    },
  });

  // Property 3 Expenses
  await prisma.expense.create({
    data: {
      propertyId: property3.id,
      expenseType: 'Rates',
      amount: 2800,
      frequency: 'Annually',
      description: 'Tauranga City Council rates',
      startDate: new Date('2024-07-01'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property3.id,
      expenseType: 'Insurance',
      amount: 1600,
      frequency: 'Annually',
      description: 'Building and contents insurance',
      startDate: new Date('2024-09-10'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property3.id,
      expenseType: 'Body Corp Fees',
      amount: 800,
      frequency: 'Quarterly',
      description: 'Body corporate levies',
      startDate: new Date('2024-01-01'),
      isRecurring: true,
    },
  });

  await prisma.expense.create({
    data: {
      propertyId: property3.id,
      expenseType: 'Property Management',
      amount: 208,
      frequency: 'Monthly',
      description: 'Property management fees (8% of rent)',
      startDate: new Date('2024-03-01'),
      isRecurring: true,
    },
  });

  console.log('✅ Created 11 expenses');

  // Create Transactions (Last 6 months)
  console.log('💸 Creating transactions...');

  const now = new Date();
  const transactionsData = [];

  // Generate rental income for last 6 months
  for (let month = 5; month >= 0; month--) {
    const date = new Date(now.getFullYear(), now.getMonth() - month, 1);
    
    // Property 1 - Rent
    transactionsData.push({
      propertyId: property1.id,
      transactionType: 'Rent',
      amount: 3200,
      date: date,
      description: 'Monthly rent payment',
      status: 'Complete',
      isIncome: true,
    });

    // Property 2 - Rent
    transactionsData.push({
      propertyId: property2.id,
      transactionType: 'Rent',
      amount: 2800,
      date: date,
      description: 'Monthly rent payment',
      status: 'Complete',
      isIncome: true,
    });

    // Property 3 - Rent
    transactionsData.push({
      propertyId: property3.id,
      transactionType: 'Rent',
      amount: 2600,
      date: date,
      description: 'Monthly rent payment',
      status: 'Complete',
      isIncome: true,
    });

    // Mortgage payments
    transactionsData.push({
      propertyId: property1.id,
      transactionType: 'Mortgage',
      amount: 4280,
      date: new Date(date.getFullYear(), date.getMonth(), 15),
      description: 'Monthly mortgage payment - ANZ',
      status: 'Complete',
      isIncome: false,
    });

    transactionsData.push({
      propertyId: property2.id,
      transactionType: 'Mortgage',
      amount: 3400,
      date: new Date(date.getFullYear(), date.getMonth(), 20),
      description: 'Monthly mortgage payment - Westpac',
      status: 'Complete',
      isIncome: false,
    });

    transactionsData.push({
      propertyId: property3.id,
      transactionType: 'Mortgage',
      amount: 3088,
      date: new Date(date.getFullYear(), date.getMonth(), 10),
      description: 'Monthly mortgage payment - ASB',
      status: 'Complete',
      isIncome: false,
    });

    // Property management fees
    transactionsData.push({
      propertyId: property1.id,
      transactionType: 'Management Fee',
      amount: 256,
      date: new Date(date.getFullYear(), date.getMonth(), 5),
      description: 'Property management fee',
      status: 'Complete',
      isIncome: false,
    });

    transactionsData.push({
      propertyId: property2.id,
      transactionType: 'Management Fee',
      amount: 224,
      date: new Date(date.getFullYear(), date.getMonth(), 5),
      description: 'Property management fee',
      status: 'Complete',
      isIncome: false,
    });

    transactionsData.push({
      propertyId: property3.id,
      transactionType: 'Management Fee',
      amount: 208,
      date: new Date(date.getFullYear(), date.getMonth(), 5),
      description: 'Property management fee',
      status: 'Complete',
      isIncome: false,
    });
  }

  // Add some quarterly expenses (rates, body corp)
  transactionsData.push({
    propertyId: property1.id,
    transactionType: 'Rates',
    amount: 800,
    date: new Date(now.getFullYear(), now.getMonth() - 2, 1),
    description: 'Auckland Council rates - Q2 2024',
    status: 'Complete',
    isIncome: false,
  });

  transactionsData.push({
    propertyId: property2.id,
    transactionType: 'Rates',
    amount: 650,
    date: new Date(now.getFullYear(), now.getMonth() - 2, 1),
    description: 'Wellington Council rates - Q2 2024',
    status: 'Complete',
    isIncome: false,
  });

  transactionsData.push({
    propertyId: property2.id,
    transactionType: 'Body Corp Fees',
    amount: 300,
    date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    description: 'Body corporate quarterly levy',
    status: 'Complete',
    isIncome: false,
  });

  transactionsData.push({
    propertyId: property3.id,
    transactionType: 'Body Corp Fees',
    amount: 200,
    date: new Date(now.getFullYear(), now.getMonth() - 1, 15),
    description: 'Body corporate quarterly levy',
    status: 'Complete',
    isIncome: false,
  });

  // Add some maintenance transactions
  transactionsData.push({
    propertyId: property1.id,
    transactionType: 'Maintenance',
    amount: 450,
    date: new Date(now.getFullYear(), now.getMonth() - 3, 10),
    description: 'Plumbing repair - leaking tap',
    status: 'Complete',
    isIncome: false,
  });

  transactionsData.push({
    propertyId: property2.id,
    transactionType: 'Maintenance',
    amount: 380,
    date: new Date(now.getFullYear(), now.getMonth() - 2, 15),
    description: 'Hot water cylinder service',
    status: 'Complete',
    isIncome: false,
  });

  transactionsData.push({
    propertyId: property3.id,
    transactionType: 'Maintenance',
    amount: 620,
    date: new Date(now.getFullYear(), now.getMonth() - 1, 8),
    description: 'Fence repair after storm',
    status: 'Complete',
    isIncome: false,
  });

  // Add insurance payments
  transactionsData.push({
    propertyId: property1.id,
    transactionType: 'Insurance',
    amount: 1800,
    date: new Date(now.getFullYear(), now.getMonth() - 4, 15),
    description: 'Annual building insurance',
    status: 'Complete',
    isIncome: false,
  });

  transactionsData.push({
    propertyId: property2.id,
    transactionType: 'Insurance',
    amount: 1500,
    date: new Date(now.getFullYear(), now.getMonth() - 3, 20),
    description: 'Annual building insurance',
    status: 'Complete',
    isIncome: false,
  });

  // Add accountant fees
  transactionsData.push({
    propertyId: property1.id,
    transactionType: 'Accountant Fees',
    amount: 850,
    date: new Date(now.getFullYear(), now.getMonth() - 5, 30),
    description: 'Tax return preparation - 2023/24',
    status: 'Complete',
    isIncome: false,
  });

  // Add a pending transaction
  transactionsData.push({
    propertyId: property1.id,
    transactionType: 'Maintenance',
    amount: 550,
    date: new Date(),
    description: 'Scheduled heat pump service',
    status: 'Pending',
    isIncome: false,
  });

  // Create all transactions
  for (const transaction of transactionsData) {
    await prisma.transaction.create({ data: transaction });
  }

  console.log(`✅ Created ${transactionsData.length} transactions`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   Properties: 3`);
  console.log(`   Mortgages: 3`);
  console.log(`   Expenses: 11`);
  console.log(`   Transactions: ${transactionsData.length}`);
  console.log('');
  console.log('🏠 Sample Properties:');
  console.log('   1. 123 Queen Street, Auckland - $1,050,000');
  console.log('   2. 45 Victoria Avenue, Wellington - $720,000');
  console.log('   3. 78 Beach Road, Tauranga - $640,000');
  console.log('');
  console.log('💰 Total Portfolio Value: $2,410,000');
  console.log('💳 Total Debt: $1,620,000');
  console.log('💎 Total Equity: $790,000');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
