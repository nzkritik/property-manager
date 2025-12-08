import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        address: body.address,
        city: body.city,
        state: body.state || '',
        zipCode: body.zipCode || '',
        purchasePrice: parseFloat(body.purchasePrice),
        purchaseDate: new Date(body.purchaseDate),
        currentValue: parseFloat(body.currentValue),
        propertyType: body.propertyType,
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseFloat(body.bathrooms) : null,
        squareFeet: body.squareFeet ? parseFloat(body.squareFeet) : null,
        rentAmount: body.rentAmount ? parseFloat(body.rentAmount) : null,
        images: body.images ? JSON.stringify(body.images) : null,
        documents: body.documents ? JSON.stringify(body.documents) : null,
      },
    });
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('PUT property error:', error);
    return NextResponse.json({ error: 'Failed to update property', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.property.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Property deleted' });
  } catch (error) {
    console.error('DELETE property error:', error);
    return NextResponse.json({ error: 'Failed to delete property', details: error }, { status: 500 });
  }
}
