import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(properties)
  } catch (error: any) {
    console.error('GET properties error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received transaction body:', JSON.stringify(body, null, 2))

    const property = await prisma.property.create({
      data: {
        // Address
        street: body.address ? String(body.address) : null,
        city: String(body.city),
        state: body.state ? String(body.state) : '',
        zipCode: body.zipCode ? String(body.zipCode) : '',
        country: body.country || 'USA',

        // Purchase Details
        purchasePrice: Number(body.purchasePrice),
        purchaseDate: new Date(body.purchaseDate),
        depositAmount: body.depositAmount ? Number(body.depositAmount) : null,
        closingCosts: body.closingCosts ? Number(body.closingCosts) : 0,

        // Current Valuation
        estimatedValue: Number(body.currentValue),
        lastValuationDate: new Date(),
        valuationSource: body.valuationSource || 'Manual Entry',

        // Mortgage (default values - will be set via Mortgages page)
        outstandingBalance: body.outstandingBalance ? Number(body.outstandingBalance) : 0,
        interestRate: body.interestRate ? Number(body.interestRate) : 0,
        monthlyPayment: body.monthlyPayment ? Number(body.monthlyPayment) : 0,
        lender: body.lender || null,
        mortgageStartDate: body.mortgageStartDate ? new Date(body.mortgageStartDate) : null,
        termYears: body.termYears ? Number(body.termYears) : null,

        // Property Details
        propertyType: String(body.propertyType),
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        sqm: body.squareMeters ? Number(body.squareMeters) : null, // Changed from sqft
        yearBuilt: body.yearBuilt ? Number(body.yearBuilt) : null,

        // Rental Info
        monthlyRent: body.rentAmount ? Number(body.rentAmount) : null,
        isRented: body.isRented || false,
        tenantName: body.tenantName || null,
        leaseStart: body.leaseStart ? new Date(body.leaseStart) : null,
        leaseEnd: body.leaseEnd ? new Date(body.leaseEnd) : null,

        // Expenses
        annualPropertyTax: body.annualPropertyTax ? Number(body.annualPropertyTax) : 0,
        insurance: body.insurance ? Number(body.insurance) : 0,
        hoaFees: body.hoaFees ? Number(body.hoaFees) : null,
        maintenanceBudget: body.maintenanceBudget ? Number(body.maintenanceBudget) : 0,

        // Media
        images: null,
        documents: null,
      },
    })

    console.log('Property created successfully:', property.id)
    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('POST property full error:', error)
    console.error('Error message:', error.message)

    return NextResponse.json(
      {
        error: 'Failed to create property',
        message: error.message,
        name: error.name,
      },
      { status: 500 }
    )
  }
}
