// src/pages/ContractsPage.jsx - FIXED equipment filtering and edit modal

"use client";

import { useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  message,
  Popconfirm,
  Space,
  List,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiUpload,
  FiFileText,
  FiAlertTriangle,
} from "react-icons/fi";
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} from "../store/slices/contractSlice";
import { equipmentAPI } from "../services/api";
import EditEquipmentModal from "../components/Equipment/EditEquipmentModal";
import dayjs from "dayjs";

const ContractsPage = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [dependencyModalVisible, setDependencyModalVisible] = useState(false);
  const [equipmentEditModalVisible, setEquipmentEditModalVisible] =
    useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [dependentEquipment, setDependentEquipment] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);

  // Individual loading states for each contract
  const [deletingContracts, setDeletingContracts] = useState(new Set());

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const dispatch = useDispatch();

  // Get data from Redux store (already loaded in App.js)
  const { contracts, loading, pagination } = useSelector(
    (state) => state.contracts
  );
  const { equipmentTypes } = useSelector((state) => state.equipment);

  // Validation for create form
  const validateCreateForm = () => {
    const values = form.getFieldsValue();
    const isValid =
      values.number && values.number.trim() !== "" && values.signed_date;
    setIsFormValid(isValid);
  };

  // Validation for edit form
  const validateEditForm = () => {
    const values = editForm.getFieldsValue();
    const isValid =
      values.number && values.number.trim() !== "" && values.signed_date;
    setIsEditFormValid(isValid);
  };

  // FIXED: Check dependencies with proper filtering
  const checkContractDependencies = async (contract) => {
    // Add contract to deleting set to show loading for this specific contract
    setDeletingContracts((prev) => new Set(prev).add(contract.id));

    try {
      // FIXED: Get all equipment first (since API might not support contract_id filter)
      const response = await equipmentAPI.getFilteredEquipments({
        page_size: 1000, // Get all equipment
      });

      const equipmentList = response.data.results || response.data || [];

      // FIXED: Filter equipment that actually uses this contract based on actual data structure
      const contractEquipment = equipmentList.filter((equipment) => {
        // Check both contract.id and direct contract_id field
        const contractId = JSON.parse(equipment.body).contract;
        return contractId === contract.id;
      });

      console.log("Contract ID to check:", contractEquipment);
      console.log("Total equipment:", equipmentList.length);
      console.log("Filtered equipment:", contractEquipment.length);
      console.log("Contract equipment:", equipmentList);

      if (contractEquipment.length > 0) {
        setDependentEquipment(contractEquipment);
        setSelectedContract(contract);
        setDependencyModalVisible(true);
      } else {
        // No dependencies, safe to delete
        confirmDirectDelete(contract);
      }
    } catch (error) {
      console.error("Error checking dependencies:", error);
      message.error("Ошибка при проверке зависимостей");
    } finally {
      // Remove contract from deleting set
      setDeletingContracts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contract.id);
        return newSet;
      });
    }
  };

  const confirmDirectDelete = (contract) => {
    Modal.confirm({
      title: "Удалить договор?",
      content: `Вы уверены, что хотите удалить договор "${contract.number}"?`,
      okText: "Да, удалить",
      cancelText: "Отмена",
      okType: "danger",
      onOk: () => handleDelete(contract.id),
    });
  };

  const handleCreate = async (values) => {
    try {
      const formData = new FormData();
      formData.append("number", values.number.trim());
      formData.append("signed_date", values.signed_date.format("YYYY-MM-DD"));

      if (values.file && values.file.fileList && values.file.fileList[0]) {
        formData.append("file", values.file.fileList[0].originFileObj);
      }

      await dispatch(createContract(formData)).unwrap();
      message.success("Договор успешно создан!");
      setCreateModalVisible(false);
      form.resetFields();
      setIsFormValid(false);
    } catch (error) {
      message.error("Ошибка при создании договора");
    }
  };

  const handleEdit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("number", values.number.trim());
      formData.append("signed_date", values.signed_date.format("YYYY-MM-DD"));

      if (values.file && values.file.fileList && values.file.fileList[0]) {
        formData.append("file", values.file.fileList[0].originFileObj);
      }

      await dispatch(
        updateContract({
          id: selectedContract.id,
          data: formData,
        })
      ).unwrap();

      message.success("Договор успешно обновлен!");
      setEditModalVisible(false);
      setSelectedContract(null);
      editForm.resetFields();
      setIsEditFormValid(false);
    } catch (error) {
      message.error("Ошибка при обновлении договора");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteContract(id)).unwrap();
      message.success("Договор успешно удален!");
    } catch (error) {
      message.error("Ошибка при удалении договора");
    }
  };

  const handleView = (contract) => {
    if (contract.file) {
      window.open(contract.file, "_blank");
    } else {
      message.info("Файл договора не найден");
    }
  };

  const handleDownload = (contract) => {
    if (contract.file) {
      const link = document.createElement("a");
      link.href = contract.file;
      link.download = `contract_${contract.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      message.info("Файл договора не найден");
    }
  };

  const openEditModal = (contract) => {
    setSelectedContract(contract);
    editForm.setFieldsValue({
      number: contract.number,
      signed_date: dayjs(contract.signed_date),
    });
    setEditModalVisible(true);
    // Validate initial form state
    setTimeout(validateEditForm, 0);
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
    setIsFormValid(false);
  };

  // FIXED: Equipment edit handler with proper data structure
  const handleEquipmentEdit = async (equipment) => {
    try {
      // FIXED: Fetch complete equipment data to ensure all required fields are present
      const response = await equipmentAPI.getEquipmentById(equipment.id);
      const fullEquipmentData = response.data;

      // FIXED: Ensure type information is properly structured
      if (!fullEquipmentData.type_data && fullEquipmentData.type) {
        // If type_data is missing but type exists, find the type data
        const typeData = equipmentTypes.find(
          (t) => t.id === fullEquipmentData.type
        );
        if (typeData) {
          fullEquipmentData.type_data = typeData;
        }
      }

      setSelectedEquipment(fullEquipmentData);
      setEquipmentEditModalVisible(true);
    } catch (error) {
      console.error("Error fetching equipment details:", error);
      message.error("Ошибка при загрузке данных оборудования");
    }
  };

  // Handle equipment edit modal close with refresh
  const handleEquipmentEditModalClose = async () => {
    setEquipmentEditModalVisible(false);
    setSelectedEquipment(null);

    // Refresh dependencies after edit
    if (selectedContract) {
      await checkContractDependencies(selectedContract);
    }
  };

  const columns = [
    {
      title: "Номер договора",
      dataIndex: "number",
      key: "number",
      render: (text) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FiFileText className="text-indigo-600" />
          </div>
          <span className="font-medium text-gray-800">{text}</span>
        </div>
      ),
    },
    {
      title: "Дата заключения",
      dataIndex: "signed_date",
      key: "signed_date",
      render: (date) => (
        <span className="text-gray-600">
          {dayjs(date).format("DD.MM.YYYY")}
        </span>
      ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<FiEye />}
            onClick={() => handleView(record)}
            className="text-indigo-500 hover:text-indigo-600"
          />
          <Button
            type="text"
            icon={<FiEdit />}
            onClick={() => openEditModal(record)}
            className="text-orange-500 hover:text-orange-600"
          />
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            onClick={() => checkContractDependencies(record)}
            loading={deletingContracts.has(record.id)}
            className="text-red-500 hover:text-red-600"
          />
          <Button
            type="text"
            icon={<FiDownload />}
            onClick={() => handleDownload(record)}
            className="text-green-500 hover:text-green-600"
          />
        </Space>
      ),
    },
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: ".pdf,.doc,.docx",
  };

  return (
    <div>
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={openCreateModal}
            className="bg-[#EEF2FF] create-contract p-7 border-[3px] rounded-xl border-[#6366F1] border-dashed text-lg font-semibold text-[#6366F1] items-center justify-center"
            style={{ display: "flex", width: "100%" }}
          >
            <FiPlus size={20} /> Добавить новый договор
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Список</h2>
        </div>

        <Table
          columns={columns}
          dataSource={contracts}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} договоров`,
          }}
          className="border rounded-lg"
        />
      </Card>

      {/* Create Contract Modal */}
      <Modal
        title="Добавить новый договор"
        visible={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setIsFormValid(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          onFieldsChange={validateCreateForm}
        >
          <Form.Item
            label="Номер договора"
            name="number"
            rules={[
              { required: true, message: "Введите номер договора!" },
              {
                validator: (_, value) => {
                  if (value && value.trim() === "") {
                    return Promise.reject(
                      new Error("Номер договора не может быть пустым!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Введите номер договора" />
          </Form.Item>

          <Form.Item
            label="Дата заключения"
            name="signed_date"
            rules={[{ required: true, message: "Выберите дату заключения!" }]}
          >
            <DatePicker
              placeholder="Выберите дату"
              className="w-full"
              format="DD.MM.YYYY"
            />
          </Form.Item>

          <Form.Item label="Файл договора" name="file" valuePropName="file">
            <Upload {...uploadProps} listType="text">
              <Button icon={<FiUpload />}>Выберите файл</Button>
            </Upload>
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
                setIsFormValid(false);
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!isFormValid}
            >
              {loading ? "Создание..." : "Создать договор"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Contract Modal */}
      <Modal
        title="Редактировать договор"
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedContract(null);
          editForm.resetFields();
          setIsEditFormValid(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEdit}
          onFieldsChange={validateEditForm}
        >
          <Form.Item
            label="Номер договора"
            name="number"
            rules={[
              { required: true, message: "Введите номер договора!" },
              {
                validator: (_, value) => {
                  if (value && value.trim() === "") {
                    return Promise.reject(
                      new Error("Номер договора не может быть пустым!")
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Введите номер договора" />
          </Form.Item>

          <Form.Item
            label="Дата заключения"
            name="signed_date"
            rules={[{ required: true, message: "Выберите дату заключения!" }]}
          >
            <DatePicker
              placeholder="Выберите дату"
              className="w-full"
              format="DD.MM.YYYY"
            />
          </Form.Item>

          <Form.Item label="Файл договора" name="file" valuePropName="file">
            <Upload {...uploadProps} listType="text">
              <Button icon={<FiUpload />}>Выберите новый файл</Button>
            </Upload>
            {selectedContract?.file && (
              <div className="mt-2 text-sm text-gray-500">
                Текущий файл: {selectedContract.file.split("/").pop()}
              </div>
            )}
          </Form.Item>

          <div className="flex justify-end space-x-2 mt-6">
            <Button
              onClick={() => {
                setEditModalVisible(false);
                setSelectedContract(null);
                editForm.resetFields();
                setIsEditFormValid(false);
              }}
            >
              Отмена
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!isEditFormValid}
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* FIXED: Dependency Check Modal with better filtering display */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <FiAlertTriangle className="text-orange-500" />
            <span>Невозможно удалить договор</span>
          </div>
        }
        visible={dependencyModalVisible}
        onCancel={() => {
          setDependencyModalVisible(false);
          setDependentEquipment([]);
          setSelectedContract(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDependencyModalVisible(false);
              setDependentEquipment([]);
              setSelectedContract(null);
            }}
          >
            Закрыть
          </Button>,
        ]}
        width={800}
      >
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <p className="text-orange-800">
              <strong>
                Договор "{selectedContract?.number}" используется в следующем
                оборудовании ({dependentEquipment.length} шт.):
              </strong>
            </p>
            <p className="text-sm text-orange-700 mt-2">
              Для удаления договора необходимо сначала отвязать его от всего
              оборудования или изменить договор у оборудования на другой.
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <List
              dataSource={dependentEquipment}
              renderItem={(equipment) => (
                <List.Item className="border-b hover:bg-gray-50 transition-colors">
                  <div className="w-full flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">
                        {equipment.name || `ID: ${equipment.id}`}
                      </div>
                      <div className="text-sm text-gray-500">
                        Тип: {equipment.type_data?.name || "Неизвестно"} • ИНН:{" "}
                        {equipment.inn || "Не указан"} • Локация:{" "}
                        {equipment.location || "Не указана"}
                      </div>
                      <div className="text-xs text-orange-600">
                        Договор: {equipment.contract?.number || "Не указан"}{" "}
                        (ID: {equipment.contract?.id})
                      </div>
                    </div>
                    <Button
                      type="link"
                      onClick={() => handleEquipmentEdit(equipment)}
                      className="text-indigo-600"
                    >
                      Редактировать →
                    </Button>
                  </div>
                </List.Item>
              )}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              💡 <strong>Рекомендация:</strong> Перейдите к каждому оборудованию
              и измените или удалите привязку к данному договору, после чего вы
              сможете безопасно удалить договор.
            </p>
          </div>
        </div>
      </Modal>

      {/* FIXED: Equipment Edit Modal */}
      <EditEquipmentModal
        visible={equipmentEditModalVisible}
        onCancel={handleEquipmentEditModalClose}
        equipment={selectedEquipment}
        equipmentTypes={equipmentTypes}
      />
    </div>
  );
};

export default ContractsPage;
