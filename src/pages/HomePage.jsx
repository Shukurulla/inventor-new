// 1. HomePage.jsx - Accordion loading states fix

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
  getFacultiesByBuilding,
  getRoomsByBuilding,
  getEquipmentTypesByRoom,
} from "../store/slices/universitySlice";
import { getEquipmentTypes } from "../store/slices/equipmentSlice";
import { getUserActions } from "../store/slices/authSlice";
import EquipmentIcon from "../components/Equipment/EquipmentIcon";
import CreateEquipmentModal from "../components/Equipment/CreateEquipmentModal";
import EquipmentTypeSelectionModal from "../components/Equipment/EquipmentTypeSelectionModal";
import EquipmentListModal from "../components/Equipment/EquipmentListModal";

const { Panel } = Collapse;

const HomePage = () => {
  const dispatch = useDispatch();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [typeSelectionModalVisible, setTypeSelectionModalVisible] =
    useState(false);
  const [equipmentModalVisible, setEquipmentModalVisible] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedEquipmentType, setSelectedEquipmentType] = useState(null);
  const [selectedEquipmentTypeData, setSelectedEquipmentTypeData] =
    useState(null);
  const [activeBuildingPanels, setActiveBuildingPanels] = useState([]);
  const [activeFloorPanels, setActiveFloorPanels] = useState({});
  const [activeFacultyPanels, setActiveFacultyPanels] = useState({});
  const [activeRoomPanels, setActiveRoomPanels] = useState({});
  const [activeTab, setActiveTab] = useState("university");

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    floors: {},
    faculties: {},
    rooms: {},
    equipment: {},
  });

  const {
    buildings = [],
    floorsByBuilding = {},
    facultiesByBuilding = {},
    roomsByBuilding = {},
    equipmentTypesByRoom = {},
    loading: universityLoading,
    error: universityError,
  } = useSelector((state) => state.university);

  const { equipmentTypes = [] } = useSelector((state) => state.equipment);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await dispatch(getBuildings()).unwrap();
        await dispatch(getEquipmentTypes()).unwrap();
        dispatch(getUserActions());
      } catch (error) {
        console.error("Ошибка при загрузке начальных данных:", error);
      }
    };

    loadInitialData();
  }, [dispatch]);

  const handleBuildingExpand = async (buildingIds) => {
    if (buildingIds.length === 0) {
      setActiveBuildingPanels([]);
      setActiveFloorPanels({});
      setActiveFacultyPanels({});
      setActiveRoomPanels({});
      return;
    }

    const newBuildingIds = buildingIds.filter(
      (id) => !activeBuildingPanels.includes(id)
    );
    const closedBuildingIds = activeBuildingPanels.filter(
      (id) => !buildingIds.includes(id)
    );

    let newActiveFloorPanels = { ...activeFloorPanels };
    let newActiveFacultyPanels = { ...activeFacultyPanels };
    let newActiveRoomPanels = { ...activeRoomPanels };

    closedBuildingIds.forEach((buildingId) => {
      delete newActiveFloorPanels[buildingId];
      Object.keys(newActiveFacultyPanels).forEach((key) => {
        if (key.startsWith(`${buildingId}-`)) {
          delete newActiveFacultyPanels[key];
        }
      });
      Object.keys(newActiveRoomPanels).forEach((key) => {
        if (key.startsWith(`${buildingId}-`)) {
          delete newActiveRoomPanels[key];
        }
      });
    });

    setActiveBuildingPanels(buildingIds);
    setActiveFloorPanels(newActiveFloorPanels);
    setActiveFacultyPanels(newActiveFacultyPanels);
    setActiveRoomPanels(newActiveRoomPanels);

    for (const buildingId of newBuildingIds) {
      // Set loading state for floors
      setLoadingStates((prev) => ({
        ...prev,
        floors: { ...prev.floors, [buildingId]: true },
      }));

      if (!floorsByBuilding[buildingId]) {
        try {
          await dispatch(getFloorsByBuilding(buildingId)).unwrap();
        } catch (error) {
          console.error(`Ошибка загрузки этажей здания ${buildingId}:`, error);
        }
      }

      if (!roomsByBuilding[buildingId]) {
        try {
          await dispatch(getRoomsByBuilding(buildingId)).unwrap();
        } catch (error) {
          console.error(`Ошибка загрузки комнат здания ${buildingId}:`, error);
        }
      }

      // Clear loading state for floors
      setLoadingStates((prev) => ({
        ...prev,
        floors: { ...prev.floors, [buildingId]: false },
      }));
    }
  };

  const handleFloorExpand = (buildingId) => (floorIds) => {
    const newActiveFacultyPanels = { ...activeFacultyPanels };
    const newActiveRoomPanels = { ...activeRoomPanels };

    Object.keys(newActiveFacultyPanels).forEach((key) => {
      if (
        key.startsWith(`${buildingId}-`) &&
        !floorIds.some((floorId) => key.startsWith(`${buildingId}-${floorId}`))
      ) {
        delete newActiveFacultyPanels[key];
      }
    });

    Object.keys(newActiveRoomPanels).forEach((key) => {
      if (
        key.startsWith(`${buildingId}-`) &&
        !floorIds.some((floorId) => key.startsWith(`${buildingId}-${floorId}`))
      ) {
        delete newActiveRoomPanels[key];
      }
    });

    setActiveFloorPanels((prev) => ({
      ...prev,
      [buildingId]: floorIds,
    }));
    setActiveFacultyPanels(newActiveFacultyPanels);
    setActiveRoomPanels(newActiveRoomPanels);
  };

  const handleFacultyExpand = (buildingId, floorId) => async (facultyIds) => {
    const key = `${buildingId}-${floorId}`;

    // Set loading state for rooms
    setLoadingStates((prev) => ({
      ...prev,
      rooms: { ...prev.rooms, [key]: true },
    }));

    const newActiveRoomPanels = { ...activeRoomPanels };

    Object.keys(newActiveRoomPanels).forEach((roomKey) => {
      if (
        roomKey.startsWith(`${buildingId}-${floorId}-`) &&
        !facultyIds.some((facultyId) =>
          roomKey.startsWith(`${buildingId}-${floorId}-${facultyId}`)
        )
      ) {
        delete newActiveRoomPanels[roomKey];
      }
    });

    setActiveFacultyPanels((prev) => ({
      ...prev,
      [key]: facultyIds,
    }));
    setActiveRoomPanels(newActiveRoomPanels);

    // Clear loading state
    setLoadingStates((prev) => ({
      ...prev,
      rooms: { ...prev.rooms, [key]: false },
    }));
  };

  const handleRoomExpand =
    (buildingId, floorId, facultyId) => async (roomIds) => {
      const key = `${buildingId}-${floorId}-${facultyId}`;
      setActiveRoomPanels((prev) => ({
        ...prev,
        [key]: roomIds,
      }));

      for (const roomId of roomIds) {
        // Set loading state for equipment
        setLoadingStates((prev) => ({
          ...prev,
          equipment: { ...prev.equipment, [roomId]: true },
        }));

        if (!equipmentTypesByRoom[roomId]) {
          try {
            await dispatch(getEquipmentTypesByRoom(roomId)).unwrap();
          } catch (error) {
            console.error(
              `Ошибка загрузки типов оборудования комнаты ${roomId}:`,
              error
            );
          }
        }

        // Clear loading state
        setLoadingStates((prev) => ({
          ...prev,
          equipment: { ...prev.equipment, [roomId]: false },
        }));
      }
    };

  const handleAddEquipmentClick = (room) => {
    setSelectedRoom(room);
    setTypeSelectionModalVisible(true);
  };

  const handleEquipmentTypeSelect = (type) => {
    setSelectedEquipmentType(type);
    setCreateModalVisible(true);
  };

  const handleEquipmentTypeClick = (typeData, room) => {
    setSelectedEquipmentTypeData(typeData);
    setSelectedRoom(room);
    setEquipmentModalVisible(true);
  };

  const renderEquipmentTypes = (roomId, room) => {
    const equipmentTypesData = equipmentTypesByRoom[roomId] || [];
    const isLoading = loadingStates.equipment[roomId];

    return (
      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
        {isLoading ? (
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="mt-4 text-gray-500">Загрузка оборудования...</p>
          </div>
        ) : (
          <>
            {equipmentTypesData.length > 0 && (
              <div className="space-y-2 mb-4">
                {equipmentTypesData.map((typeData) => {
                  const typeName =
                    typeData.type?.name || typeData.name || "Неизвестный тип";
                  const count = typeData.count || typeData.items?.length || 0;
                  const typeId = typeData.type?.id || typeData.id;

                  return (
                    <div
                      key={typeId || Math.random()}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => handleEquipmentTypeClick(typeData, room)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <EquipmentIcon type={typeName} />
                        </div>
                        <span className="font-medium text-gray-800">
                          {typeName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge
                          count={count}
                          style={{ backgroundColor: "#6366f1" }}
                        />
                        <FiChevronRight className="text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="text-center py-4">
              <Button
                icon={<FiPlus />}
                onClick={() => handleAddEquipmentClick(room)}
                className="bg-indigo-400 text-white py-2 hover:bg-indigo-600 border-indigo-600"
                block
              >
                Добавить новую технику
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderRooms = (buildingId, floorId, facultyId) => {
    const allRooms = roomsByBuilding[buildingId] || [];
    let rooms = allRooms.filter((room) => {
      const matchesFloor = !floorId || room.floor === floorId;
      const matchesFaculty = !facultyId || room.faculty === facultyId;
      return matchesFloor && matchesFaculty;
    });

    if (rooms.length === 0) {
      return (
        <div className="p-4">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Комнаты не найдены"
          />
        </div>
      );
    }

    const key = `${buildingId}-${floorId || "null"}-${facultyId || "null"}`;

    return (
      <Collapse
        ghost
        accordion
        expandIcon={({ isActive }) => (
          <FiChevronRight
            className={`transition-transform ${isActive ? "rotate-90" : ""}`}
          />
        )}
        onChange={handleRoomExpand(buildingId, floorId, facultyId)}
        activeKey={activeRoomPanels[key] || []}
      >
        {rooms.map((room) => (
          <Panel
            key={room.id}
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                    <FiHome className="text-blue-600 text-sm" />
                  </div>
                  <span className="font-medium">
                    {room.number} - {room.name}
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

  const renderFaculties = (buildingId, floorId) => {
    const allFaculties = facultiesByBuilding[buildingId] || [];
    const faculties = floorId
      ? allFaculties.filter((faculty) => faculty.floor === floorId)
      : allFaculties;

    if (faculties.length === 0) {
      return renderRooms(buildingId, floorId, null);
    }

    const key = `${buildingId}-${floorId}`;
    const isLoading = loadingStates.rooms[key];

    return (
      <>
        {isLoading && (
          <div className="text-center py-4">
            <Spin size="small" />
            <span className="ml-2 text-gray-500">Загрузка факультетов...</span>
          </div>
        )}
        <Collapse
          ghost
          accordion
          expandIcon={({ isActive }) => (
            <FiChevronRight
              className={`transition-transform ${isActive ? "rotate-90" : ""}`}
            />
          )}
          onChange={handleFacultyExpand(buildingId, floorId)}
          activeKey={activeFacultyPanels[key] || []}
        >
          {faculties.map((faculty) => (
            <Panel
              key={faculty.id}
              header={
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center">
                      <FiHome className="text-green-600 text-sm" />
                    </div>
                    <span className="font-medium">{faculty.name}</span>
                  </div>
                  <FiChevronRight className="text-gray-400" />
                </div>
              }
            >
              {renderRooms(buildingId, floorId, faculty.id)}
            </Panel>
          ))}
        </Collapse>
      </>
    );
  };

  const renderFloors = (buildingId) => {
    const floors = floorsByBuilding[buildingId] || [];
    const isLoading = loadingStates.floors[buildingId];

    if (isLoading) {
      return (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-500">Загрузка этажей...</p>
        </div>
      );
    }

    if (floors.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Этажи не найдены"
        />
      );
    }

    return (
      <Collapse
        ghost
        accordion
        expandIcon={({ isActive }) => (
          <FiChevronRight
            className={`transition-transform ${isActive ? "rotate-90" : ""}`}
          />
        )}
        onChange={handleFloorExpand(buildingId)}
        activeKey={activeFloorPanels[buildingId] || []}
      >
        {floors.map((floor) => (
          <Panel
            key={floor.id}
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded bg-orange-100 flex items-center justify-center">
                    <FiLayers className="text-orange-600 text-sm" />
                  </div>
                  <span className="font-medium">{floor.number}-й этаж</span>
                </div>
                <FiChevronRight className="text-gray-400" />
              </div>
            }
          >
            {renderFaculties(buildingId, floor.id)}
          </Panel>
        ))}
      </Collapse>
    );
  };

  if (universityError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-2">Ошибка при загрузке данных</div>
          <Button
            onClick={() => {
              dispatch(getBuildings());
              dispatch(getEquipmentTypes());
            }}
          >
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  if (universityLoading && buildings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex space-x-8 border-b border-gray-200">
            <button
              className={`pb-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "university"
                  ? "border-indigo-500 text-indigo-600"
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
              description="Корпуса не найдены"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Collapse
              accordion
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
                        <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center">
                          <FiHome className="text-purple-600 text-sm" />
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

      <EquipmentListModal
        visible={equipmentModalVisible}
        onCancel={() => setEquipmentModalVisible(false)}
        equipmentTypeData={selectedEquipmentTypeData}
        room={selectedRoom}
      />
    </div>
  );
};

export default HomePage;
