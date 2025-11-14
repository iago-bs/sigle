// Exemplo de como usar o useDropdownOptions em um formulário
// Este é um exemplo conceitual - você pode aplicar este padrão em qualquer formulário

import { useDropdownOptions } from '../hooks/useDropdownOptions';

export const ExampleForm = () => {
  const { partTypes, deviceTypes, brands, productColors } = useDropdownOptions();

  return (
    <form>
      {/* Dropdown de Tipos de Peças */}
      <select name="partType">
        <option value="">Selecione o tipo de peça</option>
        {partTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {/* Dropdown de Tipos de Equipamentos */}
      <select name="deviceType">
        <option value="">Selecione o tipo de equipamento</option>
        {deviceTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      {/* Dropdown de Marcas */}
      <select name="brand">
        <option value="">Selecione a marca</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>

      {/* Dropdown de Cores */}
      <select name="color">
        <option value="">Selecione a cor</option>
        {productColors.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </select>
    </form>
  );
};