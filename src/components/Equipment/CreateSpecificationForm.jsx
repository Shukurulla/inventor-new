import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
  Card,
} from "antd";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const { Option } = Select;

const CreateSpecificationForm = ({
  form,
  equipmentType,
  onSubmit,
  onCancel,
  isEdit = false,
  initialData = null,
}) => {
  const typeName = equipmentType?.name?.toLowerCase() || "";
  const [storageList, setStorageList] = useState([{ id: Date.now() }]);

  // Initialize storage list from existing data when editing
  useEffect(() => {
    if (isEdit && initialData && initialData.disk_specifications) {
      const existingStorages = initialData.disk_specifications.map(
        (disk, index) => ({
          id: disk.id || Date.now() + index,
        })
      );
      setStorageList(
        existingStorages.length > 0 ? existingStorages : [{ id: Date.now() }]
      );

      // Set form values for existing disk specifications
      const formValues = {};
      initialData.disk_specifications.forEach((disk, index) => {
        const storageId = existingStorages[index]?.id || Date.now() + index;
        formValues[`storage_${storageId}_size`] = disk.capacity_gb;
        formValues[`storage_${storageId}_type`] = disk.disk_type;
      });

      // Set GPU specifications if exists
      if (
        initialData.gpu_specifications &&
        initialData.gpu_specifications.length > 0
      ) {
        formValues.gpu_model = initialData.gpu_specifications[0].model;
      }

      // Set other form values
      Object.keys(initialData).forEach((key) => {
        if (key !== "disk_specifications" && key !== "gpu_specifications") {
          formValues[key] = initialData[key];
        }
      });

      form.setFieldsValue(formValues);
    }
  }, [isEdit, initialData, form]);

  const addStorage = () => {
    setStorageList([...storageList, { id: Date.now() }]);
  };

  const removeStorage = (id) => {
    if (storageList.length > 1) {
      setStorageList(storageList.filter((item) => item.id !== id));
    }
  };

  const renderComputerFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Процессор (CPU)"
            name="cpu"
            rules={[{ required: true, message: "Введите процессор!" }]}
          >
            <Input placeholder="Intel Core i5-8400" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ОЗУ (RAM)"
            name="ram"
            rules={[{ required: true, message: "Введите объем ОЗУ!" }]}
          >
            <Input placeholder="8 GB" />
          </Form.Item>
        </Col>
      </Row>

      {/* Storage Fields */}
      <Card title="Накопители" size="small" className="mb-4">
        {storageList.map((storage, index) => (
          <Row key={storage.id} gutter={16} className="mb-2">
            <Col span={10}>
              <Form.Item
                name={`storage_${storage.id}_size`}
                rules={[{ required: true, message: "Введите объем!" }]}
              >
                <InputNumber
                  placeholder="256"
                  min={1}
                  max={10000}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={`storage_${storage.id}_type`}
                rules={[{ required: true, message: "Выберите тип!" }]}
              >
                <Select placeholder="Выберите тип">
                  <Option value="HDD">HDD</Option>
                  <Option value="SSD">SSD</Option>
                  <Option value="NVMe">NVMe</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6} className="flex items-start">
              {index === 0 && storageList.length === 1 ? (
                <Button
                  type="dashed"
                  icon={<FiPlus />}
                  onClick={addStorage}
                  className="ml-4"
                >
                  Добавить
                </Button>
              ) : (
                <Button
                  type="text"
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => removeStorage(storage.id)}
                  className="mt"
                />
              )}
              {index === storageList.length - 1 && storageList.length > 1 && (
                <Button
                  type="dashed"
                  icon={<FiPlus />}
                  onClick={addStorage}
                  className="ml-4"
                >
                  Добавить
                </Button>
              )}
            </Col>
          </Row>
        ))}
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Видеокарта"
            name="gpu_model"
            rules={[{ required: true, message: "Введите видеокарту!" }]}
          >
            <Input placeholder="NVIDIA GTX 1050 Ti" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Есть клавиатура"
            name="has_keyboard"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Есть мышь"
            name="has_mouse"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderNotebookFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Процессор"
            name="cpu"
            rules={[{ required: true, message: "Введите процессор!" }]}
          >
            <Input placeholder="Intel Core i7-1165G7" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ОЗУ"
            name="ram"
            rules={[{ required: true, message: "Введите объем ОЗУ!" }]}
          >
            <Input placeholder="16 GB" />
          </Form.Item>
        </Col>
      </Row>

      {/* Storage Fields */}
      <Card title="Накопители" size="small" className="mb-4">
        {storageList.map((storage, index) => (
          <Row key={storage.id} gutter={16} className="mb-2">
            <Col span={10}>
              <Form.Item
                label={index === 0 ? "Объем накопителя (GB)" : ""}
                name={`storage_${storage.id}_size`}
                rules={[{ required: true, message: "Введите объем!" }]}
              >
                <InputNumber
                  placeholder="512"
                  min={1}
                  max={10000}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label={index === 0 ? "Тип накопителя" : ""}
                name={`storage_${storage.id}_type`}
                rules={[{ required: true, message: "Выберите тип!" }]}
              >
                <Select placeholder="Выберите тип">
                  <Option value="HDD">HDD</Option>
                  <Option value="SSD">SSD</Option>
                  <Option value="NVMe">NVMe</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4} className="flex items-center">
              {index === 0 && storageList.length === 1 ? (
                <Button
                  type="dashed"
                  icon={<FiPlus />}
                  onClick={addStorage}
                  className="mt-6"
                >
                  Добавить
                </Button>
              ) : (
                <Button
                  type="text"
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => removeStorage(storage.id)}
                  className="mt-6"
                />
              )}
              {index === storageList.length - 1 && storageList.length > 1 && (
                <Button
                  type="dashed"
                  icon={<FiPlus />}
                  onClick={addStorage}
                  className="mt-6 ml-2"
                >
                  Добавить
                </Button>
              )}
            </Col>
          </Row>
        ))}
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Видеокарта"
            name="gpu_model"
            rules={[{ required: true, message: "Введите видеокарту!" }]}
          >
            <Input placeholder="NVIDIA GTX 1650" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Размер экрана (дюймы)" name="monitor_size">
            <InputNumber
              min={10}
              max={20}
              className="w-full"
              placeholder="15.6"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderMonoblokFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Процессор"
            name="cpu"
            rules={[{ required: true, message: "Введите процессор!" }]}
          >
            <Input placeholder="Intel Core i5-8400" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="ОЗУ"
            name="ram"
            rules={[{ required: true, message: "Введите объем ОЗУ!" }]}
          >
            <Input placeholder="8 GB" />
          </Form.Item>
        </Col>
      </Row>

      {/* Storage Fields */}
      <Card title="Накопители" size="small" className="mb-4">
        {storageList.map((storage, index) => (
          <Row key={storage.id} gutter={16} className="mb-2">
            <Col span={10}>
              <Form.Item
                label={index === 0 ? "Объем накопителя (GB)" : ""}
                name={`storage_${storage.id}_size`}
                rules={[{ required: true, message: "Введите объем!" }]}
              >
                <InputNumber
                  placeholder="512"
                  min={1}
                  max={10000}
                  className="w-full"
                />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item
                label={index === 0 ? "Тип накопителя" : ""}
                name={`storage_${storage.id}_type`}
                rules={[{ required: true, message: "Выберите тип!" }]}
              >
                <Select placeholder="Выберите тип">
                  <Option value="HDD">HDD</Option>
                  <Option value="SSD">SSD</Option>
                  <Option value="NVMe">NVMe</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={4} className="flex items-center">
              {index === 0 && storageList.length === 1 ? (
                <Button
                  type="dashed"
                  icon={<FiPlus />}
                  onClick={addStorage}
                  className="mt-6"
                >
                  Добавить
                </Button>
              ) : (
                <Button
                  type="text"
                  danger
                  icon={<FiTrash2 />}
                  onClick={() => removeStorage(storage.id)}
                  className="mt-6"
                />
              )}
              {index === storageList.length - 1 && storageList.length > 1 && (
                <Button
                  type="dashed"
                  icon={<FiPlus />}
                  onClick={addStorage}
                  className="mt-6 ml-2"
                >
                  Добавить
                </Button>
              )}
            </Col>
          </Row>
        ))}
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Видеокарта"
            name="gpu_model"
            rules={[{ required: true, message: "Введите видеокарту!" }]}
          >
            <Input placeholder="NVIDIA GTX 1650" />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Размер экрана (дюймы)"
            name="screen_size"
            rules={[{ required: true, message: "Введите размер экрана!" }]}
          >
            <InputNumber
              min={15}
              max={35}
              className="w-full"
              placeholder="24"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Form.Item
            label="Есть клавиатура"
            name="has_keyboard"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            label="Есть мышь"
            name="has_mouse"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderMonitorFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="Samsung C24F390" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Серийный номер" name="serial_number">
            <Input placeholder="S/N 123456789" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Размер экрана (дюймы)"
            name="screen_size"
            rules={[{ required: true, message: "Введите размер экрана!" }]}
          >
            <Input placeholder="24" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Разрешение"
            name="resolution"
            rules={[{ required: true, message: "Введите разрешение!" }]}
          >
            <Input placeholder="1920x1080" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Тип матрицы"
            name="panel_type"
            rules={[{ required: true, message: "Выберите тип матрицы!" }]}
          >
            <Select placeholder="Выберите тип матрицы">
              <Option value="IPS">IPS</Option>
              <Option value="VA">VA</Option>
              <Option value="TN">TN</Option>
              <Option value="OLED">OLED</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Частота обновления (Hz)"
            name="refresh_rate"
            rules={[{ required: true, message: "Введите частоту обновления!" }]}
          >
            <InputNumber
              min={60}
              max={240}
              className="w-full"
              placeholder="60"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderProjectorFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="Epson EB-X05" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Яркость (люмен)"
            name="lumens"
            rules={[{ required: true, message: "Введите яркость!" }]}
          >
            <InputNumber
              min={1}
              max={10000}
              className="w-full"
              placeholder="3300"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Разрешение"
            name="resolution"
            rules={[{ required: true, message: "Введите разрешение!" }]}
          >
            <Input placeholder="1920x1080" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Тип проекции"
            name="throw_type"
            rules={[{ required: true, message: "Выберите тип проекции!" }]}
          >
            <Select placeholder="Выберите тип">
              <Option value="standard">Стандартный</Option>
              <Option value="short">Короткофокусный</Option>
              <Option value="ultra_short">Ультракороткофокусный</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderPrinterFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="HP LaserJet Pro M404n" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Серийный номер" name="serial_number">
            <Input placeholder="VNC1K23456" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Цветная печать"
            name="color"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Двусторонняя печать"
            name="duplex"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderTVFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="Samsung UE43TU7100" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Размер экрана (дюймы)"
            name="screen_size"
            rules={[{ required: true, message: "Введите размер экрана!" }]}
          >
            <InputNumber
              min={10}
              max={100}
              className="w-full"
              placeholder="43"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderRouterFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="TP-Link Archer C7" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Количество портов"
            name="ports"
            rules={[{ required: true, message: "Введите количество портов!" }]}
          >
            <InputNumber min={1} max={48} className="w-full" placeholder="4" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="WiFi стандарт"
            name="wifi_standart"
            rules={[{ required: true, message: "Выберите WiFi стандарт!" }]}
          >
            <Select placeholder="Выберите стандарт">
              <Option value="802.11n">802.11n</Option>
              <Option value="802.11ac">802.11ac</Option>
              <Option value="802.11ax">802.11ax (Wi-Fi 6)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderWhiteboardFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="SMART Board 6065" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Размер (дюймы)"
            name="screen_size"
            rules={[{ required: true, message: "Введите размер!" }]}
          >
            <InputNumber
              min={40}
              max={100}
              className="w-full"
              placeholder="65"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Тип касания"
            name="touch_type"
            rules={[{ required: true, message: "Выберите тип касания!" }]}
          >
            <Select placeholder="Выберите технологию">
              <Option value="infrared">Инфракрасная</Option>
              <Option value="resistive">Резистивная</Option>
              <Option value="capacitive">Емкостная</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderExtenderFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Количество портов"
            name="ports"
            rules={[{ required: true, message: "Введите количество портов!" }]}
          >
            <InputNumber min={1} max={20} className="w-full" placeholder="6" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Длина кабеля (м)"
            name="length"
            rules={[{ required: true, message: "Введите длину кабеля!" }]}
          >
            <InputNumber
              min={0.5}
              max={10}
              step={0.5}
              className="w-full"
              placeholder="1.5"
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const renderFieldsByType = () => {
    if (typeName.includes("компьютер")) return renderComputerFields();
    if (typeName.includes("проектор")) return renderProjectorFields();
    if (typeName.includes("принтер")) return renderPrinterFields();
    if (typeName.includes("телевизор")) return renderTVFields();
    if (typeName.includes("роутер")) return renderRouterFields();
    if (typeName.includes("ноутбук")) return renderNotebookFields();
    if (typeName.includes("моноблок")) return renderMonoblokFields();
    if (typeName.includes("доска")) return renderWhiteboardFields();
    if (typeName.includes("удлинитель")) return renderExtenderFields();
    if (typeName.includes("монитор")) return renderMonitorFields();

    return (
      <Form.Item
        label="Описание"
        name="description"
        rules={[{ required: true, message: "Введите описание!" }]}
      >
        <Input.TextArea
          rows={3}
          placeholder="Введите характеристики оборудования"
        />
      </Form.Item>
    );
  };

  const handleSubmit = async (values) => {
    // Process storage data for computer, notebook, and monoblok
    if (
      typeName.includes("компьютер") ||
      typeName.includes("ноутбук") ||
      typeName.includes("моноблок")
    ) {
      const diskSpecifications = [];
      storageList.forEach((storage) => {
        const size = values[`storage_${storage.id}_size`];
        const type = values[`storage_${storage.id}_type`];
        if (size && type) {
          // Since size is now a number from InputNumber, we can use it directly
          const capacity_gb =
            typeof size === "number" ? size : parseInt(size) || 0;

          diskSpecifications.push({
            disk_type: type,
            capacity_gb: capacity_gb,
          });
        }
        // Remove individual storage fields from values
        delete values[`storage_${storage.id}_size`];
        delete values[`storage_${storage.id}_type`];
      });
      values.disk_specifications = diskSpecifications;

      // Process GPU specifications
      if (values.gpu_model) {
        values.gpu_specifications = [
          {
            id: 1,
            author: null,
            created_at: new Date(),
            model: values.gpu_model,
          },
        ];
        // Remove the individual gpu_model field
        delete values.gpu_model;
      }

      // Remove old storage field if exists
      delete values.storage;
    }

    onSubmit(values);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      <div className="mb-3 flex items-center justify-center relative">
        <div className="line w-[100%] h-[6px] rounded-full z-10 absolute bg-[#4E38F2]"></div>
        <div className="bg-[#4E38F2] inline py-2 relative z-20 px-4 font-bold text-white rounded-[10px]">
          {equipmentType.name}
        </div>
      </div>
      {renderFieldsByType()}

      <Row gutter={16}>
        <Col span={12}>
          <button
            type="button"
            className="w-100 p-2 rounded-[10px] font-semibold text-white block bg-[#4E38F2]"
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
          >
            Создать шаблон
          </button>
        </Col>
      </Row>
    </Form>
  );
};

export default CreateSpecificationForm;
