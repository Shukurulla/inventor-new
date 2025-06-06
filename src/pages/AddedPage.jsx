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
  Popconfirm,
  Form,
  Input,
  Select,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronRight, FiTrash2, FiEdit } from "react-icons/fi";
import {
  getEquipment,
  updateEquipment,
  deleteEquipment,
  sendToRepair,
} from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";

const { Panel } = Collapse;
const { Option } = Select;

const AddedPage = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { equipment, loading } = useSelector((state) => state.equipment);

  useEffect(() => {
    dispatch(getEquipment());
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
    const grouped = {};
    equipment.forEach((item) => {
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
      room: equipment.room,
      contract: equipment.contract,
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
    } catch (error) {
      message.error("Ошибка при обновлении оборудования");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      message.success("Оборудование успешно удалено!");
    } catch (error) {
      message.error("Ошибка при удалении оборудования");
    }
  };

  const handleSendToRepair = async (id) => {
    try {
      await dispatch(sendToRepair(id)).unwrap();
      message.success("Оборудование отправлено на ремонт!");
    } catch (error) {
      message.error("Ошибка при отправке на ремонт");
    }
  };

  const handleStatusChange = async (equipmentId, newStatus) => {
    try {
      await dispatch(
        updateEquipment({
          id: equipmentId,
          data: { status: newStatus },
        })
      ).unwrap();

      message.success("Статус успешно изменен!");
    } catch (error) {
      message.error("Ошибка при изменении статуса");
    }
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
            {item.room_data?.name} - ИНН: {item.inn || "Не присвоен"} - ID:{" "}
            {item.id}
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
          <Popconfirm
            title="Удалить оборудование?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(item.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              danger
              icon={<FiTrash2 />}
              size="small"
              title="Удалить"
            />
          </Popconfirm>
        </Space>
      </div>
    </div>
  );

  const renderEquipmentList = () => {
    const groupedEquipment = groupEquipmentByType();

    if (Object.keys(groupedEquipment).length === 0) {
      return (
        <Empty
          description="Нет добавленного оборудования"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <div>
        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <Select placeholder="Блок" className="w-40" />
          <Select placeholder="Номер" className="w-40" />
          <Select placeholder="Тип оборудования" className="w-48" />
        </div>

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Добавленные</h1>
      </div>

      <Card className="shadow-sm">{renderEquipmentList()}</Card>

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
