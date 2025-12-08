import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
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
    return NextResponse.json(expenses);
  } catch (error: any) {
    console.error('GET expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const expense = await prisma.expense.create({
      data: {
        propertyId: body.propertyId,
        expenseType: body.expenseType,
        amount: Number(body.amount),
        frequency: body.frequency,
        description: body.description || null,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isRecurring: body.isRecurring ?? true,
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
    
    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error('POST expense error:', error);
    return NextResponse.json({ error: 'Failed to create expense', message: error.message }, { status: 500 });
  }
}
