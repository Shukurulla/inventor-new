// 6. RepairsPage.jsx - Status fix with correct values
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
  Spin,
  Tag,
  Tabs,
  Tooltip,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiChevronRight,
  FiTrash2,
  FiEdit,
  FiTool,
  FiSettings,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiArchive,
  FiMapPin,
  FiSave,
} from "react-icons/fi";
import { equipmentAPI } from "../services/api";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import { getStatusConfig, getStatusText } from "../utils/statusUtils";

const { Panel } = Collapse;
const { Option } = Select;
const { TabPane } = Tabs;

const RepairsPage = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [activeTab, setActiveTab] = useState("repairs");
  const [form] = Form.useForm();
  const [statusForm] = Form.useForm();

  // Status o'zgartirish uchun yangi state'lar
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [savingStatuses, setSavingStatuses] = useState({});

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const response = await equipmentAPI.getMyEquipments();
      // Faqat remont va utilizatsiya kerak bo'lgan jihozlarni filter qilish
      const filteredData = response.data.filter(
        (item) =>
          item.status === "NEEDS_REPAIR" ||
          item.status === "REPAIR" ||
          item.status === "DISPOSED"
      );
      setEquipment(filteredData);

      // Har bir jihoz uchun joriy statusni selectedStatuses ga o'rnatish
      const initialStatuses = {};
      filteredData.forEach((item) => {
        initialStatuses[item.id] = item.status;
      });
      setSelectedStatuses(initialStatuses);
    } catch (error) {
      message.error("Ошибка при загрузке данных");
      console.error("Load equipment error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Equipment ni tab bo'yicha filtrlash
  const getFilteredEquipment = () => {
    switch (activeTab) {
      case "repairs":
        return equipment.filter(
          (item) => item.status === "NEEDS_REPAIR" || item.status === "REPAIR"
        );
      case "disposed":
        return equipment.filter((item) => item.status === "DISPOSED");
      default:
        return equipment;
    }
  };

  const groupEquipmentByType = () => {
    const filteredEquipment = getFilteredEquipment();
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

  // Status o'zgartirish funksiyasi
  const handleStatusChange = (equipmentId, newStatus) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [equipmentId]: newStatus,
    }));
  };

  // Status saqlash funksiyasi
  const handleSaveStatus = async (equipmentId) => {
    const newStatus = selectedStatuses[equipmentId];
    const currentEquipment = equipment.find((item) => item.id === equipmentId);

    if (newStatus === currentEquipment.status) {
      message.info("Статус не изменился");
      return;
    }

    setSavingStatuses((prev) => ({ ...prev, [equipmentId]: true }));

    try {
      await equipmentAPI.patchEquipment(equipmentId, {
        status: newStatus,
        type: currentEquipment.type_data?.id || currentEquipment.type,
      });

      const statusMessages = {
        WORKING: "Оборудование помечено как рабочее",
        DISPOSED: "Оборудование утилизировано",
        NEEDS_REPAIR: "Оборудование помечено как требующее ремонта",
        REPAIR: "Оборудование отправлено на ремонт",
        NEW: "Оборудование помечено как новое",
      };

      message.success(statusMessages[newStatus] || "Статус обновлен");

      // Update local state
      setEquipment((prev) =>
        prev.map((item) =>
          item.id === equipmentId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      message.error("Ошибка при обновлении статуса");
      console.error("Update status error:", error);
      // Xatolik bo'lsa, eski statusga qaytarish
      setSelectedStatuses((prev) => ({
        ...prev,
        [equipmentId]: currentEquipment.status,
      }));
    } finally {
      setSavingStatuses((prev) => ({ ...prev, [equipmentId]: false }));
    }
  };

  // Status variantlari - to'g'ri qiymatlar bilan
  const getStatusOptions = () => [
    { value: "NEW", label: "Новое" },
    { value: "WORKING", label: "Работает" },
    { value: "NEEDS_REPAIR", label: "Требуется ремонт" },
    { value: "REPAIR", label: "На ремонте" },
    { value: "DISPOSED", label: "Утилизировано" },
  ];

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    form.setFieldsValue({
      name: item.name || "",
      inn: item.inn || "",
      description: item.description || "",
      status: item.status || "NEEDS_REPAIR",
    });
    setEditModalVisible(true);
  };

  const handleStatusManagement = (item) => {
    setSelectedEquipment(item);
    statusForm.setFieldsValue({
      status: item.status,
      reason: "",
    });
    setStatusModalVisible(true);
  };

  const handleUpdateEquipment = async (values) => {
    try {
      await equipmentAPI.updateEquipment(selectedEquipment.id, {
        ...values,
        type: selectedEquipment.type_data?.id || selectedEquipment.type,
      });
      message.success("Оборудование успешно обновлено!");
      setEditModalVisible(false);
      setSelectedEquipment(null);
      form.resetFields();
      loadEquipment();
    } catch (error) {
      message.error("Ошибка при обновлении оборудования");
      console.error("Update equipment error:", error);
    }
  };

  const handleStatusUpdate = async (values) => {
    try {
      await equipmentAPI.patchEquipment(selectedEquipment.id, {
        status: values.status,
        reason: values.reason,
        type: selectedEquipment.type_data?.id || selectedEquipment.type,
      });
      message.success("Статус успешно обновлен!");
      setStatusModalVisible(false);
      setSelectedEquipment(null);
      statusForm.resetFields();
      loadEquipment();
    } catch (error) {
      message.error("Ошибка при обновлении статуса");
      console.error("Update status error:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await equipmentAPI.deleteEquipment(id);
      message.success("Оборудование успешно удалено!");
      loadEquipment();
    } catch (error) {
      message.error("Ошибка при удалении оборудования");
      console.error("Delete equipment error:", error);
    }
  };

  // Tez status o'zgartirish funksiyalari
  const handleQuickStatusChange = async (equipment, newStatus) => {
    try {
      await equipmentAPI.patchEquipment(equipment.id, {
        status: newStatus,
        type: equipment.type_data?.id || equipment.type,
      });

      const statusMessages = {
        WORKING: "Оборудование помечено как рабочее",
        REPAIR: "Оборудование отправлено на ремонт",
        DISPOSED: "Оборудование утилизировано",
        NEEDS_REPAIR: "Оборудование помечено как требующее ремонта",
      };

      message.success(statusMessages[newStatus] || "Статус обновлен");
      loadEquipment();
    } catch (error) {
      message.error("Ошибка при обновлении статуса");
    }
  };

  const renderEquipmentItem = (item) => {
    const statusConfig = getStatusConfig(item.status);
    const currentSelectedStatus = selectedStatuses[item.id];
    const hasStatusChanged = currentSelectedStatus !== item.status;
    const isSaving = savingStatuses[item.id];

    return (
      <div
        key={item.id}
        className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <EquipmentIcon type={item.type_data?.name} />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-800">{item.name}</h4>
              </div>
              <p className="mt-2 flex items-center gap-2">
                <FiMapPin />
                <span>
                  {item.room_data?.number && item.room_data?.name
                    ? `${item.room_data.number} - ${item.room_data.name}`
                    : "Комната не указана"}
                </span>
              </p>
            </div>
          </div>

          {/* Status o'zgartirish bo'limi */}
          <div className="flex items-center gap-2">
            <Select
              value={currentSelectedStatus}
              onChange={(value) => handleStatusChange(item.id, value)}
              style={{ width: 180 }}
              placeholder="Выберите статус"
            >
              {getStatusOptions().map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>

            {hasStatusChanged && (
              <Tooltip title="Сохранить изменения">
                <Button
                  type="primary"
                  icon={<FiSave />}
                  loading={isSaving}
                  onClick={() => handleSaveStatus(item.id)}
                  className="bg-[#4E38F2] border-[#4E38F2] hover:bg-[#3d2bc7]"
                  size="small"
                >
                  {isSaving ? "Сохранение..." : "Сохранить"}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderEquipmentList = () => {
    const groupedEquipment = groupEquipmentByType();

    if (Object.keys(groupedEquipment).length === 0) {
      const emptyMessage =
        activeTab === "repairs"
          ? "Нет оборудования, требующего ремонта"
          : "Нет утилизированного оборудования";

      return (
        <Empty
          description={emptyMessage}
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
        {Object.entries(groupedEquipment).map(([typeName, items]) => {
          // Status bo'yicha sanovni hisoblash
          const statusCounts = {};
          items.forEach((item) => {
            statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
          });

          const iconColor =
            activeTab === "repairs" ? "text-orange-600" : "text-gray-600";
          const bgColor =
            activeTab === "repairs" ? "bg-orange-100" : "bg-gray-100";

          return (
            <Panel
              key={typeName}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <EquipmentIcon type={typeName} className={iconColor} />
                    </div>
                    <span className="font-medium">{typeName}</span>
                  </div>
                  <div className="flex items-center space-x-2 mr-4">
                    {Object.entries(statusCounts).map(([status, count]) => {
                      const statusConfig = getStatusConfig(status);
                      return (
                        <Badge
                          key={status}
                          count={count}
                          style={{ backgroundColor: statusConfig.color }}
                          title={statusConfig.text}
                        />
                      );
                    })}
                  </div>
                </div>
              }
            >
              <div className="space-y-2">{items.map(renderEquipmentItem)}</div>
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  // Tab counts
  const repairCount = equipment.filter(
    (item) => item.status === "NEEDS_REPAIR" || item.status === "REPAIR"
  ).length;

  const disposedCount = equipment.filter(
    (item) => item.status === "DISPOSED"
  ).length;

  return (
    <div>
      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <span>Ремонт</span>
                {repairCount > 0 && (
                  <Badge
                    count={repairCount}
                    style={{ backgroundColor: "#fa8c16" }}
                  />
                )}
              </span>
            }
            key="repairs"
          />
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <span>Утилизированные</span>
                {disposedCount > 0 && (
                  <Badge
                    count={disposedCount}
                    style={{ backgroundColor: "#8c8c8c" }}
                  />
                )}
              </span>
            }
            key="disposed"
          />
        </Tabs>

        <Spin spinning={loading}>{renderEquipmentList()}</Spin>
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

          <Form.Item label="ИНН" name="inn">
            <Input placeholder="Инвентарный номер" />
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
              <Option value="NEEDS_REPAIR">Требуется ремонт</Option>
              <Option value="REPAIR">На ремонте</Option>
              <Option value="DISPOSED">Утилизировано</Option>
            </Select>
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setSelectedEquipment(null);
                form.resetFields();
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#4E38F2] border-[#4E38F2]"
            >
              Сохранить
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Status Management Modal */}
      <Modal
        title={`${selectedEquipment?.type_data?.name} - Управление состоянием`}
        visible={statusModalVisible}
        onCancel={() => {
          setStatusModalVisible(false);
          setSelectedEquipment(null);
          statusForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        {selectedEquipment && (
          <div className="mb-6">
            {/* Equipment Card */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <EquipmentIcon type={selectedEquipment.type_data?.name} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 text-lg">
                    {selectedEquipment.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    ИНН: {selectedEquipment.inn || "Не указан"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Комната: {selectedEquipment.room_data?.number} -{" "}
                    {selectedEquipment.room_data?.name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Текущий статус:</span>
                  <div className="mt-1">
                    <Tag
                      style={{
                        backgroundColor: getStatusConfig(
                          selectedEquipment.status
                        ).bgColor,
                        color: getStatusConfig(selectedEquipment.status).color,
                        border: `1px solid ${
                          getStatusConfig(selectedEquipment.status).borderColor
                        }`,
                      }}
                    >
                      {getStatusConfig(selectedEquipment.status).text}
                    </Tag>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Тип оборудования:</span>
                  <div className="mt-1 font-medium">
                    {selectedEquipment.type_data?.name}
                  </div>
                </div>
              </div>

              {selectedEquipment.description && (
                <div className="mt-3">
                  <span className="text-gray-600">Описание:</span>
                  <p className="mt-1 text-gray-800">
                    {selectedEquipment.description}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-3">
                Быстрые действия:
              </h5>
              <div className="flex flex-wrap gap-2">
                {selectedEquipment.status === "NEEDS_REPAIR" && (
                  <>
                    <Button
                      icon={<FiTool />}
                      onClick={() => {
                        handleQuickStatusChange(selectedEquipment, "REPAIR");
                        setStatusModalVisible(false);
                      }}
                      className="border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      Отправить на ремонт
                    </Button>
                    <Button
                      icon={<FiArchive />}
                      onClick={() => {
                        handleQuickStatusChange(selectedEquipment, "DISPOSED");
                        setStatusModalVisible(false);
                      }}
                      className="border-gray-500 text-gray-600 hover:bg-gray-50"
                    >
                      Утилизировать
                    </Button>
                  </>
                )}
                {selectedEquipment.status === "REPAIR" && (
                  <>
                    <Button
                      icon={<FiCheckCircle />}
                      onClick={() => {
                        handleQuickStatusChange(selectedEquipment, "WORKING");
                        setStatusModalVisible(false);
                      }}
                      className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                      Ремонт завершен
                    </Button>
                    <Button
                      icon={<FiXCircle />}
                      onClick={() => {
                        handleQuickStatusChange(selectedEquipment, "DISPOSED");
                        setStatusModalVisible(false);
                      }}
                      className="border-red-500 text-red-600 hover:bg-red-50"
                    >
                      Не подлежит ремонту
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <Form form={statusForm} layout="vertical" onFinish={handleStatusUpdate}>
          <Form.Item
            label="Новый статус"
            name="status"
            rules={[{ required: true, message: "Выберите новый статус!" }]}
          >
            <Select placeholder="Выберите новый статус" size="large">
              <Option value="NEW">Новое</Option>
              <Option value="WORKING">Работает</Option>
              <Option value="NEEDS_REPAIR">Требуется ремонт</Option>
              <Option value="REPAIR">На ремонте</Option>
              <Option value="DISPOSED">Утилизировано</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Причина изменения" name="reason">
            <Input.TextArea
              rows={3}
              placeholder="Укажите причину изменения статуса"
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setStatusModalVisible(false);
                setSelectedEquipment(null);
                statusForm.resetFields();
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#4E38F2] border-[#4E38F2]"
            >
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RepairsPage;
