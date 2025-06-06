import React from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  Row,
  Col,
  Avatar,
  Upload,
  message,
  Divider,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiMail, FiPhone, FiUpload, FiEdit } from "react-icons/fi";
import {
  setTheme,
  setFontSize,
  setLanguage,
  setNotifications,
} from "../store/slices/settingsSlice";

const { Option } = Select;

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, fontSize, language, notifications } = useSelector(
    (state) => state.settings
  );
  const [profileForm] = Form.useForm();

  const handleThemeChange = (value) => {
    dispatch(setTheme(value));
    message.success(
      `Тема изменена на ${value === "dark" ? "темную" : "светлую"}`
    );
  };

  const handleFontSizeChange = (value) => {
    dispatch(setFontSize(value));
    message.success("Размер шрифта изменен");
  };

  const handleLanguageChange = (value) => {
    dispatch(setLanguage(value));
    message.success("Язык интерфейса изменен");
  };

  const handleNotificationsChange = (checked) => {
    dispatch(setNotifications(checked));
    message.success(`Уведомления ${checked ? "включены" : "отключены"}`);
  };

  const handleProfileUpdate = (values) => {
    // Здесь будет логика обновления профиля
    message.success("Профиль успешно обновлен!");
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture",
  };

  const themeOptions = [
    { label: "Светлая", value: "light" },
    { label: "Системная", value: "system" },
    { label: "Темная", value: "dark" },
  ];

  const fontOptions = [
    { label: "SF Pro Display", value: "sf-pro" },
    { label: "Inter", value: "inter" },
    { label: "Roboto", value: "roboto" },
  ];

  const sizeOptions = [
    { label: "Маленький", value: "small" },
    { label: "Средний", value: "medium" },
    { label: "Большой", value: "large" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Настройки</h1>
        <p className="text-gray-600">
          Управление профилем и настройками системы
        </p>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={12}>
          {/* Profile Settings */}
          <Card
            title={
              <div className="flex items-center space-x-2">
                <FiUser />
                <span>Профиль пользователя</span>
              </div>
            }
            className="shadow-sm mb-6"
            extra={
              <Button type="text" icon={<FiEdit />}>
                Редактировать
              </Button>
            }
          >
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileUpdate}
              initialValues={{
                first_name: user?.first_name,
                last_name: user?.last_name,
                email: user?.email,
                phone_number: user?.phone_number,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Имя"
                    name="first_name"
                    rules={[{ required: true, message: "Введите имя!" }]}
                  >
                    <Input
                      prefix={<FiUser className="text-gray-400" />}
                      placeholder="Имя"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Фамилия"
                    name="last_name"
                    rules={[{ required: true, message: "Введите фамилию!" }]}
                  >
                    <Input placeholder="Фамилия" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Введите email!" },
                  { type: "email", message: "Введите корректный email!" },
                ]}
              >
                <Input
                  prefix={<FiMail className="text-gray-400" />}
                  placeholder="email@example.com"
                />
              </Form.Item>

              <Form.Item label="Телефон" name="phone_number">
                <Input
                  prefix={<FiPhone className="text-gray-400" />}
                  placeholder="+998 90 123 45 67"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full">
                  Сохранить изменения
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {/* Theme Settings */}
          <Card title="Цветовой режим" className="shadow-sm mb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      theme === option.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleThemeChange(option.value)}
                  >
                    <div className="text-center">
                      <div
                        className={`w-8 h-8 mx-auto mb-2 rounded-full ${
                          option.value === "light"
                            ? "bg-white border-2 border-gray-300"
                            : option.value === "dark"
                            ? "bg-gray-800"
                            : "bg-gradient-to-r from-white to-gray-800"
                        }`}
                      ></div>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Font Settings */}
          <Card title="Шрифт" className="shadow-sm mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Семейство шрифтов
                </label>
                <Select
                  value="sf-pro"
                  className="w-full"
                  options={fontOptions}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Размер шрифта
                </label>
                <Select
                  value={fontSize}
                  onChange={handleFontSizeChange}
                  className="w-full"
                  options={sizeOptions}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SettingsPage;
