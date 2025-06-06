"use client";

import { Modal } from "antd";
import { FiPlus } from "react-icons/fi";
import EquipmentIcon from "./EquipmentIcon";

const EquipmentTypeSelectionModal = ({
  visible,
  onCancel,
  onSelectType,
  equipmentTypes,
}) => {
  const handleTypeSelect = (type) => {
    onSelectType(type);
    onCancel();
  };

  return (
    <Modal
      title={
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-800">
            Элемент инвентаря
          </div>
        </div>
      }
      visible={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="mt-[-40px]"
      destroyOnClose
    >
      <div className="space-y-3">
        {equipmentTypes.map((type) => (
          <div
            key={type.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => handleTypeSelect(type)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <EquipmentIcon type={type.name} />
              </div>
              <span className="font-medium text-gray-800">{type.name}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <FiPlus className="text-white text-sm" />
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default EquipmentTypeSelectionModal;
