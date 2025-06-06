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
  Modal,
  Card,
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
  FiTool,
  FiPlus,
} from "react-icons/fi";
import { logout, getUserActions } from "../../store/slices/authSlice";
import { equipmentAPI } from "../../services/api";

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchValue, setSearchValue] = useState("");

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

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    try {
      const response = await equipmentAPI.scanQR(searchValue);
      setSearchResults([response.data]);
      setSearchModalVisible(true);
    } catch (error) {
      // Если не найдено по QR, ищем по ИНН
      try {
        const response = await equipmentAPI.getEquipment({ inn: searchValue });
        setSearchResults(response.data.results || []);
        setSearchModalVisible(true);
      } catch (err) {
        setSearchResults([]);
        setSearchModalVisible(true);
      }
    }
  };

  const handleEquipmentDetails = (equipment) => {
    setSelectedEquipment(equipment);
    setDetailModalVisible(true);
    setSearchModalVisible(false);
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
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
            />
          </div>

          {/* Последние действия - отдельная секция */}
        </Header>

        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)] overflow-auto">
          {children}
        </Content>
      </AntLayout>

      {/* Search Results Modal */}
      <Modal
        title={`Результаты поиска по ИНН: ${searchValue}`}
        visible={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-3">
          {searchResults.length > 0 ? (
            searchResults.map((equipment) => (
              <Card
                key={equipment.id}
                className="cursor-pointer hover:shadow-md"
                size="small"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-blue-600 font-medium">
                        {equipment.name}
                      </span>
                      <span className="text-gray-500">
                        {equipment.type_data?.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>ИНН: {equipment.inn || 0}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                        Новое
                      </span>
                      <span>
                        📍 {equipment.room_data?.number} -{" "}
                        {equipment.room_data?.name}
                      </span>
                      <span>
                        📅 {new Date(equipment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="link"
                    className="text-blue-500"
                    onClick={() => handleEquipmentDetails(equipment)}
                  >
                    Подробнее →
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Оборудование не найдено
            </div>
          )}
        </div>
      </Modal>

      {/* Equipment Details Modal */}
      <Modal
        title="Подробная информация об оборудовании"
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedEquipment && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium mb-4">
                {selectedEquipment.name}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">ИНН:</span>
                  <span className="ml-2 font-medium">
                    {selectedEquipment.inn || 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Тип:</span>
                  <span className="ml-2 font-medium">
                    {selectedEquipment.type_data?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Статус:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                    Новое
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Активность:</span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 rounded text-sm">
                    Активно
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedEquipment.description && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Описание</h4>
                <p className="text-gray-700">{selectedEquipment.description}</p>
              </div>
            )}

            {/* Location */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <span className="mr-2">📍</span>
                Местоположение
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">Комната:</span>
                  <span className="ml-2">
                    {selectedEquipment.room_data?.number} -{" "}
                    {selectedEquipment.room_data?.name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Специальная комната:</span>
                  <span className="ml-2">
                    {selectedEquipment.room_data?.is_special ? "Да" : "Нет"}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Characteristics */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Технические характеристики</h4>
              <div className="bg-blue-50 p-3 rounded">
                <h5 className="font-medium mb-2">
                  Характеристики{" "}
                  {selectedEquipment.type_data?.name?.toLowerCase()}
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedEquipment.computer_specification_data && (
                    <>
                      <div>
                        <span className="text-gray-500">CPU:</span>{" "}
                        <span className="ml-1">
                          {selectedEquipment.computer_specification_data.cpu}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">RAM:</span>{" "}
                        <span className="ml-1">
                          {selectedEquipment.computer_specification_data.ram}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Накопитель:</span>{" "}
                        <span className="ml-1">
                          {
                            selectedEquipment.computer_specification_data
                              .storage
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Монитор:</span>{" "}
                        <span className="ml-1">
                          {
                            selectedEquipment.computer_specification_data
                              .monitor_size
                          }
                          "
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Клавиатура:</span>{" "}
                        <span className="ml-1">
                          {selectedEquipment.computer_specification_data
                            .has_keyboard
                            ? "Есть"
                            : "Нет"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Мышь:</span>{" "}
                        <span className="ml-1">
                          {selectedEquipment.computer_specification_data
                            .has_mouse
                            ? "Есть"
                            : "Нет"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Creation Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <span className="mr-2">👤</span>
                Информация о создании
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Автор:</span>
                  <span className="ml-2">
                    {selectedEquipment.author?.first_name}{" "}
                    {selectedEquipment.author?.last_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Дата создания:</span>
                  <span className="ml-2">
                    {new Date(selectedEquipment.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Роль автора:</span>
                  <span className="ml-2">Admin</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">
                    {selectedEquipment.author?.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </AntLayout>
  );
};

export default Layout;
