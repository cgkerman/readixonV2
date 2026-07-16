import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    // 1. Yetki Kontrolü
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (e) {
      return NextResponse.json({ error: 'Oturum süresi dolmuş veya geçersiz token.' }, { status: 401 });
    }
    
    const uid = decodedToken.uid;
    const { prompt, context } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Mesaj boş olamaz' }, { status: 400 });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Sistem hatası: API anahtarı yapılandırılmamış.' }, { status: 500 });
    }
    
    // 2. Kota ve Limit Kontrolü
    const userRef = adminDb.collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const today = new Date().toISOString().split('T')[0]; // Örn: 2026-07-09
    
    let maxDailyRequests = 5; // Default for free users
    if (userData?.isAdmin || userData?.status === 'pro') {
      maxDailyRequests = Infinity;
    } else if (userData?.status === 'premium') {
      maxDailyRequests = 10;
    }
    
    let aiUsage = userData?.aiUsage || { date: today, requestCount: 0 };
    
    if (aiUsage.date !== today) {
      // Yeni gün, limiti sıfırla
      aiUsage = { date: today, requestCount: 0 };
    }
    
    if (aiUsage.requestCount >= maxDailyRequests) {
      return NextResponse.json({ 
        error: `Günlük kullanım sınırınıza (${maxDailyRequests}) ulaştınız. Lütfen daha fazla kullanım için Premium veya Pro plana geçiş yapın.` 
      }, { status: 429 });
    }
    
    // 3. Gemini API Çağrısı
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const systemInstruction = `
Sen "Readixon" yazar platformuna entegre edilmiş yaratıcı bir kurgu asistanısın.
Asla bir robot, müşteri temsilcisi veya pazarlamacı gibi yapay ve resmi bir dil kullanma.
Tonun: Son derece samimi, edebiyata aşık, ilham verici ve yazarla empati kuran "kadim bir yazar dostu" gibi olmalı.

- Yazarın yaratıcı sürecine saygı duy, onu yüreklendir.
- Kısa, öz ve direkt tavsiyeler ver. Madde işaretlerini dozunda kullan.
- Edebi bir üslup kullan (ama ağdalı değil, akıcı ve doğal).

Yazarın üzerinde çalıştığı bölümün güncel içeriği:
"""
${context || "(Henüz metin girilmedi)"}
"""

Yazarın Sorusunu / İsteğini dikkate alarak cevap ver:
${prompt}
    `.trim();
    
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    const text = response.text();
    
    // 4. Kotayı Güncelle
    await userRef.update({
      aiUsage: {
        date: today,
        requestCount: aiUsage.requestCount + 1
      }
    });
    
    return NextResponse.json({ 
      response: text, 
      requestCount: aiUsage.requestCount + 1, 
      maxRequests: maxDailyRequests === Infinity ? -1 : maxDailyRequests 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("AI Error:", error);
    const errorMessage = error.message || '';
    
    // Google AI 503 (High Demand) hatası kontrolü
    if (errorMessage.includes('503') || errorMessage.includes('high demand') || errorMessage.includes('Service Unavailable')) {
      return NextResponse.json({ 
        error: 'Şu an yapay zeka sunucularımızda kısa süreli bir yoğunluk yaşanıyor. Lütfen birkaç dakika sonra tekrar deneyin.' 
      }, { status: 503 });
    }
    
    return NextResponse.json({ error: `Hata: ${errorMessage || 'Bilinmeyen'}` }, { status: 500 });
  }
}
