import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const loginPayload = {
            email: process.env.PIRPOS_EMAIL || body.email,
            password: process.env.PIRPOS_PASSWORD || body.password
        };

        if (!loginPayload.email || !loginPayload.password) {
            throw new Error("Pirpos credentials not configured in environment.");
        }

        // 1. LOGIN
        const loginRes = await fetch('https://api.pirpos.com/login', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'content-type': 'application/json'
            },
            body: JSON.stringify(loginPayload)
        });

        if (!loginRes.ok) {
            const errData = await loginRes.text();
            throw new Error(`Pirpos API error: ${loginRes.status} ${errData}`);
        }

        const loginData = await loginRes.json();
        const loginHeaders = [...loginRes.headers.entries()];
        const cookieStr = loginHeaders.filter(h => h[0].toLowerCase() === 'set-cookie').map(h => h[1]).join('; ');
        const token = loginData?.tokenCurrent || loginData?.token || loginData?.data?.token || loginData?.accessToken;
        let authHeader = token ? `Bearer ${token}` : undefined;

        // Si no pillamos Token, y manda todo el user envuelto en 'data' y un 'token'
        if(!token && Object.keys(loginData).length > 2 && typeof loginData === 'string'){
           // fallback
        }

        // Calculate dates in Bogota UTC-5 shift bounds based on UI Selection
        let dateInitISO = '2026-04-01T05:00:00.000Z'; 
        let dateEndISO = '2026-04-02T04:55:00.000Z';

        if (body.targetDate) {
            const [y, m, d] = body.targetDate.split('-');
            const target = new Date(Number(y), Number(m) - 1, Number(d));
            const yyyy = target.getFullYear();
            const mm = String(target.getMonth() + 1).padStart(2, '0');
            const dd = String(target.getDate()).padStart(2, '0');
            dateInitISO = `${yyyy}-${mm}-${dd}T05:00:00.000Z`;
            
            // Next day for shift end
            const nextDay = new Date(target.getTime() + 24 * 60 * 60 * 1000);
            const n_yyyy = nextDay.getFullYear();
            const n_mm = String(nextDay.getMonth() + 1).padStart(2, '0');
            const n_dd = String(nextDay.getDate()).padStart(2, '0');
            dateEndISO = `${n_yyyy}-${n_mm}-${n_dd}T04:55:00.000Z`;
        }

        const businessIdParam = body.businessId ? `&businesses[]=${body.businessId}` : '';
        const statsUrl = `https://api.pirpos.com/stats/totalInvoicesByProducts?dateInitISO=${dateInitISO}&dateEndISO=${dateEndISO}&sortBy=total${businessIdParam}`;
        
        
        // 2. Fetch STATS
        const statsRes = await fetch(statsUrl, {
            headers: {
                'accept': 'application/json',
                'cookie': cookieStr,
                ...(authHeader ? { 'authorization': authHeader } : {})
            }
        });

        if(!statsRes.ok) {
            throw new Error(`Pirpos stats error: ${statsRes.status} ${await statsRes.text()}`);
        }
        
        const statsData = await statsRes.json();
        
        return NextResponse.json({ success: true, data: statsData, loginRaw: loginData });
    } catch (error: any) {
        console.error("Pirpos connection failed:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
