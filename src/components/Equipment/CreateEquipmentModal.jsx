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
  Form,
  Typography,
} from "antd";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiDownload, FiPlus } from "react-icons/fi";
import {
  createEquipmentBulk,
  bulkUpdateInn,
} from "../../store/slices/equipmentSlice";
import { getAllSpecifications } from "../../store/slices/specificationSlice";
import { getContracts } from "../../store/slices/contractSlice";
import { generateQRCodesPDF } from "../../utils/pdfGenerator";
import CreateSpecificationForm from "./CreateSpecificationForm";
import InnTemplateModal from "./InnTemplateModal";
import ProtectedInnInput from "./ProtectedInnInput";
import { equipmentAPI } from "../../services/api";
import {
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
} from "../../store/slices/specificationSlice";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const CreateEquipmentModal = ({
  visible,
  onCancel,
  room,
  equipmentType,
  equipmentTypes,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [createSpecModalVisible, setCreateSpecModalVisible] = useState(false);
  const [innTemplateModalVisible, setInnTemplateModalVisible] = useState(false);
  const [specForm] = Form.useForm();

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
    specification_id: null,
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
    photo: null,
  });
  const [createdEquipment, setCreatedEquipment] = useState([]);
  const [selectedSpecification, setSelectedSpecification] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [innValues, setInnValues] = useState({});
  const [templateInnValues, setTemplateInnValues] = useState({});
  const [templatePrefix, setTemplatePrefix] = useState("");
  const [errors, setErrors] = useState({});
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedImage, setSavedImage] = useState(null); // Store image from step 1

  // Validation states for each step
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);
  const [isStep3Valid, setIsStep3Valid] = useState(false);

  const dispatch = useDispatch();
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
    if (spec?.model) updates.modelspec?.model;
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
        updates.gpu_model = spec.gpu_specifications[0]?.model || "Unknown GPU";
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
      if (spec?.lumens) updates.lumens = spec?.lumens;
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
          specification_id: selectedSpecId,
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
      const file = newFileList[0].originFileObj;
      setFormValues((prev) => ({
        ...prev,
        photo: file,
      }));
      setSavedImage(file); // Save image for later use
    } else {
      setFormValues((prev) => ({ ...prev, photo: null }));
      setSavedImage(null);
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

      const equipmentData = {
        type_id: formValues.type_id,
        room_id: formValues.room_id,
        name_prefix: formValues.name_prefix,
        description: formValues.description,
        status: formValues.status,
        contract_id: formValues.contract_id,
        count: formValues.count || 1,
      };

      // Faqat turga mos specification field'ni qo'shish
      if (specFieldName && formValues[specFieldName]) {
        equipmentData[specFieldName] = formValues[specFieldName];
      }

      let finalData;
      if (savedImage) {
        finalData = new FormData();
        Object.keys(equipmentData).forEach((key) => {
          if (equipmentData[key] !== null && equipmentData[key] !== undefined) {
            finalData.append(key, equipmentData[key]);
          }
        });
        finalData.append("image", savedImage);
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

  const handleInnTemplateSelect = (data) => {
    setTemplateInnValues(data.innValues);
    setInnValues(data.innValues);
    setTemplatePrefix(data.templatePrefix);
    setInnTemplateModalVisible(false);
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

      // Use the updated API method with image
      const updateData = {
        equipments: equipments,
      };

      // Add image if it was saved from step 1
      if (savedImage) {
        updateData.image = savedImage;
      }

      await equipmentAPI.bulkUpdateInnWithImage(updateData);
      message.success("ИНН успешно присвоены!");
      setIsCompleted(true);
    } catch (error) {
      console.error("Bulk update INN error:", error);
      message.error("Ошибка при присвоении ИНН");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadQRCodes = async () => {
    setIsSubmitting(true);
    try {
      const equipmentForPDF = createdEquipment.map((equipment, index) => {
        const innValue =
          innValues[`inn_${equipment.id}`] ||
          `ИНН${String(index + 1).padStart(9, "0")}`;

        return {
          ...equipment,
          inn: innValue,
        };
      });

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
      photo: null,
    });
    setCreatedEquipment([]);
    setSelectedSpecification(null);
    setIsCompleted(false);
    setInnValues({});
    setTemplateInnValues({});
    setTemplatePrefix("");
    setErrors({});
    setFileList([]);
    setSavedImage(null);
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

  // Yangi shablon yaratish funksiyasi
  const handleCreateNewSpec = () => {
    setCreateSpecModalVisible(true);
  };

  const handleSpecCreate = async (values) => {
    try {
      const typeId = formValues.type_id;
      const typeName = equipmentTypes
        .find((t) => t.id === typeId)
        ?.name?.toLowerCase();
      let action;

      if (typeName?.includes("компьютер")) action = createComputerSpec;
      else if (typeName?.includes("проектор")) action = createProjectorSpec;
      else if (typeName?.includes("принтер")) action = createPrinterSpec;
      else if (typeName?.includes("телевизор")) action = createTVSpec;
      else if (typeName?.includes("роутер")) action = createRouterSpec;
      else if (typeName?.includes("ноутбук")) action = createNotebookSpec;
      else if (typeName?.includes("моноблок")) action = createMonoblokSpec;
      else if (typeName?.includes("доска")) action = createWhiteboardSpec;
      else if (typeName?.includes("удлинитель")) action = createExtenderSpec;
      else if (typeName?.includes("монитор")) action = createMonitorSpec;

      if (action) {
        const response = await dispatch(action(values)).unwrap();
        const specFieldName = getSpecificationFieldName(typeId);

        if (specFieldName) {
          // Avtomatik ravishda yangi yaratilgan xarakteristikani tanlash
          setFormValues((prev) => ({
            ...prev,
            [specFieldName]: response.id,
          }));
          setSelectedSpecification(response);
        }

        setCreateSpecModalVisible(false);
        message.success("Характеристика успешно создана и применена!");
        await dispatch(getAllSpecifications());
      }
    } catch (error) {
      console.error("Specification creation error:", error);
      message.error("Ошибка при создании характеристики");
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
          <div className="flex mb-5 items-center justify-between h-[40px]">
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
            className="w-100  rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
            style={{ width: "100%" }}
            onClick={onCancel}
          >
            Отмена
          </Button>
        </Col>
        <Col span={12}>
          <Button
            type="primary"
            className="w-100  rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
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

  // Enhanced Step 2 render with create button
  const renderStep2 = () => {
    const typeId = formValues.type_id;
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = formValues[specFieldName];
    const typeName =
      equipmentTypes.find((t) => t.id === typeId)?.name?.toLowerCase() || "";

    return (
      <div className="px-6 py-4">
        <Row gutter={[16, 16]}>
          <Col span={16}>
            <div className="flex flex-col">
              <Select
                value={selectedSpecId}
                onChange={handleSpecificationChange}
                placeholder={
                  availableSpecs.length > 0
                    ? "Выберите шаблон"
                    : "Нет доступных шаблонов"
                }
                style={{ height: "40px" }}
                allowClear
              >
                {availableSpecs.length > 0 ? (
                  availableSpecs.map((spec) => (
                    <Option key={spec.id} value={spec.id}>
                      {spec?.model || spec.cpu || `Характеристика ${spec.id}`}
                    </Option>
                  ))
                ) : (
                  <Option value={null} disabled>
                    Нет доступных шаблонов
                  </Option>
                )}
              </Select>
              {errors[specFieldName] && (
                <span className="text-red-500 text-sm">
                  {errors[specFieldName]}
                </span>
              )}
            </div>
          </Col>
          <Col span={8}>
            <Button
              type="dashed"
              icon={<FiPlus />}
              onClick={handleCreateNewSpec}
              className="h-[40px] w-full text-[#4E38F2] border-[#4E38F2] hover:bg-[#4E38F2] hover:text-white"
            >
              Создать шаблон
            </Button>
          </Col>
        </Row>

        {/* Enhanced specification display with ALL fields */}
        {selectedSpecification && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3 text-gray-800">
              Предварительный просмотр характеристик
            </h4>

            {(typeName.includes("компьютер") ||
              typeName.includes("ноутбук") ||
              typeName.includes("моноблок")) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">Процессор:</label>
                  <div className="font-medium">
                    {selectedSpecification.cpu || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">ОЗУ:</label>
                  <div className="font-medium">
                    {selectedSpecification.ram || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Видеокарта:</label>
                  <div className="font-medium">
                    {selectedSpecification.gpu_specifications?.[0]?.model ||
                      selectedSpecification.gpu_model ||
                      "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Накопители:</label>
                  <div className="font-medium">
                    {selectedSpecification.disk_specifications?.length > 0
                      ? selectedSpecification.disk_specifications
                          .map(
                            (disk) => `${disk.capacity_gb}GB ${disk.disk_type}`
                          )
                          .join(", ")
                      : selectedSpecification.storage || "N/A"}
                  </div>
                </div>
                {(typeName.includes("ноутбук") ||
                  typeName.includes("моноблок")) && (
                  <div>
                    <label className="text-gray-600 text-sm">
                      Размер экрана:
                    </label>
                    <div className="font-medium">
                      {selectedSpecification.monitor_size ||
                        selectedSpecification.screen_size ||
                        "N/A"}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-gray-600 text-sm">Периферия:</label>
                  <div className="font-medium">
                    {`Мышь: ${
                      selectedSpecification.has_mouse ? "Есть" : "Нет"
                    }, 
                      Клавиатура: ${
                        selectedSpecification.has_keyboard ? "Есть" : "Нет"
                      }`}
                  </div>
                </div>
              </div>
            )}

            {typeName.includes("проектор") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">Модель:</label>
                  <div className="font-medium">
                    {selectedSpecification?.model || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Яркость:</label>
                  <div className="font-medium">
                    {selectedSpecification?.lumens || "N/A"} люмен
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Разрешение:</label>
                  <div className="font-medium">
                    {selectedSpecification.resolution || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Тип проекции:</label>
                  <div className="font-medium">
                    {selectedSpecification.throw_type || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {typeName.includes("принтер") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">Модель:</label>
                  <div className="font-medium">
                    {selectedSpecification?.model || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">
                    Цветная печать:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.color ? "Да" : "Нет"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">
                    Двусторонняя печать:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.duplex ? "Да" : "Нет"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">
                    Серийный номер:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.serial_number || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {(typeName.includes("телевизор") ||
              typeName.includes("монитор")) && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">Модель:</label>
                  <div className="font-medium">
                    {selectedSpecification?.model || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">
                    Размер экрана:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.screen_size || "N/A"}"
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Разрешение:</label>
                  <div className="font-medium">
                    {selectedSpecification.resolution || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Тип матрицы:</label>
                  <div className="font-medium">
                    {selectedSpecification.panel_type || "N/A"}
                  </div>
                </div>
                {typeName.includes("монитор") && (
                  <div>
                    <label className="text-gray-600 text-sm">
                      Частота обновления:
                    </label>
                    <div className="font-medium">
                      {selectedSpecification.refresh_rate || "N/A"} Hz
                    </div>
                  </div>
                )}
              </div>
            )}

            {typeName.includes("роутер") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">Модель:</label>
                  <div className="font-medium">
                    {selectedSpecification?.model || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">
                    Количество портов:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.ports || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">
                    WiFi стандарт:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.wifi_standart || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {typeName.includes("доска") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">Модель:</label>
                  <div className="font-medium">
                    {selectedSpecification?.model || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Размер:</label>
                  <div className="font-medium">
                    {selectedSpecification.screen_size || "N/A"}"
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Тип касания:</label>
                  <div className="font-medium">
                    {selectedSpecification.touch_type || "N/A"}
                  </div>
                </div>
              </div>
            )}

            {typeName.includes("удлинитель") && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 text-sm">
                    Количество портов:
                  </label>
                  <div className="font-medium">
                    {selectedSpecification.ports || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-gray-600 text-sm">Длина кабеля:</label>
                  <div className="font-medium">
                    {selectedSpecification.length || "N/A"} м
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <Row gutter={16} className="items-center mt-4">
          <Col span={12}>
            <div className="flex items-center">
              <label>Количество инвентаря</label>
            </div>
          </Col>
          <Col span={12}>
            <Input
              value={formValues.count > 100 ? 100 : formValues.count}
              onChange={(e) => handleInputChange("count", e.target.value)}
              placeholder="Количество инвентаря"
              style={{ height: "40px" }}
              type="number"
            />
            {formValues.count > 100 && (
              <Text type="danger" style={{ fontSize: "12px" }}>
                {`max Количество инвентаря 100`}
              </Text>
            )}
            {formValues.count == "" && (
              <Text type="danger" style={{ fontSize: "12px" }}>
                {`min Количество инвентаря 1`}
              </Text>
            )}
          </Col>
        </Row>
        <Row gutter={16} className="mt-6">
          <Col span={12}>
            <Button
              className="w-100 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
              style={{ width: "100%" }}
              onClick={() => setCurrentStep(0)}
            >
              Назад
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              className="w-100 rounded-[10px] font-semibold text-white block hover:bg-indigo-600"
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
          <Button
            type="primary"
            onClick={() => setInnTemplateModalVisible(true)}
            className="bg-[#4E38F2] border-[#4E38F2] hover:bg-[#4A63D7]"
          >
            Выбрать шаблон ИНН
          </Button>
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
                <ProtectedInnInput
                  value={innValues[`inn_${equipment.id}`] || ""}
                  onChange={(value) => handleInnChange(equipment.id, value)}
                  templatePrefix={templatePrefix}
                  placeholder={`ИНН${String(index + 1).padStart(9, "0")}`}
                  style={{ height: "40px" }}
                />
                {templatePrefix && (
                  <div className="text-xs text-blue-600 mt-1">
                    Префикс "{templatePrefix}-" защищен от изменения
                  </div>
                )}
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
              className="w-100  rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
              style={{ width: "100%" }}
              onClick={() => setCurrentStep(1)}
            >
              Назад
            </Button>
          </Col>
          <Col span={12}>
            <Button
              type="primary"
              className="w-100 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
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
    <>
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

      {/* Create Specification Modal */}
      <Modal
        title={null}
        visible={createSpecModalVisible}
        onCancel={() => {
          setCreateSpecModalVisible(false);
          specForm.resetFields();
        }}
        footer={null}
        width={800}
        className="rounded-lg"
        destroyOnClose
      >
        <CreateSpecificationForm
          form={specForm}
          equipmentType={{
            name: equipmentTypes.find((t) => t.id === formValues.type_id)?.name,
          }}
          onSubmit={handleSpecCreate}
          onCancel={() => {
            setCreateSpecModalVisible(false);
            specForm.resetFields();
          }}
          isEdit={false}
        />
      </Modal>

      {/* INN Template Modal */}
      <InnTemplateModal
        visible={innTemplateModalVisible}
        onCancel={() => setInnTemplateModalVisible(false)}
        onSelect={handleInnTemplateSelect}
        createdEquipment={createdEquipment}
      />
    </>
  );
};

export default CreateEquipmentModal;
