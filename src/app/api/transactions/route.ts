import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const transactionSchema = z.object({
  propertyId: z.string().uuid(),
  type: z.enum([
    'rental_income',
    'mortgage_payment',
    'maintenance',
    'utilities',
    'insurance',
    'property_tax',
    'capital_improvement',
    'other',
  ]),
  amount: z.number(),
  date: z.string().datetime(),
  description: z.string(),
  receiptUrl: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.enum(['monthly', 'quarterly', 'annually']).optional(),
})

const categoryMap: Record<string, string> = {
  rental_income: 'Income',
  mortgage_payment: 'Financing',
  maintenance: 'Maintenance',
  utilities: 'Operating Expenses',
  insurance: 'Operating Expenses',
  property_tax: 'Operating Expenses',
  capital_improvement: 'Capital Expenditure',
  other: 'Other',
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    const where = propertyId ? { propertyId } : {}

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(transactions)
  } catch (error: any) {
    console.error('GET transactions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validated = transactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        ...validated,
        date: new Date(validated.date),
        category: categoryMap[validated.type],
      },
      include: {
        property: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
          },
        },
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('POST transaction error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create transaction', message: error.message },
      { status: 500 }
    )
  }
}
