import React, { useEffect, useState } from "react";
import {
  Card,
  Tabs,
  Collapse,
  Button,
  Badge,
  Empty,
  Modal,
  message,
  Popconfirm,
  Form,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiPlus, FiEdit, FiTrash2, FiChevronRight } from "react-icons/fi";
import {
  getAllSpecifications,
  getSpecificationCount,
  createComputerSpec,
  createProjectorSpec,
  createPrinterSpec,
  createTVSpec,
  createRouterSpec,
  createNotebookSpec,
  createMonoblokSpec,
  createWhiteboardSpec,
  createExtenderSpec,
} from "../store/slices/specificationSlice";
import { getEquipmentTypes } from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import CreateSpecificationForm from "../components/Equipment/CreateSpecificationForm";

const { TabPane } = Tabs;
const { Panel } = Collapse;

const CharacteristicsPage = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [specForm] = Form.useForm();

  const dispatch = useDispatch();
  const specifications = useSelector((state) => state.specifications);
  const { equipmentTypes } = useSelector((state) => state.equipment);
  const { loading, specificationCount } = specifications;

  useEffect(() => {
    dispatch(getAllSpecifications());
    dispatch(getSpecificationCount());
    dispatch(getEquipmentTypes());
  }, [dispatch]);

  const equipmentTypeTemplates = [
    {
      name: "Проектор",
      icon: "проектор",
      fields: ["модель проектора", "яркость", "разрешение", "тип проекции"],
    },
    {
      name: "Компьютер",
      icon: "компьютер",
      fields: [
        "процессор (CPU)",
        "оперативная память (RAM)",
        "накопитель",
        "видеокарта",
        "тип диска",
      ],
    },
    {
      name: "Принтер",
      icon: "принтер",
      fields: [
        "модель",
        "цветная печать",
        "двусторонняя печать",
        "серийный номер",
      ],
    },
    {
      name: "Телевизор",
      icon: "телевизор",
      fields: ["модель", "размер экрана", "серийный номер"],
    },
    {
      name: "Ноутбук",
      icon: "ноутбук",
      fields: [
        "процессор",
        "ОЗУ",
        "накопитель",
        "размер экрана",
        "серийный номер",
        "тип диска",
        "видеокарта",
      ],
    },
    {
      name: "Роутер",
      icon: "роутер",
      fields: ["модель", "количество портов", "частота GHz", "серийный номер"],
    },
    {
      name: "Монитор",
      icon: "монитор",
      fields: ["размер экрана", "GHz", "тип матрицы", "монитор тип"],
    },
  ];

  const handleCreateSpec = (equipmentTypeName) => {
    setSelectedType(equipmentTypeName);
    setCreateModalVisible(true);
  };

  const handleSubmitSpec = async (values) => {
    try {
      const typeName = selectedType.toLowerCase();
      let action;

      if (typeName.includes("компьютер")) action = createComputerSpec;
      else if (typeName.includes("проектор")) action = createProjectorSpec;
      else if (typeName.includes("принтер")) action = createPrinterSpec;
      else if (typeName.includes("телевизор")) action = createTVSpec;
      else if (typeName.includes("роутер")) action = createRouterSpec;
      else if (typeName.includes("ноутбук")) action = createNotebookSpec;
      else if (typeName.includes("монитор")) action = createMonoblokSpec;
      else if (typeName.includes("доска")) action = createWhiteboardSpec;
      else if (typeName.includes("удлинитель")) action = createExtenderSpec;

      if (action) {
        await dispatch(action(values)).unwrap();
        message.success("Характеристика успешно создана!");
        setCreateModalVisible(false);
        specForm.resetFields();
        dispatch(getSpecificationCount());
      }
    } catch (error) {
      message.error("Ошибка при создании характеристики");
    }
  };

  const renderTemplatesTab = () => (
    <div className="space-y-4">
      {equipmentTypeTemplates.map((template) => (
        <Card
          key={template.name}
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <EquipmentIcon type={template.icon} className="text-2xl" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {template.name}
                </h3>
                <div className="text-sm text-gray-600">
                  Поля: {template.fields.join(", ")}
                </div>
              </div>
            </div>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={() => handleCreateSpec(template.name)}
            >
              Создать шаблон
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderSpecificationItem = (spec, type) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
      <div className="flex-1">
        <div className="font-medium text-gray-800">
          {spec.model || spec.cpu || `Характеристика ${spec.id}`}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {type === "computer" && spec.cpu && (
            <span>
              CPU: {spec.cpu}, RAM: {spec.ram}, Storage: {spec.storage}
            </span>
          )}
          {type === "projector" && spec.lumens && (
            <span>
              Яркость: {spec.lumens} лм, Разрешение: {spec.resolution}
            </span>
          )}
          {type === "printer" && spec.model && (
            <span>
              Модель: {spec.model}, Цветная: {spec.color ? "Да" : "Нет"}
            </span>
          )}
          {type === "tv" && spec.screen_size && (
            <span>
              Размер: {spec.screen_size}", Модель: {spec.model}
            </span>
          )}
          {type === "router" && spec.ports && (
            <span>
              Порты: {spec.ports}, Модель: {spec.model}
            </span>
          )}
          {type === "notebook" && spec.cpu && (
            <span>
              CPU: {spec.cpu}, Экран: {spec.screen_size}"
            </span>
          )}
          {spec.created_at && (
            <span className="ml-2">
              Создано: {new Date(spec.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button type="text" icon={<FiEdit />} size="small" />
        <Popconfirm
          title="Удалить характеристику?"
          description="Это действие нельзя отменить"
          okText="Да"
          cancelText="Нет"
        >
          <Button type="text" danger icon={<FiTrash2 />} size="small" />
        </Popconfirm>
      </div>
    </div>
  );

  const renderAddedTab = () => {
    const specTypes = [
      {
        key: "computer",
        name: "Компьютер",
        icon: "компьютер",
        data: specifications.computer,
      },
      {
        key: "projector",
        name: "Проектор",
        icon: "проектор",
        data: specifications.projector,
      },
      {
        key: "printer",
        name: "Принтер",
        icon: "принтер",
        data: specifications.printer,
      },
      {
        key: "tv",
        name: "Телевизор",
        icon: "телевизор",
        data: specifications.tv,
      },
      {
        key: "router",
        name: "Роутер",
        icon: "роутер",
        data: specifications.router,
      },
      {
        key: "notebook",
        name: "Ноутбук",
        icon: "ноутбук",
        data: specifications.notebook,
      },
      {
        key: "monoblok",
        name: "Моноблок",
        icon: "моноблок",
        data: specifications.monoblok,
      },
      {
        key: "whiteboard",
        name: "Электронная доска",
        icon: "доска",
        data: specifications.whiteboard,
      },
      {
        key: "extender",
        name: "Удлинитель",
        icon: "удлинитель",
        data: specifications.extender,
      },
    ];

    return (
      <Collapse
        expandIcon={({ isActive }) => (
          <FiChevronRight
            className={`transition-transform ${isActive ? "rotate-90" : ""}`}
          />
        )}
        className="space-y-2"
      >
        {specTypes.map((specType) => (
          <Panel
            key={specType.key}
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <EquipmentIcon type={specType.icon} />
                  <span className="font-medium">{specType.name}</span>
                </div>
                <Badge
                  count={specType.data?.length || 0}
                  showZero
                  className="mr-4"
                />
              </div>
            }
          >
            {specType.data && specType.data.length > 0 ? (
              <div className="space-y-2">
                {specType.data.map((spec) => (
                  <div key={spec.id}>
                    {renderSpecificationItem(spec, specType.key)}
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={`Нет характеристик для ${specType.name.toLowerCase()}`}
              />
            )}
          </Panel>
        ))}
      </Collapse>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Характеристики
        </h1>
        <p className="text-gray-600">
          Создавайте и управляйте шаблонами характеристик для оборудования
        </p>
      </div>

      <Card className="shadow-sm">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: "templates",
              label: "Шаблоны",
              children: renderTemplatesTab(),
            },
            {
              key: "added",
              label: "Добавленные",
              children: renderAddedTab(),
            },
          ]}
        />
      </Card>

      <Modal
        title={`Создать характеристику: ${selectedType}`}
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setSelectedType(null);
          specForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <CreateSpecificationForm
          form={specForm}
          equipmentType={{ name: selectedType }}
          onSubmit={handleSubmitSpec}
          onCancel={() => {
            setCreateModalVisible(false);
            setSelectedType(null);
            specForm.resetFields();
          }}
        />
      </Modal>
    </div>
  );
};

export default CharacteristicsPage;
