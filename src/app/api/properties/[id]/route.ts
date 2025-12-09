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
        
        // Mortgage (preserve existing if not provided)
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
        sqft: body.squareFeet ? Number(body.squareFeet) : null,
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
