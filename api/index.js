{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // api/index.js\
\
const express = require('express');\
const bodyParser = require('body-parser');\
const app = express();\
\
// Vari\'e1veis globais para armazenar o estado da comunica\'e7\'e3o\
// ATEN\'c7\'c3O: No Vercel, vari\'e1veis globais n\'e3o persistem entre requisi\'e7\'f5es.\
// Para um ambiente de produ\'e7\'e3o, voc\'ea DEVE usar um banco de dados (ex: Redis, MongoDB Atlas).\
// Para fins de teste e demonstra\'e7\'e3o, vamos manter o estado global.\
let tagId = null;\
let tagPayload = null;\
let status = "AGUARDANDO LEITURA";\
\
// Configura\'e7\'e3o do body-parser para lidar com JSON\
app.use(bodyParser.json());\
\
// ====================================================================\
// ROTAS DE COMUNICA\'c7\'c3O COM OS APLICATIVOS ANDROID\
// ====================================================================\
\
// Endpoint para o Leitor enviar o ID da tag (POST /api/tag/read)\
app.post('/api/tag/read', (req, res) => \{\
    // O Leitor envia \{ tagId: "..." \}\
    const \{ tagId: newTagId \} = req.body;\
    \
    if (newTagId) \{\
        tagId = newTagId;\
        \
        // Simula\'e7\'e3o de autentica\'e7\'e3o e payload\
        if (tagId === 'f2222222222222') \{ // Exemplo de Tag ID v\'e1lido\
            tagPayload = '1122334455667788'; // Payload simulado\
        \} else \{\
            tagPayload = 'NENHUM_PAYLOAD';\
        \}\
        \
        status = "TAG LIDA, AGUARDANDO EMULA\'c7\'c3O";\
        console.log(`[POST /api/tag/read] Tag ID: $\{tagId\}, Payload: $\{tagPayload\}`);\
        \
        res.status(200).json(\{ message: "Tag ID recebido com sucesso." \});\
    \} else \{\
        res.status(400).json(\{ message: "ID da tag n\'e3o fornecido." \});\
    \}\
\});\
\
// Endpoint para o Emulador verificar o status (GET /api/tag/status)\
app.get('/api/tag/status', (req, res) => \{\
    // CORRE\'c7\'c3O CRUCIAL: Alinhar com a classe TagStatusResponse do Android\
    // O Android espera \{ success: Boolean, tagId: String?, payload: String? \}\
    \
    const isTagPending = tagId !== null;\
    \
    res.status(200).json(\{\
        success: isTagPending, // Retorna 'true' se houver tag, 'false' se n\'e3o\
        tagId: tagId,\
        payload: tagPayload\
    \});\
\});\
\
// Endpoint para o Emulador notificar o fim da emula\'e7\'e3o (POST /api/tag/emulated/:tagId)\
app.post('/api/tag/emulated/:tagId', (req, res) => \{\
    // O Emulador envia a tagId no path, mas o corpo n\'e3o \'e9 usado aqui\
    tagId = null;\
    tagPayload = null;\
    status = "AGUARDANDO LEITURA";\
    res.status(200).json(\{ message: "Emula\'e7\'e3o finalizada. Servidor resetado." \});\
\});\
\
// ====================================================================\
// ROTAS DE TESTE E DASHBOARD (Opcional, para testar no navegador)\
// ====================================================================\
\
// Endpoint de teste de conex\'e3o e dashboard\
app.get('/', (req, res) => \{\
    res.status(200).send("Servidor Ponte Remota V10 est\'e1 online e funcionando.");\
\});\
\
// Exporta o aplicativo Express para o Vercel\
module.exports = app;\
}