"use client";
import { Card, Form, Select, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
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
    message.success("Профиль успешно обновлен!");
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture",
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Настройки</h1>
      </div>

      <div className="space-y-8">
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
                        ? "bg-gray-800"
                        : "bg-gradient-to-r from-white to-gray-800"
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
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  option.value === "inter"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div
                    className="text-lg font-medium mb-2"
                    style={{ fontFamily: option.label }}
                  >
                    Aa
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-blue-600">Текущий шрифт: Inter</div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
