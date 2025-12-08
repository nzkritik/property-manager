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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received POST body:', JSON.stringify(body, null, 2))

    // Create property directly without validation
    const property = await prisma.property.create({
      data: {
        address: String(body.address),
        street: String(body.address), // Add this line - use address as street
        city: String(body.city),
        state: body.state ? String(body.state) : '',
        zipCode: body.zipCode ? String(body.zipCode) : '',
        purchasePrice: Number(body.purchasePrice),
        purchaseDate: new Date(body.purchaseDate),
        currentValue: Number(body.currentValue),
        propertyType: String(body.propertyType),
        bedrooms: body.bedrooms ? Number(body.bedrooms) : null,
        bathrooms: body.bathrooms ? Number(body.bathrooms) : null,
        squareFeet: body.squareFeet ? Number(body.squareFeet) : null,
        rentAmount: body.rentAmount ? Number(body.rentAmount) : null,
        depositAmount: body.depositAmount ? Number(body.depositAmount) : null, // Add this line
        images: null,
        documents: null,
      },
    })

    console.log('Property created successfully:', property.id)
    return NextResponse.json(property, { status: 201 })
  } catch (error: any) {
    console.error('POST property error:', error)
    console.error('Error name:', error.name)
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
