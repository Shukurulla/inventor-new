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
      badge: userActions?.length || 0,
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

  const handleLogout = () => {
    dispatch(logout());
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
  console.log(theme);

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
                  ? new Date(action.created_at).toLocaleString()
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
      BROKEN: "bg-red-100 text-red-600",
      DISPOSED: "bg-gray-100 text-gray-600",
    };
    return colors[status] || "bg-gray-100 text-gray-600";
  };

  const getStatusText = (status) => {
    const texts = {
      NEW: "Новое",
      WORKING: "Работает",
      REPAIR: "На ремонте",
      BROKEN: "Сломано",
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
            <div className="flex-1 max-w-md mx-4">
              <Input
                placeholder="Поиск по ИНН или QR коду..."
                prefix={<FiSearch className="text-gray-400" />}
                className="rounded search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={handleSearch}
                loading={searchLoading}
              />
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

            {/* Location */}

            {/* Technical Characteristics */}
            {(selectedEquipment.computer_specification_data ||
              selectedEquipment.projector_specification_data ||
              selectedEquipment.printer_specification_data ||
              selectedEquipment.tv_specification_data ||
              selectedEquipment.router_specification_data ||
              selectedEquipment.notebook_specification_data ||
              selectedEquipment.monoblok_specification_data ||
              selectedEquipment.whiteboard_specification_data ||
              selectedEquipment.extender_specification_data) && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Технические характеристики</h4>
                <div className="bg-indigo-50 p-3 rounded">
                  <h5 className="font-medium mb-2">
                    Характеристики{" "}
                    {selectedEquipment.type_data?.name?.toLowerCase()}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {/* Computer specifications */}
                    {selectedEquipment.computer_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">CPU:</span>
                          <span className="ml-1">
                            {selectedEquipment.computer_specification_data.cpu}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">RAM:</span>
                          <span className="ml-1">
                            {selectedEquipment.computer_specification_data.ram}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Накопитель:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.computer_specification_data
                                .storage
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Монитор:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.computer_specification_data
                                .monitor_size
                            }
                            "
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Клавиатура:</span>
                          <span className="ml-1">
                            {selectedEquipment.computer_specification_data
                              .has_keyboard
                              ? "Есть"
                              : "Нет"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Мышь:</span>
                          <span className="ml-1">
                            {selectedEquipment.computer_specification_data
                              .has_mouse
                              ? "Есть"
                              : "Нет"}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Projector specifications */}
                    {selectedEquipment.projector_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Модель:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.projector_specification_data
                                .model
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Яркость:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.projector_specification_data
                                .lumens
                            }{" "}
                            люмен
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Разрешение:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.projector_specification_data
                                .resolution
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Тип проекции:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.projector_specification_data
                                .throw_type
                            }
                          </span>
                        </div>
                      </>
                    )}

                    {/* Printer specifications */}
                    {selectedEquipment.printer_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Модель:</span>
                          <span className="ml-1">
                            {selectedEquipment.printer_specification_data.model}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Цветная печать:</span>
                          <span className="ml-1">
                            {selectedEquipment.printer_specification_data.color
                              ? "Да"
                              : "Нет"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Двусторонняя печать:
                          </span>
                          <span className="ml-1">
                            {selectedEquipment.printer_specification_data.duplex
                              ? "Да"
                              : "Нет"}
                          </span>
                        </div>
                      </>
                    )}

                    {/* TV specifications */}
                    {selectedEquipment.tv_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Модель:</span>
                          <span className="ml-1">
                            {selectedEquipment.tv_specification_data.model}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Размер экрана:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.tv_specification_data
                                .screen_size
                            }
                            "
                          </span>
                        </div>
                      </>
                    )}

                    {/* Router specifications */}
                    {selectedEquipment.router_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Модель:</span>
                          <span className="ml-1">
                            {selectedEquipment.router_specification_data.model}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Порты:</span>
                          <span className="ml-1">
                            {selectedEquipment.router_specification_data.ports}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">WiFi стандарт:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.router_specification_data
                                .wifi_standart
                            }
                          </span>
                        </div>
                      </>
                    )}

                    {/* Notebook specifications */}
                    {selectedEquipment.notebook_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">CPU:</span>
                          <span className="ml-1">
                            {selectedEquipment.notebook_specification_data.cpu}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">RAM:</span>
                          <span className="ml-1">
                            {selectedEquipment.notebook_specification_data.ram}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Накопитель:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.notebook_specification_data
                                .storage
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Экран:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.notebook_specification_data
                                .monitor_size
                            }
                            "
                          </span>
                        </div>
                      </>
                    )}

                    {/* Monoblok specifications */}
                    {selectedEquipment.monoblok_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Размер экрана:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.monoblok_specification_data
                                .screen_size
                            }
                            "
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Тип касания:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.monoblok_specification_data
                                .touch_type
                            }
                          </span>
                        </div>
                      </>
                    )}

                    {/* Whiteboard specifications */}
                    {selectedEquipment.whiteboard_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Модель:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.whiteboard_specification_data
                                .model
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Размер:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.whiteboard_specification_data
                                .screen_size
                            }
                            "
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Тип касания:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.whiteboard_specification_data
                                .touch_type
                            }
                          </span>
                        </div>
                      </>
                    )}

                    {/* Extender specifications */}
                    {selectedEquipment.extender_specification_data && (
                      <>
                        <div>
                          <span className="text-gray-500">Порты:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.extender_specification_data
                                .ports
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Длина:</span>
                          <span className="ml-1">
                            {
                              selectedEquipment.extender_specification_data
                                .length
                            }
                            м
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Contract Information */}
            {selectedEquipment.contract && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center">
                  <span className="mr-2">📄</span>
                  Информация о договоре
                </h4>
                <div className="text-sm">
                  <span className="text-gray-500">Номер договора:</span>
                  <span className="ml-2 font-medium">
                    {selectedEquipment.contract}
                  </span>
                </div>
              </div>
            )}

            {/* Creation Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center">
                <span className="mr-2">👤</span>
                Информация о создании
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                  <span className="ml-2">
                    {selectedEquipment.author?.role || "Admin"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-2">
                    {selectedEquipment.author?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {selectedEquipment.qr_code_url && (
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h4 className="font-medium mb-3">QR Код</h4>
                <div className="inline-block p-3 bg-white rounded-lg shadow-sm">
                  <img
                    src={selectedEquipment.qr_code_url}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Уникальный идентификатор: {selectedEquipment.uid}
                </p>
              </div>
            )}

            {/* Actions */}
          </div>
        )}
      </Modal>
    </AntLayout>
  );
};

export default Layout;
