import { useState, useEffect } from "react";
import { Users, Plus, Mail, Calendar, Shield, User } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { AddTechnicianModal } from "./AddTechnicianModal";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";

interface TechnicianData {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

interface TechniciansPageProps {
  onBack: () => void;
}

export function TechniciansPage({ onBack }: TechniciansPageProps) {
  const { user } = useAuth(); // Get current logged in user
  const [technicians, setTechnicians] = useState<TechnicianData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      
      // Get project info
      const { projectId, publicAnonKey } = await import("../utils/supabase/info");
      
      // Call server endpoint to list technicians
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9bef0ec0/technicians`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        console.error("Error loading technicians:", result.error);
        toast.error("Erro ao carregar técnicos");
        return;
      }

      setTechnicians(result.technicians || []);
    } catch (error) {
      console.error("Error loading technicians:", error);
      toast.error("Erro ao carregar técnicos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const handleTechnicianAdded = () => {
    loadTechnicians();
    setIsAddModalOpen(false);
    toast.success("Técnico adicionado com sucesso!");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          ← Voltar
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-4xl mb-2"
              style={{
                fontFamily: 'Lexend Deca, sans-serif',
                fontWeight: 800,
                color: '#181717'
              }}
            >
              Gerenciamento de Técnicos
            </h1>
            <p className="text-gray-600">
              {technicians.length > 1 
                ? `${technicians.length} pessoas têm acesso ao sistema`
                : 'Gerencie os técnicos que têm acesso ao sistema'
              }
            </p>
          </div>
          
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#8b7355] hover:bg-[#6d5a43]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Técnico
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total de Técnicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#8b7355]" />
              <span 
                className="text-3xl"
                style={{
                  fontFamily: 'Lexend Deca, sans-serif',
                  fontWeight: 800,
                  color: '#181717'
                }}
              >
                {technicians.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Ativos Hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span 
                className="text-3xl"
                style={{
                  fontFamily: 'Lexend Deca, sans-serif',
                  fontWeight: 800,
                  color: '#181717'
                }}
              >
                {technicians.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cadastrados Este Mês</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span 
                className="text-3xl"
                style={{
                  fontFamily: 'Lexend Deca, sans-serif',
                  fontWeight: 800,
                  color: '#181717'
                }}
              >
                {technicians.filter(t => {
                  const created = new Date(t.created_at);
                  const now = new Date();
                  return created.getMonth() === now.getMonth() && 
                         created.getFullYear() === now.getFullYear();
                }).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technicians List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Carregando técnicos...
        </div>
      ) : technicians.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2">Nenhum técnico cadastrado</p>
              <p className="text-sm">Clique em "Adicionar Técnico" para começar</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map((technician) => {
            const isCurrentUser = user?.id === technician.id;
            return (
              <Card 
                key={technician.id} 
                className={`hover:shadow-lg transition-shadow ${
                  isCurrentUser ? 'ring-2 ring-[#8b7355] bg-[#f5f0e8]' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">
                          {technician.name}
                        </CardTitle>
                        {isCurrentUser && (
                          <Badge className="bg-[#8b7355] hover:bg-[#6d5a43] text-white">
                            <User className="w-3 h-3 mr-1" />
                            Você
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {technician.email}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Cadastrado em {formatDate(technician.created_at)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Technician Modal */}
      <AddTechnicianModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onTechnicianAdded={handleTechnicianAdded}
      />
    </div>
  );
}
