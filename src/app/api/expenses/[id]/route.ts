import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const expense = await prisma.expense.update({
      where: { id: params.id },
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
    
    return NextResponse.json(expense);
  } catch (error: any) {
    console.error('PUT expense error:', error);
    return NextResponse.json({ error: 'Failed to update expense', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.expense.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error: any) {
    console.error('DELETE expense error:', error);
    return NextResponse.json({ error: 'Failed to delete expense', message: error.message }, { status: 500 });
  }
}
