// src/utils/specificationUtils.js

/**
 * Check if equipment uses a specific specification
 * @param {Object} equipment - Equipment object
 * @param {Object} spec - Specification object to check
 * @param {string} typeName - Type name (e.g., "Проектор", "Компьютер")
 * @returns {boolean} - Whether equipment uses the specification
 */
export const equipmentUsesSpecification = (equipment, spec, typeName) => {
  // Parse equipment body if it's a string (from search results)
  let equipmentData = equipment;
  if (typeof equipment.body === "string") {
    try {
      equipmentData = JSON.parse(equipment.body);
    } catch (e) {
      console.error("Error parsing equipment body:", e);
      return false;
    }
  }

  const typeNameLower = typeName.toLowerCase();
  const specId = spec.id;

  // Check traditional specification ID fields first
  if (typeNameLower.includes("компьютер")) {
    if (
      equipmentData.computer_specification_id === specId ||
      equipmentData.computer_specification?.id === specId ||
      equipmentData.computer_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested computer array
    return (
      equipmentData.computer &&
      Array.isArray(equipmentData.computer) &&
      equipmentData.computer.some((comp) => comp.id === specId)
    );
  }

  if (typeNameLower.includes("проектор")) {
    if (
      equipmentData.projector_specification_id === specId ||
      equipmentData.projector_specification?.id === specId ||
      equipmentData.projector_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested projector array
    return (
      equipmentData.projector &&
      Array.isArray(equipmentData.projector) &&
      equipmentData.projector.some((proj) => proj.id === specId)
    );
  }

  if (typeNameLower.includes("принтер")) {
    if (
      equipmentData.printer_specification_id === specId ||
      equipmentData.printer_specification?.id === specId ||
      equipmentData.printer_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested printer array
    return (
      equipmentData.printer &&
      Array.isArray(equipmentData.printer) &&
      equipmentData.printer.some((printer) => printer.id === specId)
    );
  }

  if (typeNameLower.includes("телевизор")) {
    if (
      equipmentData.tv_specification_id === specId ||
      equipmentData.tv_specification?.id === specId ||
      equipmentData.tv_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested tv array
    return (
      equipmentData.tv &&
      Array.isArray(equipmentData.tv) &&
      equipmentData.tv.some((tv) => tv.id === specId)
    );
  }

  if (typeNameLower.includes("роутер")) {
    if (
      equipmentData.router_specification_id === specId ||
      equipmentData.router_specification?.id === specId ||
      equipmentData.router_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested router array
    return (
      equipmentData.router &&
      Array.isArray(equipmentData.router) &&
      equipmentData.router.some((router) => router.id === specId)
    );
  }

  if (typeNameLower.includes("ноутбук")) {
    if (
      equipmentData.notebook_specification_id === specId ||
      equipmentData.notebook_specification?.id === specId ||
      equipmentData.notebook_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested notebook array
    return (
      equipmentData.notebook &&
      Array.isArray(equipmentData.notebook) &&
      equipmentData.notebook.some((notebook) => notebook.id === specId)
    );
  }

  if (typeNameLower.includes("моноблок")) {
    if (
      equipmentData.monoblok_specification_id === specId ||
      equipmentData.monoblok_specification?.id === specId ||
      equipmentData.monoblok_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested monoblok array
    return (
      equipmentData.monoblok &&
      Array.isArray(equipmentData.monoblok) &&
      equipmentData.monoblok.some((monoblok) => monoblok.id === specId)
    );
  }

  if (typeNameLower.includes("доска")) {
    if (
      equipmentData.whiteboard_specification_id === specId ||
      equipmentData.whiteboard_specification?.id === specId ||
      equipmentData.whiteboard_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested whiteboard array
    return (
      equipmentData.whiteboard &&
      Array.isArray(equipmentData.whiteboard) &&
      equipmentData.whiteboard.some((whiteboard) => whiteboard.id === specId)
    );
  }

  if (typeNameLower.includes("удлинитель")) {
    if (
      equipmentData.extender_specification_id === specId ||
      equipmentData.extender_specification?.id === specId ||
      equipmentData.extender_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested extender array
    return (
      equipmentData.extender &&
      Array.isArray(equipmentData.extender) &&
      equipmentData.extender.some((extender) => extender.id === specId)
    );
  }

  if (typeNameLower.includes("монитор")) {
    if (
      equipmentData.monitor_specification_id === specId ||
      equipmentData.monitor_specification?.id === specId ||
      equipmentData.monitor_specification_data?.id === specId
    ) {
      return true;
    }
    // Check nested monitor array
    return (
      equipmentData.monitor &&
      Array.isArray(equipmentData.monitor) &&
      equipmentData.monitor.some((monitor) => monitor.id === specId)
    );
  }

  return false;
};

/**
 * Enrich equipment data with proper type information
 * @param {Object} equipment - Equipment object
 * @param {Array} equipmentTypes - Array of equipment types
 * @returns {Object} - Enriched equipment object
 */
export const enrichEquipmentData = (equipment, equipmentTypes = []) => {
  // Parse equipment body if it's a string (from search results)
  let equipmentData = equipment;
  if (typeof equipment.body === "string") {
    try {
      equipmentData = JSON.parse(equipment.body);
    } catch (e) {
      console.error("Error parsing equipment body:", e);
      return equipment;
    }
  }

  // Ensure type_data is properly structured
  if (!equipmentData.type_data && equipmentData.type) {
    const typeData = equipmentTypes.find((t) => t.id === equipmentData.type);
    if (typeData) {
      equipmentData.type_data = typeData;
    }
  }

  // If type_data is still missing, try to infer from nested specifications
  if (!equipmentData.type_data) {
    if (equipmentData.projector && equipmentData.projector.length > 0) {
      equipmentData.type_data = { id: 1, name: "Проектор" };
    } else if (equipmentData.computer || equipmentData.computer_details) {
      equipmentData.type_data = { id: 2, name: "Компьютер" };
    } else if (equipmentData.printer && equipmentData.printer.length > 0) {
      equipmentData.type_data = { id: 3, name: "Принтер" };
    } else if (equipmentData.monoblok && equipmentData.monoblok.length > 0) {
      equipmentData.type_data = { id: 4, name: "Моноблок" };
    } else if (
      equipmentData.whiteboard &&
      equipmentData.whiteboard.length > 0
    ) {
      equipmentData.type_data = { id: 5, name: "Электронная доска" };
    } else if (equipmentData.tv && equipmentData.tv.length > 0) {
      equipmentData.type_data = { id: 6, name: "Телевизор" };
    } else if (equipmentData.notebook && equipmentData.notebook.length > 0) {
      equipmentData.type_data = { id: 8, name: "Ноутбук" };
    } else if (equipmentData.router && equipmentData.router.length > 0) {
      equipmentData.type_data = { id: 9, name: "Роутер" };
    } else if (equipmentData.monitor && equipmentData.monitor.length > 0) {
      equipmentData.type_data = { id: 10, name: "Монитор" };
    } else if (equipmentData.extender && equipmentData.extender.length > 0) {
      equipmentData.type_data = { id: 11, name: "Удлинитель" };
    } else {
      equipmentData.type_data = { id: null, name: "Неизвестный тип" };
    }
  }

  return equipmentData;
};

/**
 * Get all specifications used by equipment
 * @param {Object} equipment - Equipment object
 * @returns {Array} - Array of specification objects with type information
 */
export const getEquipmentSpecifications = (equipment) => {
  let equipmentData = equipment;
  if (typeof equipment.body === "string") {
    try {
      equipmentData = JSON.parse(equipment.body);
    } catch (e) {
      return [];
    }
  }

  const specifications = [];

  // Check all specification types
  const specTypes = [
    { key: "computer", name: "Компьютер" },
    { key: "projector", name: "Проектор" },
    { key: "printer", name: "Принтер" },
    { key: "tv", name: "Телевизор" },
    { key: "router", name: "Роутер" },
    { key: "notebook", name: "Ноутбук" },
    { key: "monoblok", name: "Моноблок" },
    { key: "whiteboard", name: "Электронная доска" },
    { key: "extender", name: "Удлинитель" },
    { key: "monitor", name: "Монитор" },
  ];

  specTypes.forEach((specType) => {
    if (
      equipmentData[specType.key] &&
      Array.isArray(equipmentData[specType.key])
    ) {
      equipmentData[specType.key].forEach((spec) => {
        specifications.push({
          ...spec,
          type: specType.name,
          typeLower: specType.key,
        });
      });
    }
  });

  return specifications;
};
