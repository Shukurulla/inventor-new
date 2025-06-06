"use client";

import { useEffect, useState } from "react";
import { Card, Collapse, Button, Badge, Empty, Spin, Breadcrumb } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiChevronRight,
  FiHome,
  FiLayers,
  FiClock,
} from "react-icons/fi";
import {
  getBuildings,
  getFloorsByBuilding,
  getRoomsByBuilding,
  getEquipmentTypesByRoom,
} from "../store/slices/universitySlice";
import { getEquipmentTypes } from "../store/slices/equipmentSlice";
import { getUserActions } from "../store/slices/authSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import CreateEquipmentModal from "../components/Equipment/CreateEquipmentModal";
import EquipmentTypeSelectionModal from "../components/Equipment/EquipmentTypeSelectionModal";

const { Panel } = Collapse;

const HomePage = () => {
  const dispatch = useDispatch();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [typeSelectionModalVisible, setTypeSelectionModalVisible] =
    useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState(null);
  const [activeBuildingPanels, setActiveBuildingPanels] = useState([]);
  const [activeFloorPanels, setActiveFloorPanels] = useState({});
  const [activeRoomPanels, setActiveRoomPanels] = useState({});
  const [activeTab, setActiveTab] = useState("university");
  const [breadcrumb, setBreadcrumb] = useState([
    { title: "Навигация" },
    { title: "Korpus E" },
    { title: "1-этаж" },
    { title: "Ximiya" },
    { title: "201-Лаборатория №1" },
  ]);

  const {
    buildings,
    floorsByBuilding,
    roomsByBuilding,
    equipmentTypesByRoom,
    loading: universityLoading,
  } = useSelector((state) => state.university);

  const { equipmentTypes } = useSelector((state) => state.equipment);
  const { userActions } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getBuildings());
    dispatch(getEquipmentTypes());
    dispatch(getUserActions());
  }, [dispatch]);

  const handleBuildingExpand = (buildingIds) => {
    const newBuildingId = buildingIds.find(
      (id) => !activeBuildingPanels.includes(id)
    );
    if (newBuildingId) {
      if (!floorsByBuilding[newBuildingId]) {
        dispatch(getFloorsByBuilding(newBuildingId));
      }
      if (!roomsByBuilding[newBuildingId]) {
        dispatch(getRoomsByBuilding(newBuildingId));
      }
    }
    setActiveBuildingPanels(buildingIds);
  };

  const handleFloorExpand = (buildingId) => (floorIds) => {
    setActiveFloorPanels((prev) => ({
      ...prev,
      [buildingId]: floorIds,
    }));
  };

  const handleRoomExpand = (buildingId) => (roomIds) => {
    const newRoomId = roomIds.find(
      (id) => !activeRoomPanels[buildingId]?.includes(id)
    );

    if (newRoomId && !equipmentTypesByRoom[newRoomId]) {
      dispatch(getEquipmentTypesByRoom(newRoomId));
    }

    setActiveRoomPanels((prev) => ({
      ...prev,
      [buildingId]: roomIds,
    }));
  };

  const handleAddEquipmentClick = (room) => {
    setSelectedRoom(room);
    setTypeSelectionModalVisible(true);
  };

  const handleEquipmentTypeSelect = (type) => {
    setSelectedEquipmentType(type);
    setCreateModalVisible(true);
  };

  const renderEquipmentTypes = (roomId, room) => {
    const equipmentTypesData = equipmentTypesByRoom[roomId] || [];

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        {equipmentTypesData.length > 0 && (
          <div className="space-y-2 mb-4">
            {equipmentTypesData.map((typeData) => (
              <div
                key={typeData.type.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <EquipmentIcon type={typeData.type.name} />
                  </div>
                  <span className="font-medium text-gray-800">
                    {typeData.type.name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge
                    count={typeData.count}
                    style={{ backgroundColor: "#6366f1" }}
                  />
                  <FiChevronRight className="text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-4">
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={() => handleAddEquipmentClick(room)}
            className="bg-blue-500 hover:bg-blue-600 border-blue-500"
            block
          >
            Добавить новую технику
          </Button>
        </div>
      </div>
    );
  };

  const renderRooms = (buildingId, floorId = null) => {
    const allRooms = roomsByBuilding[buildingId] || [];
    const rooms = floorId
      ? allRooms.filter((room) => room.floor === floorId)
      : allRooms;

    if (rooms.length === 0) {
      return (
        <div className="p-4">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Нет кабинетов"
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
        onChange={handleRoomExpand(buildingId)}
        activeKey={activeRoomPanels[buildingId] || []}
      >
        {rooms.map((room) => (
          <Panel
            key={room.id}
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                    <FiHome className="text-orange-600 text-sm" />
                  </div>
                  <span className="font-medium">
                    {room.number}-{room.name}
                  </span>
                </div>
                <FiChevronRight className="text-gray-400" />
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
        onChange={handleFloorExpand(buildingId)}
        activeKey={activeFloorPanels[buildingId] || []}
      >
        {floors.map((floor) => {
          return (
            <Panel
              key={floor.id}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                      <FiLayers className="text-orange-600 text-sm" />
                    </div>
                    <span className="font-medium">{floor.number}-Этаж</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
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
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Главная страница
          </h1>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "university"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("university")}
            >
              Университет
            </button>
          </div>
        </div>

        <Card className="shadow-sm">
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
              onChange={handleBuildingExpand}
              activeKey={activeBuildingPanels}
            >
              {buildings.map((building) => (
                <Panel
                  key={building.id}
                  header={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 text-sm font-medium">
                            📁
                          </span>
                        </div>
                        <span className="font-medium text-lg">
                          {building.name}
                        </span>
                      </div>
                      <FiChevronRight className="text-gray-400" />
                    </div>
                  }
                >
                  {renderFloors(building.id)}
                </Panel>
              ))}
            </Collapse>
          )}
        </Card>
      </div>

      <EquipmentTypeSelectionModal
        visible={typeSelectionModalVisible}
        onCancel={() => setTypeSelectionModalVisible(false)}
        onSelectType={handleEquipmentTypeSelect}
        equipmentTypes={equipmentTypes}
      />

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
