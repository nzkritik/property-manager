import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const transaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        propertyId: body.propertyId,
        transactionType: body.transactionType,
        amount: Number(body.amount),
        date: new Date(body.date),
        description: body.description || null,
        status: body.status || 'Complete',
        isIncome: body.isIncome ?? false,
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
    
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('PUT transaction error:', error);
    return NextResponse.json({ error: 'Failed to update transaction', message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.transaction.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Transaction deleted' });
  } catch (error: any) {
    console.error('DELETE transaction error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction', message: error.message }, { status: 500 });
  }
}
