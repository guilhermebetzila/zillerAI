require('dotenv').config();
const axios = require('axios');

const API_KEY = process.env.API_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

// Endpoint de teste de saldo Binance Pay
const url = 'https://bpay.binanceapi.com/binancepay/openapi/v2/transfer/query'; // Exemplo de endpoint, depende da ação que quer testar

async function verificarSaldo() {
    try {
        const response = await axios.get(url, {
            headers: {
                'BinancePay-Timestamp': Date.now(),
                'BinancePay-Nonce': Math.random().toString(36).substring(2),
                'BinancePay-Certificate-SN': API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log('Resposta da API:', response.data);
    } catch (error) {
        console.error('Erro ao acessar a API:', error.response ? error.response.data : error.message);
    }
}

verificarSaldo();
