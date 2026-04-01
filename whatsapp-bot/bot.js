/**
 * MultiAgente WhatsApp Bot — whatsapp-web.js
 * Connects via QR code. Routes messages through MultiAgente API.
 */

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const FormData = require('form-data');

const API_URL = process.env.API_URL || 'https://multiagente-api.onrender.com';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

console.log('\n  MultiAgente WhatsApp Bot');
console.log(`  API: ${API_URL}\n`);

const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './wa_session' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
        ],
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/nicoli-hub/nicoli-hub/main/nicoli-hub-api',
    },
    webVersion: '2.3000.1017531758-alpha',
});

client.on('qr', (qr) => {
    console.log('  Escanea el QR con WhatsApp:\n');
    qrcode.generate(qr, { small: true });
    console.log('\n  WhatsApp > Dispositivos vinculados > Vincular\n');
});

client.on('ready', () => {
    console.log('  WhatsApp conectado! Listo para recibir mensajes.\n');
});

client.on('disconnected', (reason) => {
    console.log('  Disconnected:', reason);
});

client.on('message', async (msg) => {
    // Skip group messages and status
    if (msg.from === 'status@broadcast') return;
    if (msg.from.endsWith('@g.us')) return;

    const phone = '+' + msg.from.split('@')[0];
    let messageText = '';

    // Text message
    if (msg.body && !msg.hasMedia) {
        messageText = msg.body;
    }

    // Voice note
    else if (msg.hasMedia && msg.type === 'ptt') {
        try {
            console.log(`  [VOICE] ${phone} - downloading...`);
            const media = await msg.downloadMedia();
            if (media && GROQ_API_KEY) {
                const audioBuffer = Buffer.from(media.data, 'base64');
                messageText = await transcribeAudio(audioBuffer);
                if (!messageText) {
                    await msg.reply('No se pudo transcribir el audio. Intenta con texto.');
                    return;
                }
                console.log(`  [VOICE] Transcribed: ${messageText.substring(0, 50)}`);
            } else {
                await msg.reply('Notas de voz no disponibles ahora. Intenta con texto.');
                return;
            }
        } catch (err) {
            console.error('  Voice error:', err.message);
            await msg.reply('Error procesando audio.');
            return;
        }
    }

    // Image
    else if (msg.hasMedia && (msg.type === 'image' || msg.type === 'document')) {
        await msg.reply('Recibi tu archivo. Por ahora solo proceso texto y notas de voz.');
        return;
    }

    // Other
    else {
        return;
    }

    if (!messageText.trim()) return;

    // Only respond to messages starting with #soporte
    const TRIGGER = '#soporte';
    if (!messageText.toLowerCase().startsWith(TRIGGER)) return;

    // Remove the trigger keyword
    messageText = messageText.substring(TRIGGER.length).trim();
    if (!messageText) {
        await msg.reply('Escribe tu consulta despues de #soporte\nEjemplo: #soporte Horario de la alberca');
        return;
    }

    console.log(`  [IN]  ${phone}: ${messageText.substring(0, 60)}`);

    // Check if resident exists in DB before processing
    try {
        const lookupResp = await axios.get(
            `${API_URL}/api/residents/lookup/${encodeURIComponent(phone)}`,
            { timeout: 10000 }
        );

        if (!lookupResp.data?.found) {
            console.log(`  [SKIP] ${phone}: not a registered resident`);
            // Don't respond — silently ignore non-residents
            return;
        }

        console.log(`  [OK] Resident: ${lookupResp.data.resident.full_name} (${lookupResp.data.resident.unit_number})`);

        // Process through MultiAgente API
        const resp = await axios.post(`${API_URL}/api/residents/chat`, {
            message: messageText,
            phone: phone,
        }, { timeout: 30000 });

        const result = resp.data;
        const responseText = result.text || 'No pude procesar tu mensaje.';

        console.log(`  [OUT] ${result.agent || '?'}: ${responseText.substring(0, 60)}`);
        await msg.reply(responseText);

    } catch (err) {
        console.error('  API error:', err.message);
        // Only respond if it was a processing error, not a lookup error
        if (err.response?.status !== 404) {
            await msg.reply('Hubo un error. Intenta de nuevo.');
        }
    }
});

async function transcribeAudio(audioBuffer) {
    try {
        const form = new FormData();
        form.append('file', audioBuffer, { filename: 'audio.ogg', contentType: 'audio/ogg' });
        form.append('model', 'whisper-large-v3-turbo');
        form.append('language', 'es');
        form.append('response_format', 'text');

        const resp = await axios.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, ...form.getHeaders() },
            timeout: 15000,
        });
        return resp.data?.trim() || '';
    } catch (err) {
        console.error('  Whisper error:', err.message);
        return '';
    }
}

console.log('  Initializing...\n');
client.initialize();
