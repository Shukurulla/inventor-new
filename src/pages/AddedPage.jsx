"use client";

import { useEffect, useState } from "react";
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
import { FiChevronRight, FiTrash2, FiEdit, FiFilter } from "react-icons/fi";
import {
  getEquipment,
  updateEquipment,
  deleteEquipment,
} from "../store/slices/equipmentSlice";
import { getBuildings } from "../store/slices/universitySlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";

const { Panel } = Collapse;
const { Option } = Select;

const AddedPage = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [filters, setFilters] = useState({
    building_id: null,
    room_number: "",
    type_id: null,
  });
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { equipment, equipmentTypes, loading } = useSelector(
    (state) => state.equipment
  );
  const { buildings } = useSelector((state) => state.university);

  useEffect(() => {
    dispatch(getEquipment());
    dispatch(getBuildings());
  }, [dispatch]);

  const getStatusColor = (status) => {
    const statusColors = {
      NEW: "green",
      WORKING: "blue",
      REPAIR: "orange",
      BROKEN: "red",
      DISPOSED: "default",
    };
    return statusColors[status] || "default";
  };

  const getStatusText = (status) => {
    const statusTexts = {
      NEW: "Новое",
      WORKING: "Работает",
      REPAIR: "На ремонте",
      BROKEN: "Сломано",
      DISPOSED: "Утилизировано",
    };
    return statusTexts[status] || status;
  };

  const groupEquipmentByType = () => {
    let filteredEquipment = [...equipment];

    // Apply filters
    if (filters.building_id) {
      filteredEquipment = filteredEquipment.filter(
        (item) => item.room_data?.building === filters.building_id
      );
    }
    if (filters.room_number && filters.room_number.trim()) {
      filteredEquipment = filteredEquipment.filter((item) =>
        item.room_data?.number
          ?.toLowerCase()
          .includes(filters.room_number.toLowerCase())
      );
    }
    if (filters.type_id) {
      filteredEquipment = filteredEquipment.filter(
        (item) => item.type === filters.type_id
      );
    }

    const grouped = {};
    filteredEquipment.forEach((item) => {
      const typeName = item.type_data?.name || "Неизвестный тип";
      if (!grouped[typeName]) {
        grouped[typeName] = [];
      }
      grouped[typeName].push(item);
    });

    return grouped;
  };

  const handleEdit = (equipment) => {
    setSelectedEquipment(equipment);
    form.setFieldsValue({
      name: equipment.name,
      description: equipment.description,
      status: equipment.status,
    });
    setEditModalVisible(true);
  };

  const handleUpdateEquipment = async (values) => {
    try {
      await dispatch(
        updateEquipment({
          id: selectedEquipment.id,
          data: values,
        })
      ).unwrap();

      message.success("Оборудование успешно обновлено!");
      setEditModalVisible(false);
      setSelectedEquipment(null);
      form.resetFields();
      dispatch(getEquipment());
    } catch (error) {
      message.error("Ошибка при обновлении оборудования");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      message.success("Оборудование успешно удалено!");
      dispatch(getEquipment());
    } catch (error) {
      message.error("Ошибка при удалении оборудования");
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      building_id: null,
      room_number: "",
      type_id: null,
    });
  };

  const hasActiveFilters = () => {
    return filters.building_id || filters.room_number.trim() || filters.type_id;
  };

  const renderEquipmentItem = (item) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
          <EquipmentIcon
            type={item.type_data?.name}
            className="text-pink-600"
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{item.name}</div>
          <div className="text-sm text-gray-500 mt-1">
            {item.room_data?.number} - {item.room_data?.name} | ИНН:{" "}
            {item.inn || "Не присвоен"} | ID: {item.id}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <Badge
              color={getStatusColor(item.status)}
              text={getStatusText(item.status)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Space size="small">
          <Button
            type="text"
            icon={<FiEdit />}
            onClick={() => handleEdit(item)}
            size="small"
            title="Редактировать"
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
          />
        </Space>
      </div>
    </div>
  );

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Добавленные</h1>
        <p className="text-gray-600">
          Всего найдено: {getTotalCount()} единиц оборудования
        </p>
      </div>

      <Card className="shadow-sm">
        {/* Filters */}
        <div className="flex space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Select
            placeholder="Блок"
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

          <Input
            placeholder="Номер комнаты"
            className="w-40"
            value={filters.room_number}
            onChange={(e) => handleFilterChange("room_number", e.target.value)}
          />

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
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <span>Активные фильтры:</span>
              {filters.building_id && (
                <span className="px-2 py-1 bg-blue-200 rounded text-xs">
                  Блок:{" "}
                  {buildings.find((b) => b.id === filters.building_id)?.name}
                </span>
              )}
              {filters.room_number && (
                <span className="px-2 py-1 bg-blue-200 rounded text-xs">
                  Комната: {filters.room_number}
                </span>
              )}
              {filters.type_id && (
                <span className="px-2 py-1 bg-blue-200 rounded text-xs">
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
      <Modal
        title="Редактировать оборудование"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedEquipment(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateEquipment}>
          <Form.Item
            label="Название"
            name="name"
            rules={[{ required: true, message: "Введите название!" }]}
          >
            <Input placeholder="Название оборудования" />
          </Form.Item>

          <Form.Item label="Описание" name="description">
            <Input.TextArea rows={3} placeholder="Описание оборудования" />
          </Form.Item>

          <Form.Item
            label="Статус"
            name="status"
            rules={[{ required: true, message: "Выберите статус!" }]}
          >
            <Select placeholder="Выберите статус">
              <Option value="NEW">Новое</Option>
              <Option value="WORKING">Работает</Option>
              <Option value="REPAIR">На ремонте</Option>
              <Option value="BROKEN">Сломано</Option>
              <Option value="DISPOSED">Утилизировано</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setSelectedEquipment(null);
                form.resetFields();
              }}
            >
              Отмена
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AddedPage;
