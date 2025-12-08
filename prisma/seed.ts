import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo properties
  const property1 = await prisma.property.create({
    data: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      purchasePrice: 850000,
      purchaseDate: new Date('2022-01-15'),
      depositAmount: 170000,
      closingCosts: 25500,
      estimatedValue: 920000,
      lastValuationDate: new Date('2024-01-01'),
      valuationSource: 'Zillow',
      outstandingBalance: 680000,
      interestRate: 3.5,
      monthlyPayment: 3050,
      lender: 'Wells Fargo',
      mortgageStartDate: new Date('2022-01-15'),
      termYears: 30,
      propertyType: 'house',
      bedrooms: 3,
      bathrooms: 2.5,
      sqft: 1800,
      yearBuilt: 2005,
      monthlyRent: 4200,
      isRented: true,
      tenantName: 'John Doe',
      leaseStart: new Date('2023-06-01'),
      leaseEnd: new Date('2024-05-31'),
      annualPropertyTax: 12000,
      insurance: 2400,
      hoaFees: 350,
      maintenanceBudget: 6000,
    },
  })

  const property2 = await prisma.property.create({
    data: {
      street: '456 Oak Avenue',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'USA',
      purchasePrice: 425000,
      purchaseDate: new Date('2023-03-20'),
      depositAmount: 85000,
      closingCosts: 12750,
      estimatedValue: 460000,
      lastValuationDate: new Date('2024-01-01'),
      valuationSource: 'Redfin',
      outstandingBalance: 340000,
      interestRate: 4.2,
      monthlyPayment: 1665,
      lender: 'Chase Bank',
      mortgageStartDate: new Date('2023-03-20'),
      termYears: 30,
      propertyType: 'apartment',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      yearBuilt: 2018,
      monthlyRent: 2800,
      isRented: true,
      tenantName: 'Jane Smith',
      leaseStart: new Date('2023-08-01'),
      leaseEnd: new Date('2024-07-31'),
      annualPropertyTax: 5100,
      insurance: 1200,
      hoaFees: 250,
      maintenanceBudget: 3000,
    },
  })

  // Create demo transactions
  await prisma.transaction.createMany({
    data: [
      {
        propertyId: property1.id,
        type: 'rental_income',
        amount: 4200,
        date: new Date('2024-01-01'),
        description: 'January rent payment',
        category: 'Income',
      },
      {
        propertyId: property1.id,
        type: 'mortgage_payment',
        amount: -3050,
        date: new Date('2024-01-05'),
        description: 'Monthly mortgage payment',
        category: 'Financing',
        isRecurring: true,
        recurringInterval: 'monthly',
      },
      {
        propertyId: property1.id,
        type: 'maintenance',
        amount: -450,
        date: new Date('2024-01-10'),
        description: 'Plumbing repair',
        category: 'Maintenance',
      },
      {
        propertyId: property2.id,
        type: 'rental_income',
        amount: 2800,
        date: new Date('2024-01-01'),
        description: 'January rent payment',
        category: 'Income',
      },
      {
        propertyId: property2.id,
        type: 'mortgage_payment',
        amount: -1665,
        date: new Date('2024-01-05'),
        description: 'Monthly mortgage payment',
        category: 'Financing',
        isRecurring: true,
        recurringInterval: 'monthly',
      },
    ],
  })

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
