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
import { authAPI } from "../services/api";

const SettingsPage = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
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

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // API call to update profile
      const response = await authAPI.updateProfile(values);

      // Update user in store if needed
      // dispatch(updateUser(response.data));

      message.success("Профиль успешно обновлен!");
      setEditMode(false);
    } catch (error) {
      console.error("Profile update error:", error);
      message.error("Ошибка при обновлении профиля");
    } finally {
      setLoading(false);
    }
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
                <Input value={user?.role || "Администратор"} disabled />
              </Form.Item>
            </div>
          </div>

          {editMode && (
            <div className="flex justify-end">
              <Button type="primary" htmlType="submit" loading={loading}>
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
                  ? "border-indigo-500 "
                  : " hover:border-gray-300"
              }`}
              style={{
                background:
                  option.value == "system"
                    ? "linear-gradient(to right, white 50%, rgb(26, 26, 26) 50%)"
                    : "" || option.value == "light"
                    ? "#fff"
                    : "#000",
              }}
              onClick={() => handleThemeChange(option.value)}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">iM</span>
                  </div>
                </div>
                {option.value == "system" && (
                  <span className="text-sm font-medium flex justify-center">
                    <li className="text-black">{option.label.slice(0, 5)}</li>
                    <li className="text-white">
                      {option.label.slice(5, option.label.length)}
                    </li>
                  </span>
                )}
                {option.value == "light" && (
                  <span
                    className={`text-sm font-medium option-title`}
                    style={{
                      color: "#000",
                    }}
                  >
                    {option.label}
                  </span>
                )}
                {option.value == "dark" && (
                  <span
                    className={`text-sm font-medium option-title`}
                    style={{
                      color: "#fff",
                    }}
                  >
                    {option.label}
                  </span>
                )}
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
                  ? "border-indigo-500 "
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

                <span className="text-sm font-medium">{option.label}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-indigo-600">
          Текущий шрифт: {fontOptions.find((f) => f.value === fontSize)?.label}
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
