"use client";

import { useState } from "react";
import {
  Card,
  Collapse,
  Button,
  Badge,
  Empty,
  Space,
  Modal,
  message,
  Form,
  Input,
  Select,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiChevronRight,
  FiTrash2,
  FiEdit,
  FiFilter,
  FiEye,
  FiMapPin,
} from "react-icons/fi";
import {
  updateEquipment,
  deleteEquipment,
  getMyEquipments,
} from "../store/slices/equipmentSlice";
import EditEquipmentModal from "../components/Equipment/EditEquipmentModal";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import { getStatusText, getStatusConfig } from "../utils/statusUtils";

const { Panel } = Collapse;
const { Option } = Select;

const AddedPage = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [filters, setFilters] = useState({
    building_id: null,
    room_id: null,
    type_id: null,
  });
  const [form] = Form.useForm();

  const dispatch = useDispatch();

  // Get data from Redux store (already loaded in App.js)
  const {
    myEquipments = [],
    equipmentTypes = [],
    loading,
  } = useSelector((state) => state.equipment);
  const { buildings = [] } = useSelector((state) => state.university);
  const { rooms = [] } = useSelector((state) => state.university);
  console.log(myEquipments);

  // Получение данных оборудования в правильном формате
  const getValidEquipment = () => {
    if (!Array.isArray(myEquipments)) {
      console.warn("myEquipments не является массивом:", myEquipments);
      return [];
    }

    return myEquipments.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.id &&
        item.name &&
        (item.type_data || item.type)
    );
  };

  const getStatusColor = (status) => {
    const statusColors = {
      NEW: "green",
      WORKING: "blue",
      REPAIR: "orange",
      NEEDS_REPAIR: "red",
      DISPOSED: "default",
    };
    return statusColors[status] || "default";
  };

  const groupEquipmentByType = () => {
    const validEquipment = getValidEquipment();
    let filteredEquipment = [...validEquipment];

    // Apply filters
    if (filters.building_id) {
      filteredEquipment = filteredEquipment.filter(
        (item) => item.room_data?.building === filters.building_id
      );
    }
    if (filters.room_id) {
      filteredEquipment = filteredEquipment.filter(
        (item) => item.room_data?.id === filters.room_id
      );
    }
    if (filters.type_id) {
      filteredEquipment = filteredEquipment.filter(
        (item) => (item.type_data?.id || item.type) === filters.type_id
      );
    }

    const grouped = {};
    filteredEquipment.forEach((item) => {
      const typeName =
        item.type_data?.name ||
        equipmentTypes.find((t) => t.id === item.type)?.name ||
        "Неизвестный тип";
      if (!grouped[typeName]) {
        grouped[typeName] = [];
      }
      grouped[typeName].push(item);
    });

    return grouped;
  };

  // Handle view button click
  const handleView = (equipment) => {
    setSelectedEquipment(equipment);
    setDetailModalVisible(true);
  };

  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedEquipment(null);
    // Refresh equipment data
    dispatch(getMyEquipments());
  };

  const handleDetailModalClose = () => {
    setDetailModalVisible(false);
    setSelectedEquipment(null);
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      message.success("Оборудование успешно удалено!");
      // Обновить список
      dispatch(getMyEquipments());
    } catch (error) {
      console.error("Ошибка при удалении оборудования:", error);
      message.error("Ошибка при удалении оборудования");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset room filter when building changes
      ...(key === "building_id" ? { room_id: null } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters({
      building_id: null,
      room_id: null,
      type_id: null,
    });
  };

  const hasActiveFilters = () => {
    return filters.building_id || filters.room_id || filters.type_id;
  };

  // Get rooms for selected building
  const getFilteredRooms = () => {
    if (!filters.building_id) return rooms;
    return rooms.filter((room) => room.building === filters.building_id);
  };

  const renderEquipmentItem = (item) => {
    const statusConfig = getStatusConfig(item.status);

    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
      >
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <EquipmentIcon
              type={
                item.type_data?.name ||
                equipmentTypes.find((t) => t.id === item.type)?.name
              }
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-gray-800">{item.name}</span>
              <span
                className="px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color,
                  border: `1px solid ${statusConfig.borderColor}`,
                }}
              >
                {statusConfig.text}
              </span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <FiMapPin className="text-gray-400" />
                <span>
                  {item.room_data?.number && item.room_data?.name
                    ? `${item.room_data.number} - ${item.room_data.name}`
                    : "Комната не указана"}
                </span>
              </div>
              <span>ИНН: {item.inn || "Не присвоен"}</span>
              <span>ID: {item.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="text"
            icon={<FiEye />}
            onClick={() => handleView(item)}
            size="small"
            title="Подробнее"
            className="text-blue-500 hover:text-blue-700"
          />
          <Button
            type="text"
            icon={<FiEdit />}
            onClick={() => handleEdit(item)}
            size="small"
            title="Редактировать"
            className="text-indigo-500 hover:text-indigo-700"
          />
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            onClick={() => {
              Modal.confirm({
                title: "Удалить оборудование?",
                content: "Это действие нельзя отменить",
                onOk: () => handleDelete(item.id),
                okText: "Да",
                cancelText: "Нет",
              });
            }}
            size="small"
            title="Удалить"
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>
    );
  };

  const renderEquipmentList = () => {
    const groupedEquipment = groupEquipmentByType();

    if (Object.keys(groupedEquipment).length === 0) {
      if (hasActiveFilters()) {
        return (
          <div className="text-center py-8">
            <Empty
              description="Оборудование по заданным фильтрам не найдено"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
            <Button type="link" onClick={clearFilters} className="mt-2">
              Очистить фильтры
            </Button>
          </div>
        );
      }
      return (
        <Empty
          description="Нет добавленного оборудования"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div>
        <Collapse
          expandIcon={({ isActive }) => (
            <FiChevronRight
              className={`transition-transform ${isActive ? "rotate-90" : ""}`}
            />
          )}
          className="space-y-2"
        >
          {Object.entries(groupedEquipment).map(([typeName, items]) => (
            <Panel
              key={typeName}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <EquipmentIcon
                        type={typeName}
                        className="text-green-600"
                      />
                    </div>
                    <span className="font-medium">{typeName}</span>
                  </div>
                  <Badge
                    count={items.length}
                    style={{ backgroundColor: "#6366f1" }}
                    className="mr-4"
                  />
                </div>
              }
            >
              <div className="space-y-2">{items.map(renderEquipmentItem)}</div>
            </Panel>
          ))}
        </Collapse>
      </div>
    );
  };

  const getTotalCount = () => {
    const groupedEquipment = groupEquipmentByType();
    return Object.values(groupedEquipment).reduce(
      (total, items) => total + items.length,
      0
    );
  };

  return (
    <div>
      <Card className="shadow-sm">
        {/* Filters */}
        <div className="flex space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Select
            placeholder="Корпус"
            className="w-40"
            value={filters.building_id}
            onChange={(value) => handleFilterChange("building_id", value)}
            allowClear
          >
            {buildings.map((building) => (
              <Option key={building.id} value={building.id}>
                {building.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Комната"
            className="w-48"
            value={filters.room_id}
            onChange={(value) => handleFilterChange("room_id", value)}
            allowClear
            disabled={!filters.building_id}
          >
            {getFilteredRooms().map((room) => (
              <Option key={room.id} value={room.id}>
                {room.number} - {room.name}
              </Option>
            ))}
          </Select>

          <Select
            placeholder="Тип оборудования"
            className="w-48"
            value={filters.type_id}
            onChange={(value) => handleFilterChange("type_id", value)}
            allowClear
          >
            {equipmentTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                <div className="flex items-center space-x-2">
                  <EquipmentIcon type={type.name} />
                  <span>{type.name}</span>
                </div>
              </Option>
            ))}
          </Select>

          <Button
            icon={<FiFilter />}
            onClick={clearFilters}
            disabled={!hasActiveFilters()}
          >
            Очистить
          </Button>
        </div>

        {/* Show active filters */}
        {hasActiveFilters() && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-indigo-800">
              <span>Активные фильтры:</span>
              {filters.building_id && (
                <span className="px-2 py-1 bg-indigo-200 rounded text-xs">
                  Корпус:{" "}
                  {buildings.find((b) => b.id === filters.building_id)?.name}
                </span>
              )}
              {filters.room_id && (
                <span className="px-2 py-1 bg-indigo-200 rounded text-xs">
                  Комната: {rooms.find((r) => r.id === filters.room_id)?.number}{" "}
                  - {rooms.find((r) => r.id === filters.room_id)?.name}
                </span>
              )}
              {filters.type_id && (
                <span className="px-2 py-1 bg-indigo-200 rounded text-xs">
                  Тип:{" "}
                  {equipmentTypes.find((t) => t.id === filters.type_id)?.name}
                </span>
              )}
            </div>
          </div>
        )}

        {renderEquipmentList()}
      </Card>

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        equipment={selectedEquipment}
        equipmentTypes={equipmentTypes}
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
                    {selectedEquipment.type_data?.name || "Неизвестный тип"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Статус:</span>
                  <span
                    className="ml-2 px-2 py-1 rounded text-sm"
                    style={{
                      backgroundColor: getStatusConfig(selectedEquipment.status)
                        .bgColor,
                      color: getStatusConfig(selectedEquipment.status).color,
                      border: `1px solid ${
                        getStatusConfig(selectedEquipment.status).borderColor
                      }`,
                    }}
                  >
                    {getStatusConfig(selectedEquipment.status).text}
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
                  <h4 className="font-medium mb-2 flex items-center">
                    <FiMapPin className="mr-2" />
                    Местоположение
                  </h4>
                  <p className="text-gray-700">
                    {selectedEquipment.room_data
                      ? `${selectedEquipment.room_data.number} - ${selectedEquipment.room_data.name}`
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

            {/* Information about creation */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Информация о создании</h4>
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
                    src={selectedEquipment.qr_code_url}
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
    </div>
  );
};

export default AddedPage;
