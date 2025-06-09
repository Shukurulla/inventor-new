// RepairsPage.jsx - Fixed version with proper equipment type handling
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
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [savingStatuses, setSavingStatuses] = useState({});

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const response = await equipmentAPI.getMyEquipments();
      const filteredData = response.data.filter(
        (item) =>
          item.status === "NEEDS_REPAIR" ||
          item.status === "REPAIR" ||
          item.status === "DISPOSED"
      );
      setEquipment(filteredData);
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

  // Enhanced function to prepare equipment data for all types
  const prepareEquipmentData = (equipment) => {
    const typeName = equipment.type_data?.name?.toLowerCase() || "";
    let equipmentData = {
      name: equipment.name || "",
      description: equipment.description || "",
      inn: equipment.inn || 0,
      serial_number: equipment.serial_number || "N/A",
      type: equipment.type_data?.id || equipment.type,
    };

    // Handle specific equipment types based on their names
    if (typeName.includes("принтер") || typeName.includes("printer")) {
      equipmentData = {
        ...equipmentData,
        printer_char: equipment.printer_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          type: "Laser",
        },
        printer_specification_id: equipment.printer_specification_id || null,
      };
    } else if (
      typeName.includes("компьютер") ||
      typeName.includes("computer")
    ) {
      equipmentData = {
        ...equipmentData,
        computer_details: equipment.computer_details || {
          cpu: equipment.cpu || "Unknown CPU",
          ram: equipment.ram || "Unknown RAM",
          storage: equipment.storage || "Unknown Storage",
          has_mouse: equipment.has_mouse || false,
          has_keyboard: equipment.has_keyboard || false,
        },
        computer_specification_id: equipment.computer_specification_id || null,
      };
    } else if (typeName.includes("ноутбук") || typeName.includes("notebook")) {
      equipmentData = {
        ...equipmentData,
        notebook_char: equipment.notebook_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          cpu: equipment.cpu || "Unknown CPU",
          ram: equipment.ram || "Unknown RAM",
          storage: equipment.storage || "Unknown Storage",
          screen_size:
            equipment.screen_size || equipment.monitor_size || "Unknown",
        },
        notebook_specification_id: equipment.notebook_specification_id || null,
      };
    } else if (typeName.includes("моноблок") || typeName.includes("monoblok")) {
      equipmentData = {
        ...equipmentData,
        monoblok_char: equipment.monoblok_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          cpu: equipment.cpu || "Unknown CPU",
          ram: equipment.ram || "Unknown RAM",
          storage: equipment.storage || "Unknown Storage",
          screen_size:
            equipment.screen_size || equipment.monitor_size || "Unknown",
        },
        monoblok_specification_id: equipment.monoblok_specification_id || null,
      };
    } else if (
      typeName.includes("проектор") ||
      typeName.includes("projector")
    ) {
      equipmentData = {
        ...equipmentData,
        projector_char: equipment.projector_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          lumens: equipment.lumens || "Unknown",
          resolution: equipment.resolution || "Unknown",
        },
        projector_specification_id:
          equipment.projector_specification_id || null,
      };
    } else if (typeName.includes("телевизор") || typeName.includes("tv")) {
      equipmentData = {
        ...equipmentData,
        tv_char: equipment.tv_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          screen_size: equipment.screen_size || "Unknown",
          resolution: equipment.resolution || "Unknown",
        },
        tv_specification_id: equipment.tv_specification_id || null,
      };
    } else if (typeName.includes("роутер") || typeName.includes("router")) {
      equipmentData = {
        ...equipmentData,
        router_char: equipment.router_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          ports: equipment.ports || "Unknown",
          wifi_standart: equipment.wifi_standart || "Unknown",
        },
        router_specification_id: equipment.router_specification_id || null,
      };
    } else if (typeName.includes("монитор") || typeName.includes("monitor")) {
      equipmentData = {
        ...equipmentData,
        monitor_char: equipment.monitor_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          screen_size: equipment.screen_size || "Unknown",
          resolution: equipment.resolution || "Unknown",
          panel_type: equipment.panel_type || "Unknown",
        },
        monitor_specification_id: equipment.monitor_specification_id || null,
      };
    } else if (typeName.includes("доска") || typeName.includes("whiteboard")) {
      equipmentData = {
        ...equipmentData,
        whiteboard_char: equipment.whiteboard_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          screen_size: equipment.screen_size || "Unknown",
          touch_type: equipment.touch_type || "Unknown",
        },
        whiteboard_specification_id:
          equipment.whiteboard_specification_id || null,
      };
    } else if (
      typeName.includes("удлинитель") ||
      typeName.includes("extender")
    ) {
      equipmentData = {
        ...equipmentData,
        extender_char: equipment.extender_char || {
          model: equipment.model || "Unknown",
          serial_number: equipment.serial_number || "N/A",
          ports: equipment.ports || "Unknown",
          length: equipment.length || "Unknown",
        },
        extender_specification_id: equipment.extender_specification_id || null,
      };
    }

    return equipmentData;
  };

  const handleStatusChange = (equipmentId, newStatus) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [equipmentId]: newStatus,
    }));
  };

  const handleSaveStatus = async (equipmentId) => {
    const newStatus = selectedStatuses[equipmentId];
    const currentEquipment = equipment.find((item) => item.id === equipmentId);

    if (newStatus === currentEquipment.status) {
      message.info("Статус не изменился");
      return;
    }

    setSavingStatuses((prev) => ({ ...prev, [equipmentId]: true }));

    try {
      const equipmentData = prepareEquipmentData(currentEquipment);
      const updateData = {
        ...equipmentData,
        status: newStatus,
      };

      await equipmentAPI.patchEquipment(equipmentId, updateData);

      const statusMessages = {
        WORKING: "Оборудование помечено как рабочее",
        DISPOSED: "Оборудование утилизировано",
        NEEDS_REPAIR: "Оборудование помечено как требующее ремонта",
        REPAIR: "Оборудование отправлено на ремонт",
        NEW: "Оборудование помечено как новое",
      };

      message.success(statusMessages[newStatus] || "Статус обновлен");

      setEquipment((prev) =>
        prev.map((item) =>
          item.id === equipmentId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      message.error("Ошибка при обновлении статуса");
      console.error("Update status error:", error);
      setSelectedStatuses((prev) => ({
        ...prev,
        [equipmentId]: currentEquipment.status,
      }));
    } finally {
      setSavingStatuses((prev) => ({ ...prev, [equipmentId]: false }));
    }
  };

  const getStatusOptions = () => [
    { value: "NEW", label: "Новое" },
    { value: "WORKING", label: "Работает" },
    { value: "NEEDS_REPAIR", label: "Требуется ремонт" },
    { value: "DISPOSED", label: "Утилизировано" },
  ];

  const handleEdit = (item) => {
    setSelectedEquipment(item);
    form.setFieldsValue({
      name: item.name || "",
      inn: item.inn || "",
      description: item.description || "",
      status: item.status || "NEEDS_REPAIR",
      serial_number: item.serial_number || "",
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
      const equipmentData = prepareEquipmentData(selectedEquipment);

      const updateData = {
        ...equipmentData,
        ...values,
      };

      await equipmentAPI.updateEquipment(selectedEquipment.id, updateData);
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
      const equipmentData = prepareEquipmentData(selectedEquipment);

      const updateData = {
        ...equipmentData,
        status: values.status,
        reason: values.reason,
      };

      await equipmentAPI.patchEquipment(selectedEquipment.id, updateData);
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

  const handleQuickStatusChange = async (equipment, newStatus) => {
    try {
      const equipmentData = prepareEquipmentData(equipment);

      const updateData = {
        ...equipmentData,
        status: newStatus,
      };

      await equipmentAPI.patchEquipment(equipment.id, updateData);

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
      console.error("Quick status change error:", error);
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
                <Tag size="small" color="blue">
                  {item.type_data?.name}
                </Tag>
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

      {/* Edit Modal */}
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

          <Form.Item
            label="Серийный номер"
            name="serial_number"
            rules={[{ required: true, message: "Введите серийный номер!" }]}
          >
            <Input placeholder="Серийный номер" />
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
              Сохранить изменения
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RepairsPage;
