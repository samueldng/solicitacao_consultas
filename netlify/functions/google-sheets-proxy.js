const https = require('https');

exports.handler = async (event, context) => {
  // Configurar CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Apenas aceitar POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // URL do seu Google Apps Script
    const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbzhHinTFNnipt9yzXmmheV7iLLg7v3CcZ3kc4CvingxxUxJgIZHfr2LkvmL4FhpNWZn/exec';
    
    // Dados recebidos do frontend
    const formData = JSON.parse(event.body);
    
    // Fazer a requisição para o Google Apps Script
    const response = await makeRequest(googleScriptUrl, formData);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Solicitação enviada com sucesso!',
        data: response
      })
    };
    
  } catch (error) {
    console.error('Erro no proxy:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      })
    };
  }
};

// Função auxiliar para fazer requisições HTTPS
function makeRequest(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (e) {
          // Se não conseguir fazer parse, retorna o texto bruto
          resolve({ rawResponse: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}
