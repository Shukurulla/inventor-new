"use client";

import { useEffect, useState } from "react";
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
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Компьютер",
      icon: "компьютер",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Принтер",
      icon: "принтер",
      color: "bg-pink-100 text-pink-600",
    },
    {
      name: "Моноблок",
      icon: "моноблок",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Электронная доска",
      icon: "доска",
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Телевизор",
      icon: "телевизор",
      color: "bg-orange-100 text-orange-600",
    },
    {
      name: "Ноутбук",
      icon: "ноутбук",
      color: "bg-blue-100 text-blue-600",
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="font-medium text-gray-900">Элемент инвентаря</span>
        </div>
        <span className="text-gray-600">Наличие шаблонов</span>
      </div>

      <div className="space-y-3">
        {equipmentTypeTemplates.map((template) => (
          <div
            key={template.name}
            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`w-10 h-10 rounded-lg ${template.color} flex items-center justify-center`}
              >
                <EquipmentIcon type={template.icon} className="text-lg" />
              </div>
              <span className="font-medium text-gray-900">{template.name}</span>
            </div>
            <Button
              type="text"
              icon={<FiPlus />}
              onClick={() => handleCreateSpec(template.name)}
              className="text-blue-500 hover:text-blue-600"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSpecificationItem = (spec, type) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border mb-2">
      <div className="flex-1">
        <div className="font-medium text-gray-800">
          {spec.model || spec.cpu || `${type} - ID: ${spec.id}`}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {type === "Принтер" && `Принтер - ID: ${spec.id}`}
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
        color: "bg-blue-100 text-blue-600",
        count: 6,
      },
      {
        key: "projector",
        name: "Проектор",
        icon: "проектор",
        data: specifications.projector,
        color: "bg-green-100 text-green-600",
        count: 10,
      },
      {
        key: "printer",
        name: "Принтер",
        icon: "принтер",
        data: specifications.printer,
        color: "bg-pink-100 text-pink-600",
        count: 3,
      },
      {
        key: "whiteboard",
        name: "Электронная доска",
        icon: "доска",
        data: specifications.whiteboard,
        color: "bg-purple-100 text-purple-600",
        count: 2,
      },
    ];

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-medium text-gray-900">Созданные шаблоны</span>
          </div>
          <span className="text-gray-600">Количество</span>
        </div>

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
                    <div
                      className={`w-8 h-8 rounded-lg ${specType.color} flex items-center justify-center`}
                    >
                      <EquipmentIcon type={specType.icon} />
                    </div>
                    <span className="font-medium">{specType.name}</span>
                  </div>
                  <Badge
                    count={specType.count}
                    style={{ backgroundColor: "#10b981" }}
                    className="mr-4"
                  />
                </div>
              }
            >
              {specType.data && specType.data.length > 0 ? (
                <div className="space-y-2">
                  {specType.data.slice(0, 3).map((spec) => (
                    <div key={spec.id}>
                      {renderSpecificationItem(spec, specType.name)}
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
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Характеристики
        </h1>
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
