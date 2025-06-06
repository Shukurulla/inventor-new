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
            label="ОЗУ (RAM)"
            name="ram"
            rules={[{ required: true, message: "Введите объем ОЗУ!" }]}
          >
            <Input placeholder="8 GB" />
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
          <Form.Item
            label="Размер монитора"
            name="monitor_size"
            rules={[{ required: true, message: "Введите размер монитора!" }]}
          >
            <InputNumber
              min={10}
              max={50}
              className="w-full"
              placeholder="24"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Есть клавиатура"
            name="has_keyboard"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col span={12}>
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
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Накопитель" name="storage">
            <Input placeholder="SSD 512GB" />
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
        <Col span={12}>
          <Form.Item
            label="Тип касания"
            name="touch_type"
            rules={[{ required: true, message: "Выберите тип касания!" }]}
          >
            <Select placeholder="Выберите тип касания">
              <Option value="capacitive">Емкостный</Option>
              <Option value="resistive">Резистивный</Option>
              <Option value="infrared">Инфракрасный</Option>
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
