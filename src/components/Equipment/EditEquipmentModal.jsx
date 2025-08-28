import {
  Modal,
  Input,
  Select,
  Button,
  Row,
  Col,
  Switch,
  message,
  Form,
  Upload,
  Tooltip,
} from "antd";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiPlus, FiInfo } from "react-icons/fi";
import { updateEquipment } from "../../store/slices/equipmentSlice";
import { getAllSpecifications } from "../../store/slices/specificationSlice";
import { getContracts } from "../../store/slices/contractSlice";
import CreateSpecificationForm from "./CreateSpecificationForm";
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
import { inventoryTypes } from "../../constants";

const { Option } = Select;
const { TextArea } = Input;

const EditEquipmentModal = ({ visible, onCancel, equipment }) => {
  const [form] = Form.useForm();
  const [specForm] = Form.useForm();
  const [formValues, setFormValues] = useState({});
  const [selectedSpecification, setSelectedSpecification] = useState(null);
  const [createSpecModalVisible, setCreateSpecModalVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileList, setFileList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Original values reference to track changes
  const originalValues = useRef({});
  const [changedFields, setChangedFields] = useState(new Set());

  const dispatch = useDispatch();
  const { equipmentTypes } = useSelector((state) => state.equipment);
  const { contracts } = useSelector((state) => state.contracts);
  const specifications = useSelector((state) => state.specifications);

  useEffect(() => {
    console.log(equipment);

    if (visible) {
      dispatch(getAllSpecifications());
      dispatch(getContracts());
    }
  }, [visible, dispatch]);

  // Add second useEffect to handle contract loading
  useEffect(() => {
    if (contracts.length > 0 && equipment?.contract_id && form) {
      // Set contract_id after contracts are loaded
      form.setFieldValue("contract_id", equipment.contract_id);
    }
  }, [contracts, equipment, form]);

  useEffect(() => {
    if (visible && equipment) {
      const typeId = equipment.type_data?.id || equipment.type;
      if (!typeId) {
        message.error("Тип оборудования не указан");
        return;
      }

      const specFieldName = getSpecificationFieldName(typeId);
      const initialValues = {
        name: equipment.name || "",
        description: equipment.description || "",
        status: equipment.status || "NEW",
        contract_id: equipment.contract_id || equipment.contract?.id || null,
        type: typeId,
        inn: equipment.inn || "",
      };

      // Get specification data based on equipment type
      const specData = getSpecificationData(equipment);

      if (specFieldName) {
        // Check for existing specification ID in different places
        let specId = null;

        // Try to get specification ID from various sources
        if (equipment[specFieldName]) {
          specId = equipment[specFieldName];
        } else if (specData?.id) {
          specId = specData.id;
        } else {
          // Check for specification IDs in data fields
          const specIdFieldMap = {
            computer_specification_id: [
              "computer_specification_data",
              "computer_specification",
              "computer_details",
            ],
            projector_specification_id: [
              "projector_specification_data",
              "projector_specification",
              "projector_char",
            ],
            printer_specification_id: [
              "printer_specification_data",
              "printer_specification",
              "printer_char",
            ],
            tv_specification_id: ["tv_specification_data", "tv_char"],
            router_specification_id: [
              "router_specification_data",
              "router_specification",
              "router_char",
            ],
            notebook_specification_id: [
              "notebook_specification_data",
              "notebook_specification",
              "notebook_char",
            ],
            monoblok_specification_id: [
              "monoblok_specification_data",
              "monoblok_specification",
              "monoblok_char",
            ],
            whiteboard_specification_id: [
              "whiteboard_specification_data",
              "whiteboard_specification",
              "whiteboard_char",
            ],
            extender_specification_id: [
              "extender_specification_data",
              "extender_specification",
              "extender_char",
            ],
            monitor_specification_id: [
              "monitor_specification_data",
              "monitor_specification",
              "monitor_char",
            ],
          };

          const possibleFields = specIdFieldMap[specFieldName] || [];
          for (const field of possibleFields) {
            if (equipment[field]?.id) {
              specId = equipment[field].id;
              break;
            }
          }
        }

        if (specId) {
          initialValues[specFieldName] = specId;
        }

        // Always set specification data if available
        const effectiveSpecData =
          specData ||
          equipment.computer_details ||
          equipment.notebook_char ||
          equipment.monoblok_char;
        if (effectiveSpecData) {
          setSelectedSpecification(effectiveSpecData);
          // Set specification details
          Object.assign(
            initialValues,
            extractSpecificationDetails(effectiveSpecData, equipment)
          );
        }
      }

      // Handle image
      if (equipment.photo || equipment.image) {
        const imageUrl = equipment.photo || equipment.image;
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: imageUrl,
          },
        ]);
      }

      // Store original values for comparison
      originalValues.current = { ...initialValues };

      setFormValues(initialValues);
      form.setFieldsValue(initialValues);

      // Reset changed fields
      setChangedFields(new Set());

      // Log for debugging
      console.log("Initial values set:", initialValues);
      console.log("Selected specification:", specData);
      console.log("Contract ID:", initialValues.contract_id);
    }
  }, [visible, equipment, form, equipmentTypes]);

  // Helper function to track changed fields
  const trackFieldChange = (fieldName, newValue) => {
    const originalValue = originalValues.current[fieldName];

    // Compare values (handle null, undefined, and empty string cases)
    const isChanged = !isEqual(originalValue, newValue);

    setChangedFields((prev) => {
      const newSet = new Set(prev);
      if (isChanged) {
        newSet.add(fieldName);
      } else {
        newSet.delete(fieldName);
      }
      return newSet;
    });
  };

  // Helper function to compare values
  const isEqual = (val1, val2) => {
    // Handle null/undefined/empty string cases
    if (
      (val1 === null || val1 === undefined || val1 === "") &&
      (val2 === null || val2 === undefined || val2 === "")
    ) {
      return true;
    }

    // Compare other values
    return val1 === val2;
  };

  // Modified handleInputChange to track changes
  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    form.setFieldValue(name, value);

    // Track the change
    trackFieldChange(name, value);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Helper function to get specification data
  const getSpecificationData = (equipment) => {
    if (!equipment) return null;

    return (
      equipment.computer_specification_data ||
      equipment.computer_specification ||
      equipment.computer_details ||
      equipment.projector_specification_data ||
      equipment.projector_specification ||
      equipment.projector_char ||
      equipment.printer_specification_data ||
      equipment.printer_specification ||
      equipment.printer_char ||
      equipment.tv_specification_data ||
      equipment.tv_char ||
      equipment.router_specification_data ||
      equipment.router_specification ||
      equipment.router_char ||
      equipment.notebook_specification_data ||
      equipment.notebook_specification ||
      equipment.notebook_char ||
      equipment.monoblok_specification_data ||
      equipment.monoblok_specification ||
      equipment.monoblok_char ||
      equipment.whiteboard_specification_data ||
      equipment.whiteboard_specification ||
      equipment.whiteboard_char ||
      equipment.extender_specification_data ||
      equipment.extender_specification ||
      equipment.extender_char ||
      equipment.monitor_specification_data ||
      equipment.monitor_specification ||
      equipment.monitor_char ||
      null
    );
  };

  // Helper function to extract specification details
  const extractSpecificationDetails = (spec, equipment) => {
    const details = {};

    if (spec) {
      // Common fields
      details.cpu = spec.cpu || "";
      details.ram = spec.ram || "";
      details.model = spec?.model || "";

      // Handle storage/disks
      if (equipment.disks && equipment.disks.length > 0) {
        const storageInfo = equipment.disks
          .map((disk) => `${disk.capacity_gb}GB ${disk.disk_type}`)
          .join(", ");
        details.storage = storageInfo;
      } else if (
        spec.disk_specifications &&
        spec.disk_specifications.length > 0
      ) {
        const storageInfo = spec.disk_specifications
          .map((disk) => `${disk.capacity_gb}GB ${disk.disk_type}`)
          .join(", ");
        details.storage = storageInfo;
      } else {
        details.storage = spec.storage || "";
      }

      // Handle GPUs
      if (equipment.gpus && equipment.gpus.length > 0) {
        details.gpu = equipment.gpus.map((gpu) => gpu?.model).join(", ");
      }

      // Monitor/screen size
      details.monitor_size = spec.monitor_size || spec.screen_size || "";

      // Computer specific
      details.has_mouse = spec.has_mouse || false;
      details.has_keyboard = spec.has_keyboard || false;

      // Projector specific
      details.lumens = spec?.lumens || "";
      details.resolution = spec.resolution || "";
      details.throw_type = spec.throw_type || "";

      // TV/Monitor specific
      details.screen_size = spec.screen_size || "";
      details.panel_type = spec.panel_type || "";
      details.refresh_rate = spec.refresh_rate || "";

      // Printer specific
      details.color = spec.color || false;
      details.duplex = spec.duplex || false;

      // Router specific
      details.ports = spec.ports || "";
      details.wifi_standart = spec.wifi_standart || "";

      // Whiteboard specific
      details.touch_type = spec.touch_type || "";

      // Extender specific
      details.length = spec.length || "";

      if (spec.id) {
        details.id = spec.id;
      }
    }

    return details;
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
    if (typeName.includes("монитор")) return "monitor_specification_id";
    return null;
  };

  const getSpecificationsForType = (typeId) => {
    const type = equipmentTypes.find((t) => t.id === typeId);
    if (!type) return [];

    const typeName = type.name.toLowerCase();
    const specKey = inventoryTypes.find(
      (c) => c.name.toLowerCase() === typeName
    )?.key;
    return specifications[specKey] || [];
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
    if (newFileList.length > 0 && newFileList[0]?.originFileObj) {
      setFormValues((prev) => ({
        ...prev,
        image: newFileList[0]?.originFileObj,
      }));
      // Track image change
      setChangedFields((prev) => new Set([...prev, "image"]));
    } else {
      setFormValues((prev) => ({ ...prev, image: null }));
      // Remove image from changed fields if deleted
      setChangedFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete("image");
        return newSet;
      });
    }
  };

  const handleSpecificationChange = (value) => {
    const typeId = equipment?.type_data?.id || equipment?.type;
    const availableSpecs = getSpecificationsForType(typeId);
    const spec = availableSpecs.find((s) => s.id === value);
    setSelectedSpecification(spec || null);

    const specFieldName = getSpecificationFieldName(typeId);
    if (specFieldName && spec) {
      let storageDisplay = "";
      if (spec?.disk_specifications && spec.disk_specifications.length > 0) {
        storageDisplay = spec.disk_specifications
          .map((disk) => `${disk.capacity_gb}GB ${disk.disk_type}`)
          .join(", ");
      } else {
        storageDisplay = spec?.storage || "";
      }

      const newValues = {
        ...formValues,
        [specFieldName]: value,
        cpu: spec?.cpu || "",
        ram: spec?.ram || "",
        storage: storageDisplay,
        monitor_size: spec?.monitor_size || spec?.screen_size || "",
        has_mouse: spec?.has_mouse || false,
        has_keyboard: spec?.has_keyboard || false,
        model: spec?.model || "",
        lumens: spec?.lumens || "",
        resolution: spec?.resolution || "",
        throw_type: spec?.throw_type || "",
        screen_size: spec?.screen_size || "",
        panel_type: spec?.panel_type || "",
        refresh_rate: spec?.refresh_rate || "",
        color: spec?.color || false,
        duplex: spec?.duplex || false,
        ports: spec?.ports || "",
        wifi_standart: spec?.wifi_standart || "",
        touch_type: spec?.touch_type || "",
        length: spec?.length || "",
      };
      setFormValues(newValues);
      form.setFieldsValue(newValues);

      // Track specification change
      trackFieldChange(specFieldName, value);
    } else {
      setFormValues((prev) => ({ ...prev, [specFieldName]: null }));
      form.setFieldsValue({ [specFieldName]: null });
      trackFieldChange(specFieldName, null);
    }
  };

  const handleCreateNewSpec = () => {
    setCreateSpecModalVisible(true);
  };

  const handleSpecCreate = async (values) => {
    setIsSubmitting(true);
    try {
      const typeId = equipment?.type_data?.id || equipment?.type;
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
      else {
        message.error("Неизвестный тип оборудования");
        return;
      }

      const response = await dispatch(action(values)).unwrap();
      const specFieldName = getSpecificationFieldName(typeId);
      if (specFieldName) {
        setFormValues((prev) => ({
          ...prev,
          [specFieldName]: response.id,
        }));
        form.setFieldsValue({ [specFieldName]: response.id });
        setSelectedSpecification(response);

        // Track specification change
        trackFieldChange(specFieldName, response.id);
      }
      setCreateSpecModalVisible(false);
      message.success("Характеристика успешно создана!");
      await dispatch(getAllSpecifications());
    } catch (error) {
      console.error("Specification creation error:", error);
      message.error("Ошибка при создании характеристики");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);

    try {
      // Build update data with only changed fields
      const updateData = {};

      // Check each field for changes
      changedFields.forEach((field) => {
        if (field === "image") {
          // Image will be handled separately
          return;
        }

        // Only add changed fields to update data
        if (values[field] !== undefined) {
          updateData[field] = values[field];
        }
      });

      // Special handling for specification fields
      const typeId = equipment?.type_data?.id || equipment?.type;
      const specFieldName = getSpecificationFieldName(typeId);

      if (specFieldName && changedFields.has(specFieldName)) {
        updateData[specFieldName] = values[specFieldName];
      }

      // Handle contract_id specifically if changed
      if (changedFields.has("contract_id")) {
        updateData.contract_id = values.contract_id || null;
      }

      // If no fields changed, just close the modal
      if (Object.keys(updateData).length === 0 && !changedFields.has("image")) {
        message.info("Никаких изменений не было внесено");
        if (onCancel) {
          onCancel();
        }
        return;
      }

      // Log what's being sent
      console.log("Changed fields:", Array.from(changedFields));
      console.log("Update data being sent:", updateData);

      let finalData;

      // Check if image was changed
      if (changedFields.has("image") && formValues.image) {
        finalData = new FormData();

        // Add only changed fields to FormData
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === "object") {
              finalData.append(key, JSON.stringify(value));
            } else {
              finalData.append(key, value);
            }
          }
        });

        // Add image
        finalData.append("image", formValues.image);
      } else if (Object.keys(updateData).length > 0) {
        // Send only changed fields as JSON
        finalData = updateData;
      } else {
        message.info("Никаких изменений не было внесено");
        if (onCancel) {
          onCancel();
        }
        return;
      }

      const response = await dispatch(
        updateEquipment({
          id: equipment.id,
          data: finalData,
        })
      ).unwrap();

      message.success("Оборудование успешно обновлено!");

      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.contract_id?.[0] ||
        error?.response?.data?.non_field_errors?.[0] ||
        error?.message ||
        "Ошибка при обновлении оборудования";

      message.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get characteristic data
  const getCharacteristicData = (typeName, equipment) => {
    if (typeName?.includes("компьютер")) {
      return {
        field: "computer_char",
        data: {
          cpu: equipment.computer_details?.cpu || "",
          ram: equipment.computer_details?.ram || "",
          has_keyboard: equipment.computer_details?.has_keyboard || false,
          has_mouse: equipment.computer_details?.has_mouse || false,
        },
      };
    } else if (typeName?.includes("ноутбук")) {
      return {
        field: "notebook_char",
        data: {
          cpu: equipment.notebook_details?.cpu || "",
          ram: equipment.notebook_details?.ram || "",
          has_keyboard: equipment.notebook_details?.has_keyboard || false,
          has_mouse: equipment.notebook_details?.has_mouse || false,
          screen_size: equipment.notebook_details?.screen_size || "",
        },
      };
    } else if (typeName?.includes("моноблок")) {
      return {
        field: "monoblok_char",
        data: {
          cpu: equipment.monoblok_details?.cpu || "",
          ram: equipment.monoblok_details?.ram || "",
          has_keyboard: equipment.monoblok_details?.has_keyboard || false,
          has_mouse: equipment.monoblok_details?.has_mouse || false,
          screen_size: equipment.monoblok_details?.screen_size || "",
        },
      };
    }
    // Add other equipment types as needed
    return { field: null, data: null };
  };

  const renderSpecificationSection = () => {
    const typeId = equipment?.type_data?.id || equipment?.type;
    const typeName = equipmentTypes
      ?.find((t) => t.id === typeId)
      ?.name?.toLowerCase();
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);

    // Get current specification from equipment data or selected specification
    const currentSpec =
      selectedSpecification ||
      getSpecificationData(equipment) ||
      equipment.computer_details ||
      equipment.notebook_char ||
      equipment.monoblok_char;

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Характеристики" name={specFieldName}>
              <Select
                placeholder="Выберите характеристику"
                onChange={handleSpecificationChange}
                style={{ height: "40px" }}
                allowClear
              >
                {availableSpecs.length > 0 ? (
                  availableSpecs.map((spec) => (
                    <Option key={spec.id} value={spec.id}>
                      {spec?.model || spec.cpu || `Шаблон ${spec.id}`}
                    </Option>
                  ))
                ) : (
                  <Option value={null} disabled>
                    Нет доступных шаблонов
                  </Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12} className="flex items-start mt-8">
            <Button
              type="link"
              icon={<FiPlus />}
              onClick={handleCreateNewSpec}
              className="text-[#4E38F2] hover:text-[#4A63D7]"
            >
              Создать новый шаблон
            </Button>
          </Col>
        </Row>

        {/* Always show specification details if available */}
        {(currentSpec || equipment) &&
          renderSpecificationDetails(typeName, currentSpec)}

        {/* Show equipment-specific raw data if no specification */}
        {!currentSpec &&
          equipment &&
          (equipment.disks?.length > 0 || equipment.gpus?.length > 0) &&
          renderEquipmentDetails(typeName, equipment)}
      </>
    );
  };

  const renderEquipmentDetails = (typeName, equipment) => {
    // Show raw equipment data when no specification is selected
    if (!equipment) return null;

    const typeId = equipment?.type_data?.id || equipment?.type;
    const type = equipmentTypes.find((t) => t.id === typeId);

    if (!type) return null;

    // Basic info that might be available
  };

  const renderSpecificationDetails = (typeName, spec) => {
    if (!spec && !equipment) return null;

    // Use spec or fall back to equipment data directly
    const data =
      spec ||
      equipment.computer_details ||
      equipment.notebook_char ||
      equipment.monoblok_char ||
      {};

    if (
      typeName?.includes("компьютер") ||
      typeName?.includes("ноутбук") ||
      typeName?.includes("моноблок")
    ) {
      return (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Процессор">
                <Input
                  value={data.cpu || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="ОЗУ">
                <Input
                  value={data.ram || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Накопитель">
                <Input
                  value={
                    equipment?.disks?.length > 0
                      ? equipment.disks
                          .map(
                            (disk) => `${disk.capacity_gb}GB ${disk.disk_type}`
                          )
                          .join(", ")
                      : data.disk_specifications?.length > 0
                      ? data.disk_specifications
                          .map(
                            (disk) => `${disk.capacity_gb}GB ${disk.disk_type}`
                          )
                          .join(", ")
                      : data.storage || "N/A"
                  }
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Видеокарта">
                <Input
                  value={
                    equipment?.gpus?.length > 0
                      ? equipment.gpus.map((gpu) => gpu?.model).join(", ")
                      : data.gpu || "N/A"
                  }
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          {(typeName?.includes("ноутбук") ||
            typeName?.includes("моноблок")) && (
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item label="Размер экрана">
                  <Input
                    value={data.screen_size || data.monitor_size || "N/A"}
                    disabled
                    style={{ height: "40px" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Мышка">
                <Switch checked={data.has_mouse || false} disabled />
                <span className="ml-2">{data.has_mouse ? "Есть" : "Нет"}</span>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Клавиатура">
                <Switch checked={data.has_keyboard || false} disabled />
                <span className="ml-2">
                  {data.has_keyboard ? "Есть" : "Нет"}
                </span>
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    }

    if (typeName?.includes("проектор")) {
      return (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Модель">
                <Input
                  value={spec?.model || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Яркость (люмен)">
                <Input
                  value={spec?.lumens || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Разрешение">
                <Input
                  value={spec?.resolution || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Тип проекции">
                <Input
                  value={spec?.throw_type || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    }

    if (typeName?.includes("принтер")) {
      return (
        <>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Модель">
                <Input
                  value={spec?.model || "N/A"}
                  disabled
                  style={{ height: "40px" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Цветная печать">
                <Switch checked={spec?.color} disabled />
                <span className="ml-2">{spec.color ? "Есть" : "Нет"}</span>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Двусторонняя печать">
                <Switch checked={spec?.duplex} disabled />
                <span className="ml-2">{spec.duplex ? "Есть" : "Нет"}</span>
              </Form.Item>
            </Col>
          </Row>
        </>
      );
    }

    // Add other equipment types rendering here...
    return null;
  };

  if (!equipment) return null;

  return (
    <>
      <Modal
        title={null}
        visible={visible}
        onCancel={() => {
          form.resetFields();
          setFormValues({});
          setSelectedSpecification(null);
          setFileList([]);
          setErrors({});
          setChangedFields(new Set());
          originalValues.current = {};
          onCancel();
        }}
        footer={null}
        width={800}
        className="rounded-lg"
        destroyOnClose
      >
        <div className="px-6 py-4 mb-3">
          <div className="flex items-center justify-center relative">
            <div className="line w-[100%] h-[6px] rounded-full z-10 absolute bg-[#4E38F2]"></div>
            <div className="bg-[#4E38F2] inline py-2 relative z-20 px-4 font-bold text-white rounded-[10px]">
              Редактирование оборудования
            </div>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" noStyle>
            <Input type="hidden" />
          </Form.Item>

          {/* Basic Information Section */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Основная информация
            </h3>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Название техники"
                  name="name"
                  rules={[{ required: true, message: "Введите название!" }]}
                >
                  <Input
                    placeholder="Название техники"
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    style={{ height: "40px" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={
                    <span>
                      Инвентарный номер (INN)
                      <Tooltip title="Уникальный инвентарный номер оборудования">
                        <FiInfo className="ml-2 inline text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                  name="inn"
                  rules={[
                    { required: true, message: "Введите инвентарный номер!" },
                  ]}
                >
                  <Input
                    placeholder="Например: 2316532245"
                    onChange={(e) => handleInputChange("inn", e.target.value)}
                    style={{ height: "40px" }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Состояние"
                  name="status"
                  rules={[{ required: true, message: "Выберите состояние!" }]}
                >
                  <Select
                    placeholder="Выберите состояние"
                    onChange={(value) => handleInputChange("status", value)}
                    style={{ height: "40px" }}
                  >
                    <Option value="NEW">Новое</Option>
                    <Option value="WORKING">Работает</Option>
                    <Option value="NEEDS_REPAIR">Требуется ремонт</Option>
                    <Option value="DISPOSED">Утилизировано</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Договор" name="contract_id">
                  <Select
                    placeholder="Выберите договор"
                    onChange={(value) =>
                      handleInputChange("contract_id", value)
                    }
                    allowClear
                    style={{ height: "40px" }}
                  >
                    {contracts.map((contract) => (
                      <Option key={contract.id} value={contract.id}>
                        {contract.number} - {contract.name || "Без названия"}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Описание" name="description">
              <TextArea
                rows={3}
                placeholder="Введите описание оборудования"
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
              />
            </Form.Item>

            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div className="flex items-center justify-between">
                  <span className="text-gray-700 font-medium">
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
          </div>

          {/* Technical Specifications Section */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">
              Технические характеристики
            </h3>
            {renderSpecificationSection()}
          </div>

          {equipment?.repair_record && (
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h3 className="text-lg font-semibold mb-2 text-yellow-700">
                Информация о ремонте
              </h3>
              <p className="text-sm text-yellow-600">Статус: В ремонте</p>
            </div>
          )}

          {/* Show changed fields indicator */}
          {changedFields.size > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600">
                Изменено полей: {changedFields.size} (
                {Array.from(changedFields).join(", ")})
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <Row gutter={16} className="mt-6">
            <Col span={12}>
              <Button
                type="default"
                className="w-full h-[45px] rounded-[10px] font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 border-0 transition-all duration-200"
                onClick={() => {
                  form.resetFields();
                  setFormValues({});
                  setSelectedSpecification(null);
                  setFileList([]);
                  setErrors({});
                  setChangedFields(new Set());
                  originalValues.current = {};
                  onCancel();
                }}
                disabled={isSubmitting}
              >
                Отмена
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-[45px] rounded-[10px] font-semibold text-white bg-[#4E38F2] hover:bg-[#3d2dc7] border-0 transition-all duration-200"
                disabled={isSubmitting || changedFields.size === 0}
                loading={isSubmitting}
              >
                {isSubmitting ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </Col>
          </Row>
        </Form>
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
            name: equipmentTypes.find(
              (t) => t.id === (equipment?.type_data?.id || equipment?.type)
            )?.name,
          }}
          onSubmit={handleSpecCreate}
          onCancel={() => {
            setCreateSpecModalVisible(false);
            specForm.resetFields();
          }}
          isEdit={false}
        />
      </Modal>
    </>
  );
};

export default EditEquipmentModal;
