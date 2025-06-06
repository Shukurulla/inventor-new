import React, { useEffect, useState } from "react";
import {
  Card,
  Collapse,
  Button,
  Badge,
  Empty,
  Tag,
  Space,
  Modal,
  message,
  Popconfirm,
  Form,
  Input,
  Select,
  DatePicker,
  Table,
  Tabs,
  Tooltip,
  Progress,
  Statistic,
  Row,
  Col,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiChevronRight,
  FiCheck,
  FiX,
  FiTool,
  FiTrash2,
  FiClock,
  FiAlertTriangle,
  FiSettings,
  FiActivity,
  FiBarChart,
} from "react-icons/fi";
import {
  getRepairs,
  completeRepair,
  failRepair,
  getDisposals,
  disposeEquipment,
} from "../store/slices/repairSlice";
import {
  getEquipment,
  sendToRepair,
  updateEquipment,
} from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.locale("ru");

const { Panel } = Collapse;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

const RepairsPage = () => {
  const [activeTab, setActiveTab] = useState("repairs");
  const [disposeModalVisible, setDisposeModalVisible] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [repairHistoryVisible, setRepairHistoryVisible] = useState(false);
  const [disposeForm] = Form.useForm();

  const dispatch = useDispatch();
  const { repairs, disposals, loading } = useSelector((state) => state.repairs);
  const { equipment } = useSelector((state) => state.equipment);

  useEffect(() => {
    dispatch(getRepairs());
    dispatch(getDisposals());
    dispatch(getEquipment({ status: "REPAIR" }));
  }, [dispatch]);

  // Группировка оборудования на ремонте по типам
  const getRepairEquipmentByType = () => {
    const repairEquipment = equipment.filter(
      (item) => item.status === "REPAIR"
    );
    const grouped = {};

    repairEquipment.forEach((item) => {
      const typeName = item.type_data?.name || "Неизвестный тип";
      if (!grouped[typeName]) {
        grouped[typeName] = [];
      }
      grouped[typeName].push(item);
    });

    return grouped;
  };

  // Статистика ремонтов
  const getRepairStats = () => {
    const repairEquipment = equipment.filter(
      (item) => item.status === "REPAIR"
    );
    const totalRepairs = repairEquipment.length;
    const completedRepairs = repairs.filter(
      (repair) => repair.status === "COMPLETED"
    ).length;
    const failedRepairs = repairs.filter(
      (repair) => repair.status === "FAILED"
    ).length;
    const inProgress = repairs.filter(
      (repair) => repair.status === "IN_PROGRESS"
    ).length;

    // Средний срок ремонта
    const completedWithDuration = repairs
      .filter(
        (repair) =>
          repair.status === "COMPLETED" &&
          repair.started_at &&
          repair.completed_at
      )
      .map((repair) => {
        const start = dayjs(repair.started_at);
        const end = dayjs(repair.completed_at);
        return end.diff(start, "day");
      });

    const avgRepairTime =
      completedWithDuration.length > 0
        ? Math.round(
            completedWithDuration.reduce((a, b) => a + b, 0) /
              completedWithDuration.length
          )
        : 0;

    return {
      totalRepairs,
      completedRepairs,
      failedRepairs,
      inProgress,
      avgRepairTime,
      successRate:
        totalRepairs > 0
          ? Math.round(
              (completedRepairs / (completedRepairs + failedRepairs)) * 100
            )
          : 0,
    };
  };

  const handleCompleteRepair = async (equipmentId) => {
    try {
      await dispatch(completeRepair(equipmentId)).unwrap();
      message.success("Ремонт успешно завершен!");
      // Обновляем статус оборудования на "WORKING"
      await dispatch(
        updateEquipment({
          id: equipmentId,
          data: { status: "WORKING" },
        })
      );
      dispatch(getEquipment({ status: "REPAIR" }));
      dispatch(getRepairs());
    } catch (error) {
      message.error("Ошибка при завершении ремонта");
    }
  };

  const handleFailRepair = async (equipmentId) => {
    try {
      await dispatch(failRepair(equipmentId)).unwrap();
      message.success("Ремонт отмечен как неуспешный");
      // Обновляем статус оборудования на "BROKEN"
      await dispatch(
        updateEquipment({
          id: equipmentId,
          data: { status: "BROKEN" },
        })
      );
      dispatch(getEquipment({ status: "REPAIR" }));
      dispatch(getRepairs());
    } catch (error) {
      message.error("Ошибка при отметке ремонта как неуспешного");
    }
  };

  const handleSendToRepair = async (equipmentId) => {
    try {
      await dispatch(sendToRepair(equipmentId)).unwrap();
      message.success("Оборудование отправлено на ремонт!");
      dispatch(getEquipment({ status: "REPAIR" }));
      dispatch(getRepairs());
    } catch (error) {
      message.error("Ошибка при отправке на ремонт");
    }
  };

  const handleDisposeEquipment = async (values) => {
    try {
      await dispatch(
        disposeEquipment({
          id: selectedEquipment.id,
          data: values,
        })
      ).unwrap();

      message.success("Оборудование успешно утилизировано!");
      setDisposeModalVisible(false);
      setSelectedEquipment(null);
      disposeForm.resetFields();
      dispatch(getDisposals());
      dispatch(getEquipment({ status: "REPAIR" }));
    } catch (error) {
      message.error("Ошибка при утилизации оборудования");
    }
  };

  const openDisposeModal = (equipment) => {
    setSelectedEquipment(equipment);
    setDisposeModalVisible(true);
  };

  const getRepairDuration = (startDate) => {
    if (!startDate) return "Не указано";
    const duration = dayjs().diff(dayjs(startDate), "day");
    return `${duration} дн.`;
  };

  const getRepairPriority = (equipment) => {
    const createdDate = dayjs(equipment.created_at);
    const daysInRepair = dayjs().diff(createdDate, "day");

    if (daysInRepair > 30)
      return { color: "red", text: "Критично", level: "high" };
    if (daysInRepair > 14)
      return { color: "orange", text: "Высокий", level: "medium" };
    if (daysInRepair > 7)
      return { color: "yellow", text: "Средний", level: "normal" };
    return { color: "green", text: "Низкий", level: "low" };
  };

  const renderRepairItem = (item) => {
    const priority = getRepairPriority(item);

    return (
      <div
        key={item.id}
        className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
      >
        <div className="flex items-center space-x-4">
          <EquipmentIcon type={item.type_data?.name} className="text-xl" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-800">{item.name}</span>
              <Tag color={priority.color} size="small">
                {priority.text}
              </Tag>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ИНН: {item.inn || "Не присвоен"} | Кабинет:{" "}
              {item.room_data?.number} | ID: {item.id}
            </div>
            {item.description && (
              <div className="text-sm text-gray-400 mt-1">
                {item.description}
              </div>
            )}
            <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
              <div className="flex items-center space-x-1">
                <FiClock />
                <span>На ремонте: {getRepairDuration(item.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FiActivity />
                <span>
                  Создано: {dayjs(item.created_at).format("DD.MM.YYYY")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Tag color="orange" icon={<FiTool />}>
            На ремонте
          </Tag>

          <Space size="small">
            <Tooltip title="Ремонт завершен успешно">
              <Popconfirm
                title="Завершить ремонт?"
                description="Оборудование будет переведено в статус 'Работает'"
                onConfirm={() => handleCompleteRepair(item.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button
                  type="primary"
                  icon={<FiCheck />}
                  size="small"
                  className="bg-green-500 hover:bg-green-600 border-green-500"
                >
                  Готово
                </Button>
              </Popconfirm>
            </Tooltip>

            <Tooltip title="Ремонт неуспешен">
              <Popconfirm
                title="Ремонт неуспешен?"
                description="Оборудование будет переведено в статус 'Сломано'"
                onConfirm={() => handleFailRepair(item.id)}
                okText="Да"
                cancelText="Нет"
              >
                <Button danger icon={<FiX />} size="small">
                  Неуспешно
                </Button>
              </Popconfirm>
            </Tooltip>

            <Tooltip title="Утилизировать оборудование">
              <Button
                icon={<FiTrash2 />}
                size="small"
                onClick={() => openDisposeModal(item)}
                className="text-gray-500 hover:text-red-500"
              >
                Утилизировать
              </Button>
            </Tooltip>
          </Space>
        </div>
      </div>
    );
  };

  const renderRepairsList = () => {
    const groupedEquipment = getRepairEquipmentByType();

    if (Object.keys(groupedEquipment).length === 0) {
      return (
        <Empty
          description="Нет оборудования на ремонте"
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
        defaultActiveKey={Object.keys(groupedEquipment)}
      >
        {Object.entries(groupedEquipment).map(([typeName, items]) => {
          const highPriorityCount = items.filter(
            (item) => getRepairPriority(item).level === "high"
          ).length;

          return (
            <Panel
              key={typeName}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <EquipmentIcon type={typeName} />
                    <span className="font-medium">{typeName}</span>
                    {highPriorityCount > 0 && (
                      <Tag color="red" size="small">
                        <FiAlertTriangle className="inline mr-1" />
                        {highPriorityCount} критично
                      </Tag>
                    )}
                  </div>
                  <Badge count={items.length} showZero className="mr-4" />
                </div>
              }
            >
              <div className="space-y-2">
                {items
                  .sort((a, b) => {
                    const priorityOrder = {
                      high: 3,
                      medium: 2,
                      normal: 1,
                      low: 0,
                    };
                    return (
                      priorityOrder[getRepairPriority(b).level] -
                      priorityOrder[getRepairPriority(a).level]
                    );
                  })
                  .map(renderRepairItem)}
              </div>
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  const renderRepairStats = () => {
    const stats = getRepairStats();

    return (
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="На ремонте"
              value={stats.totalRepairs}
              valueStyle={{ color: "#f59e0b" }}
              prefix={<FiTool />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Отремонтировано"
              value={stats.completedRepairs}
              valueStyle={{ color: "#10b981" }}
              prefix={<FiCheck />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Средний срок"
              value={stats.avgRepairTime}
              suffix="дн."
              valueStyle={{ color: "#6366f1" }}
              prefix={<FiClock />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="text-center">
            <Statistic
              title="Успешность"
              value={stats.successRate}
              suffix="%"
              valueStyle={{
                color:
                  stats.successRate > 80
                    ? "#10b981"
                    : stats.successRate > 60
                    ? "#f59e0b"
                    : "#ef4444",
              }}
              prefix={<FiBarChart />}
            />
            <Progress
              percent={stats.successRate}
              size="small"
              strokeColor={
                stats.successRate > 80
                  ? "#10b981"
                  : stats.successRate > 60
                  ? "#f59e0b"
                  : "#ef4444"
              }
              className="mt-2"
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderDisposalHistory = () => {
    const columns = [
      {
        title: "Оборудование",
        dataIndex: "equipment_name",
        key: "equipment_name",
        render: (text, record) => (
          <div>
            <div className="font-medium">
              {text || `ID: ${record.equipment_id}`}
            </div>
            <div className="text-sm text-gray-500">
              ID: {record.equipment_id}
            </div>
          </div>
        ),
      },
      {
        title: "Причина утилизации",
        dataIndex: "reason",
        key: "reason",
        render: (text) => <span className="text-sm">{text}</span>,
      },
      {
        title: "Примечания",
        dataIndex: "notes",
        key: "notes",
        render: (text) => (
          <span className="text-sm text-gray-600">{text || "Нет"}</span>
        ),
      },
      {
        title: "Дата утилизации",
        dataIndex: "created_at",
        key: "created_at",
        render: (date) => (
          <div>
            <div className="text-sm">{dayjs(date).format("DD.MM.YYYY")}</div>
            <div className="text-xs text-gray-500">
              {dayjs(date).format("HH:mm")}
            </div>
          </div>
        ),
      },
      {
        title: "Статус",
        key: "status",
        render: () => (
          <Tag color="default" icon={<FiTrash2 />}>
            Утилизировано
          </Tag>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={disposals}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} из ${total} записей`,
        }}
        locale={{
          emptyText: (
            <Empty
              description="Нет записей об утилизации"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    );
  };

  const renderRepairHistory = () => {
    const columns = [
      {
        title: "Оборудование",
        dataIndex: "equipment_name",
        key: "equipment_name",
        render: (text, record) => (
          <div className="flex items-center space-x-2">
            <EquipmentIcon type={record.equipment_type} className="text-lg" />
            <div>
              <div className="font-medium">{text}</div>
              <div className="text-sm text-gray-500">
                ID: {record.equipment_id}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: "Статус ремонта",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          const statusConfig = {
            IN_PROGRESS: {
              color: "blue",
              text: "В процессе",
              icon: <FiSettings />,
            },
            COMPLETED: { color: "green", text: "Завершен", icon: <FiCheck /> },
            FAILED: { color: "red", text: "Неуспешен", icon: <FiX /> },
          };
          const config = statusConfig[status] || {
            color: "default",
            text: status,
            icon: null,
          };

          return (
            <Tag color={config.color} icon={config.icon}>
              {config.text}
            </Tag>
          );
        },
      },
      {
        title: "Начат",
        dataIndex: "started_at",
        key: "started_at",
        render: (date) =>
          date ? dayjs(date).format("DD.MM.YYYY HH:mm") : "Не указано",
      },
      {
        title: "Завершен",
        dataIndex: "completed_at",
        key: "completed_at",
        render: (date) =>
          date ? dayjs(date).format("DD.MM.YYYY HH:mm") : "Не завершен",
      },
      {
        title: "Длительность",
        key: "duration",
        render: (_, record) => {
          if (!record.started_at) return "Не указано";
          const end = record.completed_at
            ? dayjs(record.completed_at)
            : dayjs();
          const duration = end.diff(dayjs(record.started_at), "day");
          return `${duration} дн.`;
        },
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={repairs}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} из ${total} ремонтов`,
        }}
        locale={{
          emptyText: (
            <Empty
              description="Нет истории ремонтов"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Ремонт оборудования
        </h1>
        <p className="text-gray-600">
          Управление оборудованием, требующим ремонта, и контроль процесса
          восстановления
        </p>
      </div>

      {renderRepairStats()}

      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "repairs",
              label: (
                <span className="flex items-center space-x-2">
                  <FiTool />
                  <span>Текущие ремонты</span>
                  <Badge
                    count={
                      equipment.filter((item) => item.status === "REPAIR")
                        .length
                    }
                  />
                </span>
              ),
              children: (
                <div>
                  {loading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    renderRepairsList()
                  )}
                </div>
              ),
            },
            {
              key: "history",
              label: (
                <span className="flex items-center space-x-2">
                  <FiActivity />
                  <span>История ремонтов</span>
                </span>
              ),
              children: renderRepairHistory(),
            },
            {
              key: "disposals",
              label: (
                <span className="flex items-center space-x-2">
                  <FiTrash2 />
                  <span>Утилизация</span>
                  <Badge count={disposals?.length || 0} />
                </span>
              ),
              children: renderDisposalHistory(),
            },
          ]}
        />
      </Card>

      {/* Dispose Equipment Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <FiTrash2 className="text-red-500" />
            <span>Утилизация оборудования</span>
          </div>
        }
        visible={disposeModalVisible}
        onCancel={() => {
          setDisposeModalVisible(false);
          setSelectedEquipment(null);
          disposeForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedEquipment && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <EquipmentIcon
                type={selectedEquipment.type_data?.name}
                className="text-xl"
              />
              <div>
                <div className="font-medium">{selectedEquipment.name}</div>
                <div className="text-sm text-gray-500">
                  ИНН: {selectedEquipment.inn} | ID: {selectedEquipment.id}
                </div>
              </div>
            </div>
          </div>
        )}

        <Form
          form={disposeForm}
          layout="vertical"
          onFinish={handleDisposeEquipment}
        >
          <Form.Item
            label="Причина утилизации"
            name="reason"
            rules={[{ required: true, message: "Укажите причину утилизации!" }]}
          >
            <Select placeholder="Выберите причину">
              <Option value="Неремонтопригодное">
                Неремонтопригодное состояние
              </Option>
              <Option value="Экономически нецелесообразно">
                Экономически нецелесообразно ремонтировать
              </Option>
              <Option value="Устаревшее">
                Морально устаревшее оборудование
              </Option>
              <Option value="Критические повреждения">
                Критические повреждения
              </Option>
              <Option value="Другое">Другое</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Дополнительные примечания" name="notes">
            <TextArea
              rows={3}
              placeholder="Дополнительная информация об утилизации..."
            />
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setDisposeModalVisible(false);
                setSelectedEquipment(null);
                disposeForm.resetFields();
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              danger
              htmlType="submit"
              loading={loading}
              icon={<FiTrash2 />}
            >
              Утилизировать
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RepairsPage;
