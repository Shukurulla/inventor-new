import { Modal, Input, Select, Button, Row, Col, Switch, message } from "antd";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiDownload } from "react-icons/fi";
import {
  createEquipmentBulk,
  bulkUpdateInn,
} from "../../store/slices/equipmentSlice";
import { getAllSpecifications } from "../../store/slices/specificationSlice";
import { getContracts } from "../../store/slices/contractSlice";
import { generateQRCodesPDF } from "../../utils/pdfGenerator";

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
  const [formValues, setFormValues] = useState({
    type_id: "",
    room_id: "",
    status: "NEW",
    count: 1,
    name_prefix: "",
    description: "",
    contract_id: null,
    computer_specification_id: null,
    cpu: "",
    ram: "",
    storage: "",
    monitor_size: "",
    has_mouse: false,
    has_keyboard: false,
    // Add other specification fields as needed
  });
  const [createdEquipment, setCreatedEquipment] = useState([]);
  const [selectedSpecification, setSelectedSpecification] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [innValues, setInnValues] = useState({}); // For step 3 INN inputs
  const [errors, setErrors] = useState({}); // For validation errors

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
      setFormValues({
        ...formValues,
        type_id: equipmentType.id,
        room_id: room.id,
        status: "NEW",
        count: 1,
        name_prefix: "",
      });
    }
  }, [visible, equipmentType, room]);

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

  useEffect(() => {
    const typeId = formValues.type_id;
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = formValues[specFieldName];

    if (selectedSpecId && specFieldName) {
      const availableSpecs = getSpecificationsForType(typeId);
      const spec = availableSpecs.find((s) => s.id === selectedSpecId);
      if (spec) {
        setFormValues((prev) => ({
          ...prev,
          cpu: spec.cpu || "",
          ram: spec.ram || "",
          storage: spec.storage || "",
          monitor_size: spec.monitor_size || "",
          has_mouse: spec.has_mouse || false,
          has_keyboard: spec.has_keyboard || false,
        }));
        setSelectedSpecification(spec);
      }
    }
  }, [formValues.type_id, formValues.computer_specification_id]); // Adjust dependency based on spec field

  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleInnChange = (equipmentId, value) => {
    setInnValues((prev) => ({ ...prev, [`inn_${equipmentId}`]: value }));
    // Clear error when user types
    if (errors[`inn_${equipmentId}`]) {
      setErrors((prev) => ({ ...prev, [`inn_${equipmentId}`]: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formValues.name_prefix) {
      newErrors.name_prefix = "Введите название!";
    }
    if (!formValues.status) {
      newErrors.status = "Выберите состояние!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    const specFieldName = getSpecificationFieldName(formValues.type_id);
    const availableSpecs = getSpecificationsForType(formValues.type_id);
    if (!formValues[specFieldName] && availableSpecs.length > 0) {
      newErrors[specFieldName] = "Выберите шаблон!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    createdEquipment.forEach((equipment, index) => {
      if (!innValues[`inn_${equipment.id}`]) {
        newErrors[`inn_${equipment.id}`] = "Введите ИНН!";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Submit = () => {
    if (!validateStep1()) {
      message.error("Пожалуйста, заполните обязательные поля!");
      return;
    }
    setCurrentStep(1);
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) {
      message.error("Выберите шаблон характеристики!");
      return;
    }

    try {
      const specFieldName = getSpecificationFieldName(formValues.type_id);
      const equipmentData = {
        type_id: formValues.type_id,
        room_id: formValues.room_id,
        name_prefix: formValues.name_prefix,
        description: formValues.description,
        status: formValues.status,
        contract_id: formValues.contract_id,
        count: formValues.count || 1,
      };

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

  const handleStep3Submit = async () => {
    if (!validateStep3()) {
      message.error("Пожалуйста, заполните все поля ИНН!");
      return;
    }

    try {
      const equipments = createdEquipment.map((equipment, index) => ({
        id: equipment.id,
        inn:
          innValues[`inn_${equipment.id}`] ||
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
        inn:
          innValues[`inn_${equipment.id}`] ||
          `ИНН${String(index + 1).padStart(9, "0")}`,
      }));

      await generateQRCodesPDF(qrData);
      message.success("QR-коды успешно скачаны!");
    } catch (error) {
      message.error("Ошибка при скачивании QR-кодов");
    }
  };

  const resetModal = () => {
    setCurrentStep(0);
    setFormValues({
      type_id: "",
      room_id: "",
      status: "NEW",
      count: 1,
      name_prefix: "",
      description: "",
      contract_id: null,
      computer_specification_id: null,
      cpu: "",
      ram: "",
      storage: "",
      monitor_size: "",
      has_mouse: false,
      has_keyboard: false,
    });
    setCreatedEquipment([]);
    setSelectedSpecification(null);
    setIsCompleted(false);
    setInnValues({});
    setErrors({});
  };

  const handleSpecificationChange = (value) => {
    const availableSpecs = getSpecificationsForType(formValues.type_id);
    const spec = availableSpecs.find((s) => s.id === value);
    setSelectedSpecification(spec);

    const specFieldName = getSpecificationFieldName(formValues.type_id);
    if (specFieldName) {
      setFormValues((prev) => ({
        ...prev,
        [specFieldName]: value,
        cpu: spec?.cpu || "",
        ram: spec?.ram || "",
        storage: spec?.storage || "",
        monitor_size: spec?.monitor_size || "",
        has_mouse: spec?.has_mouse || false,
        has_keyboard: spec?.has_keyboard || false,
      }));
    }
  };

  const renderStep1 = () => (
    <div className="px-6 py-4">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <div className="flex flex-col">
            <Input
              value={formValues.name_prefix}
              onChange={(e) => handleInputChange("name_prefix", e.target.value)}
              placeholder="Название техники"
              style={{ height: "40px" }}
              required={true}
            />
            {errors.name_prefix && (
              <span className="text-red-500 text-sm">{errors.name_prefix}</span>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="flex items-center justify-between h-[40px]">
            <span className="text-gray-700 text-lg font-semibold">
              Фото техники:
            </span>
            <Button
              icon={<FiUpload />}
              className="flex items-center gap-2 bg-[#4E38F2] text-white border-none hover:bg-[#4A63D7]"
            >
              Загрузить
            </Button>
          </div>
        </Col>
      </Row>

      <div className="mt-6">
        <TextArea
          rows={4}
          value={formValues.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Описание:"
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <div className="flex flex-col">
            <Select
              value={formValues.status}
              onChange={(value) => handleInputChange("status", value)}
              placeholder="Выберите состояние"
              style={{ height: "40px" }}
            >
              <Option value="NEW">Новое</Option>
              <Option value="WORKING">Работает</Option>
              <Option value="NEEDS_REPAIR">Требуется ремонт</Option>
              <Option value="DISPOSED">Утилизировано</Option>
            </Select>
            {errors.status && (
              <span className="text-red-500 text-sm">{errors.status}</span>
            )}
          </div>
        </Col>
        <Col span={12}>
          <div className="flex flex-col">
            <Select
              value={formValues.contract_id}
              onChange={(value) => handleInputChange("contract_id", value)}
              placeholder="Выберите договор"
              allowClear
              style={{ height: "40px" }}
            >
              {contracts.map((contract) => (
                <Option key={contract.id} value={contract.id}>
                  {contract.number}
                </Option>
              ))}
            </Select>
          </div>
        </Col>
      </Row>

      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <button
            className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
            style={{ width: "100%" }}
            onClick={onCancel}
          >
            Отмена
          </button>
        </Col>
        <Col span={12}>
          <button
            className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
            style={{ width: "100%" }}
            onClick={() => handleStep1Submit()}
          >
            Далее
          </button>
        </Col>
      </Row>
    </div>
  );

  const renderStep2 = () => {
    const typeId = formValues.type_id;
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = formValues[specFieldName];

    return (
      <div className="px-6 py-4">
        {availableSpecs.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div className="flex flex-col">
                  <Select
                    value={selectedSpecId}
                    onChange={handleSpecificationChange}
                    placeholder="LG short 100"
                    style={{ height: "40px" }}
                  >
                    {availableSpecs.map((spec) => (
                      <Option key={spec.id} value={spec.id}>
                        {spec.model || spec.cpu || `Характеристика ${spec.id}`}
                      </Option>
                    ))}
                  </Select>
                  {errors[specFieldName] && (
                    <span className="text-red-500 text-sm">
                      {errors[specFieldName]}
                    </span>
                  )}
                </div>
              </Col>
              <Col span={12}>
                <div className="flex flex-col">
                  <Input
                    value={formValues.count}
                    onChange={(e) => handleInputChange("count", e.target.value)}
                    placeholder="1"
                    style={{ height: "40px" }}
                  />
                </div>
              </Col>
            </Row>

            {equipmentType?.name?.toLowerCase().includes("компьютер") && (
              <>
                <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                  <Col span={12}>
                    <div className="flex flex-col">
                      <Input
                        value={formValues.cpu}
                        disabled
                        placeholder="Процессор:"
                        style={{ height: "40px" }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col">
                      <Input
                        value={formValues.ram}
                        disabled
                        placeholder="Оперативная память:"
                        style={{ height: "40px" }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: ",16px" }}>
                  <Col span={12}>
                    <div className="flex flex-col">
                      <Input
                        value={formValues.storage}
                        disabled
                        placeholder="Накопитель:"
                        style={{ height: "40px" }}
                      />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col">
                      <Input
                        value={formValues.monitor_size}
                        disabled
                        placeholder="Размер монитора:"
                        style={{ height: "40px" }}
                      />
                    </div>
                  </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                  <Col span={12}>
                    <div className="flex flex-col">
                      <label className="text-gray-700 mb-1">Мышка</label>
                      <Switch checked={formValues.has_mouse} disabled />
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex flex-col">
                      <label className="text-gray-700 mb-1">Клавиатура</label>
                      <Switch checked={formValues.has_keyboard} disabled />
                    </div>
                  </Col>
                </Row>
              </>
            )}
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

        <div className="">
          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <button
                className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
                style={{ width: "100%" }}
                onClick={() => setCurrentStep(0)}
              >
                Назад
              </button>
            </Col>
            <Col span={12}>
              <button
                className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
                style={{ width: "100%" }}
                onClick={() => handleStep2Submit()}
              >
                Далее
              </button>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
    if (isCompleted) {
      return (
        <div className="text-center py-8 px-6">
          <div className="space-y-4">
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
                className="bg-[#4E38F2] border-none hover:bg-[#4A63D7]"
              >
                Скачать QR-коды
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">ИНН</h3>
        </div>
        <div className="space-y-4">
          {createdEquipment.map((equipment, index) => (
            <Row key={equipment.id} gutter={16}>
              <Col span={12}>
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="font-medium text-sm">{equipment.name}</div>
                </div>
              </Col>
              <Col span={12}>
                <Input
                  value={innValues[`inn_${equipment.id}`] || ""}
                  onChange={(e) =>
                    handleInnChange(equipment.id, e.target.value)
                  }
                  placeholder={`ИНН${String(index + 1).padStart(9, "0")}`}
                  style={{ height: "40px" }}
                />
                {errors[`inn_${equipment.id}`] && (
                  <span className="text-red-500 text-sm">
                    {errors[`inn_${equipment.id}`]}
                  </span>
                )}
              </Col>
            </Row>
          ))}
        </div>
        <div>
          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <button
                className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
                style={{ width: "100%" }}
                onClick={() => setCurrentStep(1)}
              >
                Назад
              </button>
            </Col>
            <Col span={12}>
              <button
                className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
                style={{ width: "100%" }}
                onClick={handleStep3Submit}
              >
                Далее
              </button>
            </Col>
          </Row>
        </div>
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
      className="rounded-lg mt-[-50px]"
      destroyOnClose
    >
      <div className="px-6 py-4 mb-3 ">
        <div className="flex items-center">
          <div className="flex-1 relative">
            <div
              className={`h-[5px] rounded-full ${
                currentStep >= 0 ? "bg-[#4E38F2]" : "bg-gray-300"
              }`}
            />
            {currentStep === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#4E38F2] text-white px-4 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                Общее
              </div>
            )}
          </div>
          <div className="flex-1 relative mx-2">
            <div
              className={`h-[5px] rounded-full ${
                currentStep >= 1 ? "bg-[#4E38F2]" : "bg-gray-300"
              }`}
            />
            {currentStep === 1 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#4E38F2] text-white px-4 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
                Характеристики
              </div>
            )}
          </div>
          <div className="flex-1 relative">
            <div
              className={`h-[5px] rounded-full ${
                currentStep >= 2 ? "bg-[#4E38F2]" : "bg-gray-300"
              }`}
            />
            {currentStep === 2 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#4E38F2] text-white px-4 py-1 rounded-lg text-sm font-medium whitespace-nowrap">
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
