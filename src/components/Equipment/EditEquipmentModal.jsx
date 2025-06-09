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

const { Option } = Select;
const { TextArea } = Input;

const EditEquipmentModal = ({
  visible,
  onCancel,
  equipment,
  equipmentTypes,
}) => {
  const [form] = Form.useForm();
  const [specForm] = Form.useForm();
  const [formValues, setFormValues] = useState({});
  const [selectedSpecification, setSelectedSpecification] = useState(null);
  const [createSpecModalVisible, setCreateSpecModalVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [fileList, setFileList] = useState([]);

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
    if (visible && equipment) {
      console.log("Equipment data:", equipment);

      const initialValues = {
        name: equipment.name || "",
        description: equipment.description || "",
        status: equipment.status || "NEW",
        contract_id: equipment.contract_id || equipment.contract?.id || null,
      };

      console.log(
        "Contract ID found:",
        equipment.contract_id,
        equipment.contract?.id
      );

      // Set specification field based on equipment type
      const specFieldName = getSpecificationFieldName(
        equipment.type || equipment.type_data?.id
      );
      console.log("Spec field name:", specFieldName);

      if (specFieldName) {
        // Get the specification ID from the equipment - try different possible field names
        let specId = null;

        // Try direct field access first
        specId = equipment[specFieldName];

        // If not found, try nested object access
        if (!specId) {
          const specObjectName = specFieldName.replace("_id", "");
          const specObject = equipment[specObjectName];
          if (specObject) {
            specId = specObject.id;
          }
        }

        console.log("Spec ID found:", specId);
        if (specId) {
          initialValues[specFieldName] = specId;
        }
      }

      // Set specification characteristics from the equipment's specification object
      const spec =
        equipment.computer_specification ||
        equipment.projector_specification ||
        equipment.printer_specification ||
        equipment.tv_specification ||
        equipment.router_specification ||
        equipment.notebook_specification ||
        equipment.monoblok_specification ||
        equipment.whiteboard_specification ||
        equipment.extender_specification ||
        equipment.monitor_specification;

      console.log("Specification object:", spec);

      if (spec) {
        initialValues.cpu = spec.cpu || "";
        initialValues.ram = spec.ram || "";

        // Handle disk specifications for storage display
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
        setSelectedSpecification(spec);
      }

      // Handle existing image
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

      console.log("Initial values:", initialValues);
      setFormValues(initialValues);
      form.setFieldsValue(initialValues);
    }
  }, [visible, equipment, form]);

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
    return false; // Prevent auto upload
  };

  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      setFormValues((prev) => ({
        ...prev,
        image: newFileList[0].originFileObj,
      }));
    }
  };

  const handleSpecificationChange = (value) => {
    const typeId = equipment?.type || equipment?.type_data?.id;
    const availableSpecs = getSpecificationsForType(typeId);
    const spec = availableSpecs.find((s) => s.id === value);
    setSelectedSpecification(spec);

    const specFieldName = getSpecificationFieldName(typeId);
    if (specFieldName) {
      // Handle disk specifications for storage display
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
      };
      setFormValues(newValues);

      form.setFieldsValue({
        [specFieldName]: value,
        cpu: spec?.cpu || "",
        ram: spec?.ram || "",
        storage: storageDisplay,
        monitor_size: spec?.monitor_size || spec?.screen_size || "",
        has_mouse: spec?.has_mouse || false,
        has_keyboard: spec?.has_keyboard || false,
      });
    }
  };

  const handleCreateNewSpec = () => {
    setCreateSpecModalVisible(true);
  };

  const handleSpecCreate = async (values) => {
    try {
      const typeId = equipment?.type || equipment?.type_data?.id;
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
        const newSpec = await dispatch(action(values)).unwrap();
        message.success("Шаблон успешно создан!");

        await dispatch(getAllSpecifications());

        const specFieldName = getSpecificationFieldName(typeId);
        if (specFieldName) {
          // Handle disk specifications for storage display
          let storageDisplay = "";
          if (
            newSpec.disk_specifications &&
            newSpec.disk_specifications.length > 0
          ) {
            storageDisplay = newSpec.disk_specifications
              .map((disk) => `${disk.capacity_gb}GB ${disk.disk_type}`)
              .join(", ");
          } else {
            storageDisplay = newSpec.storage || "";
          }

          const newValues = {
            ...formValues,
            [specFieldName]: newSpec.id,
            cpu: newSpec.cpu || "",
            ram: newSpec.ram || "",
            storage: storageDisplay,
            monitor_size: newSpec.monitor_size || newSpec.screen_size || "",
            has_mouse: newSpec.has_mouse || false,
            has_keyboard: newSpec.has_keyboard || false,
          };
          setFormValues(newValues);
          form.setFieldsValue(newValues);
          setSelectedSpecification(newSpec);
        }

        setCreateSpecModalVisible(false);
        specForm.resetFields();
      }
    } catch (error) {
      console.error("Spec creation error:", error);
      message.error("Ошибка при создании шаблона");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Create FormData if image is included
      let updateData;
      if (formValues.image) {
        updateData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] !== null && values[key] !== undefined) {
            updateData.append(key, values[key]);
          }
        });
        updateData.append("image", formValues.image);
      } else {
        updateData = values;
      }

      await dispatch(
        updateEquipment({
          id: equipment.id,
          data: updateData,
        })
      ).unwrap();

      message.success("Оборудование успешно обновлено!");
      onCancel();
    } catch (error) {
      console.error("Equipment update error:", error);
      message.error("Ошибка при обновлении оборудования");
    }
  };

  const renderSpecificationSection = () => {
    const typeId = equipment?.type || equipment?.type_data?.id;
    const availableSpecs = getSpecificationsForType(typeId);
    const specFieldName = getSpecificationFieldName(typeId);
    const selectedSpecId = formValues[specFieldName];
    const typeName = equipmentTypes.find((t) => t.id === typeId)?.name;

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-gray-700 font-medium">
            Шаблон характеристик:
          </label>
          <Button
            type="dashed"
            icon={<FiPlus />}
            onClick={handleCreateNewSpec}
            size="small"
            className="text-indigo-500 border-indigo-500"
          >
            Создать новый
          </Button>
        </div>

        <Form.Item name={specFieldName}>
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

        {!selectedSpecId && availableSpecs.length === 0 && (
          <div className="text-center py-4 border rounded-lg bg-gray-50">
            <p className="text-gray-500 mb-2">Нет шаблона характеристик</p>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={handleCreateNewSpec}
              className="bg-[#4E38F2] border-[#4E38F2]"
              size="small"
            >
              Создать шаблон
            </Button>
          </div>
        )}

        {(selectedSpecId || selectedSpecification) &&
          (typeName?.toLowerCase().includes("компьютер") ||
            typeName?.toLowerCase().includes("ноутбук") ||
            typeName?.toLowerCase().includes("моноблок")) && (
            <>
              <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  <Form.Item name="cpu" label="Процессор">
                    <Input
                      value={formValues.cpu}
                      disabled
                      placeholder="Процессор:"
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="ram" label="ОЗУ">
                    <Input
                      value={formValues.ram}
                      disabled
                      placeholder="Оперативная память:"
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Form.Item name="storage" label="Накопитель">
                    <Input
                      value={formValues.storage}
                      disabled
                      placeholder="Накопитель:"
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="monitor_size" label="Размер монитора/экрана">
                    <Input
                      value={formValues.monitor_size}
                      disabled
                      placeholder="Размер монитора:"
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {(typeName?.toLowerCase().includes("компьютер") ||
                typeName?.toLowerCase().includes("моноблок")) && (
                <Row gutter={[16, 16]}>
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
              )}
            </>
          )}

        {(selectedSpecId || selectedSpecification) && (
          <>
            {typeName?.toLowerCase().includes("проектор") && (
              <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  <Form.Item name="model" label="Модель">
                    <Input
                      value={selectedSpecification?.model || ""}
                      disabled
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="lumens" label="Яркость (люмен)">
                    <Input
                      value={selectedSpecification?.lumens || ""}
                      disabled
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {typeName?.toLowerCase().includes("монитор") && (
              <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  <Form.Item name="model" label="Модель">
                    <Input
                      value={selectedSpecification?.model || ""}
                      disabled
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="screen_size" label="Размер экрана">
                    <Input
                      value={formValues.monitor_size}
                      disabled
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {typeName?.toLowerCase().includes("телевизор") && (
              <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col span={12}>
                  <Form.Item name="model" label="Модель">
                    <Input
                      value={selectedSpecification?.model || ""}
                      disabled
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="screen_size" label="Размер экрана">
                    <Input
                      value={formValues.monitor_size}
                      disabled
                      style={{ height: "40px" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </>
        )}
      </div>
    );
  };

  if (!equipment) return null;

  return (
    <>
      <Modal
        visible={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        className="rounded-lg"
        destroyOnClose
      >
        <div className="px-6 py-4">
          <div className="mb-3 flex items-center justify-center relative">
            <div className="line w-[100%] h-[6px] rounded-full z-10 absolute bg-[#4E38F2]"></div>
            <div className="bg-[#4E38F2] inline py-2 relative z-20 px-4 font-bold text-white rounded-[10px]">
              Редактирование
            </div>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  label="Название"
                  name="name"
                  rules={[{ required: true, message: "Введите название!" }]}
                >
                  <Input
                    placeholder="Название техники"
                    style={{ height: "40px" }}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="flex items-center mt-5 justify-between h-[40px]">
                  <span className="text-gray-500 text-lg font-semibold">
                    Фото техники:
                  </span>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleImageChange}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                    accept="image/*"
                    showUploadList={{
                      showPreviewIcon: false,
                      showRemoveIcon: true,
                    }}
                  >
                    {fileList.length === 0 && (
                      <div className="flex flex-col text-gray-600 items-center">
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
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
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
                    style={{ height: "40px" }}
                    onChange={(value) => handleInputChange("status", value)}
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
                    allowClear
                    style={{ height: "40px" }}
                    onChange={(value) =>
                      handleInputChange("contract_id", value)
                    }
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

            {/* {renderSpecificationSection()} */}

            <Row gutter={16} className="mt-6">
              <Col span={12}>
                <button
                  type="button"
                  className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-gray-500"
                  style={{ width: "100%" }}
                  onClick={onCancel}
                >
                  Отмена
                </button>
              </Col>
              <Col span={12}>
                <button
                  type="submit"
                  className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>

      <Modal
        visible={createSpecModalVisible}
        onCancel={() => {
          setCreateSpecModalVisible(false);
          specForm.resetFields();
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <CreateSpecificationForm
          form={specForm}
          equipmentType={{
            name: equipmentTypes.find(
              (t) => t.id === (equipment?.type || equipment?.type_data?.id)
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
