import { ArrowLeft, Search, Plus, Pencil, Trash2, Archive, History, Package } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { Part, StockPart, ServiceOrder, Piece } from "../types";

import type { OnlinePart } from "../types";

type TabType = "stock" | "history";

interface AggregatedStock {
  pieceId: string;
  pieceName: string;
  totalQuantity: number;
  lastPrice?: number;
  lastEntryDate: string;
}

interface PartsPageProps {
  onBack: () => void;
  parts: Part[];
  stockParts: StockPart[];
  pieces: Piece[];
  onlineParts: OnlinePart[];
  serviceOrders: ServiceOrder[];
  onAddPart: () => void;
  onAddStockPart: () => void;
  onAddOnlinePart: () => void;
  onEditPart: (part: Part) => void;
  onDeletePart: (id: string) => void;
  onEditStockPart: (stockPart: StockPart, isIndividual?: boolean) => void;
  onDeleteStockPart: (id: string) => void; // Para aba Estoque (cria entrada negativa)
  onDeleteIndividualStockPart: (id: string) => void; // Para aba Movimentações (deleta registro)
  onEditOnlinePart: (onlinePart: OnlinePart) => void;
  onDeleteOnlinePart: (id: string) => void;
  onSelectServiceOrder: (serviceOrder: ServiceOrder) => void;
}

