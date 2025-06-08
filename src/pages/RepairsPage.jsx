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
import { FiChevronRight, FiTrash2, FiEdit, FiTool } from "react-icons/fi";
import {
  getFilteredEquipment,
  updateEquipment,
  deleteEquipment,
  sendToRepair,
  getEquipmentTypes,
} from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";

const { Panel } = Collapse;
const { Option } = Select;

const RepairsPage = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const {
    filteredEquipment = [],
    equipmentTypes = [],
    loading,
  } = useSelector((state) => state.equipment);

  useEffect(() => {
    const loadRepairEquipment = async () => {
      try {
        // Загрузка оборудования, требующего ремонта
        await dispatch(
          getFilteredEquipment({ status: "NEEDS_REPAIR" })
        ).unwrap();
        await dispatch(getEquipmentTypes()).unwrap();
      } catch (error) {
        console.error("Ошибка при загрузке оборудования для ремонта:", error);
        message.error("Произошла ошибка при загрузке данных");
      }
    };

    loadRepairEquipment();
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
      REPAIR: "В ремонте",
      BROKEN: "Требует ремонта",
      DISPOSED: "Утилизировано",
    };
    return statusTexts[status] || status;
  };

  const groupEquipmentByType = () => {
    // Фильтрация только сломанного оборудования
    const brokenEquipment = Array.isArray(filteredEquipment)
      ? filteredEquipment.filter((item) => item.status === "BROKEN")
      : [];

    const grouped = {};

    brokenEquipment.forEach((item) => {
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
      // Обновление списка
      dispatch(getFilteredEquipment({ status: "BROKEN" }));
    } catch (error) {
      console.error("Ошибка при обновлении оборудования:", error);
      message.error("Произошла ошибка при обновлении оборудования");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      message.success("Оборудование успешно удалено!");
      // Обновление списка
      dispatch(getFilteredEquipment({ status: "BROKEN" }));
    } catch (error) {
      console.error("Ошибка при удалении оборудования:", error);
      message.error("Произошла ошибка при удалении оборудования");
    }
  };

  const handleSendToRepair = async (id) => {
    try {
      await dispatch(sendToRepair(id)).unwrap();
      message.success("Оборудование отправлено в ремонт!");
      // Обновление списка
      dispatch(getFilteredEquipment({ status: "BROKEN" }));
    } catch (error) {
      console.error("Ошибка при отправке в ремонт:", error);
      message.error("Произошла ошибка при отправке в ремонт");
    }
  };

  const renderEquipmentItem = (item) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <EquipmentIcon
            type={
              item.type_data?.name ||
              equipmentTypes.find((t) => t.id === item.type)?.name
            }
            className="text-red-600"
          />
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">{item.name}</div>
          <div className="text-sm text-gray-500 mt-1">
            {item.room_data?.number} - {item.room_data?.name} | ИНН:{" "}
            {item.inn || "Не указан"} | ID: {item.id}
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
            type="primary"
            icon={<FiTool />}
            onClick={() => handleSendToRepair(item.id)}
            size="small"
            title="Отправить в ремонт"
          >
            В ремонт
          </Button>
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
      return (
        <Empty
          description="Нет оборудования, требующего ремонта"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
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
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <EquipmentIcon type={typeName} className="text-red-600" />
                  </div>
                  <span className="font-medium">{typeName}</span>
                </div>
                <Badge
                  count={items.length}
                  style={{ backgroundColor: "#ef4444" }}
                  className="mr-4"
                />
              </div>
            }
          >
            <div className="space-y-2">{items.map(renderEquipmentItem)}</div>
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <div>
      <Card className="shadow-sm">{renderEquipmentList()}</Card>

      {/* Модальное окно редактирования оборудования */}
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
            label="Состояние"
            name="status"
            rules={[{ required: true, message: "Выберите состояние!" }]}
          >
            <Select placeholder="Выберите состояние">
              <Option value="NEW">Новое</Option>
              <Option value="WORKING">Работает</Option>
              <Option value="REPAIR">В ремонте</Option>
              <Option value="BROKEN">Требует ремонта</Option>
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
              Отменить
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

export default RepairsPage;
