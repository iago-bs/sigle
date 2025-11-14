// Email service module using Resend
// Handles all email sending functionality

interface SendInvoiceEmailParams {
  to: string;
  clientName: string;
  osNumber: string;
  deliveryDate?: string;
  totalValue: number;
  paymentMethod?: string;
  warrantyEndDate?: string;
  parts?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface SendBudgetEmailParams {
  to: string;
  clientName: string;
  osNumber: string;
  totalValue: number;
  parts?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  observations?: string;
}

interface SendServiceOrderCreatedEmailParams {
  to: string;
  clientName: string;
  osNumber: string;
  equipmentType: string;
  equipmentBrand?: string;
  equipmentModel?: string;
  defect: string;
  technicianName?: string;
  estimatedDeliveryDate?: string;
}

export async function sendInvoiceEmail(resendApiKey: string, params: SendInvoiceEmailParams) {
  const {
    to,
    clientName,
    osNumber,
    deliveryDate,
    totalValue,
    paymentMethod,
    warrantyEndDate,
    parts,
  } = params;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nota Fiscal - Eletrodel Eletronica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #8b7355 0%, #6b5745 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .info-section {
      background: #f9f9f9;
      border-left: 4px solid #8b7355;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .parts-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .parts-table th {
      background: #8b7355;
      color: white;
      padding: 10px;
      text-align: left;
    }
    .parts-table td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .total-section {
      background: #e8f5e9;
      border: 2px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .total-label {
      font-size: 14px;
      color: #555;
      margin-bottom: 5px;
    }
    .total-value {
      font-size: 28px;
      font-weight: bold;
      color: #2e7d32;
    }
    .warranty-section {
      background: #fff3e0;
      border: 2px solid #ff9800;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warranty-section h3 {
      color: #e65100;
      margin-bottom: 10px;
      font-size: 18px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Eletrodel Eletronica</h1>
      <p>SIGLE Systems - Vitória da Conquista, BA</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Prezado(a) <strong>${clientName}</strong>,</p>
      <p>Segue a nota fiscal referente ao serviço realizado em seu equipamento.</p>

      <!-- Informações da O.S -->
      <div class="info-section">
        <h3 style="margin-bottom: 10px; color: #8b7355;">📋 Dados da Ordem de Serviço</h3>
        <div class="info-row">
          <span class="info-label">Número da O.S:</span>
          <span class="info-value">#${osNumber}</span>
        </div>
        ${deliveryDate ? `
        <div class="info-row">
          <span class="info-label">Data de Entrega:</span>
          <span class="info-value">${deliveryDate}</span>
        </div>
        ` : ''}
        ${paymentMethod ? `
        <div class="info-row">
          <span class="info-label">Forma de Pagamento:</span>
          <span class="info-value">${paymentMethod.toUpperCase()}</span>
        </div>
        ` : ''}
      </div>

      ${parts && parts.length > 0 ? `
      <!-- Peças Utilizadas -->
      <h3 style="margin: 20px 0 10px; color: #8b7355;">🔧 Peças e Serviços</h3>
      <table class="parts-table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Qtd</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parts.map((part) => `
            <tr>
              <td>${part.name}</td>
              <td>${part.quantity}</td>
              <td>R$ ${part.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Valor Total -->
      <div class="total-section">
        <p class="total-label">Valor Total do Serviço</p>
        <p class="total-value">R$ ${totalValue.toFixed(2)}</p>
      </div>

      <!-- Garantia -->
      <div class="warranty-section">
        <h3>🛡️ Garantia de 3 Meses</h3>
        <p>Este serviço possui <strong>garantia de 3 meses</strong> a partir da data de entrega.</p>
        ${warrantyEndDate ? `<p>Válida até: <strong>${warrantyEndDate}</strong></p>` : ''}
        <p style="margin-top: 10px; font-size: 11px; color: #666;">
          A garantia cobre defeitos relacionados ao serviço realizado. 
          Não cobre danos causados por mau uso, quedas ou oxidação.
        </p>
      </div>

      <p style="margin-top: 20px; text-align: center;">
        Obrigado pela confiança em nossos serviços!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eletrodel Eletronica</strong></p>
      <p>Vitória da Conquista, BA</p>
      <p>Sistema SIGLE</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este é um email automático. Por favor, não responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Eletrodel Eletronica <onboarding@resend.dev>',
      to: [to],
      subject: `Nota Fiscal - O.S #${osNumber} - Eletrodel Eletronica`,
      html: htmlContent,
    }),
  });

  return await response.json();
}

