import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Input, message, Form, Space } from "antd";
import { FiPlus } from "react-icons/fi";
import { innTemplatesAPI } from "../../services/api";

const { Option } = Select;

const InnTemplateModal = ({
  visible,
  onCancel,
  onSelect,
  createdEquipment = [],
}) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (visible) {
      loadTemplates();
    }
  }, [visible]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const response = await innTemplatesAPI.getTemplates();
      setTemplates(response.data || []);
    } catch (error) {
      console.error("Error loading templates:", error);
      message.error("Ошибка при загрузке шаблонов");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      message.error("Введите название шаблона");
      return;
    }

    setCreating(true);
    try {
      const response = await innTemplatesAPI.createTemplate({
        name: newTemplateName.trim(),
      });

      setTemplates([...templates, response.data]);
      setSelectedTemplate(response.data);
      setCreateModalVisible(false);
      setNewTemplateName("");
      message.success("Шаблон успешно создан");
    } catch (error) {
      console.error("Error creating template:", error);
      message.error("Ошибка при создании шаблона");
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = () => {
    if (!selectedTemplate) {
      message.error("Выберите шаблон");
      return;
    }

    // Set only template prefix, user will add suffix manually
    const templatePrefix = selectedTemplate.name;
    const innValues = {};

    createdEquipment.forEach((equipment, index) => {
      // Only set template prefix, user will complete the INN
      innValues[`inn_${equipment.id}`] = `${templatePrefix}-`;
    });

    onSelect({
      innValues,
      templatePrefix: templatePrefix,
    });
  };

  return (
    <>
      <Modal
        title="Выбор шаблона ИНН"
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={500}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите шаблон ИНН:
            </label>
            <Space.Compact style={{ width: "100%" }}>
              <Select
                value={selectedTemplate?.id}
                onChange={(value) => {
                  const template = templates.find((t) => t.id === value);
                  setSelectedTemplate(template);
                }}
                placeholder="Выберите шаблон"
                style={{ width: "calc(100% - 40px)" }}
                loading={loading}
              >
                {templates.map((template) => (
                  <Option key={template.id} value={template.id}>
                    {template.name}
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<FiPlus />}
                onClick={() => setCreateModalVisible(true)}
                className="bg-[#4E38F2] border-[#4E38F2]"
              />
            </Space.Compact>
          </div>

          {selectedTemplate && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">
                Предварительный просмотр:
              </h4>
              <div className="space-y-1 text-sm">
                {createdEquipment.slice(0, 3).map((equipment, index) => {
                  const innValue = `${selectedTemplate.name}-[пользователь заполнит]`;
                  return (
                    <div key={equipment.id} className="text-blue-700">
                      {equipment.name}:{" "}
                      <span className="font-mono">{innValue}</span>
                    </div>
                  );
                })}
                {createdEquipment.length > 3 && (
                  <div className="text-blue-600 text-xs">
                    ... и еще {createdEquipment.length - 3} единиц
                  </div>
                )}
              </div>
              <div className="text-xs text-blue-600 mt-2">
                💡 Префикс "{selectedTemplate.name}-" будет автоматически
                добавлен. Вы сможете заполнить окончание ИНН.
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button onClick={onCancel}>Отмена</Button>
            <Button
              type="primary"
              onClick={handleSelect}
              disabled={!selectedTemplate}
              className="bg-[#4E38F2] border-[#4E38F2]"
            >
              Применить шаблон
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Template Modal */}
      <Modal
        title="Создать новый шаблон ИНН"
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setNewTemplateName("");
        }}
        footer={null}
        width={400}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название шаблона:
            </label>
            <Input
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Например: COMP, PROJ, TV"
              onPressEnter={handleCreateTemplate}
            />
            <div className="text-xs text-gray-500 mt-1">
              Это будет префикс для всех ИНН (например: COMP-001, COMP-002)
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={() => {
                setCreateModalVisible(false);
                setNewTemplateName("");
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              onClick={handleCreateTemplate}
              loading={creating}
              disabled={!newTemplateName.trim()}
              className="bg-[#4E38F2] border-[#4E38F2]"
            >
              Создать
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InnTemplateModal;
