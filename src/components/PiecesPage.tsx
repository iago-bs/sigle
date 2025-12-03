import { ArrowLeft, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import type { Piece } from "../types";
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

interface PiecesPageProps {
  onBack: () => void;
  pieces: Piece[];
  onAddPiece: () => void;
  onEditPiece: (piece: Piece) => void;
  onDeletePiece: (pieceId: string) => Promise<void>;
  onReactivatePiece: (pieceId: string) => Promise<void>;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PiecesPage({ 
  onBack, 
  pieces, 
  onAddPiece, 
  onEditPiece, 
  onDeletePiece,
  onReactivatePiece 
}: PiecesPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [pieceToDelete, setPieceToDelete] = useState<Piece | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  // Separate pieces by active status
  const activePieces = pieces.filter(p => p.active !== false);
  const inactivePieces = pieces.filter(p => p.active === false);

  // Get current tab pieces
  const currentTabPieces = activeTab === 'active' ? activePieces : inactivePieces;

  // Filter pieces based on search
  const filteredPieces = currentTabPieces.filter((piece) => {
    const query = searchQuery.toLowerCase();
    return (
      piece.name.toLowerCase().includes(query) ||
      piece.partType.toLowerCase().includes(query) ||
      piece.serialNumber?.toLowerCase().includes(query)
    );
  });

  // Delete piece handler
  const handleDeletePiece = async () => {
    if (!pieceToDelete?.id) return;

    try {
      await onDeletePiece(pieceToDelete.id);
      setPieceToDelete(null);
      setSelectedPiece(null);
      // Mensagem já é exibida no App.tsx
    } catch (error) {
      console.error('Erro ao excluir peça:', error);
      toast.error(error instanceof Error ? error.message : "Erro ao excluir peça");
    }
  };

  // Update selectedPiece when pieces change (after edit)
  useEffect(() => {
    if (selectedPiece) {
      const updated = pieces.find(p => p.id === selectedPiece.id);
      if (updated) {
        setSelectedPiece(updated);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setSelectedPiece(null);
                onBack();
              }}
              variant="ghost"
              size="sm"
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-[#181717] font-['Lexend_Deca']">Peças Cadastradas</h1>
              <p className="text-sm text-gray-600">
                {pieces.length} peça{pieces.length !== 1 ? "s" : ""} cadastrada{pieces.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          
          {/* Add Piece Button */}
          <Button
            onClick={onAddPiece}
            className="bg-[#8b7355] hover:bg-[#7a6345] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastrar Peça
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => {
              setActiveTab('active');
              setSelectedPiece(null);
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-[#8b7355] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ativos ({activePieces.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('inactive');
              setSelectedPiece(null);
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'inactive'
                ? 'bg-[#8b7355] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Inativos ({inactivePieces.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, tipo ou número de série..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#f5f0e8]"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedPiece ? (
          // Detail View
          <div className="p-6">
            <Button
              onClick={() => setSelectedPiece(null)}
              variant="ghost"
              size="sm"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para lista
            </Button>

            {/* Piece Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-['Lexend_Deca'] text-[#181717] mb-2">
                    {selectedPiece.name}
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Tipo:</span>
                      <Badge variant="outline">{selectedPiece.partType}</Badge>
                    </div>
                    {selectedPiece.serialNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Número de Série:</span>
                        <span className="text-sm text-gray-600">{selectedPiece.serialNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Cadastrado em:</span>
                      <span className="text-sm text-gray-600">{formatDate(selectedPiece.createdAt)}</span>
                    </div>
                    {selectedPiece.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-700">Observações:</span>
                        <p className="text-sm text-gray-600 mt-1">{selectedPiece.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedPiece.active !== false ? (
                    <>
                      <button
                        onClick={() => onEditPiece(selectedPiece)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#8b7355] text-white hover:bg-[#7a6345] rounded-md transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => setPieceToDelete(selectedPiece)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Excluir
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={async () => {
                        if (selectedPiece.id) {
                          await onReactivatePiece(selectedPiece.id);
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md transition-colors"
                    >
                      Reativar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // List View
          <div className="p-6">
            {filteredPieces.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-gray-500 mb-2">
                  {searchQuery ? "Nenhuma peça encontrada" : "Nenhuma peça cadastrada"}
                </h3>
                <p className="text-sm text-gray-400">
                  {searchQuery
                    ? "Tente ajustar sua busca"
                    : "Clique em 'Cadastrar Peça' para adicionar uma nova peça"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPieces.map((piece) => (
                  <div
                    key={piece.id}
                    onClick={() => setSelectedPiece(piece)}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-[#8b7355] transition-all text-left cursor-pointer"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-['Lexend_Deca'] font-medium text-lg text-gray-900 mb-1">
                          {piece.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {piece.partType}
                          </Badge>
                          {piece.active === false && (
                            <Badge variant="secondary" className="text-xs bg-gray-500 text-white">
                              Inativo
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Serial Number */}
                    {piece.serialNumber && (
                      <div className="mb-2">
                        <div className="text-xs text-gray-500">Número de Série:</div>
                        <div className="text-sm text-gray-700 font-mono">{piece.serialNumber}</div>
                      </div>
                    )}

                    {/* Date */}
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                      Cadastrado em {formatDate(piece.createdAt)}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3">
                      {piece.active !== false ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditPiece(piece);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-[#8b7355] text-white hover:bg-[#7a6345] rounded transition-colors"
                          >
                            <Pencil className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPieceToDelete(piece);
                            }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (piece.id) {
                              await onReactivatePiece(piece.id);
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 rounded transition-colors"
                        >
                          Reativar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {!selectedPiece && filteredPieces.length > 0 && (
        <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Mostrando {filteredPieces.length} de {pieces.length} peça{pieces.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!pieceToDelete}
        onOpenChange={(open) => !open && setPieceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Peça</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a peça{" "}
              <strong>{pieceToDelete?.name}</strong>?
              <br /><br />
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePiece}
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
