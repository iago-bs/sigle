import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, RotateCcw, Save, X } from 'lucide-react';
import { useSystemVariables } from '../hooks/useSystemVariables';
import type { VariableCategory, SystemVariable } from '../types';

const categoryLabels: Record<VariableCategory, string> = {
  part_types: "Tipos de Peças",
  device_types: "Tipos de Equipamentos", 
  brands: "Marcas",
  product_colors: "Cores de Produtos"
};

export const VariablesPage = () => {
  const {
    variables,
    loading,
    getVariablesByCategory,
    addVariable,
    updateVariable,
    deleteVariable,
    resetToDefaults
  } = useSystemVariables();

  const [selectedCategory, setSelectedCategory] = useState<VariableCategory>('part_types');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  // Clear error after 3 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Get filtered variables for current category
  const filteredVariables = getVariablesByCategory(selectedCategory).filter(
    (variable: SystemVariable) =>
      variable.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newValue.trim()) {
      setError('Por favor, digite um valor válido');
      return;
    }

    const success = addVariable(selectedCategory, newValue);
    if (success) {
      setNewValue('');
      setShowAddForm(false);
      setError('');
    } else {
      setError('Este valor já existe na categoria selecionada');
    }
  };

  const handleEdit = (variable: SystemVariable) => {
    setEditingId(variable.id);
    setEditingValue(variable.value);
  };

  const handleSaveEdit = () => {
    if (!editingValue.trim()) {
      setError('Por favor, digite um valor válido');
      return;
    }

    if (editingId) {
      const success = updateVariable(editingId, editingValue);
      if (success) {
        setEditingId(null);
        setEditingValue('');
        setError('');
      } else {
        setError('Este valor já existe na categoria selecionada');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      const success = deleteVariable(id);
      if (!success) {
        setError('Não é possível excluir variáveis padrão do sistema');
      }
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Tem certeza que deseja restaurar todas as variáveis para os valores padrão? Esta ação irá remover todas as customizações.')) {
      resetToDefaults();
      setError('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando variáveis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Variáveis do Sistema</h1>
          <p className="text-gray-600 mt-1">
            Gerencie os tipos, marcas e cores disponíveis no sistema
          </p>
        </div>
        <button
          onClick={handleResetToDefaults}
          className="flex items-center gap-2 px-4 py-2 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrões
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b">
        {Object.entries(categoryLabels).map(([category, label]) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category as VariableCategory);
              setSearchTerm('');
              setShowAddForm(false);
              setEditingId(null);
            }}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              selectedCategory === category
                ? 'border-brown-500 text-brown-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {label} ({getVariablesByCategory(category as VariableCategory).length})
          </button>
        ))}
      </div>

      {/* Search and Add */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={`Pesquisar em ${categoryLabels[selectedCategory].toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500"
          />
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder={`Novo ${categoryLabels[selectedCategory].toLowerCase().slice(0, -1)}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAdd();
                } else if (e.key === 'Escape') {
                  setShowAddForm(false);
                  setNewValue('');
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brown-500 focus:border-brown-500"
              autoFocus
            />
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="h-4 w-4" />
              Salvar
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewValue('');
              }}
              className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Variables List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {categoryLabels[selectedCategory]}
            <span className="text-sm text-gray-500 font-normal ml-2">
              ({filteredVariables.length} {filteredVariables.length === 1 ? 'item' : 'itens'})
            </span>
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredVariables.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum item nesta categoria'}
            </div>
          ) : (
            filteredVariables.map((variable: SystemVariable) => (
              <div key={variable.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  {editingId === variable.id ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-brown-500 focus:border-brown-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900">{variable.value}</span>
                      {variable.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {editingId !== variable.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(variable)}
                      className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(variable.id)}
                      className={`p-2 transition-colors ${
                        variable.isDefault
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                      disabled={variable.isDefault}
                      title={variable.isDefault ? 'Variáveis padrão não podem ser excluídas' : 'Excluir'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(categoryLabels).map(([category, label]) => {
          const count = getVariablesByCategory(category as VariableCategory).length;
          return (
            <div key={category} className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">{label}</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};