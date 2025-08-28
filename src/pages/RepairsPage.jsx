// RepairsPage.jsx - Fixed version with pagination inside each accordion
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
  Pagination,
} from "antd";
import { FiChevronRight, FiMapPin, FiSave } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { equipmentAPI } from "../services/api";
import { getMyEquipments } from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import { getStatusConfig } from "../utils/statusUtils";

const { Panel } = Collapse;
const { Option } = Select;
const { TabPane } = Tabs;

const RepairsPage = () => {
  const dispatch = useDispatch();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [activeTab, setActiveTab] = useState("repairs");
  const [form] = Form.useForm();
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [savingStatuses, setSavingStatuses] = useState({});
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await authAPI.getProfile();
      setUser(data);

      return data;
    };
    fetchUser();
  }, []);

  // Pagination states - har bir equipment type uchun alohida pagination
  const [paginationStates, setPaginationStates] = useState({});
  const pageSize = 5; // Har bir accordion uchun 5 ta item

  // OPTIMIZED: Use data from Redux store instead of separate API calls
  const { myEquipments = [], loading } = useSelector(
    (state) => state.equipment
  );

  // OPTIMIZED: Filter equipment from Redux store instead of loading separately
  useEffect(() => {
    const filtered = myEquipments.filter(
      (item) =>
        item.status === "NEEDS_REPAIR" ||
        item.status === "REPAIR" ||
        item.status === "DISPOSED"
    );
    setFilteredEquipment(filtered);

    // Initialize status states
    const initialStatuses = {};
    filtered.forEach((item) => {
      initialStatuses[item.id] = item.status;
    });
    setSelectedStatuses(initialStatuses);

    // Initialize pagination states for each equipment type
    const groupedEquipment = {};
    filtered.forEach((item) => {
      const typeName = item.type_data?.name || "Неизвестный тип";
      if (!groupedEquipment[typeName]) {
        groupedEquipment[typeName] = [];
      }
      groupedEquipment[typeName].push(item);
    });

    const initialPaginationStates = {};
    Object.keys(groupedEquipment).forEach((typeName) => {
      initialPaginationStates[typeName] = {
        currentPage: 1,
        pageSize: pageSize,
      };
    });
    setPaginationStates(initialPaginationStates);
  }, [myEquipments]);

  const getFilteredEquipment = () => {
    switch (activeTab) {
      case "repairs":
        return filteredEquipment.filter(
          (item) => item.status === "NEEDS_REPAIR" || item.status === "REPAIR"
        );
      case "disposed":
        return filteredEquipment.filter((item) => item.status === "DISPOSED");
      default:
        return filteredEquipment;
    }
  };

  const groupEquipmentByType = () => {
    const equipment = getFilteredEquipment();
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

  // Handle pagination change for specific equipment type
  const handlePageChange = (typeName, page) => {
    setPaginationStates((prev) => ({
      ...prev,
      [typeName]: {
        ...prev[typeName],
        currentPage: page,
      },
    }));
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    // Reset pagination for all types when tab changes
    const newPaginationStates = {};
    Object.keys(paginationStates).forEach((typeName) => {
      newPaginationStates[typeName] = {
        ...paginationStates[typeName],
        currentPage: 1,
      };
    });
    setPaginationStates(newPaginationStates);
  };

  // Get paginated items for specific equipment type
  const getPaginatedItemsForType = (typeName, items) => {
    const paginationState = paginationStates[typeName] || {
      currentPage: 1,
      pageSize: pageSize,
    };
    const startIndex = (paginationState.currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  };

  // FIXED: Enhanced function to prepare equipment data consistently for all types
  const prepareEquipmentData = (equipment) => {
    const typeName = equipment.type_data?.name?.toLowerCase() || "";
    let equipmentData = {
      name: equipment.name || "",
      description: equipment.description || "",
      inn: equipment.inn || 0,
      serial_number: equipment.serial_number || "N/A",
      type: equipment.type_data?.id || equipment.type,
    };

    // Handle specific equipment types based on their names - PRESERVE EXISTING DATA
    if (typeName.includes("принтер") || typeName.includes("printer")) {
      equipmentData = {
        ...equipmentData,
        printer_char: equipment.printer_char ||
          equipment.printer_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            type: "Laser",
            color: equipment.color || false,
            duplex: equipment.duplex || false,
          },
        printer_specification_id: equipment.printer_specification_id || null,
      };
    } else if (
      typeName.includes("компьютер") ||
      typeName.includes("computer")
    ) {
      // FIXED: Use existing computer_details if available, otherwise create from equipment data
      equipmentData = {
        ...equipmentData,
        computer_details: equipment.computer_details ||
          equipment.computer_specification_data || {
            cpu: equipment.cpu || "Unknown CPU",
            ram: equipment.ram || "Unknown RAM",
            storage: equipment.storage || "Unknown Storage",
            has_mouse:
              equipment.has_mouse !== undefined ? equipment.has_mouse : false,
            has_keyboard:
              equipment.has_keyboard !== undefined
                ? equipment.has_keyboard
                : false,
            monitor_size: equipment.monitor_size || "Unknown",
          },
        computer_specification_id: equipment.computer_specification_id || null,
      };
    } else if (typeName.includes("ноутбук") || typeName.includes("notebook")) {
      // FIXED: Use existing notebook_char if available
      equipmentData = {
        ...equipmentData,
        notebook_char: equipment.notebook_char ||
          equipment.notebook_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            cpu: equipment.cpu || "Unknown CPU",
            ram: equipment.ram || "Unknown RAM",
            storage: equipment.storage || "Unknown Storage",
            screen_size:
              equipment.screen_size || equipment.monitor_size || "Unknown",
            has_mouse:
              equipment.has_mouse !== undefined ? equipment.has_mouse : false,
            has_keyboard:
              equipment.has_keyboard !== undefined
                ? equipment.has_keyboard
                : false,
          },
        notebook_specification_id: equipment.notebook_specification_id || null,
      };
    } else if (typeName.includes("моноблок") || typeName.includes("monoblok")) {
      // FIXED: Use existing monoblok_char if available
      equipmentData = {
        ...equipmentData,
        monoblok_char: equipment.monoblok_char ||
          equipment.monoblok_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            cpu: equipment.cpu || "Unknown CPU",
            ram: equipment.ram || "Unknown RAM",
            storage: equipment.storage || "Unknown Storage",
            screen_size:
              equipment.screen_size || equipment.monitor_size || "Unknown",
            has_mouse:
              equipment.has_mouse !== undefined ? equipment.has_mouse : false,
            has_keyboard:
              equipment.has_keyboard !== undefined
                ? equipment.has_keyboard
                : false,
          },
        monoblok_specification_id: equipment.monoblok_specification_id || null,
      };
    } else if (
      typeName.includes("проектор") ||
      typeName.includes("projector")
    ) {
      equipmentData = {
        ...equipmentData,
        projector_char: equipment.projector_char ||
          equipment.projector_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            lumens: equipment?.lumens || "Unknown",
            resolution: equipment.resolution || "Unknown",
            throw_type: equipment.throw_type || "standard",
          },
        projector_specification_id:
          equipment.projector_specification_id || null,
      };
    } else if (typeName.includes("телевизор") || typeName.includes("tv")) {
      equipmentData = {
        ...equipmentData,
        tv_char: equipment.tv_char ||
          equipment.tv_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            screen_size: equipment.screen_size || "Unknown",
            resolution: equipment.resolution || "Unknown",
            panel_type: equipment.panel_type || "Unknown",
          },
        tv_specification_id: equipment.tv_specification_id || null,
      };
    } else if (typeName.includes("роутер") || typeName.includes("router")) {
      equipmentData = {
        ...equipmentData,
        router_char: equipment.router_char ||
          equipment.router_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            ports: equipment.ports || "Unknown",
            wifi_standart: equipment.wifi_standart || "Unknown",
          },
        router_specification_id: equipment.router_specification_id || null,
      };
    } else if (typeName.includes("монитор") || typeName.includes("monitor")) {
      equipmentData = {
        ...equipmentData,
        monitor_char: equipment.monitor_char ||
          equipment.monitor_specification_data || {
            model: equipment?.model || "Unknown",
            serial_number: equipment.serial_number || "N/A",
            screen_size: equipment.screen_size || "Unknown",
            resolution: equipment.resolution || "Unknown",
            panel_type: equipment.panel_type || "Unknown",
            refresh_rate: equipment.refresh_rate || "60",
          },
        monitor_specification_id: equipment.monitor_specification_id || null,
      };
    } else if (typeName.includes("доска") || typeName.includes("whiteboard")) {
      equipmentData = {
        ...equipmentData,
        whiteboard_char: equipment.whiteboard_char ||
          equipment.whiteboard_specification_data || {
            model: equipment?.model || "Unknown",
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
        extender_char: equipment.extender_char ||
          equipment.extender_specification_data || {
            model: equipment?.model || "Unknown",
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
    const currentEquipment = filteredEquipment.find(
      (item) => item.id === equipmentId
    );

    if (newStatus === currentEquipment.status) {
      message.info("Статус не изменился");
      return;
    }

    setSavingStatuses((prev) => ({ ...prev, [equipmentId]: true }));

    try {
      const equipmentData = prepareEquipmentData(currentEquipment);
      const updateData = {
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

      // OPTIMIZED: Refresh data using Redux action
      dispatch(getMyEquipments());
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

  const handleUpdateEquipment = async (values) => {
    try {
      const equipmentData = prepareEquipmentData(selectedEquipment);

      const updateData = {
        ...values,
      };

      await equipmentAPI.updateEquipment(selectedEquipment.id, updateData);
      message.success("Оборудование успешно обновлено!");
      setEditModalVisible(false);
      setSelectedEquipment(null);
      form.resetFields();
      // OPTIMIZED: Refresh data using Redux action
      dispatch(getMyEquipments());
    } catch (error) {
      message.error("Ошибка при обновлении оборудования");
      console.error("Update equipment error:", error);
    }
  };

  const renderEquipmentItem = (item) => {
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
          {user?.role && user.role !== "user" ? (
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
          ) : (
            ""
          )}
        </div>
      </div>
    );
  };

  const renderEquipmentList = () => {
    const groupedData = groupEquipmentByType();

    if (Object.keys(groupedData).length === 0) {
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
      <div>
        <Collapse
          expandIcon={({ isActive }) => (
            <FiChevronRight
              className={`transition-transform ${isActive ? "rotate-90" : ""}`}
            />
          )}
          className="space-y-2"
        >
          {Object.entries(groupedData).map(([typeName, items]) => {
            const statusCounts = {};
            items.forEach((item) => {
              statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
            });

            const iconColor =
              activeTab === "repairs" ? "text-orange-600" : "text-gray-600";
            const bgColor =
              activeTab === "repairs" ? "bg-orange-100" : "bg-gray-100";

            // Get paginated items for this type
            const paginatedItems = getPaginatedItemsForType(typeName, items);
            const currentPage = paginationStates[typeName]?.currentPage || 1;
            const totalItems = items.length;

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
                <div className="space-y-3">
                  {/* Equipment items */}
                  <div className="space-y-2">
                    {paginatedItems.map(renderEquipmentItem)}
                  </div>

                  {/* Pagination for this equipment type */}
                  {totalItems > pageSize && (
                    <div className="flex justify-center pt-4 border-t border-gray-100">
                      <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={totalItems}
                        onChange={(page) => handlePageChange(typeName, page)}
                        showSizeChanger={false}
                        showQuickJumper={false}
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} из ${total} единиц`
                        }
                        className="custom-pagination"
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

  const repairCount = filteredEquipment.filter(
    (item) => item.status === "NEEDS_REPAIR" || item.status === "REPAIR"
  ).length;

  const disposedCount = filteredEquipment.filter(
    (item) => item.status === "DISPOSED"
  ).length;

  return (
    <div>
      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={handleTabChange} className="mb-4">
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
