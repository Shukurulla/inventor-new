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
} from "antd";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiPlus } from "react-icons/fi";
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

  const dispatch = useDispatch();
  const { loading, equipmentTypes } = useSelector((state) => state.equipment);
  const { contracts } = useSelector((state) => state.contracts);
  const specifications = useSelector((state) => state.specifications);

  useEffect(() => {
    if (visible) {
      dispatch(getAllSpecifications());
      dispatch(getContracts());
    }
  }, [visible, dispatch]);

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
      };

      if (specFieldName) {
        let specId = equipment[specFieldName];
        if (!specId) {
          const specObjectName = specFieldName.replace("_id", "");
          const specObject = equipment[specObjectName];
          if (specObject) {
            specId = specObject.id;
          }
        }
        if (specId) {
          initialValues[specFieldName] = specId;
        }
      }

      const spec =
        equipment.computer_specification ||
        equipment.projector_specification ||
        equipment.printer_specification ||
        equipment.tv_specification_data ||
        equipment.router_specification ||
        equipment.notebook_specification ||
        equipment.monoblok_specification ||
        equipment.whiteboard_specification ||
        equipment.extender_specification ||
        equipment.monitor_specification;

      if (spec) {
        setSelectedSpecification(spec);
        initialValues.cpu = spec.cpu || "";
        initialValues.ram = spec.ram || "";
        if (spec.disk_specifications && spec.disk_specifications.length > 0) {
          const storageInfo = spec.disk_specifications
            .map((disk) => `${disk.capacity_gb}GB ${disk.disk_type}`)
            .join(", ");
          initialValues.storage = storageInfo;
        } else {
          initialValues.storage = spec.storage || "";
        }
        initialValues.monitor_size =
          spec.monitor_size || spec.screen_size || "";
        initialValues.has_mouse = spec.has_mouse || false;
        initialValues.has_keyboard = spec.has_keyboard || false;
        initialValues.model = spec.model || "";
        initialValues.lumens = spec.lumens || "";
        initialValues.resolution = spec.resolution || "";
        initialValues.throw_type = spec.throw_type || "";
        initialValues.screen_size = spec.screen_size || "";
        initialValues.panel_type = spec.panel_type || "";
        initialValues.refresh_rate = spec.refresh_rate || "";
        initialValues.color = spec.color || false;
        initialValues.duplex = spec.duplex || false;
        initialValues.ports = spec.ports || "";
        initialValues.wifi_standart = spec.wifi_standart || "";
        initialValues.touch_type = spec.touch_type || "";
        initialValues.length = spec.length || "";
        initialValues.id = spec.id;
      }

      if (equipment.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: equipment.image,
          },
        ]);
      }

      setFormValues(initialValues);
      form.setFieldsValue(initialValues);
    }
  }, [visible, equipment, form, equipmentTypes]);

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

  const handleInputChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    form.setFieldValue(name, value);
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
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
    if (newFileList.length > 0 && newFileList[0]?.originFileObj) {
      setFormValues((prev) => ({
        ...prev,
        image: newFileList[0]?.originFileObj,
      }));
    } else {
      setFormValues((prev) => ({ ...prev, image: null }));
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
    } else {
      setFormValues((prev) => ({ ...prev, [specFieldName]: null }));
      form.setFieldsValue({ [specFieldName]: null });
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
      const typeId = equipment?.type_data?.id || equipment?.type;
      if (!typeId) {
        message.error("Тип оборудования не указан");
        return;
      }

      const type = equipmentTypes.find((t) => t.id === typeId);
      const typeName = type?.name?.toLowerCase();
      const specFieldName = getSpecificationFieldName(typeId);

      // FIXED: Ensure contract_id is properly handled
      const updateData = {
        name: values.name,
        description: values.description,
        status: values.status,
        type: typeId,
      };

      // FIXED: Handle contract_id specifically
      if (values.contract_id) {
        updateData.contract_id = values.contract_id;
      } else {
        // Explicitly set to null if no contract selected
        updateData.contract_id = null;
      }

      console.log("Form values received:", values);
      console.log("Current equipment contract:", equipment.contract);
      console.log("New contract_id to send:", updateData.contract_id);

      // Add specification data based on equipment type
      if (specFieldName && values[specFieldName]) {
        updateData[specFieldName] = values[specFieldName];
        console.log(`Setting ${specFieldName}:`, values[specFieldName]);
      } else {
        // If no specification selected, add empty char data to satisfy backend requirements
        if (typeName?.includes("компьютер")) {
          updateData.computer_char = {
            cpu: equipment.computer_details?.cpu || "",
            ram: equipment.computer_details?.ram || "",
            has_keyboard: equipment.computer_details?.has_keyboard || false,
            has_mouse: equipment.computer_details?.has_mouse || false,
          };
        } else if (typeName?.includes("ноутбук")) {
          updateData.notebook_char = {
            cpu: equipment.notebook_details?.cpu || "",
            ram: equipment.notebook_details?.ram || "",
            has_keyboard: equipment.notebook_details?.has_keyboard || false,
            has_mouse: equipment.notebook_details?.has_mouse || false,
            screen_size: equipment.notebook_details?.screen_size || "",
          };
        } else if (typeName?.includes("моноблок")) {
          updateData.monoblok_char = {
            cpu: equipment.monoblok_details?.cpu || "",
            ram: equipment.monoblok_details?.ram || "",
            has_keyboard: equipment.monoblok_details?.has_keyboard || false,
            has_mouse: equipment.monoblok_details?.has_mouse || false,
            screen_size: equipment.monoblok_details?.screen_size || "",
          };
        } else if (typeName?.includes("проектор")) {
          updateData.projector_char = {
            model: equipment.projector_char?.model || "",
            lumens: equipment.projector_char?.lumens || "",
            resolution: equipment.projector_char?.resolution || "",
            throw_type: equipment.projector_char?.throw_type || "",
          };
        } else if (typeName?.includes("принтер")) {
          updateData.printer_char = {
            model: equipment.printer_char?.model || "",
            color: equipment.printer_char?.color || false,
            duplex: equipment.printer_char?.duplex || false,
          };
        } else if (typeName?.includes("телевизор")) {
          updateData.tv_char = {
            model: equipment.tv_char?.model || "",
            screen_size: equipment.tv_char?.screen_size || "",
            panel_type: equipment.tv_char?.panel_type || "",
            refresh_rate: equipment.tv_char?.refresh_rate || "",
          };
        } else if (typeName?.includes("роутер")) {
          updateData.router_char = {
            model: equipment.router_char?.model || "",
            ports: equipment.router_char?.ports || "",
            wifi_standart: equipment.router_char?.wifi_standart || "",
          };
        } else if (typeName?.includes("доска")) {
          updateData.whiteboard_char = {
            model: equipment.whiteboard_char?.model || "",
            screen_size: equipment.whiteboard_char?.screen_size || "",
            touch_type: equipment.whiteboard_char?.touch_type || "",
          };
        } else if (typeName?.includes("удлинитель")) {
          updateData.extender_char = {
            ports: equipment.extender_char?.ports || "",
            length: equipment.extender_char?.length || "",
          };
        } else if (typeName?.includes("монитор")) {
          updateData.monitor_char = {
            model: equipment.monitor_char?.model || "",
            screen_size: equipment.monitor_char?.screen_size || "",
            panel_type: equipment.monitor_char?.panel_type || "",
            refresh_rate: equipment.monitor_char?.refresh_rate || "",
          };
        }
      }

      console.log("Final update data to send:", updateData);

      let finalData;
      if (formValues.image) {
        finalData = new FormData();
        Object.entries(updateData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (typeof value === "object") {
              finalData.append(key, JSON.stringify(value));
            } else {
              finalData.append(key, value);
            }
          }
        });
        finalData.append("image", formValues.image);

        console.log("Sending FormData with image");
        // Log FormData contents
        for (let [key, value] of finalData.entries()) {
          console.log(`FormData - ${key}:`, value);
        }
      } else {
        finalData = updateData;
        console.log("Sending JSON data:", finalData);
      }

      const response = await dispatch(
        updateEquipment({
          id: equipment.id,
          data: finalData,
        })
      ).unwrap();

      console.log("Update response:", response);

      message.success("Оборудование успешно обновлено!");

      // FIXED: Refresh the contract dependencies after successful update
      if (onCancel) {
        onCancel();
      }
    } catch (error) {
      console.error("Equipment update error:", error);
      console.error("Error details:", error?.response?.data);

      // Show more specific error message
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

  const renderSpecificationSection = () => {
    const typeId = equipment?.type;
    const typeName = equipmentTypes
      ?.find((t) => t.id === typeId)
      ?.name?.toLowerCase();
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const titleCharacteristics = (spec) => {
      console.log(spec);
      return "Caractristics";

      // if (spec.projector_specification_data !== null) {
      //   return `model: ${spec.projector_specification_data.model}`;
      // } else if (spec.computer_details !== null) {
      //   return `${spec.computer_details.cpu} ${spec.computer_details.ram} ${spec.computer_details?.disks[0]?.capacity_gb}GB ${spec.computer_details.disks[0]?.disk_type}`;
      // } else if (spec.printer_specification_data !== null) {
      //   return `model: ${spec.printer_specification_data.model}`;
      // } else if (
      //   spec.type_data?.name === "Моноблок" &&
      //   spec.disks?.length &&
      //   spec.gpus?.length
      // ) {
      //   return `Диск: ${spec.disks[0]?.capacity_gb}GB ${spec.disks[0]?.disk_type}, GPU: ${spec.gpus[0]?.model}`;
      // } else if (spec.whiteboard_specification_data !== null) {
      //   return `model: ${spec.whiteboard_specification_data.model} ${spec.whiteboard_specification_data.screen_size}`;
      // } else if (
      //   spec.type_data?.name === "Ноутбук" &&
      //   spec.disks?.length &&
      //   spec.gpus?.length
      // ) {
      //   return `Диск: ${spec.disks[0]?.capacity_gb}GB ${spec.disks[0]?.disk_type}, GPU: ${spec.gpus[0]?.model}`;
      // } else if (spec.router_char !== null) {
      //   return `model: ${spec.router_char.model} port: ${spec.router_char.ports}`;
      // } else if (spec.tv_specification_data !== null) {
      //   return `model: ${spec.tv_specification_data.model} port: ${spec.tv_specification_data.screen_size}`;
      // } else {
      //   return "Нет доступных шаблонов";
      // }
    };

    console.log("Type ID:", typeId);
    console.log("Type Name:", typeName);
    console.log("Available Specs:", availableSpecs);
    console.log("Spec Field Name:", specFieldName);
    console.log(titleCharacteristics(equipment));

    return (
      <>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item label="Характеристики" name={specFieldName}>
              <Select
                placeholder={titleCharacteristics(equipment)}
                onChange={handleSpecificationChange}
                style={{ height: "40px" }}
                allowClear
              >
                {availableSpecs.length > 0 ? (
                  availableSpecs.map((spec) => (
                    <Option key={spec.id} value={spec.id}>
                      {spec.model || spec.cpu || `Шаблон ${spec.id}`}
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

        {selectedSpecification && (
          <>
            {(typeName?.includes("компьютер") ||
              typeName?.includes("ноутбук") ||
              typeName?.includes("моноблок")) && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Процессор">
                      <Input
                        value={selectedSpecification.cpu || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="ОЗУ">
                      <Input
                        value={selectedSpecification.ram || "N/A"}
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
                          selectedSpecification.disk_specifications?.length > 0
                            ? selectedSpecification.disk_specifications
                                .map(
                                  (disk) =>
                                    `${disk.capacity_gb}GB ${disk.disk_type}`
                                )
                                .join(", ")
                            : selectedSpecification.storage || "N/A"
                        }
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Form.Item label="Мышка">
                        <Switch
                          checked={selectedSpecification.has_mouse}
                          disabled
                        />
                        <span className="ml-2">
                          {selectedSpecification.has_mouse ? "Есть" : "Нет"}
                        </span>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Клавиатура">
                        <Switch
                          checked={selectedSpecification.has_keyboard}
                          disabled
                        />
                        <span className="ml-2">
                          {selectedSpecification.has_keyboard ? "Есть" : "Нет"}
                        </span>
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* {(typeName?.includes("ноутбук") ||
                    typeName?.includes("моноблок")) && (
                    <Col span={12}>
                      <Form.Item label="Размер экрана">
                        <Input
                          value={
                            selectedSpecification.monitor_size ||
                            selectedSpecification.screen_size ||
                            "N/A"
                          }
                          disabled
                          style={{ height: "40px" }}
                        />
                      </Form.Item>
                    </Col>
                  )} */}
                </Row>
              </>
            )}

            {typeName?.includes("проектор") && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Модель">
                      <Input
                        value={selectedSpecification.model || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Яркость (люмен)">
                      <Input
                        value={selectedSpecification.lumens || "N/A"}
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
                        value={selectedSpecification.resolution || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Тип проекции">
                      <Input
                        value={selectedSpecification.throw_type || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {typeName?.includes("принтер") && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Модель">
                      <Input
                        value={selectedSpecification.model || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Цветная печать">
                      <Switch checked={selectedSpecification.color} disabled />
                      <span className="ml-2">
                        {selectedSpecification.color ? "Есть" : "Нет"}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Двусторонняя печать">
                      <Switch checked={selectedSpecification.duplex} disabled />
                      <span className="ml-2">
                        {selectedSpecification.duplex ? "Есть" : "Нет"}
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {(typeName?.includes("телевизор") ||
              typeName?.includes("монитор")) && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Модель">
                      <Input
                        value={selectedSpecification.model || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Размер экрана (дюймы)">
                      <Input
                        value={selectedSpecification.screen_size || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Тип матрицы">
                      <Input
                        value={selectedSpecification.panel_type || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Частота обновления (Hz)">
                      <Input
                        value={selectedSpecification.refresh_rate || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {typeName?.includes("роутер") && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Модель">
                      <Input
                        value={selectedSpecification.model || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Количество портов">
                      <Input
                        value={selectedSpecification.ports || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="WiFi стандарт">
                      <Input
                        value={selectedSpecification.wifi_standart || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {typeName?.includes("доска") && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Модель">
                      <Input
                        value={selectedSpecification.model || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Размер (дюймы)">
                      <Input
                        value={selectedSpecification.screen_size || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Тип касания">
                      <Input
                        value={selectedSpecification.touch_type || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {typeName?.includes("удлинитель") && (
              <>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Form.Item label="Количество портов">
                      <Input
                        value={selectedSpecification.ports || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Длина кабеля (м)">
                      <Input
                        value={selectedSpecification.length || "N/A"}
                        disabled
                        style={{ height: "40px" }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
          </>
        )}
      </>
    );
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
              <div className="flex mt-7 items-center justify-between h-[40px]">
                <span className="text-gray-700 text-lg  font-semibold">
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

          <Form.Item label="Описание" name="description">
            <TextArea
              rows={4}
              placeholder="Описание:"
              onChange={(e) => handleInputChange("description", e.target.value)}
            />
          </Form.Item>

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
                  onChange={(value) => handleInputChange("contract_id", value)}
                  allowClear
                  style={{ height: "40px" }}
                >
                  {contracts.map((contract) => (
                    <Option key={contract.id} value={contract.id}>
                      {contract.number}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {renderSpecificationSection()}

          <Row gutter={16} className="mt-6">
            <Col span={12}>
              <Button
                type="default"
                className="w-100  rounded-[10px] font-semibold text-white block bg-gray-500"
                style={{ width: "100%" }}
                onClick={() => {
                  form.resetFields();
                  setFormValues({});
                  setSelectedSpecification(null);
                  setFileList([]);
                  setErrors({});
                  onCancel();
                }}
              >
                Отмена
              </Button>
            </Col>
            <Col span={12}>
              <Button
                type="primary"
                htmlType="submit"
                className="w-100  rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
                style={{ width: "100%" }}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>

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
