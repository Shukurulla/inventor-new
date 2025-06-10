"use client";

import { useState } from "react";
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
  createMonitorSpec,
} from "../store/slices/specificationSlice";
import { specificationsAPI } from "../services/api";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import CreateSpecificationForm from "../components/Equipment/CreateSpecificationForm";

const { TabPane } = Tabs;
const { Panel } = Collapse;

const CharacteristicsPage = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSpec, setSelectedSpec] = useState(null);
  const [specForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const dispatch = useDispatch();

  // Get data from Redux store (already loaded in App.js)
  const specifications = useSelector((state) => state.specifications);
  const { equipmentTypes } = useSelector((state) => state.equipment);
  const { loading, specificationCount } = specifications;

  // No initial data loading needed - data is already loaded in App.js

  const equipmentTypeTemplates = [
    {
      name: "Проектор",
      icon: "проектор",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Компьютер",
      icon: "компьютер",
      color: "bg-indigo-100 text-indigo-600",
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
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      name: "Роутер",
      icon: "роутер",
      color: "bg-red-100 text-red-600",
    },
    {
      name: "Удлинитель",
      icon: "удлинитель",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      name: "Монитор",
      icon: "монитор",
      color: "bg-cyan-100 text-cyan-600",
    },
  ];

  const handleCreateSpec = (equipmentTypeName) => {
    setSelectedType(equipmentTypeName);
    setCreateModalVisible(true);
  };

  const handleEditSpec = (spec, typeName) => {
    setSelectedSpec(spec);
    setSelectedType(typeName);
    setEditModalVisible(true);
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
      else if (typeName.includes("моноблок")) action = createMonoblokSpec;
      else if (typeName.includes("доска")) action = createWhiteboardSpec;
      else if (typeName.includes("удлинитель")) action = createExtenderSpec;
      else if (typeName.includes("монитор")) action = createMonitorSpec;

      if (action) {
        await dispatch(action(values)).unwrap();
        message.success("Характеристика успешно создана!");
        setCreateModalVisible(false);
        specForm.resetFields();
        // Refresh specifications data
        dispatch(getAllSpecifications());
        dispatch(getSpecificationCount());
      }
    } catch (error) {
      console.error("Spec creation error:", error);
      message.error("Ошибка при создании характеристики");
    }
  };

  const handleUpdateSpec = async (values) => {
    try {
      const typeName = selectedType.toLowerCase();
      let apiCall;

      // Определяем какой API использовать для обновления
      if (typeName.includes("компьютер")) {
        apiCall = () =>
          specificationsAPI.updateComputerSpec(selectedSpec.id, values);
      } else if (typeName.includes("проектор")) {
        apiCall = () =>
          specificationsAPI.updateProjectorSpec(selectedSpec.id, values);
      } else if (typeName.includes("принтер")) {
        apiCall = () =>
          specificationsAPI.updatePrinterSpec(selectedSpec.id, values);
      } else if (typeName.includes("телевизор")) {
        apiCall = () => specificationsAPI.updateTVSpec(selectedSpec.id, values);
      } else if (typeName.includes("роутер")) {
        apiCall = () =>
          specificationsAPI.updateRouterSpec(selectedSpec.id, values);
      } else if (typeName.includes("ноутбук")) {
        apiCall = () =>
          specificationsAPI.updateNotebookSpec(selectedSpec.id, values);
      } else if (typeName.includes("моноблок")) {
        apiCall = () =>
          specificationsAPI.updateMonoblokSpec(selectedSpec.id, values);
      } else if (typeName.includes("доска")) {
        apiCall = () =>
          specificationsAPI.updateWhiteboardSpec(selectedSpec.id, values);
      } else if (typeName.includes("удлинитель")) {
        apiCall = () =>
          specificationsAPI.updateExtenderSpec(selectedSpec.id, values);
      } else if (typeName.includes("монитор")) {
        apiCall = () =>
          specificationsAPI.updateMonitorSpec(selectedSpec.id, values);
      }

      if (apiCall) {
        await apiCall();
        message.success("Характеристика успешно обновлена!");
        setEditModalVisible(false);
        editForm.resetFields();
        setSelectedSpec(null);
        dispatch(getAllSpecifications());
      }
    } catch (error) {
      console.error("Spec update error:", error);
      message.error("Ошибка при обновлении характеристики");
    }
  };

  const handleDeleteSpec = async (spec, typeName) => {
    try {
      const typeNameLower = typeName.toLowerCase();
      let apiCall;

      // Определяем какой API использовать для удаления
      if (typeNameLower.includes("компьютер")) {
        apiCall = () => specificationsAPI.deleteComputerSpec(spec.id);
      } else if (typeNameLower.includes("проектор")) {
        apiCall = () => specificationsAPI.deleteProjectorSpec(spec.id);
      } else if (typeNameLower.includes("принтер")) {
        apiCall = () => specificationsAPI.deletePrinterSpec(spec.id);
      } else if (typeNameLower.includes("телевизор")) {
        apiCall = () => specificationsAPI.deleteTVSpec(spec.id);
      } else if (typeNameLower.includes("роутер")) {
        apiCall = () => specificationsAPI.deleteRouterSpec(spec.id);
      } else if (typeNameLower.includes("ноутбук")) {
        apiCall = () => specificationsAPI.deleteNotebookSpec(spec.id);
      } else if (typeNameLower.includes("моноблок")) {
        apiCall = () => specificationsAPI.deleteMonoblokSpec(spec.id);
      } else if (typeNameLower.includes("доска")) {
        apiCall = () => specificationsAPI.deleteWhiteboardSpec(spec.id);
      } else if (typeNameLower.includes("удлинитель")) {
        apiCall = () => specificationsAPI.deleteExtenderSpec(spec.id);
      } else if (typeNameLower.includes("монитор")) {
        apiCall = () => specificationsAPI.deleteMonitorSpec(spec.id);
      }

      if (apiCall) {
        await apiCall();
        message.success("Характеристика успешно удалена!");
        dispatch(getAllSpecifications());
        dispatch(getSpecificationCount());
      }
    } catch (error) {
      console.error("Spec delete error:", error);
      message.error("Ошибка при удалении характеристики");
    }
  };

  const renderTemplatesTab = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
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
              className="text-indigo-500 hover:text-indigo-600"
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
          {type === "Компьютер" &&
            spec.cpu &&
            `CPU: ${spec.cpu}, RAM: ${spec.ram}`}
          {type === "Проектор" &&
            spec.lumens &&
            `Яркость: ${spec.lumens} люмен`}
          {type === "Телевизор" &&
            spec.screen_size &&
            `Размер: ${spec.screen_size}"`}
          {type === "Роутер" && spec.ports && `Порты: ${spec.ports}`}
          {type === "Ноутбук" && spec.cpu && `CPU: ${spec.cpu}`}
          {type === "Моноблок" &&
            spec.screen_size &&
            `Размер: ${spec.screen_size}"`}
          {type === "Электронная доска" &&
            spec.screen_size &&
            `Размер: ${spec.screen_size}"`}
          {type === "Удлинитель" && spec.ports && `Порты: ${spec.ports}`}
          {type === "Монитор" &&
            spec.screen_size &&
            `Размер: ${spec.screen_size}" ${spec.panel_type}`}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          type="text"
          icon={<FiEdit />}
          size="small"
          onClick={() => handleEditSpec(spec, type)}
        />
        <Popconfirm
          title="Удалить характеристику?"
          description="Это действие нельзя отменить"
          okText="Да"
          cancelText="Нет"
          onConfirm={() => handleDeleteSpec(spec, type)}
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
        color: "bg-indigo-100 text-indigo-600",
        count: specifications.computer?.length || 0,
      },
      {
        key: "projector",
        name: "Проектор",
        icon: "проектор",
        data: specifications.projector,
        color: "bg-green-100 text-green-600",
        count: specifications.projector?.length || 0,
      },
      {
        key: "printer",
        name: "Принтер",
        icon: "принтер",
        data: specifications.printer,
        color: "bg-pink-100 text-pink-600",
        count: specifications.printer?.length || 0,
      },
      {
        key: "tv",
        name: "Телевизор",
        icon: "телевизор",
        data: specifications.tv,
        color: "bg-orange-100 text-orange-600",
        count: specifications.tv?.length || 0,
      },
      {
        key: "router",
        name: "Роутер",
        icon: "роутер",
        data: specifications.router,
        color: "bg-red-100 text-red-600",
        count: specifications.router?.length || 0,
      },
      {
        key: "notebook",
        name: "Ноутбук",
        icon: "ноутбук",
        data: specifications.notebook,
        color: "bg-indigo-100 text-indigo-600",
        count: specifications.notebook?.length || 0,
      },
      {
        key: "monoblok",
        name: "Моноблок",
        icon: "моноблок",
        data: specifications.monoblok,
        color: "bg-green-100 text-green-600",
        count: specifications.monoblok?.length || 0,
      },
      {
        key: "whiteboard",
        name: "Электронная доска",
        icon: "доска",
        data: specifications.whiteboard,
        color: "bg-purple-100 text-purple-600",
        count: specifications.whiteboard?.length || 0,
      },
      {
        key: "extender",
        name: "Удлинитель",
        icon: "удлинитель",
        data: specifications.extender,
        color: "bg-indigo-100 text-indigo-600",
        count: specifications.extender?.length || 0,
      },
      {
        key: "monitor",
        name: "Монитор",
        icon: "монитор",
        data: specifications.monitor,
        color: "bg-cyan-100 text-cyan-600",
        count: specifications.monitor?.length || 0,
      },
    ];

    // Фильтруем только те типы, у которых есть данные
    const typesWithData = specTypes.filter((specType) => specType.count > 0);

    if (typesWithData.length === 0) {
      return (
        <div className="text-center py-8">
          <Empty
            description="Нет созданных характеристик"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

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
          {typesWithData.map((specType) => (
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
              <div className="space-y-2">
                {specType.data &&
                  specType.data.map((spec) => (
                    <div key={spec.id}>
                      {renderSpecificationItem(spec, specType.name)}
                    </div>
                  ))}
              </div>
            </Panel>
          ))}
        </Collapse>
      </div>
    );
  };

  return (
    <div>
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

      {/* Create Modal */}
      <Modal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setSelectedType(null);
          specForm.resetFields();
        }}
        footer={null}
        width={1000}
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
          isEdit={false}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedType(null);
          setSelectedSpec(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateSpecificationForm
          form={editForm}
          equipmentType={{ name: selectedType }}
          onSubmit={handleUpdateSpec}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedType(null);
            setSelectedSpec(null);
            editForm.resetFields();
          }}
          isEdit={true}
          initialData={selectedSpec}
        />
      </Modal>
    </div>
  );
};

export default CharacteristicsPage;
