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
  getEquipment,
  updateEquipment,
  deleteEquipment,
  sendToRepair,
} from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";

const { Panel } = Collapse;
const { Option } = Select;

const RepairsPage = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { equipment, loading } = useSelector((state) => state.equipment);

  useEffect(() => {
    // Загружаем только оборудование, требующее ремонта
    dispatch(getEquipment({ status: "NEEDS_REPAIR" }));
    console.log(equipment);
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
      BROKEN: "Требует ремонта",
      DISPOSED: "Утилизировано",
    };
    return statusTexts[status] || status;
  };

  const groupEquipmentByType = () => {
    // Фильтруем только оборудование со статусом BROKEN (требует ремонта)
    const brokenEquipment = equipment.filter(
      (item) => item.status === "BROKEN"
    );
    const grouped = {};

    brokenEquipment.forEach((item) => {
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
      dispatch(getEquipment({ status: "BROKEN" }));
    } catch (error) {
      message.error("Ошибка при обновлении оборудования");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteEquipment(id)).unwrap();
      message.success("Оборудование успешно удалено!");
      dispatch(getEquipment({ status: "BROKEN" }));
    } catch (error) {
      message.error("Ошибка при удалении оборудования");
    }
  };

  const handleSendToRepair = async (id) => {
    try {
      await dispatch(sendToRepair(id)).unwrap();
      message.success("Оборудование отправлено на ремонт!");
      dispatch(getEquipment({ status: "BROKEN" }));
    } catch (error) {
      message.error("Ошибка при отправке на ремонт");
    }
  };

  const renderEquipmentItem = (item) => (
    <div
      key={item.id}
      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
          <EquipmentIcon type={item.type_data?.name} className="text-red-600" />
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
            type="primary"
            icon={<FiTool />}
            onClick={() => handleSendToRepair(item.id)}
            size="small"
            title="Отправить на ремонт"
          >
            На ремонт
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Ремонт оборудования
        </h1>
        <p className="text-gray-600">Оборудование, требующее ремонта</p>
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

export default RepairsPage;
