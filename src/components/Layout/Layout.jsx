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
  Spin,
  Empty,
  Tooltip,
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
  FiTool,
  FiClock,
  FiMenu,
  FiX,
  FiBell,
  FiUser,
  FiMap,
  FiMapPin,
} from "react-icons/fi";
import { logout, getUserActions } from "../../store/slices/authSlice";
import api, { equipmentAPI } from "../../services/api";
import {
  getFilteredEquipment,
  scanQRCode,
} from "../../store/slices/equipmentSlice";
import { LogoDark, LogoLight } from "../../../public";
import { inventoryTypes } from "../../constants";

const { Header, Sider, Content } = AntLayout;

const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [rooms, setRooms] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userActions } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.settings);
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      const response = await equipmentAPI.getMyEquipments();
      setCount(response.data.length);
    } catch (error) {
      console.error("Load equipment error:", error);
    }
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const titles = {
      "/": "Главная страница",
      "/characteristics": "Характеристики",
      "/contracts": "Договоры",
      "/added": "Добавленные",
      "/repairs": "Ремонт оборудования",
      "/settings": "Настройки",
    };
    return titles[location.pathname] || "iMaster";
  };

  const getRooms = async () => {
    try {
      const { data } = await api.get("/university/rooms");
      setRooms(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    dispatch(getUserActions());
    getRooms();
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
      badge: count || 0,
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
    setMobileMenuVisible(false);
  };

  // Updated logout handler with confirmation modal
  const handleLogout = () => {
    Modal.confirm({
      title: "Подтвердите выход",
      content: "Вы уверены, что хотите выйти из системы?",
      okText: "Да, выйти",
      cancelText: "Отмена",
      okType: "danger",
      icon: <FiLogOut className="text-red-500" />,
      onOk() {
        dispatch(logout());
      },
      onCancel() {
        console.log("Logout cancelled");
      },
    });
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setSearchLoading(true);
    try {
      // Avval QR kod bo'yicha qidirish
      const qrResponse = await dispatch(scanQRCode(searchValue)).unwrap();
      setSearchResults([qrResponse]);
      setSearchModalVisible(true);
    } catch (error) {
      // QR bo'yicha topilmasa, INN yoki nom bo'yicha qidirish
      try {
        const filterResponse = await dispatch(
          getFilteredEquipment({
            search: searchValue,
            inn: searchValue,
          })
        ).unwrap();

        const results = filterResponse.results || filterResponse || [];
        setSearchResults(Array.isArray(results) ? results : []);
        setSearchModalVisible(true);
      } catch (err) {
        console.error("Qidirishda xato:", err);
        setSearchResults([]);
        setSearchModalVisible(true);
        message.error("Qidirishda xato yuz berdi");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleEquipmentDetails = (equipment) => {
    setSelectedEquipment(equipment);
    console.log(equipment);

    setDetailModalVisible(true);
    setSearchModalVisible(false);
  };

  // Helper function to format time difference
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Только что";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} д назад`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} нед назад`;

    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} мес назад`;
  };

  const renderUserActions = () => {
    if (!userActions || userActions.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <FiClock className="text-2xl mb-2 mx-auto" />
          <p className="text-sm">Нет последних действий</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {userActions.slice(0, 5).map((action, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiClock className="text-indigo-600 text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-800 truncate">
                {action.action ||
                  action.description ||
                  "Действие с оборудованием"}
              </div>
              <div className="text-xs text-gray-500">
                {action.created_at
                  ? formatTimeAgo(action.created_at)
                  : "Недавно"}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <FiUser />,
      label: "Профиль",
      onClick: () => navigate("/settings"),
    },
    {
      key: "logout",
      icon: <FiLogOut />,
      label: "Выйти",
      onClick: handleLogout,
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      NEW: "bg-green-100 text-green-600",
      WORKING: "bg-indigo-100 text-indigo-600",
      REPAIR: "bg-orange-100 text-orange-600",
      DISPOSED: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      NEW: "Новое",
      WORKING: "Работает",
      REPAIR: "На ремонте",
      DISPOSED: "Утилизировано",
    };
    return texts[status] || status;
  };

  useEffect(() => {
    console.log(searchResults);
  }, [searchResults]);

  return (
    <AntLayout className="min-h-screen">
      {/* Left Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white border-r border-gray-100 hidden lg:block"
        width={280}
        breakpoint="lg"
        collapsedWidth="0"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <img src={theme == "dark" ? LogoDark : LogoLight} />
          </div>
        </div>

        {/* Menu */}
        <div className="py-4 pr-4">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="border-none bg-transparent"
            items={menuItems.map((item) => ({
              ...item,
              label: (
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
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
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <Avatar size="small" className="bg-indigo-600">
                {user?.first_name?.charAt(0) ||
                  user?.username?.charAt(0) ||
                  "U"}
              </Avatar>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.first_name || "Пользователь"}
                  </div>
                  <div className="text-xs text-gray-500">
                    @{user?.username || "user"}
                  </div>
                </div>
              )}
            </div>
          </Dropdown>
        </div>
      </Sider>

      {/* Mobile Menu */}
      <Modal
        title="Меню"
        visible={mobileMenuVisible}
        onCancel={() => setMobileMenuVisible(false)}
        footer={null}
        className="lg:hidden"
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          className="border-none"
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Modal>

      <AntLayout className="flex">
        <AntLayout className="flex-1">
          <Header className="!bg-white border-b border-gray-100 !px-4 lg:!px-6 flex items-center justify-between">
            <Button
              type="text"
              icon={<FiMenu />}
              onClick={() => setMobileMenuVisible(true)}
              className="lg:hidden"
            />

            {/* Page Title */}
            <div className="flex-1 justify-between flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 mr-6">
                {getPageTitle()}
              </h1>

              {/* Search Input with Button */}
              <div className="flex-1 max-w-md flex items-center space-x-2">
                <Input
                  placeholder="Поиск по ИНН или QR коду..."
                  prefix={<FiSearch className="text-gray-400" />}
                  className="rounded search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onPressEnter={handleSearch}
                />
                <Button
                  type="primary"
                  icon={<FiSearch />}
                  onClick={handleSearch}
                  loading={searchLoading}
                  className="bg-[#4E38F2] border-none hover:bg-[#4A63D7]"
                >
                  Поиск
                </Button>
              </div>
            </div>
          </Header>

          <Content className="flex-1 p-4 lg:p-6 bg-gray-50  overflow-y-scroll">
            <div className=" h-[50vh] w-100">{children}</div>
          </Content>
        </AntLayout>
        <Sider
          width={300}
          className="!bg-gray-50 border-l border-gray-100 hidden xl:block"
          theme="light"
        >
          <div className="p- h-full">
            <Card
              title={
                <div className="flex items-center space-x-2">
                  <FiClock className="text-lg text-indigo-600" />
                  <span className="font-medium">Мои действия</span>
                </div>
              }
              className="shadow-sm h-full"
              bodyStyle={{
                padding: "16px",
                height: "calc(100% - 60px)",
                overflowY: "auto",
              }}
            >
              {renderUserActions()}
            </Card>
          </div>
        </Sider>
      </AntLayout>

      {/* Search Results Modal */}
      <Modal
        title={
          <div className="flex text-lg items-center space-x-2">
            <FiSearch className="text-lg" />
            <span>Результаты поиска: ИНН: {searchValue}</span>
          </div>
        }
        visible={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="space-y-3">
          {searchLoading ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-500">Поиск...</p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((eq) => {
              const equipment = JSON.parse(eq.body);

              return (
                <Card
                  key={equipment.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  size="small"
                  onClick={() =>
                    handleEquipmentDetails({
                      ...equipment,
                      title: eq.title,
                      room: rooms.find((c) => c.id == equipment.room)?.name,
                    })
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-indigo-600 font-medium">
                          {eq.title}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {equipment.type_data?.name}
                        </span>
                      </div>
                      <div className="  text-sm text-gray-500 flex-wrap">
                        <div className="flex gap-3">
                          <span>ИНН: {equipment.inn}</span>

                          <span
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(
                              equipment.status
                            )}`}
                          >
                            {getStatusText(equipment.status)}
                          </span>
                        </div>
                        <div className="flex ml-0 justify-start gap-3 mt-3">
                          <span className="flex items-center gap-1">
                            <FiMapPin size={20} />
                            <span>
                              {rooms.find((c) => c.id == equipment.room)?.name}
                            </span>
                          </span>
                          <span className="flex gap-1">
                            <FiClock size={20} />
                            {new Date(
                              equipment.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button type="link" className="text-indigo-600 font-medium">
                      Подробнее →
                    </button>
                  </div>
                </Card>
              );
            })
          ) : (
            <Empty
              description="Оборудование не найдено"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>
      </Modal>

      {/* Equipment Details Modal */}
      <Modal
        visible={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
      >
        <h1 className="text-3xl font-semibold">
          Подробная информация об оборудовании
        </h1>
        {selectedEquipment && (
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-medium text-indigo-600 my-4">
                {selectedEquipment.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500">ИНН:</span>
                  <span className="ml-2 font-medium">
                    {selectedEquipment.inn}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Тип:</span>
                  <span className="ml-2 font-medium">
                    {
                      inventoryTypes.find((c) => c.id == selectedEquipment.type)
                        ?.name
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Статус:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(
                      selectedEquipment.status
                    )}`}
                  >
                    {getStatusText(selectedEquipment.status)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Активность:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-sm ${
                      selectedEquipment.is_active
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {selectedEquipment.is_active ? "Активно" : "Неактивно"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedEquipment.description && (
              <div className="bg-indigo-50 p-4 flex items-center rounded-lg">
                <div className="w-[50%]">
                  <h4 className="font-medium mb-2">Описание</h4>
                  <p className="text-gray-700">
                    {selectedEquipment.description}
                  </p>
                </div>
                <div className="w-[50%]">
                  <h4 className="font-medium mb-2 flex items-center">
                    <span className="mr-2">
                      <FiMapPin />
                    </span>
                    Местоположение
                  </h4>
                  <p>{selectedEquipment.room}</p>
                </div>
              </div>
            )}

            {/* QR Code */}
            {selectedEquipment.inn && (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h4 className="font-medium mb-3">QR Код</h4>
                <div className="inline-block p-3 bg-white rounded-lg shadow-sm">
                  <img
                    src={`http://api.qrserver.com/v1/create-qr-code/?data=${selectedEquipment.inn}&size=200x200&bgcolor=FFFFFF&color=000000&format=png`}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Уникальный идентификатор: {selectedEquipment.uid}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AntLayout>
  );
};

export default Layout;
