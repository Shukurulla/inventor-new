import React, { useState, useEffect } from "react";
import {
  Layout as AntLayout,
  Menu,
  Badge,
  Dropdown,
  Avatar,
  Button,
} from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiHome,
  FiSettings,
  FiFileText,
  FiTool,
  FiLayers,
  FiUser,
  FiLogOut,
  FiBell,
  FiMenu,
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
    },
    {
      key: "/repairs",
      icon: <FiTool className="text-lg" />,
      label: "Ремонт",
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
      key: "profile",
      icon: <FiUser />,
      label: "Профиль",
    },
    {
      key: "logout",
      icon: <FiLogOut />,
      label: "Выйти",
      onClick: handleLogout,
    },
  ];

  const actionsDropdownItems =
    userActions?.slice(0, 5).map((action, index) => ({
      key: index,
      label: (
        <div className="py-2">
          <div className="font-medium text-sm">{action.action_type}</div>
          <div className="text-xs text-gray-500">{action.created_at}</div>
        </div>
      ),
    })) || [];

  return (
    <AntLayout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-gray-50 border-r border-gray-200"
        width={260}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">iM</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-gray-800">iMaster</span>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-none mt-4"
        />
      </Sider>

      <AntLayout>
        <Header className="!bg-white border-b border-gray-200 !px-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              type="text"
              icon={<FiMenu />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-600 hover:text-gray-800"
            />
          </div>

          <div className="flex items-center space-x-4">
            <Dropdown
              menu={{ items: actionsDropdownItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" className="flex items-center">
                <Badge
                  count={userActions?.length > 0 ? userActions.length : 0}
                  size="small"
                >
                  <FiBell className="text-lg text-gray-600" />
                </Badge>
                <span className="ml-2 text-sm font-medium">Мои действия</span>
              </Button>
            </Dropdown>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Avatar size="small" className="bg-indigo-600">
                  {user?.first_name?.[0] || "U"}
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    ({user?.role || "Администратор"})
                  </div>
                </div>
              </div>
            </Dropdown>
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
