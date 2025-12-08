import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const mortgage = await prisma.mortgage.update({
      where: { id: params.id },
      data: {
        propertyId: body.propertyId,
        lender: body.lender,
        loanAmount: Number(body.loanAmount),
        interestRate: Number(body.interestRate),
        termYears: Number(body.termYears),
        startDate: new Date(body.startDate),
        monthlyPayment: Number(body.monthlyPayment),
        outstandingBalance: Number(body.outstandingBalance),
        mortgageType: body.mortgageType,
        notes: body.notes || null,
      },
      include: {
        property: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
          }
        }
      }
    });
    
    return NextResponse.json(mortgage);
  } catch (error: any) {
    console.error('PUT mortgage error:', error);
    return NextResponse.json({ error: 'Failed to update mortgage', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.mortgage.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Mortgage deleted' });
  } catch (error: any) {
    console.error('DELETE mortgage error:', error);
    return NextResponse.json({ error: 'Failed to delete mortgage', message: error.message }, { status: 500 });
  }
}
