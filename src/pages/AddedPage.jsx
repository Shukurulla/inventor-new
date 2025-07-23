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
  List,
  Pagination,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiChevronRight,
  FiTrash2,
  FiEdit,
  FiFilter,
  FiEye,
  FiMapPin,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  updateEquipment,
  deleteEquipment,
  getMyEquipments,
} from "../store/slices/equipmentSlice";
import { specificationsAPI, equipmentAPI } from "../services/api";
import EditEquipmentModal from "../components/Equipment/EditEquipmentModal";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import { getStatusText, getStatusConfig } from "../utils/statusUtils";

const { Panel } = Collapse;
const { Option } = Select;

const AddedPage = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [dependencyModalVisible, setDependencyModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dependentSpecifications, setDependentSpecifications] = useState([]);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [deletingEquipment, setDeletingEquipment] = useState(new Set());
  const [filters, setFilters] = useState({
    building_id: null,
    room_id: null,
    type_id: null,
  });

  // Pagination states for each type
  const [paginationByType, setPaginationByType] = useState({});
  const [pageSize] = useState(5);

  const [form] = Form.useForm();

  const dispatch = useDispatch();

  // OPTIMIZED: Get data from Redux store (already loaded in App.jsx)
  const {
    myEquipments = [],
    equipmentTypes = [],
    loading,
  } = useSelector((state) => state.equipment);
  const { buildings = [], rooms = [] } = useSelector(
    (state) => state.university
  );

  // OPTIMIZED: Use data from Redux store instead of separate validation
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

  // Get paginated items for specific type
  const getPaginatedItemsForType = (typeName, items) => {
    const currentPage = paginationByType[typeName] || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return {
      paginatedItems: items.slice(startIndex, endIndex),
      totalItems: items.length,
      currentPage,
    };
  };

  // Handle pagination change for specific type
  const handlePageChangeForType = (typeName, page) => {
    setPaginationByType((prev) => ({
      ...prev,
      [typeName]: page,
    }));
  };

  // Enhanced dependency check for specifications
  const checkEquipmentDependencies = async (equipment) => {
    setDeletingEquipment((prev) => new Set(prev).add(equipment.id));

    try {
      const dependentSpecs = [];
      const typeName = equipment.type_data?.name?.toLowerCase() || "";

      // Check if equipment uses any specifications
      const specChecks = [
        {
          field: "computer_specification_id",
          api: specificationsAPI.getComputerSpecs,
          type: "компьютер",
        },
        {
          field: "projector_specification_id",
          api: specificationsAPI.getProjectorSpecs,
          type: "проектор",
        },
        {
          field: "printer_specification_id",
          api: specificationsAPI.getPrinterSpecs,
          type: "принтер",
        },
        {
          field: "tv_specification_id",
          api: specificationsAPI.getTVSpecs,
          type: "телевизор",
        },
        {
          field: "router_specification_id",
          api: specificationsAPI.getRouterSpecs,
          type: "роутер",
        },
        {
          field: "notebook_specification_id",
          api: specificationsAPI.getNotebookSpecs,
          type: "ноутбук",
        },
        {
          field: "monoblok_specification_id",
          api: specificationsAPI.getMonoblokSpecs,
          type: "моноблок",
        },
        {
          field: "whiteboard_specification_id",
          api: specificationsAPI.getWhiteboardSpecs,
          type: "доска",
        },
        {
          field: "extender_specification_id",
          api: specificationsAPI.getExtenderSpecs,
          type: "удлинитель",
        },
        {
          field: "monitor_specification_id",
          api: specificationsAPI.getMonitorSpecs,
          type: "монитор",
        },
      ];

      for (const check of specChecks) {
        if (equipment[check.field] && typeName.includes(check.type)) {
          try {
            const response = await check.api();
            const spec = response.data.find(
              (s) => s.id === equipment[check.field]
            );
            if (spec) {
              // Check if this specification is used by other equipment
              const otherEquipmentUsingSpec = myEquipments.filter(
                (eq) => eq.id !== equipment.id && eq[check.field] === spec.id
              );

              if (otherEquipmentUsingSpec.length === 0) {
                dependentSpecs.push({
                  ...spec,
                  type: check.type,
                  field: check.field,
                  isLastUser: true,
                });
              }
            }
          } catch (error) {
            console.error(`Error checking ${check.type} specs:`, error);
          }
        }
      }

      if (dependentSpecs.length > 0) {
        setDependentSpecifications(dependentSpecs);
        setEquipmentToDelete(equipment);
        setDependencyModalVisible(true);
      } else {
        // No dependencies, safe to delete
        confirmDirectDelete(equipment);
      }
    } catch (error) {
      console.error("Error checking dependencies:", error);
      message.error("Ошибка при проверке зависимостей");
    } finally {
      setDeletingEquipment((prev) => {
        const newSet = new Set(prev);
        newSet.delete(equipment.id);
        return newSet;
      });
    }
  };

  const confirmDirectDelete = (equipment) => {
    Modal.confirm({
      title: "Удалить оборудование?",
      content: `Вы уверены, что хотите удалить "${equipment.name}"?`,
      onOk: () => handleDelete(equipment.id),
      okText: "Да",
      cancelText: "Нет",
      okType: "danger",
    });
  };

  const handleDeleteWithCheck = (equipment) => {
    checkEquipmentDependencies(equipment);
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
    // OPTIMIZED: Refresh equipment data using Redux action
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
      // OPTIMIZED: Equipment will be automatically removed from store
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
    // Reset pagination for all types when filters change
    setPaginationByType({});
  };

  const clearFilters = () => {
    setFilters({
      building_id: null,
      room_id: null,
      type_id: null,
    });
    setPaginationByType({});
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
    const isDeleting = deletingEquipment.has(item.id);

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
            onClick={() => handleDeleteWithCheck(item)}
            size="small"
            title="Удалить"
            loading={isDeleting}
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
          {Object.entries(groupedEquipment).map(([typeName, items]) => {
            const { paginatedItems, totalItems, currentPage } =
              getPaginatedItemsForType(typeName, items);

            return (
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
                      count={totalItems}
                      style={{ backgroundColor: "#6366f1" }}
                      className="mr-4"
                    />
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Equipment Items */}
                  <div className="space-y-2">
                    {paginatedItems.map(renderEquipmentItem)}
                  </div>

                  {/* Pagination for this type */}
                  {totalItems > pageSize && (
                    <div className="flex justify-end pt-4 border-t">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={(page) =>
                          handlePageChangeForType(typeName, page)
                        }
                        showQuickJumper={false}
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} из ${total} единиц`
                        }
                        size="default"
                      />
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </div>
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

      {/* Detail Modal */}
      <Modal
        title="Подробная информация об оборудовании"
        open={detailModalVisible}
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

            {/* QR Code */}
            {selectedEquipment.inn && (
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h4 className="font-medium mb-3">QR Код</h4>
                <div className="inline-block p-3 bg-white rounded-lg shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?data=${selectedEquipment.inn}&size=200x200&bgcolor=FFFFFF&color=000000&format=png`}
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

      {/* Edit Equipment Modal */}
      <EditEquipmentModal
        visible={editModalVisible}
        onCancel={handleEditModalClose}
        equipment={selectedEquipment}
        equipmentTypes={equipmentTypes}
      />

      {/* Dependency Check Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <FiAlertTriangle className="text-orange-500" />
            <span>Внимание: найдены связанные характеристики</span>
          </div>
        }
        visible={dependencyModalVisible}
        onCancel={() => {
          setDependencyModalVisible(false);
          setDependentSpecifications([]);
          setEquipmentToDelete(null);
        }}
        footer={[
          <Button
            key="cancel"
            onClick={() => {
              setDependencyModalVisible(false);
              setDependentSpecifications([]);
              setEquipmentToDelete(null);
            }}
          >
            Отмена
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={() => {
              setDependencyModalVisible(false);
              confirmDirectDelete(equipmentToDelete);
              setDependentSpecifications([]);
              setEquipmentToDelete(null);
            }}
          >
            Удалить все равно
          </Button>,
        ]}
        width={800}
      >
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-orange-800">
              <strong>
                Данное оборудование является единственным пользователем
                следующих характеристик:
              </strong>
            </p>
            <p className="text-sm text-orange-700 mt-2">
              При удалении оборудования эти характеристики станут
              неиспользуемыми. Рекомендуется сначала отредактировать
              оборудование или удалить неиспользуемые характеристики.
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <List
              dataSource={dependentSpecifications}
              renderItem={(spec) => (
                <List.Item className="border-b hover:bg-gray-50 transition-colors">
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">
                        {spec.model || spec.cpu || `Характеристика ${spec.id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Тип: {spec.type} • ID: {spec.id}
                      </div>
                    </div>
                    <Button
                      type="link"
                      onClick={() => {
                        setDependencyModalVisible(false);
                        setSelectedEquipment(equipmentToDelete);
                        setEditModalVisible(true);
                      }}
                      className="text-indigo-600"
                    >
                      Редактировать оборудование →
                    </Button>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              💡 <strong>Рекомендация:</strong> Отредактируйте оборудование и
              измените или удалите привязку к характеристикам, либо удалите
              оборудование вместе с неиспользуемыми характеристиками.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddedPage;
