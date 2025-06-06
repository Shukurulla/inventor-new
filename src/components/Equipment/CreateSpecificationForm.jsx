import React from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Row,
  Col,
} from "antd";

const { Option } = Select;

const CreateSpecificationForm = ({
  form,
  equipmentType,
  onSubmit,
  onCancel,
}) => {
  const typeName = equipmentType?.name?.toLowerCase() || "";

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
            label="ОЗУ (RAM), ГБ"
            name="ram"
            rules={[{ required: true, message: "Введите объем ОЗУ!" }]}
          >
            <InputNumber min={1} max={128} className="w-full" placeholder="8" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Накопитель"
            name="storage"
            rules={[{ required: true, message: "Введите накопитель!" }]}
          >
            <Input placeholder="SSD 256GB" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Видеокарта" name="gpu">
            <Input placeholder="Intel UHD Graphics 630" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Тип диска" name="disk_type">
        <Select placeholder="Выберите тип диска">
          <Option value="SSD">SSD</Option>
          <Option value="HDD">HDD</Option>
          <Option value="Hybrid">Гибридный</Option>
        </Select>
      </Form.Item>
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
            <Select placeholder="Выберите разрешение">
              <Option value="1024x768">XGA (1024x768)</Option>
              <Option value="1920x1080">Full HD (1920x1080)</Option>
              <Option value="3840x2160">4K (3840x2160)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Тип проекции" name="projection_type">
            <Select placeholder="Выберите тип">
              <Option value="LCD">LCD</Option>
              <Option value="DLP">DLP</Option>
              <Option value="LED">LED</Option>
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
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Двусторонняя печать"
            name="duplex"
            valuePropName="checked"
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
      <Form.Item label="Серийный номер" name="serial_number">
        <Input placeholder="ABC123XYZ789" />
      </Form.Item>
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
          <Form.Item label="Частота (GHz)" name="frequency">
            <Select placeholder="Выберите частоту">
              <Option value="2.4">2.4 GHz</Option>
              <Option value="5">5 GHz</Option>
              <Option value="dual">Dual Band</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Серийный номер" name="serial_number">
            <Input placeholder="SN123456789" />
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
            label="ОЗУ (ГБ)"
            name="ram"
            rules={[{ required: true, message: "Введите объем ОЗУ!" }]}
          >
            <InputNumber min={1} max={64} className="w-full" placeholder="16" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Накопитель" name="storage">
            <Input placeholder="SSD 512GB" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Размер экрана (дюймы)" name="screen_size">
            <InputNumber
              min={10}
              max={20}
              className="w-full"
              placeholder="15.6"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Серийный номер" name="serial_number">
            <Input placeholder="NB123456789" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Тип диска" name="disk_type">
            <Select placeholder="Выберите тип диска">
              <Option value="SSD">SSD</Option>
              <Option value="HDD">HDD</Option>
              <Option value="Hybrid">Гибридный</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label="Видеокарта" name="gpu">
        <Input placeholder="Intel Iris Xe Graphics" />
      </Form.Item>
    </>
  );

  const renderMonoblokFields = () => (
    <>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Размер экрана (дюймы)" name="screen_size">
            <InputNumber
              min={15}
              max={35}
              className="w-full"
              placeholder="24"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Частота (GHz)" name="frequency">
            <InputNumber
              min={1}
              max={10}
              step={0.1}
              className="w-full"
              placeholder="2.4"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Тип матрицы" name="matrix_type">
            <Select placeholder="Выберите тип матрицы">
              <Option value="IPS">IPS</Option>
              <Option value="VA">VA</Option>
              <Option value="TN">TN</Option>
              <Option value="OLED">OLED</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Тип монитора" name="monitor_type">
            <Select placeholder="Выберите тип">
              <Option value="Офисный">Офисный</Option>
              <Option value="Игровой">Игровой</Option>
              <Option value="Профессиональный">Профессиональный</Option>
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
            name="size"
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
          <Form.Item label="Технология" name="technology">
            <Select placeholder="Выберите технологию">
              <Option value="Инфракрасная">Инфракрасная</Option>
              <Option value="Резистивная">Резистивная</Option>
              <Option value="Емкостная">Емкостная</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Серийный номер" name="serial_number">
            <Input placeholder="WB123456789" />
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
            label="Модель"
            name="model"
            rules={[{ required: true, message: "Введите модель!" }]}
          >
            <Input placeholder="Belkin 6-Outlet" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            label="Количество розеток"
            name="outlets"
            rules={[{ required: true, message: "Введите количество розеток!" }]}
          >
            <InputNumber min={1} max={20} className="w-full" placeholder="6" />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Длина кабеля (м)" name="cable_length">
            <InputNumber
              min={0.5}
              max={10}
              step={0.5}
              className="w-full"
              placeholder="1.5"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Максимальная мощность (Вт)" name="max_power">
            <InputNumber
              min={100}
              max={5000}
              className="w-full"
              placeholder="2500"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label="Защита от перенапряжения"
        name="surge_protection"
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
    </>
  );

  const renderFieldsByType = () => {
    if (typeName.includes("компьютер")) return renderComputerFields();
    if (typeName.includes("проектор")) return renderProjectorFields();
    if (typeName.includes("принтер")) return renderPrinterFields();
    if (typeName.includes("телевизор")) return renderTVFields();
    if (typeName.includes("роутер")) return renderRouterFields();
    if (typeName.includes("ноутбук")) return renderNotebookFields();
    if (typeName.includes("моноблок") || typeName.includes("монитор"))
      return renderMonoblokFields();
    if (typeName.includes("доска")) return renderWhiteboardFields();
    if (typeName.includes("удлинитель")) return renderExtenderFields();

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

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      {renderFieldsByType()}

      <div className="flex justify-end space-x-2 mt-6">
        <Button onClick={onCancel}>Отмена</Button>
        <Button type="primary" htmlType="submit">
          Создать характеристику
        </Button>
      </div>
    </Form>
  );
};

export default CreateSpecificationForm;
