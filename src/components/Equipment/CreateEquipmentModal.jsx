"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  Button,
  message,
  Row,
  Col,
  Progress,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiDownload } from "react-icons/fi";
import {
  createEquipmentBulk,
  bulkUpdateInn,
} from "../../store/slices/equipmentSlice";
import { getAllSpecifications } from "../../store/slices/specificationSlice";
import { getContracts } from "../../store/slices/contractSlice";
import { generateQRCodesPDF } from "../../utils/pdfGenerator";

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
  const [createdEquipment, setCreatedEquipment] = useState([]);
  const [selectedSpecification, setSelectedSpecification] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);

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
    if (visible && equipmentType && room) {
      const initialValues = {
        type_id: equipmentType.id,
        room_id: room.id,
        status: "NEW",
        count: 1,
      };
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

  const steps = [
    { title: "Общее", description: "Основная информация" },
    { title: "Характеристики", description: "Технические характеристики" },
    { title: "ИНН", description: "Инвентарные номера" },
  ];

  const handleStep1Submit = async (values) => {
    try {
      form.setFieldsValue(values);
      setCurrentStep(1);
    } catch (error) {
      message.error("Ошибка при переходе к следующему шагу");
    }
  };

  const handleStep2Submit = async () => {
    try {
      const formValues = form.getFieldsValue();
      const specFieldName = getSpecificationFieldName(formValues.type_id);

      if (!formValues[specFieldName]) {
        message.error("Выберите шаблон характеристики!");
        return;
      }

      const equipmentData = {
        type_id: formValues.type_id,
        room_id: formValues.room_id,
        name_prefix: formValues.name_prefix,
        description: formValues.description,
        status: formValues.status,
        contract_id: formValues.contract_id,
        count: formValues.count || 1,
        [specFieldName]: formValues[specFieldName],
      };

      const result = await dispatch(
        createEquipmentBulk(equipmentData)
      ).unwrap();
      setCreatedEquipment(result);
      setCurrentStep(2);
      message.success(`Создано ${result.length} единиц оборудования`);
    } catch (error) {
      message.error("Ошибка при создании оборудования");
    }
  };

  const handleStep3Submit = async (values) => {
    try {
      const equipments = createdEquipment.map((equipment, index) => ({
        id: equipment.id,
        inn: values[`inn_${equipment.id}`],
      }));

      await dispatch(bulkUpdateInn({ equipments })).unwrap();
      message.success("ИНН успешно присвоены!");
      setIsCompleted(true);
    } catch (error) {
      message.error("Ошибка при присвоении ИНН");
    }
  };

  const handleDownloadQRCodes = async () => {
    try {
      const qrData = createdEquipment.map((equipment, index) => ({
        name: `${equipment.name}`,
        qrCodeUrl: equipment.qr_code_url,
        inn: equipment.inn || `ИНН${String(index + 1).padStart(9, "0")}`,
      }));

      await generateQRCodesPDF(qrData);
      message.success("QR-коды успешно скачаны!");
    } catch (error) {
      message.error("Ошибка при скачивании QR-кодов");
    }
  };

  const handleDownloadINNs = () => {
    const innData = createdEquipment.map((equipment) => ({
      name: equipment.name,
      inn: equipment.inn,
    }));

    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Название,ИНН\n" +
      innData.map((item) => `${item.name},${item.inn}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "equipment_inn.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("ИНН список скачан!");
  };

  const resetModal = () => {
    setCurrentStep(0);
    setCreatedEquipment([]);
    setSelectedSpecification(null);
    setIsCompleted(false);
    form.resetFields();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="bg-blue-500 text-white px-4 py-2 rounded-full inline-block">
          Общее
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleStep1Submit}
        className="space-y-3"
      >
        <Row gutter={16}>
          <Col span={18}>
            <Form.Item
              label="Названия техники"
              name="name_prefix"
              rules={[{ required: true, message: "Введите название!" }]}
              className="mb-3"
            >
              <Input placeholder="Названия техники" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <div className="text-right mt-8">
              <Button type="primary" icon={<FiUpload />} size="small">
                Загрузить
              </Button>
            </div>
          </Col>
        </Row>

        <Form.Item label="Фото техники" className="mb-3">
          <div className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm">
            Фото техники
          </div>
        </Form.Item>

        <Form.Item label="Описание:" name="description" className="mb-3">
          <TextArea rows={3} placeholder="Описание:" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Состояние техники"
              name="status"
              rules={[{ required: true, message: "Выберите состояние!" }]}
              className="mb-3"
            >
              <Select placeholder="Состояние техники">
                <Option value="NEW">Новое</Option>
                <Option value="WORKING">Работает</Option>
                <Option value="REPAIR">На ремонте</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Договор"
              name="contract_id"
              rules={[{ required: true, message: "Выберите договор!" }]}
              className="mb-3"
            >
              <Select placeholder="Выберите договор">
                {contracts.map((contract) => (
                  <Option key={contract.id} value={contract.id}>
                    {contract.number}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <div className="text-sm text-gray-600 mb-3">
          Автор: Даулетмуратов Ахмет Кубейсинович
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onCancel}>Назад</Button>
          <Button type="primary" htmlType="submit">
            Далее
          </Button>
        </div>
      </Form>
    </div>
  );

  const renderStep2 = () => {
    const typeId = form.getFieldValue("type_id");
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = form.getFieldValue(specFieldName);
    const selectedSpec = availableSpecs.find(
      (spec) => spec.id === selectedSpecId
    );

    // Функция для обновления выбранной спецификации
    const handleSpecificationChange = (value) => {
      const spec = availableSpecs.find((s) => s.id === value);
      setSelectedSpecification(spec);
      form.setFieldsValue({ [specFieldName]: value });
    };

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full inline-block">
            Характеристики
          </div>
        </div>

        {/* Template Selection First */}
        <Form.Item
          label="Шаблон характеристики"
          name={specFieldName}
          className="mb-4"
          rules={[{ required: true, message: "Выберите шаблон!" }]}
        >
          <Select
            placeholder="Шаблон характеристики"
            onChange={handleSpecificationChange}
          >
            {availableSpecs.map((spec) => (
              <Option key={spec.id} value={spec.id}>
                {spec.model || spec.cpu || `Характеристика ${spec.id}`}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Characteristics Fields (Read-only) */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Процессор:" className="mb-3">
              <Input
                placeholder="Процессор:"
                value={selectedSpec?.cpu || ""}
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Оперативная память:" className="mb-3">
              <Input
                placeholder="Оперативная память:"
                value={selectedSpec?.ram || ""}
                disabled
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Накопитель (SSD):" className="mb-3">
              <Input
                placeholder="Накопитель (SSD):"
                value={selectedSpec?.storage || ""}
                disabled
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Накопитель (HDD):" className="mb-3">
              <Input placeholder="Накопитель (HDD):" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Накопитель (M2):" className="mb-3">
              <Input placeholder="Накопитель (M2):" disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Накопитель (SATA SDD):" className="mb-3">
              <Input placeholder="Накопитель (SATA SDD):" disabled />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Видеокарта:" className="mb-3">
              <Input placeholder="Видеокарта:" disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <div className="flex items-center justify-between mt-8">
              <Button
                type="text"
                className="text-gray-400"
                disabled
                size="small"
              >
                — Убавить
              </Button>
              <span className="text-sm">Кол-во</span>
              <Button
                type="text"
                className="text-blue-500"
                disabled
                size="small"
              >
                + Добавить
              </Button>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Мышка</span>
              <div
                className={`w-10 h-6 rounded-full ${
                  selectedSpec?.has_mouse ? "bg-blue-500" : "bg-gray-300"
                } relative`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    selectedSpec?.has_mouse
                      ? "translate-x-4"
                      : "translate-x-0.5"
                  }`}
                ></div>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Клавиатура</span>
              <div
                className={`w-10 h-6 rounded-full ${
                  selectedSpec?.has_keyboard ? "bg-blue-500" : "bg-gray-300"
                } relative`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    selectedSpec?.has_keyboard
                      ? "translate-x-4"
                      : "translate-x-0.5"
                  }`}
                ></div>
              </div>
            </div>
          </Col>
        </Row>

        <div className="text-sm text-gray-600 mb-3">
          Автор: Даулетмуратов Ахмет Кубейсинович
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={() => setCurrentStep(0)}>Назад</Button>
          <Button
            type="primary"
            onClick={handleStep2Submit}
            disabled={!selectedSpecId}
          >
            Далее
          </Button>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    if (isCompleted) {
      return (
        <div className="text-center space-y-4">
          <div className="bg-green-500 text-white px-4 py-2 rounded-full inline-block mb-4">
            Завершено
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-medium">
              Оборудование успешно создано!
            </h3>
            <p className="text-gray-600">
              Все ИНН присвоены. Вы можете скачать данные.
            </p>

            <div className="flex justify-center space-x-3">
              <Button
                type="primary"
                icon={<FiDownload />}
                onClick={handleDownloadQRCodes}
              >
                Скачать QR-коды
              </Button>
              <Button
                type="default"
                icon={<FiDownload />}
                onClick={handleDownloadINNs}
              >
                Скачать ИНН
              </Button>
            </div>
          </div>

          <Button type="primary" onClick={onCancel} className="mt-4">
            Закрыть
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-full inline-block">
            ИНН
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">QR-код</h3>
          <Button
            type="primary"
            icon={<FiDownload />}
            onClick={handleDownloadQRCodes}
            size="small"
          >
            Скачать
          </Button>
        </div>

        <Form onFinish={handleStep3Submit}>
          <div className="space-y-3">
            {createdEquipment.map((equipment, index) => (
              <Row key={equipment.id} gutter={16} className="items-center">
                <Col span={12}>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{equipment.name}</div>
                  </div>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name={`inn_${equipment.id}`}
                    className="mb-0"
                    rules={[{ required: true, message: "Введите ИНН!" }]}
                  >
                    <Input
                      placeholder={`ИНН${String(index + 1).padStart(9, "0")}`}
                    />
                  </Form.Item>
                </Col>
              </Row>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button onClick={() => setCurrentStep(1)}>Назад</Button>
            <Button type="primary" htmlType="submit">
              Завершить
            </Button>
          </div>
        </Form>
      </div>
    );
  };

  return (
    <Modal
      title={null}
      visible={visible}
      onCancel={() => {
        resetModal();
        onCancel();
      }}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div className="mb-4">
        <Progress
          percent={((currentStep + 1) / steps.length) * 100}
          showInfo={false}
          strokeColor="#3b82f6"
          className="mb-3"
        />
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-center ${
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <div className="font-medium">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
    </Modal>
  );
};

export default CreateEquipmentModal;