const statusConfig = {
  "to-order": { label: "À Pedir", color: "bg-red-100 text-red-800 border-red-300" },
  "ordered": { label: "Pedido Realizado", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  "arriving": { label: "À Chegar", color: "bg-blue-100 text-blue-800 border-blue-300" },
  "received": { label: "Recebido", color: "bg-green-100 text-green-800 border-green-300" },
};

export function PartsPage({ 
  onBack, 
  parts, 
  stockParts,
  pieces,
  onlineParts,
  serviceOrders,
  onAddPart, 
  onAddStockPart,
  onAddOnlinePart,
  onEditPart, 
  onDeletePart,
  onEditStockPart,
  onDeleteStockPart,
  onDeleteIndividualStockPart,
  onEditOnlinePart,
  onDeleteOnlinePart,
  onSelectServiceOrder,
}: PartsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTab, setCurrentTab] = useState<TabType>("stock");

  // Agregar estoque por piece_id
  const aggregatedStock = useMemo((): AggregatedStock[] => {
    const grouped: Record<string, AggregatedStock> = {};
    
    stockParts.forEach((part) => {
      const pieceId = part.piece_id || part.pieceId;
      if (!pieceId) return;
      
      const piece = pieces.find(p => p.id === pieceId);
      const pieceName = piece?.name || part.name;
      const addedAt = part.added_at || part.addedAt || new Date().toISOString();
      
      if (!grouped[pieceId]) {
        grouped[pieceId] = {
          pieceId: pieceId,
          pieceName,
          totalQuantity: 0,
          lastPrice: undefined,
          lastEntryDate: addedAt,
        };
      }
      
      grouped[pieceId].totalQuantity += part.quantity || 0;
      
      // Atualizar preço e data do registro mais recente
      if (new Date(addedAt) >= new Date(grouped[pieceId].lastEntryDate)) {
        grouped[pieceId].lastPrice = part.price;
        grouped[pieceId].lastEntryDate = addedAt;
      }
    });
    
    // Filtrar apenas itens com quantidade > 0
    return Object.values(grouped).filter(item => item.totalQuantity > 0);
  }, [stockParts, pieces]);

  // Filter aggregated stock based on search
  const filteredAggregatedStock = aggregatedStock.filter((item) => {
    const query = searchQuery.toLowerCase();
    return item.pieceName.toLowerCase().includes(query);
  });

  // Helper function to get updated piece name
  const getPieceName = (stockPart: StockPart): string => {
    const pieceId = stockPart.piece_id || stockPart.pieceId;
    if (!pieceId) return stockPart.name;
    const piece = pieces.find(p => p.id === pieceId);
    return piece?.name || stockPart.name;
  };

  // Filter history (all stockParts) based on search
  const filteredHistory = stockParts.filter((stockPart) => {
    const query = searchQuery.toLowerCase();
    const pieceName = getPieceName(stockPart);
    return pieceName.toLowerCase().includes(query);
  }).sort((a, b) => {
    const dateA = new Date(a.added_at || a.addedAt || 0).getTime();
    const dateB = new Date(b.added_at || b.addedAt || 0).getTime();
    return dateB - dateA;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatPrice = (price?: number) => {
    if (!price) return "—";
    return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

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
              letterSpacing: '0.5px',
              color: '#181717'
            }}
          >
            GERENCIAMENTO DE ESTOQUE DE PEÇAS
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setCurrentTab("stock")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors ${
              currentTab === "stock"
                ? "bg-[#8b7355] text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Package className="w-4 h-4" />
            Estoque
          </button>
          <button
            onClick={() => setCurrentTab("history")}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors ${
              currentTab === "history"
                ? "bg-[#8b7355] text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            <History className="w-4 h-4" />
            Movimentações
          </button>
        </div>

        {/* Search Bar and Add Button */}
        <div className="max-w-[600px] mx-auto">
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
            <input
              type="text"
              placeholder={currentTab === "stock" ? "Pesquisar peça..." : "Pesquisar nas movimentações..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-full bg-white text-sm focus:outline-none focus:border-[#8b7355] transition-colors shadow-sm"
            />
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={onAddStockPart}
              className="bg-[#8b7355] hover:bg-[#7a6345] text-white rounded-full px-6 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar ao Estoque
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-8 pb-8 overflow-y-auto max-h-[calc(100vh-320px)]">
        {currentTab === "stock" ? (
          /* ABA ESTOQUE - Agregado */
          filteredAggregatedStock.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <Archive className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma peça em estoque</p>
              <p className="text-sm mt-2">
                {searchQuery 
                  ? "Nenhuma peça encontrada com esse filtro" 
                  : "Adicione peças ao estoque para ter controle do inventário"}
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAggregatedStock.map((item) => (
                <div
                  key={item.pieceId}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {item.pieceName}
                      </h3>
                      <Badge className="bg-green-100 text-green-800 border-green-300">
                        Qtd: {item.totalQuantity}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço:</span>
                        <span className="font-medium">{formatPrice(item.lastPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Última Entrada:</span>
                        <span className="font-medium text-xs">{formatDate(item.lastEntryDate)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          // Encontrar o último registro dessa peça para editar
                          const lastEntry = stockParts
                            .filter(p => (p.piece_id || p.pieceId) === item.pieceId)
                            .sort((a, b) => {
                              const dateA = new Date(a.added_at || a.addedAt || 0).getTime();
                              const dateB = new Date(b.added_at || b.addedAt || 0).getTime();
                              return dateB - dateA;
                            })[0];
                          if (lastEntry) onEditStockPart(lastEntry);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6345] transition-colors text-sm"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          // Passar o pieceId para criar entrada negativa
                          onDeleteStockPart(item.pieceId);
                        }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ABA HISTÓRICO - Todos os registros */
          filteredHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhuma movimentação registrada</p>
              <p className="text-sm mt-2">
                {searchQuery 
                  ? "Nenhuma movimentação encontrada com esse filtro" 
                  : "Todas as movimentações de estoque aparecerão aqui"}
              </p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-3">
              {filteredHistory.map((stockPart) => (
                <div
                  key={stockPart.id}
                  className="bg-white border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    {/* Stock Part Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {getPieceName(stockPart)}
                        </h3>
                        <Badge className={
                          (stockPart.quantity || 0) >= 0
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-red-100 text-red-800 border-red-300"
                        }>
                          {(stockPart.quantity || 0) >= 0 ? '+' : ''}{stockPart.quantity}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Preço:</span>
                          <span className="ml-1 font-medium">{formatPrice(stockPart.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Data:</span>
                          <span className="ml-1 font-medium">{formatDate(stockPart.addedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => onEditStockPart(stockPart, true)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#8b7355] text-white rounded-lg hover:bg-[#7a6345] transition-colors text-sm whitespace-nowrap"
                      >
                        <Pencil className="w-3 h-3" />
                        Editar
                      </button>
                      <button
                        onClick={() => onDeleteIndividualStockPart(stockPart.id)}
                        className="flex items-center justify-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
