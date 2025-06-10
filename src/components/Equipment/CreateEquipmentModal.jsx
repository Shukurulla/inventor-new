import {
  Modal,
  Input,
  Select,
  Button,
  Row,
  Col,
  Switch,
  message,
  Upload,
} from "antd";
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
    projector_specification_id: null,
    printer_specification_id: null,
    tv_specification_id: null,
    router_specification_id: null,
    notebook_specification_id: null,
    monoblok_specification_id: null,
    whiteboard_specification_id: null,
    extender_specification_id: null,
    monitor_specification_id: null,
    cpu: "",
    ram: "",
    storage: "",
    monitor_size: "",
    has_mouse: false,
    has_keyboard: false,
    model: "",
    lumens: "",
    resolution: "",
    throw_type: "",
    screen_size: "",
    panel_type: "",
    refresh_rate: "",
    color: false,
    duplex: false,
    ports: "",
    wifi_standart: "",
    touch_type: "",
    length: "",
    gpu_model: "",
    storageList: [],
    image: null,
  });
  const [createdEquipment, setCreatedEquipment] = useState([]);
  const [selectedSpecification, setSelectedSpecification] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [innValues, setInnValues] = useState({});
  const [errors, setErrors] = useState({});
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation states for each step
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);
  const [isStep3Valid, setIsStep3Valid] = useState(false);

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
      setFormValues((prev) => ({
        ...prev,
        type_id: equipmentType.id,
        room_id: room.id,
        status: "NEW",
        count: 1,
        name_prefix: "",
      }));
    }
  }, [visible, equipmentType, room]);

  // Validation logic for each step
  useEffect(() => {
    const validateStep1 = () => {
      const isValid =
        formValues.name_prefix &&
        formValues.name_prefix.trim() !== "" &&
        formValues.status;
      setIsStep1Valid(isValid);
      return isValid;
    };

    const validateStep2 = () => {
      const specFieldName = getSpecificationFieldName(formValues.type_id);
      const availableSpecs = getSpecificationsForType(formValues.type_id);

      // Agar specification kerak bo'lsa va mavjud bo'lsa, tanlangan bo'lishi kerak
      const isValid =
        !specFieldName ||
        formValues[specFieldName] ||
        availableSpecs.length === 0;
      setIsStep2Valid(isValid);
      return isValid;
    };

    const validateStep3 = () => {
      const isValid = createdEquipment.every(
        (equipment) =>
          innValues[`inn_${equipment.id}`] &&
          innValues[`inn_${equipment.id}`].trim() !== ""
      );
      setIsStep3Valid(isValid);
      return isValid;
    };

    if (currentStep === 0) validateStep1();
    if (currentStep === 1) validateStep2();
    if (currentStep === 2) validateStep3();
  }, [formValues, createdEquipment, innValues, currentStep]);

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
    if (typeName.includes("монитор")) return "monitor_specification_id";
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
    if (typeName.includes("монитор")) return specifications.monitor || [];
    return [];
  };

  const updateSpecificationDetails = (spec, typeName) => {
    const updates = {
      cpu: "",
      ram: "",
      storage: "",
      monitor_size: "",
      has_mouse: false,
      has_keyboard: false,
      model: "",
      lumens: "",
      resolution: "",
      throw_type: "",
      screen_size: "",
      panel_type: "",
      refresh_rate: "",
      color: false,
      duplex: false,
      ports: "",
      wifi_standart: "",
      touch_type: "",
      length: "",
      gpu_model: "",
      storageList: [],
    };

    if (!spec) {
      return updates;
    }

    // Common fields
    if (spec.model) updates.model = spec.model;
    if (spec.resolution) updates.resolution = spec.resolution;

    // Computer, Notebook, Monoblok
    if (
      typeName.includes("компьютер") ||
      typeName.includes("ноутбук") ||
      typeName.includes("моноблок")
    ) {
      if (spec.cpu) updates.cpu = spec.cpu;
      if (spec.ram) updates.ram = spec.ram;
      if (typeof spec.has_mouse === "boolean")
        updates.has_mouse = spec.has_mouse;
      if (typeof spec.has_keyboard === "boolean")
        updates.has_keyboard = spec.has_keyboard;

      // GPU specifications handling
      if (spec.gpu_specifications && spec.gpu_specifications.length > 0) {
        updates.gpu_model = spec.gpu_specifications[0].model || "Unknown GPU";
      } else if (spec.gpu_model) {
        updates.gpu_model = spec.gpu_model;
      }

      // Disk specifications handling
      if (spec.disk_specifications && spec.disk_specifications.length > 0) {
        const storageInfo = spec.disk_specifications
          .map((disk) => `${disk.capacity_gb}GB ${disk.disk_type}`)
          .join(", ");
        updates.storage = storageInfo;
        updates.storageList = spec.disk_specifications;
      } else if (spec.storage) {
        updates.storage = spec.storage;
      }

      // Only include monitor_size for notebook and monoblok
      if (typeName.includes("ноутбук") || typeName.includes("моноблок")) {
        if (spec.monitor_size) updates.monitor_size = spec.monitor_size;
        if (spec.screen_size) updates.monitor_size = spec.screen_size;
      }
    }

    // Projector
    if (typeName.includes("проектор")) {
      if (spec.lumens) updates.lumens = spec.lumens;
      if (spec.throw_type) updates.throw_type = spec.throw_type;
    }

    // Printer
    if (typeName.includes("принтер")) {
      if (typeof spec.color === "boolean") updates.color = spec.color;
      if (typeof spec.duplex === "boolean") updates.duplex = spec.duplex;
    }

    // TV, Monitor
    if (typeName.includes("телевизор") || typeName.includes("монитор")) {
      if (spec.screen_size) updates.screen_size = spec.screen_size;
      if (spec.panel_type) updates.panel_type = spec.panel_type;
      if (spec.refresh_rate) updates.refresh_rate = spec.refresh_rate;
    }

    // Router
    if (typeName.includes("роутер")) {
      if (spec.ports) updates.ports = spec.ports;
      if (spec.wifi_standart) updates.wifi_standart = spec.wifi_standart;
    }

    // Whiteboard
    if (typeName.includes("доска")) {
      if (spec.screen_size) updates.screen_size = spec.screen_size;
      if (spec.touch_type) updates.touch_type = spec.touch_type;
    }

    // Extender
    if (typeName.includes("удлинитель")) {
      if (spec.ports) updates.ports = spec.ports;
      if (spec.length) updates.length = spec.length;
    }

    return updates;
  };

  useEffect(() => {
    const typeId = formValues.type_id;
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = formValues[specFieldName];

    if (selectedSpecId && specFieldName) {
      const availableSpecs = getSpecificationsForType(typeId);
      const spec = availableSpecs.find((s) => s.id === selectedSpecId);
      const typeName =
        equipmentTypes.find((t) => t.id === typeId)?.name?.toLowerCase() || "";

      if (spec) {
        const specDetails = updateSpecificationDetails(spec, typeName);
        setFormValues((prev) => ({
          ...prev,
          [specFieldName]: selectedSpecId,
          ...specDetails,
        }));
        setSelectedSpecification(spec);
      }
    }
  }, [
    formValues.type_id,
    formValues.computer_specification_id,
    formValues.notebook_specification_id,
    formValues.monoblok_specification_id,
    equipmentTypes,
    specifications,
  ]);

  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleInnChange = (equipmentId, value) => {
    setInnValues((prev) => ({ ...prev, [`inn_${equipmentId}`]: value }));
    if (errors[`inn_${equipmentId}`]) {
      setErrors((prev) => ({ ...prev, [`inn_${equipmentId}`]: null }));
    }
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Можно загружать только JPG/PNG файлы!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Изображение должно быть меньше 2MB!");
      return false;
    }
    return false;
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      setFormValues((prev) => ({
        ...prev,
        image: newFileList[0].originFileObj,
      }));
    } else {
      setFormValues((prev) => ({ ...prev, image: null }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formValues.name_prefix || formValues.name_prefix.trim() === "") {
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
    if (
      specFieldName &&
      !formValues[specFieldName] &&
      availableSpecs.length > 0
    ) {
      newErrors[specFieldName] = "Выберите шаблон!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    createdEquipment.forEach((equipment, index) => {
      if (
        !innValues[`inn_${equipment.id}`] ||
        innValues[`inn_${equipment.id}`].trim() === ""
      ) {
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

    setIsSubmitting(true);
    try {
      const specFieldName = getSpecificationFieldName(formValues.type_id);
      const typeName =
        equipmentTypes
          .find((t) => t.id === formValues.type_id)
          ?.name?.toLowerCase() || "";

      const equipmentData = {
        type_id: formValues.type_id,
        room_id: formValues.room_id,
        name_prefix: formValues.name_prefix,
        description: formValues.description,
        status: formValues.status,
        contract_id: formValues.contract_id,
        count: formValues.count || 1,
      };

      if (specFieldName && formValues[specFieldName]) {
        equipmentData[specFieldName] = formValues[specFieldName];
      }

      let finalData;
      if (formValues.image) {
        finalData = new FormData();
        Object.keys(equipmentData).forEach((key) => {
          if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
            finalData.append(key, equipmentData[key]);
          }
        });
        finalData.append("image", formValues.image);
      } else {
        finalData = equipmentData;
      }

      const result = await dispatch(createEquipmentBulk(finalData)).unwrap();
      setCreatedEquipment(result);
      setCurrentStep(2);
      message.success(`Создано ${result.length} единиц оборудования`);
    } catch (error) {
      console.error("Equipment creation error:", error);
      message.error("Ошибка при создании оборудования");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Submit = async () => {
    if (!validateStep3()) {
      message.error("Пожалуйста, заполните все поля ИНН!");
      return;
    }

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQRCodes = async () => {
    setIsSubmitting(true);
    try {
      console.log("Starting QR code download...");
      console.log("Created equipment:", createdEquipment);

      const equipmentForPDF = createdEquipment.map((equipment, index) => {
        const innValue =
          innValues[`inn_${equipment.id}`] ||
          `ИНН${String(index + 1).padStart(9, "0")}`;

        console.log(`Equipment ${index + 1}:`, {
          name: equipment.name,
          inn: innValue,
          uid: equipment.uid,
          type_data: equipment.type_data,
          room_data: equipment.room_data,
        });

        return {
          ...equipment,
          inn: innValue,
        };
      });

      console.log("Prepared equipment for PDF:", equipmentForPDF);

      message.loading("Создание PDF файла...", 0);
      await generateQRCodesPDF(equipmentForPDF);
      message.destroy();
      message.success("QR-коды успешно скачаны!");
    } catch (error) {
      message.destroy();
      console.error("QR code download error:", error);
      message.error(`Ошибка при скачивании QR-кодов: ${error.message}`);
    } finally {
      setIsSubmitting(false);
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
      projector_specification_id: null,
      printer_specification_id: null,
      tv_specification_id: null,
      router_specification_id: null,
      notebook_specification_id: null,
      monoblok_specification_id: null,
      whiteboard_specification_id: null,
      extender_specification_id: null,
      monitor_specification_id: null,
      cpu: "",
      ram: "",
      storage: "",
      monitor_size: "",
      has_mouse: false,
      has_keyboard: false,
      model: "",
      lumens: "",
      resolution: "",
      throw_type: "",
      screen_size: "",
      panel_type: "",
      refresh_rate: "",
      color: false,
      duplex: false,
      ports: "",
      wifi_standart: "",
      touch_type: "",
      length: "",
      gpu_model: "",
      storageList: [],
      image: null,
    });
    setCreatedEquipment([]);
    setSelectedSpecification(null);
    setIsCompleted(false);
    setInnValues({});
    setErrors({});
    setFileList([]);
    setIsSubmitting(false);
    setIsStep1Valid(false);
    setIsStep2Valid(false);
    setIsStep3Valid(false);
  };

  const handleSpecificationChange = (value) => {
    const availableSpecs = getSpecificationsForType(formValues.type_id);
    const spec = availableSpecs.find((s) => s.id === value);
    const typeName =
      equipmentTypes
        .find((t) => t.id === formValues.type_id)
        ?.name?.toLowerCase() || "";

    setSelectedSpecification(spec);

    const specFieldName = getSpecificationFieldName(formValues.type_id);
    if (specFieldName && spec) {
      const specDetails = updateSpecificationDetails(spec, typeName);
      setFormValues((prev) => ({
        ...prev,
        [specFieldName]: value,
        ...specDetails,
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
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              maxCount={1}
              showUploadList={{
                showPreviewIcon: false,
                showRemoveIcon: true,
              }}
            >
              {fileList.length === 0 && (
                <div className="flex flex-col items-center">
                  <FiUpload />
                  <div style={{ marginTop: 8 }}>Загрузить</div>
                </div>
              )}
            </Upload>
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
          <Button
            className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
            style={{ width: "100%" }}
            onClick={onCancel}
          >
            Отмена
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type="primary"
            className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
            style={{ width: "100%" }}
            onClick={handleStep1Submit}
            disabled={!isStep1Valid}
            loading={isSubmitting && currentStep === 0}
          >
            {isSubmitting && currentStep === 0 ? "Загрузка..." : "Далее"}
          </Button>
        </Col>
      </Row>
    </div>
  );

  const renderStep2 = () => {
    const typeId = formValues.type_id;
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = formValues[specFieldName];
    const typeName =
      equipmentTypes.find((t) => t.id === typeId)?.name?.toLowerCase() || "";

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
                    placeholder="Выберите шаблон"
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

            {(typeName.includes("компьютер") ||
              typeName.includes("ноутбук") ||
              typeName.includes("моноблок")) &&
              selectedSpecId && (
                <>
                  <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                    <Col span={12}>
                      <div className="flex flex-col">
                        <label className="text-gray-600 mb-1">Процессор:</label>
                        <Input
                          value={formValues.cpu || "N/A"}
                          disabled
                          style={{ height: "40px" }}
                        />
                      </div>
                    </Col>
                    {(typeName.includes("ноутбук") ||
                      typeName.includes("моноблок")) && (
                      <Col span={12}>
                        <div className="flex flex-col">
                          <label className="text-gray-600 mb-1">
                            Размер экрана:
                          </label>
                          <Input
                            value={formValues.monitor_size || "N/A"}
                            disabled
                            style={{ height: "40px" }}
                          />
                        </div>
                      </Col>
                    )}
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                    <Col span={12}>
                      <div className="flex flex-col">
                        <label className="text-gray-600 mb-1">Мышка:</label>
                        <div
                          style={{
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Switch checked={formValues.has_mouse} disabled />
                          <span className="ml-2">
                            {formValues.has_mouse ? "Есть" : "Нет"}
                          </span>
                        </div>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="flex flex-col">
                        <label className="text-gray-600 mb-1">
                          Клавиатура:
                        </label>
                        <div
                          style={{
                            height: "40px",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Switch checked={formValues.has_keyboard} disabled />
                          <span className="ml-2">
                            {formValues.has_keyboard ? "Есть" : "Нет"}
                          </span>
                        </div>
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

        <Row gutter={16} className="mt-4">
          <Col span={12}>
            <Button
              className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
              style={{ width: "100%" }}
              onClick={() => setCurrentStep(0)}
            >
              Назад
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
              style={{ width: "100%" }}
              onClick={handleStep2Submit}
              disabled={!isStep2Valid}
              loading={isSubmitting && currentStep === 1}
            >
              {isSubmitting && currentStep === 1 ? "Создание..." : "Далее"}
            </Button>
          </Col>
        </Row>
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
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Создание PDF..." : "Скачать QR-коды"}
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
        <Row gutter={16} className="mt-4">
          <Col span={12}>
            <Button
              className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
              style={{ width: "100%" }}
              onClick={() => setCurrentStep(1)}
            >
              Назад
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
              style={{ width: "100%" }}
              onClick={handleStep3Submit}
              disabled={!isStep3Valid}
              loading={isSubmitting && currentStep === 2}
            >
              {isSubmitting && currentStep === 2 ? "Сохранение..." : "Далее"}
            </Button>
          </Col>
        </Row>
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
