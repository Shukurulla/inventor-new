import React, { useEffect, useState } from "react";
import { Card, Collapse, Button, Badge, Empty, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiChevronRight,
  FiThumbsDown,
  FiLayers,
  FiHome,
} from "react-icons/fi";
import {
  getBuildings,
  getFloorsByBuilding,
  getRoomsByBuilding,
  getEquipmentTypesByRoom,
} from "../store/slices/universitySlice";
import { getEquipmentTypes } from "../store/slices/equipmentSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import CreateEquipmentModal from "../components/Equipment/CreateEquipmentModal";

const { Panel } = Collapse;

const HomePage = () => {
  const dispatch = useDispatch();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState(null);
  const [activeBuildingPanels, setActiveBuildingPanels] = useState([]);
  const [activeFloorPanels, setActiveFloorPanels] = useState([]);
  const [activeRoomPanels, setActiveRoomPanels] = useState([]);

  const {
    buildings,
    floorsByBuilding,
    roomsByBuilding,
    equipmentTypesByRoom,
    loading: universityLoading,
  } = useSelector((state) => state.university);

  const { equipmentTypes } = useSelector((state) => state.equipment);

  useEffect(() => {
    dispatch(getBuildings());
    dispatch(getEquipmentTypes());
  }, [dispatch]);

  const handleBuildingExpand = (buildingId) => {
    if (!floorsByBuilding[buildingId]) {
      dispatch(getFloorsByBuilding(buildingId));
    }
    if (!roomsByBuilding[buildingId]) {
      dispatch(getRoomsByBuilding(buildingId));
    }
  };

  const handleRoomExpand = (roomId) => {
    if (!equipmentTypesByRoom[roomId]) {
      dispatch(getEquipmentTypesByRoom(roomId));
    }
  };

  const handleCreateEquipment = (room, equipmentType) => {
    setSelectedRoom(room);
    setSelectedEquipmentType(equipmentType);
    setCreateModalVisible(true);
  };

  const renderEquipmentTypes = (roomId, room) => {
    const equipmentTypesData = equipmentTypesByRoom[roomId] || [];

    return (
      <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">
            Оборудование в кабинете:
          </h4>
          <Button
            type="primary"
            size="small"
            icon={<FiPlus />}
            onClick={() => handleCreateEquipment(room, null)}
          >
            Создать
          </Button>
        </div>

        {equipmentTypesData.length === 0 ? (
          <div className="text-center py-4">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Нет оборудования в этом кабинете"
              className="mb-3"
            />
            <Button
              type="dashed"
              icon={<FiPlus />}
              onClick={() => handleCreateEquipment(room, null)}
              className="w-full"
            >
              Добавить первое оборудование
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {equipmentTypesData.map((typeData) => (
              <div
                key={typeData.type.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <EquipmentIcon type={typeData.type.name} />
                  <div>
                    <span className="font-medium text-gray-800">
                      {typeData.type.name}
                    </span>
                    <div className="text-sm text-gray-500">
                      Количество: {typeData.count}
                    </div>
                  </div>
                </div>
                <Button
                  type="primary"
                  size="small"
                  icon={<FiPlus />}
                  onClick={() => handleCreateEquipment(room, typeData.type)}
                >
                  Добавить
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderRooms = (buildingId, floorId = null) => {
    const allRooms = roomsByBuilding[buildingId] || [];
    // Фильтруем комнаты по этажу, если этаж указан
    const rooms = floorId
      ? allRooms.filter((room) => room.floor === floorId)
      : allRooms;

    if (rooms.length === 0) {
      return (
        <div className="p-4">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              floorId
                ? "Нет кабинетов на этом этаже"
                : "Нет кабинетов в этом корпусе"
            }
          />
        </div>
      );
    }

    return (
      <Collapse
        ghost
        expandIcon={({ isActive }) => (
          <FiChevronRight
            className={`transition-transform ${isActive ? "rotate-90" : ""}`}
          />
        )}
        onChange={(keys) => {
          setActiveRoomPanels(keys);
          keys.forEach((key) => handleRoomExpand(key));
        }}
        activeKey={activeRoomPanels}
      >
        {rooms.map((room) => (
          <Panel
            key={room.id}
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <FiHome className="text-blue-500" />
                  <span className="font-medium">
                    Кабинет {room.number} - {room.name}
                  </span>
                  {room.is_special && <Badge color="purple" text="Спец." />}
                </div>
                <Badge
                  count={equipmentTypesByRoom[room.id]?.length || 0}
                  showZero
                  className="mr-4"
                />
              </div>
            }
          >
            {renderEquipmentTypes(room.id, room)}
          </Panel>
        ))}
      </Collapse>
    );
  };

  const renderFloors = (buildingId) => {
    const floors = floorsByBuilding[buildingId] || [];

    if (floors.length === 0) {
      // Если этажей нет, показываем все комнаты корпуса
      return renderRooms(buildingId);
    }

    return (
      <Collapse
        ghost
        expandIcon={({ isActive }) => (
          <FiChevronRight
            className={`transition-transform ${isActive ? "rotate-90" : ""}`}
          />
        )}
        onChange={(keys) => {
          setActiveFloorPanels(keys);
        }}
        activeKey={activeFloorPanels}
      >
        {floors.map((floor) => {
          const floorRooms = (roomsByBuilding[buildingId] || []).filter(
            (room) => room.floor === floor.id
          );

          return (
            <Panel
              key={floor.id}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <FiLayers className="text-green-500" />
                    <span className="font-medium">{floor.number} этаж</span>
                    {floor.description && (
                      <span className="text-sm text-gray-500">
                        - {floor.description}
                      </span>
                    )}
                  </div>
                  <Badge count={floorRooms.length} showZero className="mr-4" />
                </div>
              }
            >
              {renderRooms(buildingId, floor.id)}
            </Panel>
          );
        })}
      </Collapse>
    );
  };

  if (universityLoading && buildings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Элемент инвентаря
        </h1>
        <p className="text-gray-600">
          Создавайте и управляйте инвентарем по корпусам, этажам и кабинетам
        </p>
      </div>

      <Card className="shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Наличие шаблонов
          </h2>
          <p className="text-sm text-gray-600">
            Выберите корпус → этаж → кабинет для создания оборудования
          </p>
        </div>

        {buildings.length === 0 ? (
          <Empty
            description="Нет доступных корпусов"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Collapse
            expandIcon={({ isActive }) => (
              <FiChevronRight
                className={`transition-transform ${
                  isActive ? "rotate-90" : ""
                }`}
              />
            )}
            onChange={(keys) => {
              setActiveBuildingPanels(keys);
              keys.forEach((key) => handleBuildingExpand(key));
            }}
            activeKey={activeBuildingPanels}
          >
            {buildings.map((building) => {
              const buildingRooms = roomsByBuilding[building.id] || [];
              const totalRooms = buildingRooms.length;

              return (
                <Panel
                  key={building.id}
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <FiThumbsDown className="text-indigo-500 text-lg" />

                        <div>
                          <span className="font-medium text-lg">
                            {building.name}
                          </span>
                          {building.address && (
                            <div className="text-sm text-gray-500">
                              {building.address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          count={`${
                            floorsByBuilding[building.id]?.length || 0
                          } этажей`}
                          className="mr-2"
                          style={{ backgroundColor: "#10b981" }}
                        />
                        <Badge
                          count={`${totalRooms} кабинетов`}
                          className="mr-4"
                          style={{ backgroundColor: "#3b82f6" }}
                        />
                      </div>
                    </div>
                  }
                >
                  {renderFloors(building.id)}
                </Panel>
              );
            })}
          </Collapse>
        )}
      </Card>

      <CreateEquipmentModal
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setSelectedRoom(null);
          setSelectedEquipmentType(null);
        }}
        room={selectedRoom}
        equipmentType={selectedEquipmentType}
        equipmentTypes={equipmentTypes}
      />
    </div>
  );
};

export default HomePage;
