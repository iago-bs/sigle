import { ArrowLeft, Search, Plus, Pencil, Trash2, Phone, Mail, MapPin, Archive } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { useClients, type Client } from "../hooks/useClients";
import { AddClientModal } from "./clientes/AddClientModal";
import { EditClientModal } from "./clientes/EditClientModal";
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

interface ClientsPageProps {
  onBack: () => void;
  onViewInactive: () => void;
}

export function ClientsPage({ onBack, onViewInactive }: ClientsPageProps) {
  const { clients, loading, deleteClient, fetchClients } = useClients();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Filter clients based on search (only active clients)
  const activeClients = clients.filter((client) => client.is_active);
  const filteredClients = activeClients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.phone.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.cpf?.toLowerCase().includes(query)
    );
  });

  // Count inactive clients
  const inactiveCount = clients.filter((client) => !client.is_active).length;

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!deletingClient) return;

    try {
      const result = await deleteClient(deletingClient.id);
      if (result.action === 'inactivated') {
        toast.info(result.message);
      } else {
        toast.success(result.message);
      }
      setDeletingClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao deletar cliente");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-[#f5f0e8] h-screen flex items-center justify-center">
        <p className="text-lg">Carregando clientes...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#f5f0e8] h-screen overflow-hidden flex flex-col">
      {/* Sticky Header with Back Button and Title */}
      <div className="sticky top-0 bg-[#f5f0e8] z-20 pb-4 pt-6 px-8">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 
            style={{
              fontFamily: 'Lexend Deca, sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            GERENCIAMENTO DE CLIENTES
          </h1>
        </div>

        {/* Sticky Search Bar - Centered */}
        <div className="max-w-[500px] mx-auto">
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
            <input
              type="text"
              placeholder="Pesquisar por nome, telefone, e-mail ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-[#8b7355] transition-colors shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3">
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#8b7355] hover:bg-[#7a6345] text-white rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
            <Button 
              onClick={onViewInactive}
              className="bg-gray-600 hover:bg-gray-700 text-white rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Archive className="w-4 h-4" />
              Inativados {inactiveCount > 0 && `(${inactiveCount})`}
            </Button>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto">
        {filteredClients.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg">Nenhum cliente encontrado</p>
            <p className="text-sm mt-2">
              {searchQuery ? "Tente outra pesquisa" : "Cadastre seu primeiro cliente"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="bg-white border border-gray-300 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow"
              >
                {/* Client Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {client.name}
                    </h3>
                    {client.cpf && (
                      <p className="text-sm text-gray-600">CPF: {client.cpf}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(client)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Editar cliente"
                    >
                      <Pencil className="w-4 h-4 text-[#8b7355]" />
                    </button>
                    <button
                      onClick={() => setDeletingClient(client)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      title="Inativar cliente"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Client Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{client.phone}</span>
                  </div>
                  
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{client.email}</span>
                    </div>
                  )}
                  
                  {client.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-700">{client.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddClientModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSuccess={() => {
          // Recarrega a lista do hook desta página após criar
          fetchClients(false);
        }}
      />

      <EditClientModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        client={editingClient}
        onSuccess={() => {
          // Recarrega a lista após editar
          fetchClients(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingClient}
        onOpenChange={(open) => !open && setDeletingClient(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente{" "}
              <strong>{deletingClient?.name}</strong>?
              {" "}Se o cliente possuir ordens de serviço associadas, ele será apenas inativado.
              Caso contrário, será excluído permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
