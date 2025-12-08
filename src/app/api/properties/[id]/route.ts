import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    console.log('Received PUT body:', JSON.stringify(body, null, 2));
    
    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        address: String(body.address),
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
        images: body.images ? JSON.stringify(body.images) : null,
        documents: body.documents ? JSON.stringify(body.documents) : null,
      },
    });
    
    console.log('Property updated successfully:', property.id);
    return NextResponse.json(property);
  } catch (error: any) {
    console.error('PUT property error:', error);
    return NextResponse.json({ 
      error: 'Failed to update property', 
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.property.delete({
      where: { id: params.id },
    });
    console.log('Property deleted successfully:', params.id);
    return NextResponse.json({ message: 'Property deleted' });
  } catch (error: any) {
    console.error('DELETE property error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete property', 
      message: error.message 
    }, { status: 500 });
  }
}
