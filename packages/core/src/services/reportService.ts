import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import type { ReportTargetType, Report } from '../types';

export async function reportContent(
  targetId: string,
  targetType: ReportTargetType,
  reporterId: string,
  reason: string
): Promise<Report> {
  const reportRef = doc(collection(db, 'reports'));
  const newReport = {
    id: reportRef.id,
    targetId,
    targetType,
    reporterId,
    reason,
    status: 'pending' as const,
    createdAt: serverTimestamp()
  };

  await setDoc(reportRef, newReport);

  return {
    ...newReport,
    createdAt: { toDate: () => new Date() } as any
  } as Report;
}
