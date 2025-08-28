// 3. EquipmentListModal.jsx - With view button
import React, { useState, useEffect } from "react";
import {
  Modal,
  List,
  Button,
  Empty,
  Form,
  Select,
  message,
  Popconfirm,
} from "antd";
import { FiEdit, FiTrash2, FiPlus, FiEye } from "react-icons/fi";
import { useDispatch } from "react-redux";
import EquipmentIcon from "./EquipmentIcon";
import EditEquipmentModal from "./EditEquipmentModal";
import { equipmentAPI, specificationsAPI } from "../../services/api";
import { getEquipmentTypesByRoom } from "../../store/slices/universitySlice";
import { getStatusText } from "../../utils/statusUtils";

const { Option } = Select;

const EquipmentListModal = ({ visible, onCancel, equipmentTypeData, room }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  const dispatch = useDispatch();

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
    const typeName = equipmentTypeData.type?.name?.toLowerCase() || "";
    if (typeName.includes("компьютер")) return "computer-specifications";
    if (typeName.includes("проектор")) return "projector-specification";
    if (typeName.includes("принтер")) return "printer-specification";
    if (typeName.includes("телевизор")) return "tv-specification";
    if (typeName.includes("роутер")) return "router-specification";
    if (typeName.includes("ноутбук")) return "notebook-specification";
    if (typeName.includes("моноблок")) return "monoblok-specification";
    if (typeName.includes("доска")) return "whiteboard-specification";
    if (typeName.includes("удлинитель")) return "extender-specification";
    if (typeName.includes("монитор")) return "monitor-specification";
    return null;
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
        case "tv-specification":
          response = await specificationsAPI.getTVSpecs();
          break;
        case "router-specification":
          response = await specificationsAPI.getRouterSpecs();
          break;
        case "notebook-specification":
          response = await specificationsAPI.getNotebookSpecs();
          break;
        case "monoblok-specification":
          response = await specificationsAPI.getMonoblokSpecs();
          break;
        case "whiteboard-specification":
          response = await specificationsAPI.getWhiteboardSpecs();
          break;
        case "extender-specification":
          response = await specificationsAPI.getExtenderSpecs();
          break;
        case "monitor-specification":
          response = await specificationsAPI.getMonitorSpecs();
          break;
        default:
          response = { data: [] };
      }
    } catch (error) {
      message.error("Failed to load specifications");
    }
  };

  useEffect(() => {
    if (editModalVisible && selectedEquipment) {
      fetchSpecifications();
    }
  }, [editModalVisible, selectedEquipment]);

  // Handle view button click
  const handleView = (equipment) => {
    setSelectedEquipment(equipment);
    setDetailModalVisible(true);
  };

  // Handle edit button click
  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setEditModalVisible(true);
  };

  // Handle edit modal close with refresh
  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedEquipment(null);
    refreshRoomData();
  };

  // Handle detail modal close
  const handleDetailModalClose = () => {
    setDetailModalVisible(false);
    setSelectedEquipment(null);
  };

  // Handle delete confirmation
  const handleDelete = async (equipment) => {
    try {
      await equipmentAPI.deleteEquipment(equipment.id);
      message.success("Equipment deleted successfully");
      refreshRoomData();
    } catch (error) {
      message.error("Failed to delete equipment");
    }
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
                    key="view"
                    type="link"
                    icon={<FiEye />}
                    onClick={() => handleView(equipment)}
                    className="text-blue-500 hover:text-blue-700"
                  />,
                  <Button
                    key="edit"
                    type="link"
                    icon={<FiEdit />}
                    onClick={() => handleEdit(equipment)}
                    className="text-indigo-500 hover:text-indigo-700"
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
                      ИНН: {equipment.inn || "Нет"} • Статус:{" "}
                      {getStatusText(equipment.status)}
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
        equipmentTypes={[]}
      />

      {/* Detail Equipment Modal */}
      <Modal
        title="Подробная информация об оборудовании"
        visible={detailModalVisible}
        onCancel={handleDetailModalClose}
        footer={[
          <Button key="close" onClick={handleDetailModalClose}>
            Закрыть
          </Button>,
        ]}
        width={900}
      >
        {selectedEquipment && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-indigo-600 mb-4">
                {selectedEquipment.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">ИНН:</span>
                  <span className="ml-2 font-medium">
                    {selectedEquipment.inn || "Не указан"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Тип:</span>
                  <span className="ml-2 font-medium">
                    {selectedEquipment.type_data?.name || typeName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Статус:</span>
                  <span className="ml-2 px-2 py-1 rounded text-sm bg-indigo-100 text-indigo-600">
                    {getStatusText(selectedEquipment.status)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Активность:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      selectedEquipment.is_active
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {selectedEquipment.is_active ? "Активно" : "Неактивно"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description and Location */}
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Описание</h4>
                  <p className="text-gray-700">
                    {selectedEquipment.description || "Описание не указано"}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Местоположение</h4>
                  <p className="text-gray-700">
                    {selectedEquipment.room_data
                      ? `${selectedEquipment.room_data.number} - ${selectedEquipment.room_data.name}`
                      : room
                      ? `${room.number} - ${room.name}`
                      : "Не указано"}
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Characteristics */}
            {selectedEquipment.computer_specification_data && (
              <div>
                <h4 className="font-medium mb-3">Характеристики компьютера</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Процессор:</span>
                      <div className="font-medium">
                        {selectedEquipment.computer_specification_data.cpu}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">ОЗУ:</span>
                      <div className="font-medium">
                        {selectedEquipment.computer_specification_data.ram}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Накопитель:</span>
                      <div className="font-medium">
                        {selectedEquipment.computer_specification_data.storage}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Размер монитора:</span>
                      <div className="font-medium">
                        {
                          selectedEquipment.computer_specification_data
                            .monitor_size
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Клавиатура:</span>
                      <div className="font-medium">
                        {selectedEquipment.computer_specification_data
                          .has_keyboard
                          ? "Есть"
                          : "Нет"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Мышь:</span>
                      <div className="font-medium">
                        {selectedEquipment.computer_specification_data.has_mouse
                          ? "Есть"
                          : "Нет"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedEquipment.projector_specification_data && (
              <div>
                <h4 className="font-medium mb-3">Характеристики проектора</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Модель:</span>
                      <div className="font-medium">
                        {selectedEquipment.projector_specification_data?.model}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Яркость:</span>
                      <div className="font-medium">
                        {selectedEquipment.projector_specification_data?.lumens}{" "}
                        люмен
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Разрешение:</span>
                      <div className="font-medium">
                        {
                          selectedEquipment.projector_specification_data
                            .resolution
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Тип проекции:</span>
                      <div className="font-medium">
                        {
                          selectedEquipment.projector_specification_data
                            .throw_type
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedEquipment.printer_specification_data && (
              <div>
                <h4 className="font-medium mb-3">Характеристики принтера</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Модель:</span>
                      <div className="font-medium">
                        {selectedEquipment.printer_specification_data?.model}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Цветная печать:</span>
                      <div className="font-medium">
                        {selectedEquipment.printer_specification_data.color
                          ? "Да"
                          : "Нет"}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        Двусторонняя печать:
                      </span>
                      <div className="font-medium">
                        {selectedEquipment.printer_specification_data.duplex
                          ? "Да"
                          : "Нет"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Information about creation */}
            <div className="bg-purple-50  p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <span className="mr-2">Информация о создании</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Автор:</span>
                  <div className="font-medium">
                    {selectedEquipment.author
                      ? `${selectedEquipment.author.first_name} ${selectedEquipment.author.last_name}`
                      : "Неизвестно"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Роль автора:</span>
                  <div className="font-medium">
                    {selectedEquipment.author?.role || "Неизвестно"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <div className="font-medium">
                    {selectedEquipment.author?.email || "Неизвестно"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Дата создания:</span>
                  <div className="font-medium">
                    {selectedEquipment.created_at
                      ? new Date(
                          selectedEquipment.created_at
                        ).toLocaleDateString()
                      : "Неизвестно"}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {selectedEquipment.qr_code_url && (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h4 className="font-medium mb-3">QR Код</h4>
                <div className="inline-block p-3 bg-white rounded-lg shadow-sm">
                  <img
                    src={
                      `https://server.kerek.uz/` + selectedEquipment.qr_code_url
                    }
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Уникальный идентификатор: {selectedEquipment.uid}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default EquipmentListModal;
