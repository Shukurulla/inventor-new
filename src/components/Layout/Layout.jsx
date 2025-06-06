"use client";

import { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Menu,
  Badge,
  Dropdown,
  Avatar,
  Button,
  Input,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiHome,
  FiSettings,
  FiFileText,
  FiLayers,
  FiLogOut,
  FiSearch,
  FiClock,
} from "react-icons/fi";
import { logout, getUserActions } from "../../store/slices/authSlice";

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userActions } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUserActions());
  }, [dispatch]);

  const menuItems = [
    {
      key: "/",
      icon: <FiHome className="text-lg" />,
      label: "Главная страница",
    },
    {
      key: "/characteristics",
      icon: <FiLayers className="text-lg" />,
      label: "Характеристики",
    },
    {
      key: "/contracts",
      icon: <FiFileText className="text-lg" />,
      label: "Договоры",
    },
    {
      key: "/added",
      icon: <FiLayers className="text-lg" />,
      label: "Добавленные",
      badge: 123,
    },
    {
      key: "/settings",
      icon: <FiSettings className="text-lg" />,
      label: "Настройки",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <FiLogOut />,
      label: "Выйти",
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white border-r border-gray-100"
        width={280}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">iM</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-gray-900">iMaster</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="py-4">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="border-none bg-transparent"
            items={menuItems.map((item) => ({
              ...item,
              label: (
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge
                      count={item.badge}
                      size="small"
                      style={{ backgroundColor: "#6366f1" }}
                    />
                  )}
                </div>
              ),
            }))}
            onClick={handleMenuClick}
          />
        </div>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="topRight"
            trigger={["click"]}
          >
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <Avatar size="small" className="bg-indigo-600">
                U
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Пользователь
                  </div>
                  <div className="text-xs text-gray-500">@user</div>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </Sider>

      <AntLayout>
        <Header className="!bg-white border-b border-gray-100 !px-6 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Поиск по ИНН..."
              prefix={<FiSearch className="text-gray-400" />}
              className="rounded-lg"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Dropdown
              menu={{
                items:
                  userActions?.slice(0, 5).map((action, index) => ({
                    key: index,
                    label: (
                      <div className="py-2">
                        <div className="font-medium text-sm">
                          {action.action_type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {action.created_at}
                        </div>
                      </div>
                    ),
                  })) || [],
              }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" className="flex items-center space-x-2">
                <FiClock className="text-lg text-gray-600" />
                <span className="text-sm font-medium">Последние действия</span>
              </Button>
            </Dropdown>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                Мои действия
              </div>
              <div className="text-xs text-gray-500">
                {userActions?.length > 0 && (
                  <div className="space-y-1">
                    {userActions.slice(0, 3).map((action, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-blue-600">+</span>
                        <span>(Администратор)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Header>

        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] overflow-auto">
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
