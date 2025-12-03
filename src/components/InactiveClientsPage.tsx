// Page for viewing and managing inactive (soft-deleted) clients

import { useEffect, useState } from "react";
import { ArrowLeft, Search, RotateCcw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { useClients, type Client } from "../hooks/useClients";

interface InactiveClientsPageProps {
  onBack: () => void;
}

export function InactiveClientsPage({ onBack }: InactiveClientsPageProps) {
  const { clients, loading, reactivateClient, deleteClient, fetchClients } = useClients({ autoFetch: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [clientToRestore, setClientToRestore] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Garantir que carregamos também os inativos ao entrar na página
  useEffect(() => {
    fetchClients(true);
  }, [fetchClients]);

  // Filter inactive clients
  const inactiveClients = clients.filter((client) => !client.is_active);

  // Apply search filter
  const filteredClients = inactiveClients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.cpf?.toLowerCase().includes(query) ||
      client.name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    );
  });

  const handleRestore = async () => {
    if (!clientToRestore) return;

    try {
      await reactivateClient(clientToRestore.id);
      toast.success(`Cliente "${clientToRestore.name}" reativado com sucesso!`);
      setClientToRestore(null);
      // Recarregar a lista incluindo inativos para refletir mudanças
      fetchClients(true);
    } catch (error) {
      console.error('Error reactivating client:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao reativar cliente");
    }
  };

  const handlePermanentDelete = async () => {
    if (!clientToDelete) return;

    try {
      const result = await deleteClient(clientToDelete.id);
      toast.success(result.message);
      setClientToDelete(null);
      // Recarregar para atualizar a lista
      fetchClients(true);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao deletar cliente");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f1e8]">
        <p className="text-lg">Carregando clientes inativos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f1e8] p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6345] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl">Clientes Inativados</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por CPF, nome, telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#8b7355] bg-white"
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded">
        <p className="text-sm text-amber-800">
          <strong>Clientes Inativados:</strong> Estes clientes foram removidos mas
          ainda podem ser restaurados. Use "Reativar" para retornar o cliente à
          lista ativa ou "Excluir Permanentemente" para removê-lo definitivamente.
        </p>
      </div>

      {/* Clients Table */}
      <div className="flex-1 overflow-auto">
        {filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p className="text-lg">
              {inactiveClients.length === 0
                ? "Nenhum cliente inativado"
                : "Nenhum cliente encontrado"}
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Telefone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">CPF</th>
                <th className="px-4 py-3 text-left">Data Inativação</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3">{client.phone}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.email || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.cpf || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.updated_at
                      ? new Date(client.updated_at).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setClientToRestore(client)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        title="Reativar cliente"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span className="text-sm">Reativar</span>
                      </button>
                      <button
                        onClick={() => setClientToDelete(client)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        title="Excluir permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog
        open={!!clientToRestore}
        onOpenChange={(open) => !open && setClientToRestore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reativar Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja reativar o cliente{" "}
              <strong>{clientToRestore?.name}</strong>? Este cliente voltará a
              aparecer na lista de clientes ativos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              className="bg-green-600 hover:bg-green-700"
            >
              Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog
        open={!!clientToDelete}
        onOpenChange={(open) => !open && setClientToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Permanentemente</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-red-600">ATENÇÃO:</strong> Esta ação é
              irreversível! Tem certeza que deseja excluir permanentemente o
              cliente <strong>{clientToDelete?.name}</strong>? Todos os dados
              serão perdidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
