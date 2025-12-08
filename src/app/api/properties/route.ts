import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const propertySchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  country: z.string().default('USA'),
  purchasePrice: z.number().positive(),
  purchaseDate: z.string().datetime(),
  depositAmount: z.number().nonnegative(),
  closingCosts: z.number().nonnegative(),
  estimatedValue: z.number().positive(),
  lastValuationDate: z.string().datetime(),
  valuationSource: z.string(),
  outstandingBalance: z.number().nonnegative(),
  interestRate: z.number().nonnegative(),
  monthlyPayment: z.number().nonnegative(),
  lender: z.string().optional(),
  mortgageStartDate: z.string().datetime().optional(),
  termYears: z.number().int().positive().optional(),
  propertyType: z.enum(['house', 'apartment', 'commercial', 'land']),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().nonnegative().optional(),
  sqft: z.number().int().positive().optional(),
  yearBuilt: z.number().int().optional(),
  monthlyRent: z.number().nonnegative().optional(),
  isRented: z.boolean().default(false),
  tenantName: z.string().optional(),
  leaseStart: z.string().datetime().optional(),
  leaseEnd: z.string().datetime().optional(),
  annualPropertyTax: z.number().nonnegative(),
  insurance: z.number().nonnegative(),
  hoaFees: z.number().nonnegative().optional(),
  maintenanceBudget: z.number().nonnegative(),
})

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = propertySchema.parse(body)

    const property = await prisma.property.create({
      data: {
        ...validated,
        purchaseDate: new Date(validated.purchaseDate),
        lastValuationDate: new Date(validated.lastValuationDate),
        mortgageStartDate: validated.mortgageStartDate 
          ? new Date(validated.mortgageStartDate) 
          : null,
        leaseStart: validated.leaseStart 
          ? new Date(validated.leaseStart) 
          : null,
        leaseEnd: validated.leaseEnd 
          ? new Date(validated.leaseEnd) 
          : null,
      },
    })

    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    )
  }
}
