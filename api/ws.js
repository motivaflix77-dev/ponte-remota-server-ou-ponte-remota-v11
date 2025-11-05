// server.js (Versão Final para Teste Local)

const WebSocket = require('ws');
const http = require('http' );

// Mapa para rastrear as conexões ativas
// Chave: tagId (do cartão)
// Valor: { emulator: WebSocket, reader: WebSocket }
const activeConnections = new Map();

// -------------------------------------------------------------------
// 1. FUNÇÕES DE RASTREAMENTO E ROTEAMENTO
// -------------------------------------------------------------------

function addConnection(tagId, ws, type) {
    if (!activeConnections.has(tagId)) {
        activeConnections.set(tagId, { emulator: null, reader: null });
    }
    const connection = activeConnections.get(tagId);
    connection[type] = ws;
    ws.tagId = tagId;
    ws.type = type;

    console.log(`[SERVER] Conexão ${type} registrada para Tag ID: ${tagId}`);

    if (connection.emulator && connection.reader) {
        console.log(`[SERVER] Par completo! Sinalizando Emulador: ${tagId}`);
        connection.emulator.send(`TAG_ID:${tagId}`);
    }
}

function removeConnection(ws) {
    const { tagId, type } = ws;
    if (tagId && activeConnections.has(tagId)) {
        const connection = activeConnections.get(tagId);
        if (connection[type] === ws) {
            connection[type] = null;
            console.log(`[SERVER] Conexão ${type} removida para Tag ID: ${tagId}`);
        }
        if (!connection.emulator && !connection.reader) {
            activeConnections.delete(tagId);
            console.log(`[SERVER] Entrada de Tag ID ${tagId} limpa.`);
        }
    }
}

function routeApduCommand(message, sender) {
    const { tagId } = sender;
    const connection = activeConnections.get(tagId);

    if (connection && connection.reader) {
        connection.reader.send(message);
        console.log(`[SERVER] Roteado APDU COMMAND para Leitor: ${tagId}`);
    } else {
        console.error(`[SERVER] Erro: Leitor não encontrado para Tag ID: ${tagId}`);
    }
}

function routeApduResponse(message, sender) {
    const { tagId } = sender;
    const connection = activeConnections.get(tagId);

    if (connection && connection.emulator) {
        connection.emulator.send(message);
        console.log(`[SERVER] Roteado APDU RESPONSE para Emulador: ${tagId}`);
    } else {
        console.error(`[SERVER] Erro: Emulador não encontrado para Tag ID: ${tagId}`);
    }
}

// -------------------------------------------------------------------
// 2. CONFIGURAÇÃO DO SERVIDOR HTTP E WEBSOCKET
// -------------------------------------------------------------------

const server = http.createServer((req, res ) => {
    // Lógica de notificação de transação concluída (se necessário)
    if (req.url === '/api/tag/emulated' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Notificação recebida' }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
    console.log('[SERVER] Novo cliente conectado.');

    ws.on('message', (message) => {
        const msg = message.toString();
        console.log(`[SERVER] Mensagem recebida: ${msg}`);

        // 1. Lógica de Registro
        if (msg.startsWith('REGISTER_EMULATOR:')) {
            const tagId = msg.substring('REGISTER_EMULATOR:'.length);
            addConnection(tagId, ws, 'emulator');
        } else if (msg.startsWith('REGISTER_READER:')) {
            const tagId = msg.substring('REGISTER_READER:'.length);
            addConnection(tagId, ws, 'reader');
        } 
        
        // 2. Lógica de Roteamento APDU
        else if (msg.startsWith('APDU_COMMAND:')) {
            routeApduCommand(msg, ws);
        } 
        
        // 3. Lógica de Roteamento Resposta APDU
        else if (msg.startsWith('APDU_RESPONSE:')) {
            routeApduResponse(msg, ws);
        }
    });

    ws.on('close', () => {
        removeConnection(ws);
        console.log('[SERVER] Cliente desconectado.');
    });

    ws.on('error', (error) => {
        console.error('[SERVER] Erro no WebSocket:', error);
    });
});

// -------------------------------------------------------------------
// 3. INÍCIO DO SERVIDOR (PARA TESTE LOCAL)
// -------------------------------------------------------------------

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// Remova a linha "module.exports = server;" para este teste local