export async function sendBudgetEmail(resendApiKey: string, params: SendBudgetEmailParams) {
  const {
    to,
    clientName,
    osNumber,
    totalValue,
    parts,
    observations,
  } = params;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Orçamento - Eletrodel Eletronica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .parts-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .parts-table th {
      background: #667eea;
      color: white;
      padding: 12px;
      text-align: left;
    }
    .parts-table td {
      padding: 12px;
      border-bottom: 1px solid #e0e0e0;
    }
    .parts-table tr:hover {
      background: #f9f9f9;
    }
    .total-section {
      background: #e3f2fd;
      border: 2px solid #2196f3;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
      text-align: center;
    }
    .total-label {
      font-size: 16px;
      color: #555;
      margin-bottom: 8px;
    }
    .total-value {
      font-size: 32px;
      font-weight: bold;
      color: #1976d2;
    }
    .info-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>Eletrodel Eletronica</h1>
      <p>SIGLE Systems - Vitória da Conquista, BA</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá <strong>${clientName}</strong>,</p>
      <p>Segue o orçamento para o conserto do seu equipamento referente à O.S <strong>#${osNumber}</strong>.</p>

      ${parts && parts.length > 0 ? `
      <!-- Peças e Serviços -->
      <h3 style="margin: 25px 0 15px; color: #667eea;">💰 Detalhamento do Orçamento</h3>
      <table class="parts-table">
        <thead>
          <tr>
            <th>Peça/Serviço</th>
            <th style="text-align: center;">Qtd</th>
            <th style="text-align: right;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${parts.map((part) => `
            <tr>
              <td>${part.name}</td>
              <td style="text-align: center;">${part.quantity}</td>
              <td style="text-align: right;">R$ ${part.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      ` : ''}

      <!-- Valor Total -->
      <div class="total-section">
        <p class="total-label">Valor Total do Orçamento</p>
        <p class="total-value">R$ ${totalValue.toFixed(2)}</p>
      </div>

      ${observations ? `
      <!-- Observações -->
      <div class="info-box">
        <h4 style="color: #856404; margin-bottom: 10px;">📝 Observações</h4>
        <p style="color: #856404; margin: 0;">${observations}</p>
      </div>
      ` : ''}

      <div class="info-box">
        <h4 style="color: #856404; margin-bottom: 10px;">⚠️ Importante</h4>
        <ul style="margin: 0; padding-left: 20px; color: #856404;">
          <li>Este orçamento tem validade de 7 dias</li>
          <li>Entre em contato para aprovar o orçamento</li>
          <li>O serviço inclui garantia de 3 meses</li>
        </ul>
      </div>

      <p style="margin-top: 25px; text-align: center;">
        Para aprovação ou dúvidas, entre em contato conosco.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eletrodel Eletronica</strong></p>
      <p>Vitória da Conquista, BA</p>
      <p>Sistema SIGLE</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este é um email automático. Por favor, não responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Eletrodel Eletronica <onboarding@resend.dev>',
      to: [to],
      subject: `Orçamento #${osNumber} - Eletrodel Eletronica`,
      html: htmlContent,
    }),
  });

  return await response.json();
}

export async function sendServiceOrderCreatedEmail(
  resendApiKey: string,
  params: SendServiceOrderCreatedEmailParams
) {
  const {
    to,
    clientName,
    osNumber,
    equipmentType,
    equipmentBrand,
    equipmentModel,
    defect,
    technicianName,
    estimatedDeliveryDate,
  } = params;

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ordem de Serviço Criada - Eletrodel Eletronica</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Arial, sans-serif; 
      line-height: 1.6; 
      background-color: #f4f4f4;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .info-section {
      background: #f9f9f9;
      border-left: 4px solid #4caf50;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #555;
    }
    .info-value {
      color: #333;
    }
    .success-badge {
      background: #e8f5e9;
      color: #2e7d32;
      padding: 10px 20px;
      border-radius: 20px;
      display: inline-block;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✅ Ordem de Serviço Criada</h1>
      <p>Eletrodel Eletronica - SIGLE Systems</p>
    </div>

    <!-- Content -->
    <div class="content">
      <p class="greeting">Olá <strong>${clientName}</strong>,</p>
      <p>Seu equipamento foi recebido e uma ordem de serviço foi criada com sucesso!</p>

      <div style="text-align: center;">
        <span class="success-badge">O.S #${osNumber}</span>
      </div>

      <!-- Informações do Equipamento -->
      <div class="info-section">
        <h3 style="margin-bottom: 10px; color: #4caf50;">📱 Dados do Equipamento</h3>
        <div class="info-row">
          <span class="info-label">Tipo:</span>
          <span class="info-value">${equipmentType}</span>
        </div>
        ${equipmentBrand ? `
        <div class="info-row">
          <span class="info-label">Marca:</span>
          <span class="info-value">${equipmentBrand}</span>
        </div>
        ` : ''}
        ${equipmentModel ? `
        <div class="info-row">
          <span class="info-label">Modelo:</span>
          <span class="info-value">${equipmentModel}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Defeito Relatado:</span>
          <span class="info-value">${defect}</span>
        </div>
        ${technicianName ? `
        <div class="info-row">
          <span class="info-label">Técnico Responsável:</span>
          <span class="info-value">${technicianName}</span>
        </div>
        ` : ''}
        ${estimatedDeliveryDate ? `
        <div class="info-row">
          <span class="info-label">Previsão de Entrega:</span>
          <span class="info-value">${estimatedDeliveryDate}</span>
        </div>
        ` : ''}
      </div>

      <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <h4 style="color: #1565c0; margin-bottom: 10px;">📋 Próximos Passos</h4>
        <ul style="margin: 0; padding-left: 20px; color: #1565c0;">
          <li>Nossos técnicos irão avaliar seu equipamento</li>
          <li>Em breve entraremos em contato com o orçamento</li>
          <li>Mantenha este número de O.S para consultas</li>
        </ul>
      </div>

      <p style="margin-top: 25px; text-align: center;">
        Qualquer dúvida, entre em contato conosco!
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Eletrodel Eletronica</strong></p>
      <p>Vitória da Conquista, BA</p>
      <p>Sistema SIGLE</p>
      <p style="margin-top: 10px; font-size: 10px;">
        Este é um email automático. Por favor, não responda.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Eletrodel Eletronica <onboarding@resend.dev>',
      to: [to],
      subject: `O.S #${osNumber} criada - Eletrodel Eletronica`,
      html: htmlContent,
    }),
  });

  return await response.json();
}
