import React, { useState, useEffect } from "react";
import {
  Modal,
  List,
  Button,
  Empty,
  Divider,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import { FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useDispatch } from "react-redux";
import EquipmentIcon from "./EquipmentIcon";
import EditEquipmentModal from "./EditEquipmentModal";
import { equipmentAPI, specificationsAPI } from "../../services/api";
import { getEquipmentTypesByRoom } from "../../store/slices/universitySlice";

const { Option } = Select;

const EquipmentListModal = ({ visible, onCancel, equipmentTypeData, room }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [form] = Form.useForm();
  const [specs, setSpecs] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const dispatch = useDispatch();

  // Force refresh when modal opens
  useEffect(() => {
    if (visible && room) {
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [visible, room]);

  // Refresh room data when needed
  const refreshRoomData = async () => {
    if (room) {
      try {
        await dispatch(getEquipmentTypesByRoom(room.id)).unwrap();
        setRefreshTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error refreshing room data:", error);
      }
    }
  };

  // Determine the specification type based on equipment type
  const getSpecEndpoint = () => {
    const typeName = equipmentTypeData.type?.name?.toLowerCase();
    switch (typeName) {
      case "computer":
        return "computer-specifications";
      case "projector":
        return "projector-specification";
      case "printer":
        return "printer-specification";
      // Add more cases as needed
      default:
        return null;
    }
  };

  // Fetch specifications dynamically
  const fetchSpecifications = async () => {
    const endpoint = getSpecEndpoint();
    if (!endpoint) {
      message.warning("Specification type not supported for this equipment");
      return;
    }

    try {
      let response;
      switch (endpoint) {
        case "computer-specifications":
          response = await specificationsAPI.getComputerSpecs();
          break;
        case "projector-specification":
          response = await specificationsAPI.getProjectorSpecs();
          break;
        case "printer-specification":
          response = await specificationsAPI.getPrinterSpecs();
          break;
        // Add more cases as needed
        default:
          response = { data: [] };
      }
      setSpecs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error("Failed to load specifications");
      setSpecs([]);
    }
  };

  useEffect(() => {
    if (editModalVisible && selectedEquipment) {
      fetchSpecifications();
    }
  }, [editModalVisible, selectedEquipment]);

  // Handle edit button click
  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setEditModalVisible(true);
  };

  // Handle edit modal close with refresh
  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedEquipment(null);
    refreshRoomData(); // Refresh the data when edit modal closes
  };

  // Handle delete confirmation
  const handleDelete = async (equipment) => {
    try {
      await equipmentAPI.deleteEquipment(equipment.id);
      message.success("Equipment deleted successfully");
      refreshRoomData(); // Refresh the data after deletion
    } catch (error) {
      message.error("Failed to delete equipment");
    }
  };

  // Handle add new equipment (placeholder)
  const handleAddNew = () => {
    message.info("Add new equipment functionality to be implemented");
  };

  if (!equipmentTypeData || !room) {
    return null;
  }

  const typeName =
    equipmentTypeData.type?.name || equipmentTypeData.name || "Неизвестный тип";
  const equipmentItems = equipmentTypeData.items || [];
  const count = equipmentTypeData.count || equipmentItems.length || 0;

  return (
    <>
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <EquipmentIcon type={typeName} />
            </div>
            <div>
              <span className="text-lg font-medium">{typeName}</span>
              <div className="text-sm text-gray-500">
                {room.number} - {room.name} • Всего: {count} шт.
              </div>
            </div>
          </div>
        }
        visible={visible}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            Закрыть
          </Button>,
        ]}
        width={800}
        className="mt-[-50px]"
        bodyStyle={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        {equipmentItems.length === 0 ? (
          <Empty
            description="Оборудование данного типа не найдено"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={equipmentItems}
            renderItem={(equipment) => (
              <List.Item
                key={equipment.id}
                className="py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
                actions={[
                  <Button
                    key="edit"
                    type="link"
                    icon={<FiEdit />}
                    onClick={() => handleEdit(equipment)}
                    className="text-blue-500 hover:text-blue-700"
                  />,
                  <Popconfirm
                    title="Вы уверены, что хотите удалить это оборудование?"
                    onConfirm={() => handleDelete(equipment)}
                    okText="Да"
                    cancelText="Нет"
                  >
                    <Button
                      key="delete"
                      type="link"
                      icon={<FiTrash2 />}
                      className="text-red-500 hover:text-red-700"
                    />
                  </Popconfirm>,
                ]}
              >
                <div className="flex items-center w-full space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <EquipmentIcon type={typeName} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">
                      {equipment.name || `ID: ${equipment.id}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      ИНН: {equipment.inn || "Нет"} • Статус: {equipment.status}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Modal>

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        equipment={selectedEquipment}
        equipmentTypes={[]} // Pass equipment types if needed
      />
    </>
  );
};

export default EquipmentListModal;
