import React from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { FiUser, FiLock } from "react-icons/fi";
import { login, clearError } from "../store/slices/authSlice";
import { LogoDark, LogoLight } from "../../public";

const LoginPage = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.settings);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      message.success("Успешный вход в систему!");
    } catch (error) {
      message.error(error.detail || "Ошибка входа в систему");
    }
  };

  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <img src={theme == "dark" ? LogoDark : LogoLight} alt="" />
          </div>
          <p className="text-gray-600">Система управления инвентарем</p>
        </div>

        <Card className="shadow-xl border-0">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
          >
            <Form.Item
              label="Имя пользователя"
              name="username"
              rules={[
                {
                  required: true,
                  message: "Пожалуйста, введите имя пользователя!",
                },
              ]}
            >
              <Input
                prefix={<FiUser className="text-gray-400" />}
                placeholder="Введите имя пользователя"
                size="large"
              />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: "Пожалуйста, введите пароль!" },
              ]}
            >
              <Input.Password
                prefix={<FiLock className="text-gray-400" />}
                placeholder="Введите пароль"
                size="large"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full h-12 text-base font-medium"
              >
                Войти в систему
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
