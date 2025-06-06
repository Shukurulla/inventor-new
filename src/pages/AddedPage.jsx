import React, { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Collapse,
  Button,
  Badge,
  Empty,
  Modal,
  Form,
  Select,
  message,
  Popconfirm,
  Tag,
  Space,
  Input,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit, FiTrash2, FiChevronRight, FiTool } from "react-icons/fi";
import {
  getEquipment,
  updateEquipment,
  deleteEquipment,
  sendToRepair,
} from "../store/slices/equipmentSlice";
import { getAllSpecifications } from "../store/slices/specificationSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import CreateSpecificationForm from "../components/Equipment/CreateSpecificationForm";

const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

const AddedPage = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [createSpecModalVisible, setCreateSpecModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [specForm] = Form.useForm();

  const dispatch = useDispatch();
  const { equipment, loading } = useSelector((state) => state.equipment);
  const specifications = useSelector((state) => state.specifications);
  console.log(equipment);

  useEffect(() => {
    dispatch(getEquipment());
    dispatch(getAllSpecifications());
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
        <EquipmentIcon type={item.type_data?.name} className="text-xl" />
        <div className="flex-1">
          <div className="font-medium text-gray-800">{item.name}</div>
          <div className="text-sm text-gray-500 mt-1">
            ИНН: {item.inn || "Не присвоен"} | Кабинет: {item.room_data?.number}{" "}
            | ID: {item.id}
          </div>
          {item.description && (
            <div className="text-sm text-gray-400 mt-1">{item.description}</div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Select
          value={item.status}
          onChange={(value) => handleStatusChange(item.id, value)}
          className="w-32"
          size="small"
        >
          <Option value="NEW">Новое</Option>
          <Option value="WORKING">Работает</Option>
          <Option value="REPAIR">На ремонте</Option>
          <Option value="BROKEN">Сломано</Option>
          <Option value="DISPOSED">Утилизировано</Option>
        </Select>

        <Tag color={getStatusColor(item.status)}>
          {getStatusText(item.status)}
        </Tag>

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
            icon={<FiTool />}
            onClick={() => handleSendToRepair(item.id)}
            size="small"
            title="Отправить на ремонт"
            disabled={item.status === "REPAIR"}
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
                  <EquipmentIcon type={typeName} />
                  <span className="font-medium">{typeName}</span>
                </div>
                <Badge count={items.length} showZero className="mr-4" />
              </div>
            }
          >
            <div className="space-y-2">{items.map(renderEquipmentItem)}</div>
          </Panel>
        ))}
      </Collapse>
    );
  };

  const renderStatusManagement = () => {
    const statusCounts = equipment.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card key={status} className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {count}
              </div>
              <Tag color={getStatusColor(status)} className="mb-0">
                {getStatusText(status)}
              </Tag>
            </Card>
          ))}
        </div>

        <Card title="Управление статусом" className="mt-6">
          <p className="text-gray-600 mb-4">
            Вы можете изменять статус оборудования непосредственно в списке
            оборудования
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Tag color="green">Новое</Tag>
              <span className="text-sm text-gray-600">
                Недавно добавленное оборудование
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="blue">Работает</Tag>
              <span className="text-sm text-gray-600">
                Оборудование в рабочем состоянии
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="orange">На ремонте</Tag>
              <span className="text-sm text-gray-600">Требуется ремонт</span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="red">Сломано</Tag>
              <span className="text-sm text-gray-600">
                Неисправное оборудование
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Tag color="default">Утилизировано</Tag>
              <span className="text-sm text-gray-600">
                Списанное оборудование
              </span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Добавленные</h1>
        <p className="text-gray-600">
          Просмотр и управление добавленным оборудованием
        </p>
      </div>

      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "list",
              label: "Список оборудования",
              children: renderEquipmentList(),
            },
            {
              key: "status",
              label: "Управление статусом",
              children: renderStatusManagement(),
            },
          ]}
        />
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
