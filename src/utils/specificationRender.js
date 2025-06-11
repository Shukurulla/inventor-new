export const renderEquipmetnSpecification = (equipment) => {
  const typeEquipment = inventoryTypes.find((c) => c.id == equipment.type).name;
  switch (equipment) {
    case "Проектор":
      return equipment.projector_specification_data;
    case "Компьютер":
      return equipment.computer_details;
    case "Принтер":
      return equipment.printer_specification_data;
    case "Моноблок":
      return equipment.monoblok_specification_data;
    case "Электронная доска":
      return equipment.whiteboard_specification_data;
    case "Телевизор":
      return equipment.tv_specification_data;
    case "Ноутбук":
      return equipment.notebook_specification_data;
    case "Роутер":
      return equipment.router_specification_data;
    default:
      break;
  }
};
