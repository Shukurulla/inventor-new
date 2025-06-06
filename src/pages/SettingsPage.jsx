"use client";

import { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Switch,
  Avatar,
  Upload,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiEdit, FiUpload, FiUser } from "react-icons/fi";
import { setTheme, setFontSize } from "../store/slices/settingsSlice";

const SettingsPage = () => {
  const [editMode, setEditMode] = useState(false);
  const [profileForm] = Form.useForm();

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { theme, fontSize } = useSelector((state) => state.settings);

  const handleThemeChange = (value) => {
    dispatch(setTheme(value));
    message.success(
      `Тема изменена на ${
        value === "dark"
          ? "тёмную"
          : value === "light"
          ? "светлую"
          : "системную"
      }`
    );
  };

  const handleFontSizeChange = (value) => {
    dispatch(setFontSize(value));
    message.success("Шрифт изменен");
  };

  const handleProfileUpdate = (values) => {
    // Here you would typically call an API to update user profile
    console.log("Profile update:", values);
    message.success("Профиль успешно обновлен!");
    setEditMode(false);
  };

  const themeOptions = [
    { label: "Светлый", value: "light" },
    { label: "Системный", value: "system" },
    { label: "Тёмный", value: "dark" },
  ];

  const fontOptions = [
    { label: "SF Pro Display", value: "sf-pro" },
    { label: "Inter", value: "inter" },
    { label: "Roboto", value: "roboto" },
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture",
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Настройки</h1>
      </div>

      {/* Profile Settings */}
      <Card
        title="Профиль пользователя"
        className="shadow-sm"
        extra={
          <Button
            type="primary"
            icon={<FiEdit />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Отмена" : "Редактировать"}
          </Button>
        }
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={{
            username: user?.username || "admin",
            first_name: user?.first_name || "Администратор",
            last_name: user?.last_name || "Системы",
            email: user?.email || "admin@imaster.com",
            phone_number: user?.phone_number || "+998901234567",
          }}
        >
          <div className="flex items-start space-x-6 mb-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar size={80} icon={<FiUser />} className="bg-indigo-600" />
              {editMode && (
                <Upload {...uploadProps}>
                  <Button icon={<FiUpload />} size="small">
                    Загрузить фото
                  </Button>
                </Upload>
              )}
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4">
              <Form.Item label="Имя пользователя" name="username">
                <Input disabled={!editMode} />
              </Form.Item>

              <Form.Item label="Email" name="email">
                <Input disabled={!editMode} />
              </Form.Item>

              <Form.Item label="Имя" name="first_name">
                <Input disabled={!editMode} />
              </Form.Item>

              <Form.Item label="Фамилия" name="last_name">
                <Input disabled={!editMode} />
              </Form.Item>

              <Form.Item label="Телефон" name="phone_number">
                <Input disabled={!editMode} />
              </Form.Item>

              <Form.Item label="Роль">
                <Input value="Администратор" disabled />
              </Form.Item>
            </div>
          </div>

          {editMode && (
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit">
                Сохранить изменения
              </Button>
            </div>
          )}
        </Form>
      </Card>

      {/* Theme Settings */}
      <Card title="Цветовой режим" className="shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => (
            <div
              key={option.value}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                theme === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleThemeChange(option.value)}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">iM</span>
                  </div>
                </div>
                <div
                  className={`w-full h-16 rounded-lg mb-3 ${
                    option.value === "light"
                      ? "bg-white border border-gray-200"
                      : option.value === "dark"
                      ? "bg-black"
                      : "bg-gradient-to-r from-white to-black"
                  }`}
                >
                  <div className="p-2 text-xs">
                    <div
                      className={`font-bold ${
                        option.value === "dark" ? "text-white" : "text-black"
                      }`}
                    >
                      iMaster
                    </div>
                    <div
                      className={`text-xs ${
                        option.value === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`}
                    >
                      {option.label}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Font Settings */}
      <Card title="Шрифт" className="shadow-sm">
        <div className="grid grid-cols-3 gap-4">
          {fontOptions.map((option) => (
            <div
              key={option.value}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                fontSize === option.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleFontSizeChange(option.value)}
            >
              <div className="text-center">
                <div
                  className="text-2xl font-bold mb-4"
                  style={{
                    fontFamily:
                      option.value === "sf-pro"
                        ? "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                        : option.value === "inter"
                        ? "'Inter', system-ui, sans-serif"
                        : "'Roboto', system-ui, sans-serif",
                  }}
                >
                  Aa
                </div>
                <div
                  className="text-lg font-medium mb-2"
                  style={{
                    fontFamily:
                      option.value === "sf-pro"
                        ? "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
                        : option.value === "inter"
                        ? "'Inter', system-ui, sans-serif"
                        : "'Roboto', system-ui, sans-serif",
                  }}
                >
                  iMaster
                </div>
                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-blue-600">
          Текущий шрифт: {fontOptions.find((f) => f.value === fontSize)?.label}
        </div>
      </Card>

      {/* Additional Settings */}
      <Card title="Дополнительные настройки" className="shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Уведомления</div>
              <div className="text-sm text-gray-500">
                Получать уведомления о системных событиях
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Автосохранение</div>
              <div className="text-sm text-gray-500">
                Автоматически сохранять изменения
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
