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
import dayjs from "dayjs";

const ContractsPage = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [dependencyModalVisible, setDependencyModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [dependentEquipment, setDependentEquipment] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isEditFormValid, setIsEditFormValid] = useState(false);
  const [checkingDependencies, setCheckingDependencies] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const dispatch = useDispatch();

  // Get data from Redux store (already loaded in App.js)
  const { contracts, loading, pagination } = useSelector(
    (state) => state.contracts
  );

  // Validation for create form
  const validateCreateForm = () => {
    const values = form.getFieldsValue();
    const isValid =
      values.number && values.number.trim() !== "" && values.valid_until;
    setIsFormValid(isValid);
  };

  // Validation for edit form
  const validateEditForm = () => {
    const values = editForm.getFieldsValue();
    const isValid =
      values.number && values.number.trim() !== "" && values.valid_until;
    setIsEditFormValid(isValid);
  };

  // Check dependencies before deletion
  const checkContractDependencies = async (contract) => {
    setCheckingDependencies(true);
    try {
      // Check if contract is used in any equipment
      const response = await equipmentAPI.getFilteredEquipments({
        contract_id: contract.id,
      });

      const equipmentList = response.data.results || response.data || [];

      if (equipmentList.length > 0) {
        setDependentEquipment(equipmentList);
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
      setCheckingDependencies(false);
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
      formData.append("valid_until", values.valid_until.format("YYYY-MM-DD"));

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
      formData.append("valid_until", values.valid_until.format("YYYY-MM-DD"));

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
      valid_until: dayjs(contract.valid_until),
    });
    setEditModalVisible(true);
    // Validate initial form state
    setTimeout(validateEditForm, 0);
  };

  const openCreateModal = () => {
    setCreateModalVisible(true);
    setIsFormValid(false);
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
      dataIndex: "valid_until",
      key: "valid_until",
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
            loading={checkingDependencies}
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
            name="valid_until"
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
            name="valid_until"
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

      {/* Dependency Check Modal */}
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
                Данный договор используется в следующем оборудовании:
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
                        {equipment.inn || "Не указан"}
                      </div>
                    </div>
                    <Button
                      type="link"
                      onClick={() => {
                        // Navigate to equipment edit or details
                        message.info("Переход к редактированию оборудования");
                      }}
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
    </div>
  );
};

export default ContractsPage;
