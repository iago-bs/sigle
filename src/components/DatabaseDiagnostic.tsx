/**
 * Componente de Diagnóstico do Banco de Dados
 * Use este componente para testar se as colunas city e state existem
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DatabaseDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/diagnostic`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();
      console.log('Diagnostic result:', data);
      setResult(data);
    } catch (error) {
      console.error('Diagnostic error:', error);
      setResult({
        error: 'Erro ao conectar com o servidor',
        message: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-xl mb-4 font-semibold">🔍 Diagnóstico do Banco de Dados</h2>
      
      <p className="text-sm text-gray-600 mb-4">
        Este teste verifica a conexão com o Supabase e se a tabela{' '}
        <code className="bg-gray-100 px-1 rounded">equipments_manual</code> existe.
      </p>

      <Button 
        onClick={runTest} 
        disabled={testing}
        className="w-full mb-4"
      >
        {testing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testando...
          </>
        ) : (
          'Executar Teste'
        )}
      </Button>

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.status === 'ok'
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          {result.status === 'ok' ? (
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-2">✅ Conexão OK!</h3>
                <p className="text-sm text-green-800 mb-2">
                  Tabela exists: {result.table_exists ? 'Sim ✅' : 'Não ❌'}
                </p>
                {result.table_exists && (
                  <p className="text-xs text-green-700">
                    A tabela equipments_manual existe e está acessível.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">❌ Erro Detectado</h3>
                <p className="text-sm text-red-800 mb-2">
                  {result.error_message || result.error || 'Erro desconhecido'}
                </p>
                
                {result.error_code && (
                  <p className="text-xs text-red-700 mb-2">
                    Código do erro: <code className="bg-white px-1 rounded">{result.error_code}</code>
                  </p>
                )}

                {result.table_exists === false && (
                  <div className="mt-3 p-3 bg-white rounded border border-red-200">
                    <p className="text-sm font-semibold text-red-900 mb-2">🔧 Execute este SQL no Supabase:</p>
                    <code className="block text-xs bg-gray-900 text-white p-3 rounded overflow-x-auto whitespace-pre">
{`CREATE TABLE IF NOT EXISTS equipments_manual (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_token TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  device TEXT NOT NULL,
  serial_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipments_manual_shop_token 
ON equipments_manual(shop_token);

ALTER TABLE equipments_manual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for service role" 
ON equipments_manual FOR ALL USING (true);`}
                    </code>
                    <p className="text-xs text-red-700 mt-2">
                      Depois de executar o SQL, <strong>recarregue a página</strong> (Ctrl+Shift+R)
                    </p>
                  </div>
                )}

                <details className="mt-3">
                  <summary className="text-xs text-red-700 cursor-pointer hover:text-red-900">
                    Ver detalhes técnicos
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-white rounded border border-red-200 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 mb-2">
          💡 <strong>Dica:</strong> Se o teste falhar, abra o Supabase Dashboard → SQL Editor e execute o SQL mostrado acima.
        </p>
        <p className="text-xs text-blue-700">
          📄 Ou consulte o arquivo <code className="bg-blue-100 px-1 rounded">EQUIPMENTS_TABLE_SETUP.md</code> para instruções completas.
        </p>
      </div>
    </Card>
  );
}
