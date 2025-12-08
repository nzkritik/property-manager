import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const mortgages = await prisma.mortgage.findMany({
      include: {
        property: {
          select: {
            id: true,
            street: true,
            city: true,
            state: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(mortgages);
  } catch (error: any) {
    console.error('GET mortgages error:', error);
    return NextResponse.json({ error: 'Failed to fetch mortgages', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const mortgage = await prisma.mortgage.create({
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
    
    return NextResponse.json(mortgage, { status: 201 });
  } catch (error: any) {
    console.error('POST mortgage error:', error);
    return NextResponse.json({ error: 'Failed to create mortgage', message: error.message }, { status: 500 });
  }
}
