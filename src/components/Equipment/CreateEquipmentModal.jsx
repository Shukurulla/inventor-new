import React, { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Upload,
  message,
  Divider,
  Card,
  Row,
  Col,
  Switch,
  Space,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiDownload, FiPlus, FiCheck } from "react-icons/fi";
import {
  createEquipmentBulk,
  bulkUpdateInn,
} from "../../store/slices/equipmentSlice";
import {
  getAllSpecifications,
  createComputerSpec,
  createProjectorSpec,
  createPrinterSpec,
  createTVSpec,
  createRouterSpec,
  createNotebookSpec,
  createMonoblokSpec,
  createWhiteboardSpec,
  createExtenderSpec,
} from "../../store/slices/specificationSlice";
import { getContracts } from "../../store/slices/contractSlice";
import { getEquipmentTypesByRoom } from "../../store/slices/universitySlice";
import EquipmentIcon from "./EquipmentIcon";
import CreateSpecificationForm from "./CreateSpecificationForm";

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const CreateEquipmentModal = ({
  visible,
  onCancel,
  room,
  equipmentType,
  equipmentTypes,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [specForm] = Form.useForm();
  const [createdEquipment, setCreatedEquipment] = useState([]);
  const [showCreateSpec, setShowCreateSpec] = useState(false);

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.equipment);
  const { contracts } = useSelector((state) => state.contracts);
  const specifications = useSelector((state) => state.specifications);

  useEffect(() => {
    if (visible) {
      dispatch(getAllSpecifications());
      dispatch(getContracts());
    }
  }, [visible, dispatch]);

  useEffect(() => {
    if (visible) {
      const initialValues = {
        status: "NEW",
        count: 1,
      };

      if (equipmentType) {
        initialValues.type_id = equipmentType.id;
      }

      if (room) {
        initialValues.room_id = room.id;
      }

      form.setFieldsValue(initialValues);
    }
  }, [visible, equipmentType, room, form]);

  const getSpecificationsForType = (typeId) => {
    const type = equipmentTypes.find((t) => t.id === typeId);
    if (!type) return [];

    const typeName = type.name.toLowerCase();

    if (typeName.includes("компьютер")) return specifications.computer || [];
    if (typeName.includes("проектор")) return specifications.projector || [];
    if (typeName.includes("принтер")) return specifications.printer || [];
    if (typeName.includes("телевизор")) return specifications.tv || [];
    if (typeName.includes("роутер")) return specifications.router || [];
    if (typeName.includes("ноутбук")) return specifications.notebook || [];
    if (typeName.includes("моноблок")) return specifications.monoblok || [];
    if (typeName.includes("доска")) return specifications.whiteboard || [];
    if (typeName.includes("удлинитель")) return specifications.extender || [];

    return [];
  };

  const getSpecificationFieldName = (typeId) => {
    const type = equipmentTypes.find((t) => t.id === typeId);
    if (!type) return null;

    const typeName = type.name.toLowerCase();

    if (typeName.includes("компьютер")) return "computer_specification_id";
    if (typeName.includes("проектор")) return "projector_specification_id";
    if (typeName.includes("принтер")) return "printer_specification_id";
    if (typeName.includes("телевизор")) return "tv_specification_id";
    if (typeName.includes("роутер")) return "router_specification_id";
    if (typeName.includes("ноутбук")) return "notebook_specification_id";
    if (typeName.includes("моноблок")) return "monoblok_specification_id";
    if (typeName.includes("доска")) return "whiteboard_specification_id";
    if (typeName.includes("удлинитель")) return "extender_specification_id";

    return null;
  };

  const handleCreateSpecification = async (values) => {
    try {
      const typeId = form.getFieldValue("type_id");
      const type = equipmentTypes.find((t) => t.id === typeId);
      const typeName = type.name.toLowerCase();

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

      if (action) {
        const result = await dispatch(action(values)).unwrap();
        message.success("Характеристика успешно создана!");

        const specFieldName = getSpecificationFieldName(typeId);
        if (specFieldName) {
          // Form field'ni update qilish va force re-render
          form.setFieldsValue({
            [specFieldName]: result.id,
          });

          // State'ni majburan yangilash
          form.validateFields([specFieldName]);
        }

        setShowCreateSpec(false);
        specForm.resetFields();
      }
    } catch (error) {
      message.error("Ошибка при создании характеристики");
    }
  };

  const handleStep1Submit = async (values) => {
    try {
      // Ikkinchi stepga o'tish uchun faqat form validatsiyasini tekshiramiz
      const typeId = values.type_id;
      const type = equipmentTypes.find((t) => t.id === typeId);

      if (!type) {
        message.error("Выберите тип оборудования!");
        return;
      }

      // Ma'lumotlarni saqlash
      form.setFieldsValue(values);
      setCurrentStep(1);
    } catch (error) {
      message.error("Ошибка при переходе к следующему шагу");
    }
  };

  const handleStep2Submit = async () => {
    try {
      // Step 1 dan ma'lumotlarni olish
      const step1Values = form.getFieldsValue();
      const typeId = step1Values.type_id;
      const specFieldName = getSpecificationFieldName(typeId);
      const specId = form.getFieldValue(specFieldName);

      if (!specId) {
        message.error("Выберите характеристику для оборудования!");
        return;
      }

      // Equipment yaratish uchun to'liq ma'lumotlar
      const equipmentData = {
        ...step1Values,
        room_id: room.id,
        status: "NEW",
        [specFieldName]: specId,
      };

      const result = await dispatch(
        createEquipmentBulk(equipmentData)
      ).unwrap();
      setCreatedEquipment(result);
      setCurrentStep(2);
      message.success(`Создано ${result.length} единиц оборудования`);
    } catch (error) {
      console.error("Error creating equipment:", error);
      message.error("Ошибка при создании оборудования");
    }
  };

  const handleDownloadQR = (equipment) => {
    if (equipment.qr_code_url) {
      window.open(equipment.qr_code_url, "_blank");
    }
  };

  const handleDownloadAllPDF = () => {
    // Здесь будет логика для скачивания PDF со всеми ИНН
    message.info("Функция скачивания PDF будет реализована");
  };

  const resetModal = () => {
    setCurrentStep(0);
    setCreatedEquipment([]);
    setShowCreateSpec(false);
    form.resetFields();
    specForm.resetFields();

    // Qaytadan initial values o'rnatish
    if (equipmentType || room) {
      const initialValues = {
        status: "NEW",
        count: 1,
      };

      if (equipmentType) {
        initialValues.type_id = equipmentType.id;
      }

      if (room) {
        initialValues.room_id = room.id;
      }

      form.setFieldsValue(initialValues);
    }
  };

  const steps = [
    {
      title: "Общее",
      description: "Основная информация об оборудовании",
    },
    {
      title: "Характеристики",
      description: "Выбор характеристик и создание оборудования",
    },
    {
      title: "ИНН",
      description: "Присвоение инвентарных номеров",
    },
    {
      title: "Готово",
      description: "Завершение создания",
    },
  ];

  const renderStep1 = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleStep1Submit}
      initialValues={{
        status: "NEW",
        count: 1,
      }}
    >
      {/* Скрытое поле для типа оборудования */}
      <Form.Item
        name="type_id"
        rules={[{ required: true, message: "Выберите тип оборудования!" }]}
        hidden={!!equipmentType} // Скрываем только если тип уже выбран
      >
        {!equipmentType ? (
          <Select placeholder="Выберите тип оборудования">
            {equipmentTypes.map((type) => (
              <Option key={type.id} value={type.id}>
                <div className="flex items-center space-x-2">
                  <EquipmentIcon type={type.name} />
                  <span>{type.name}</span>
                </div>
              </Option>
            ))}
          </Select>
        ) : (
          <Input />
        )}
      </Form.Item>

      {/* Показываем выбранный тип оборудования */}
      {equipmentType && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-3">
            <EquipmentIcon type={equipmentType.name} className="text-xl" />
            <div>
              <div className="font-medium text-blue-800">
                Создание: {equipmentType.name}
              </div>
              <div className="text-sm text-blue-600">
                Тип оборудования выбран автоматически
              </div>
            </div>
          </div>
        </div>
      )}

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Название техники"
            name="name_prefix"
            rules={[{ required: true, message: "Введите название техники!" }]}
          >
            <Input
              placeholder={
                equipmentType ? `${equipmentType.name}` : "Например: Проектор"
              }
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Количество"
            name="count"
            rules={[
              { required: true, message: "Введите количество!" },
              { max: 50, type: "number", message: "Максимум 50 единиц!" },
            ]}
          >
            <InputNumber min={1} max={50} className="w-full" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item label="Договор" name="contract_id">
        <Select placeholder="Выберите договор" allowClear>
          {contracts.map((contract) => (
            <Option key={contract.id} value={contract.id}>
              {contract.number}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="Фото техники">
        <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
          <div className="flex flex-col items-center">
            <FiUpload className="text-2xl mb-2" />
            <span>Загрузить</span>
          </div>
        </Upload>
      </Form.Item>

      <Form.Item label="Описание" name="description">
        <TextArea rows={3} placeholder="Описание оборудования" />
      </Form.Item>

      <Form.Item name="room_id" hidden>
        <Input />
      </Form.Item>

      <Form.Item name="status" hidden>
        <Input />
      </Form.Item>

      <div className="flex justify-between">
        <Button onClick={onCancel}>Отмена</Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Далее
        </Button>
      </div>
    </Form>
  );

  const renderStep2 = () => {
    const typeId = form.getFieldValue("type_id");
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = form.getFieldValue(specFieldName);

    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Выбор характеристик</h3>
            {availableSpecs.length === 0 && (
              <Button
                type="dashed"
                icon={<FiPlus />}
                onClick={() => setShowCreateSpec(true)}
              >
                Создать характеристику
              </Button>
            )}
          </div>

          {availableSpecs.length > 0 ? (
            <Form.Item
              label="Выберите характеристику"
              name={specFieldName}
              rules={[{ required: true, message: "Выберите характеристику!" }]}
            >
              <Select
                placeholder="Выберите характеристику"
                onChange={(value) => {
                  // Form field'ni manual update qilish
                  form.setFieldsValue({ [specFieldName]: value });
                }}
              >
                {availableSpecs.map((spec) => (
                  <Option key={spec.id} value={spec.id}>
                    {spec.model || spec.cpu || `Характеристика ${spec.id}`}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                Нет доступных характеристик для данного типа оборудования
              </p>
              <Button
                type="primary"
                icon={<FiPlus />}
                onClick={() => setShowCreateSpec(true)}
              >
                Создать характеристику
              </Button>
            </div>
          )}

          {/* Показать выбранную характеристику */}
          {selectedSpecId && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <FiCheck className="text-green-600" />
                <span className="text-green-800 font-medium">
                  Характеристика выбрана (ID: {selectedSpecId})
                </span>
              </div>
            </div>
          )}
        </div>

        {showCreateSpec && (
          <Card title="Создать новую характеристику" className="mb-6">
            <CreateSpecificationForm
              form={specForm}
              equipmentType={equipmentTypes.find((t) => t.id === typeId)}
              onSubmit={handleCreateSpecification}
              onCancel={() => setShowCreateSpec(false)}
            />
          </Card>
        )}

        <div className="flex justify-between">
          <Button onClick={() => setCurrentStep(0)}>Назад</Button>
          <Button
            type="primary"
            onClick={handleStep2Submit}
            disabled={!selectedSpecId}
            loading={loading}
          >
            Создать оборудование
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Присвоение ИНН</h3>
          <Button
            type="primary"
            icon={<FiDownload />}
            onClick={handleDownloadAllPDF}
          >
            Скачать все QR-коды (PDF)
          </Button>
        </div>

        <Form onFinish={handleStep3Submit}>
          <div className="space-y-4">
            {createdEquipment.map((equipment, index) => (
              <Card key={equipment.id} size="small">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <EquipmentIcon type={equipment.type_data?.name} />
                    <div>
                      <div className="font-medium">{equipment.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {equipment.id}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Form.Item
                      name={`inn_${equipment.id}`}
                      className="mb-0"
                      rules={[{ required: true, message: "Введите ИНН!" }]}
                    >
                      <InputNumber placeholder="ИНН" className="w-32" />
                    </Form.Item>

                    <Button
                      type="link"
                      icon={<FiDownload />}
                      onClick={() => handleDownloadQR(equipment)}
                    >
                      Скачать
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Заполнено: 0 из {createdEquipment.length}
          </div>

          <div className="flex justify-between mt-6">
            <Button onClick={() => setCurrentStep(1)}>Назад</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Завершить
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center py-8">
      <div className="mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiCheck className="text-green-600 text-2xl" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Оборудование успешно создано!
        </h3>
        <p className="text-gray-600">
          Создано {createdEquipment.length} единиц оборудования с ИНН номерами
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="text-sm text-gray-600 mb-2">
          Созданное оборудование:
        </div>
        {createdEquipment.slice(0, 3).map((equipment) => (
          <div
            key={equipment.id}
            className="flex items-center justify-between py-1"
          >
            <span className="text-sm">{equipment.name}</span>
            <span className="text-sm text-gray-500">ИНН: {equipment.inn}</span>
          </div>
        ))}
        {createdEquipment.length > 3 && (
          <div className="text-sm text-gray-500 mt-2">
            И еще {createdEquipment.length - 3} единиц...
          </div>
        )}
      </div>

      <Button type="primary" onClick={onCancel} size="large">
        Закрыть
      </Button>
    </div>
  );

  return (
    <Modal
      title={
        <div className="flex items-center space-x-3">
          {equipmentType && <EquipmentIcon type={equipmentType.name} />}
          <div>
            <div className="font-semibold">
              {equipmentType
                ? `Создать ${equipmentType.name}`
                : "Создать оборудование"}
            </div>
            {room && (
              <div className="text-sm text-gray-500">
                Кабинет {room.number} - {room.name}
              </div>
            )}
          </div>
        </div>
      }
      visible={visible}
      onCancel={() => {
        resetModal();
        onCancel();
      }}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div className="mb-6">
        <Steps current={currentStep} items={steps} />
      </div>

      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
      {currentStep === 3 && renderStep4()}
    </Modal>
  );
};

export default CreateEquipmentModal;
