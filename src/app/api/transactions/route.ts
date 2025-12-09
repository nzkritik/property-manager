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
    console.log('Received transaction body:', JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.propertyId) {
      return NextResponse.json({ error: 'Property is required' }, { status: 400 })
    }
    if (!body.transactionType) {
      return NextResponse.json({ error: 'Transaction type is required' }, { status: 400 })
    }
    if (!body.amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 })
    }
    if (!body.date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    const transactionData = {
      propertyId: String(body.propertyId),
      transactionType: String(body.transactionType),
      amount: Number(body.amount),
      date: new Date(body.date),
      description: body.description ? String(body.description) : null,
      status: body.status ? String(body.status) : 'Complete',
      isIncome: Boolean(body.isIncome),
    }

    console.log('Creating transaction with data:', JSON.stringify(transactionData, null, 2))

    const transaction = await prisma.transaction.create({
      data: transactionData,
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

    console.log('Transaction created successfully:', transaction.id)
    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('POST transaction error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      {
        error: 'Failed to create transaction',
        message: error.message,
        details: error.stack,
      },
      { status: 500 }
    )
  }
}
