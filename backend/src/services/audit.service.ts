import prisma from '../lib/prisma';

export async function logAuditAction(userId: string, action: string, details?: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details || null,
      },
    });
  } catch (error) {
    console.error('Audit Log Error:', error);
  }
}
