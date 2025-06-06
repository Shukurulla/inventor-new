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
  Switch,
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
      };

      // Har xil turdagi spetsifikatsiya uchun to'g'ri field nomini qo'shish
      if (specFieldName) {
        equipmentData[specFieldName] = formValues[specFieldName];
      }

      const result = await dispatch(
        createEquipmentBulk(equipmentData)
      ).unwrap();
      setCreatedEquipment(result);
      setCurrentStep(2);
      message.success(`Создано ${result.length} единиц оборудования`);
    } catch (error) {
      console.error("Equipment creation error:", error);
      message.error("Ошибка при создании оборудования");
    }
  };

  const handleStep3Submit = async (values) => {
    try {
      const equipments = createdEquipment.map((equipment, index) => ({
        id: equipment.id,
        inn:
          values[`inn_${equipment.id}`] ||
          `ИНН${String(index + 1).padStart(9, "0")}`,
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
      <Form
        form={form}
        layout="vertical"
        onFinish={handleStep1Submit}
        className="space-y-3"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name_prefix"
              rules={[{ required: true, message: "Введите название!" }]}
            >
              <Input className="p-3" placeholder="Названия техники" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <div className="flex items-center">
              <label htmlFor="image">Фото техники:</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                className="d-none"
              />
              <button>
                <FiUpload /> Загрузить
              </button>
            </div>
          </Col>
        </Row>

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
            <Form.Item label="Договор" name="contract_id" className="mb-3">
              <Select placeholder="Выберите договор" allowClear>
                {contracts.map((contract) => (
                  <Option key={contract.id} value={contract.id}>
                    {contract.number}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Количество"
              name="count"
              rules={[{ required: true, message: "Введите количество!" }]}
              className="mb-3"
            >
              <Input type="number" min="1" placeholder="1" />
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

    const handleSpecificationChange = (value) => {
      const spec = availableSpecs.find((s) => s.id === value);
      setSelectedSpecification(spec);
      form.setFieldsValue({ [specFieldName]: value });
    };

    return (
      <div className="space-y-4">
        {availableSpecs.length > 0 ? (
          <>
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

            {/* Computer characteristics */}
            {equipmentType?.name?.toLowerCase().includes("компьютер") &&
              selectedSpec && (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Процессор:" className="mb-3">
                        <Input
                          placeholder="Процессор:"
                          value={selectedSpec.cpu || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Оперативная память:" className="mb-3">
                        <Input
                          placeholder="Оперативная память:"
                          value={selectedSpec.ram || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Накопитель:" className="mb-3">
                        <Input
                          placeholder="Накопитель:"
                          value={selectedSpec.storage || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Размер монитора:" className="mb-3">
                        <Input
                          placeholder="Размер монитора:"
                          value={
                            selectedSpec.monitor_size
                              ? `${selectedSpec.monitor_size}"`
                              : ""
                          }
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm">Мышка</span>
                        <Switch checked={selectedSpec.has_mouse} disabled />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm">Клавиатура</span>
                        <Switch checked={selectedSpec.has_keyboard} disabled />
                      </div>
                    </Col>
                  </Row>
                </>
              )}

            {/* Projector characteristics */}
            {equipmentType?.name?.toLowerCase().includes("проектор") &&
              selectedSpec && (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Модель:" className="mb-3">
                        <Input
                          placeholder="Модель:"
                          value={selectedSpec.model || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Яркость (люмен):" className="mb-3">
                        <Input
                          placeholder="Яркость:"
                          value={selectedSpec.lumens || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Разрешение:" className="mb-3">
                        <Input
                          placeholder="Разрешение:"
                          value={selectedSpec.resolution || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Тип проекции:" className="mb-3">
                        <Input
                          placeholder="Тип проекции:"
                          value={selectedSpec.throw_type || ""}
                          disabled
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </>
              )}

            {/* Other equipment characteristics rendered similarly */}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Для данного типа оборудования нет созданных шаблонов
            </p>
            <p className="text-sm text-gray-400">
              Создайте шаблон в разделе "Характеристики"
            </p>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-3">
          Автор: Даулетмуратов Ахмет Кубейсинович
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={() => setCurrentStep(0)}>Назад</Button>
          <Button
            type="primary"
            onClick={handleStep2Submit}
            disabled={!selectedSpecId && availableSpecs.length > 0}
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
          <div className="bg-indigo-500 text-white px-4 py-2 rounded-full inline-block">
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
      width={1000}
      className="mt-[-50px]"
      destroyOnClose
    >
      <div className="mb-4">
        <div className="flex justify-between">
          <div className="w-[32%] flex items-center justify-center relative">
            <div
              className={`line ${
                currentStep == 0 ? "bg-[#4F39F6]" : "bg-slate-200"
              } z-10 w-[100%] h-[7px] left-0 top-[50%] translate-y-[-50%] rounded-full absolute`}
            ></div>
            {currentStep == 0 && (
              <div className="bg-[#4F39F6] z-20 relative inline p-4 py-2 rounded-[10px] font-bold text-white">
                Общее
              </div>
            )}
          </div>
          <div className="w-[32%] flex items-center justify-center relative">
            <div
              className={`line ${
                currentStep == 1 ? "bg-[#4F39F6]" : "bg-slate-200"
              } z-10 w-[100%] h-[7px] left-0 top-[50%] translate-y-[-50%] rounded-full absolute`}
            ></div>
            {currentStep == 1 && (
              <div className="bg-[#4F39F6] z-20 relative inline p-4 py-2 rounded-[10px] font-bold text-white">
                Характеристики
              </div>
            )}
          </div>

          <div className="w-[32%] flex items-center justify-center relative">
            <div
              className={`line ${
                currentStep == 2 ? "bg-[#4F39F6]" : "bg-slate-200"
              } z-10 w-[100%] h-[7px] left-0 top-[50%] translate-y-[-50%] rounded-full absolute`}
            ></div>
            {currentStep == 2 && (
              <div className="bg-[#4F39F6] z-20 relative inline p-4 py-2 rounded-[10px] font-bold text-white">
                ИНН
              </div>
            )}
          </div>
        </div>
      </div>

      {currentStep === 0 && renderStep1()}
      {currentStep === 1 && renderStep2()}
      {currentStep === 2 && renderStep3()}
    </Modal>
  );
};
export default CreateEquipmentModal;
