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
  Switch,
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

  const steps = [
    {
      title: "Общее",
      description: "Основная информация",
    },
    {
      title: "Характеристики",
      description: "Технические характеристики",
    },
    {
      title: "ИНН",
      description: "Инвентарные номера",
    },
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
      const step1Values = form.getFieldsValue();
      const result = await dispatch(createEquipmentBulk(step1Values)).unwrap();
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
      onCancel();
      resetModal();
    } catch (error) {
      message.error("Ошибка при присвоении ИНН");
    }
  };

  const resetModal = () => {
    setCurrentStep(0);
    setCreatedEquipment([]);
    setShowCreateSpec(false);
    form.resetFields();
    specForm.resetFields();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold">1</span>
        </div>
        <div className="w-full bg-blue-500 h-1 rounded mb-4"></div>
      </div>

      <Form form={form} layout="vertical" onFinish={handleStep1Submit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Названия техники"
              name="name_prefix"
              rules={[{ required: true, message: "Введите название!" }]}
            >
              <Input placeholder="Названия техники" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <div className="text-right">
              <Button
                type="primary"
                icon={<FiUpload />}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Загрузить
              </Button>
            </div>
          </Col>
        </Row>

        <Form.Item label="Фото техники">
          <div className="text-center text-gray-500">Фото техники</div>
        </Form.Item>

        <Form.Item label="Описание:" name="description">
          <TextArea rows={4} placeholder="Описание:" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Состояние техники" name="status">
              <Select placeholder="Состояние техники">
                <Option value="NEW">Новое</Option>
                <Option value="WORKING">Работает</Option>
                <Option value="REPAIR">На ремонте</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <div className="flex items-center space-x-2 mt-8">
              <span>Техника активна работает</span>
              <Switch defaultChecked className="bg-blue-500" />
            </div>
          </Col>
        </Row>

        <Form.Item label="Договор" name="contract_id">
          <Button type="primary" className="bg-blue-500 hover:bg-blue-600">
            Выбрать
          </Button>
        </Form.Item>

        <div className="text-sm text-gray-600 mb-4">
          Автор: Даулетмуратов Ахмет Кубейсинович
        </div>

        <div className="flex justify-between">
          <Button onClick={onCancel}>Назад</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500 hover:bg-blue-600"
          >
            Далее
          </Button>
        </div>
      </Form>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold">2</span>
        </div>
        <div className="w-full bg-blue-500 h-1 rounded mb-4"></div>
      </div>

      <div className="text-center">
        <h3 className="text-lg font-medium mb-4">Характеристики</h3>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Процессор:">
            <Input placeholder="Процессор:" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Оперативная память:">
            <Input placeholder="Оперативная память:" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Накопитель (SSD):">
            <Input placeholder="Накопитель (SSD):" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Накопитель (HDD):">
            <Input placeholder="Накопитель (HDD):" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Накопитель (M2):">
            <Input placeholder="Накопитель (M2):" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Накопитель (SATA SDD):">
            <Input placeholder="Накопитель (SATA SDD):" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Видеокарта:">
            <Input placeholder="Видеокарта:" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <div className="flex items-center justify-between mt-8">
            <Button type="text" className="text-gray-500">
              — Убавить
            </Button>
            <span>Кол-во</span>
            <Button type="text" className="text-blue-500">
              + Добавить
            </Button>
          </div>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <div className="flex items-center space-x-2">
            <span>Мышка</span>
            <Switch defaultChecked className="bg-blue-500" />
          </div>
        </Col>
        <Col span={12}>
          <div className="flex items-center space-x-2">
            <span>Клавиатура</span>
            <Switch defaultChecked className="bg-blue-500" />
          </div>
        </Col>
      </Row>

      <div className="text-sm text-gray-600 mb-4">
        Автор: Даулетмуратов Ахмет Кубейсинович
      </div>

      <Form.Item label="Шаблон характеристики">
        <Select placeholder="Шаблон характеристики">
          <Option value="template1">Шаблон 1</Option>
        </Select>
      </Form.Item>

      <div className="flex justify-between">
        <Button onClick={() => setCurrentStep(0)}>Назад</Button>
        <Button
          type="primary"
          onClick={handleStep2Submit}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Далее
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-xl font-bold">3</span>
        </div>
        <div className="w-full bg-blue-500 h-1 rounded mb-4"></div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">QR-код</h3>
        <Button
          type="primary"
          icon={<FiDownload />}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Скачать
        </Button>
      </div>

      <Form onFinish={handleStep3Submit}>
        <div className="space-y-4">
          {createdEquipment.map((equipment, index) => (
            <Row key={equipment.id} gutter={16} className="items-center">
              <Col span={12}>
                <div className="p-3 border rounded-lg">
                  <div className="font-medium">{equipment.name}</div>
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

        <div className="flex justify-between mt-6">
          <Button onClick={() => setCurrentStep(1)}>Назад</Button>
          <Button
            type="primary"
            htmlType="submit"
            className="bg-blue-500 hover:bg-blue-600"
          >
            Завершить
          </Button>
        </div>
      </Form>
    </div>
  );

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
      <div className="mb-6">
        <Progress
          percent={((currentStep + 1) / steps.length) * 100}
          showInfo={false}
          strokeColor="#3b82f6"
          className="mb-4"
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
