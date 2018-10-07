import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Button,
  Modal,
  message,
  Table,
  Icon,
  Badge,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './Basicinfo.less';
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const CreateForm = Form.create()(props => {
  const {
    title,
    modalVisible,
    form,
    handleAdd,
    closeModalVisible,
    branchOptions,
    branchOptions2,
    isChange,
    subsidiaryData,
    subsidiaryOptions,
  } = props;
  //模态对话框确定按钮
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
    });
  };
  const setModalVisible = (flag) => {
    form.resetFields();
    closeModalVisible(flag);
  };
  let options = [];
  if (isChange == false) {
    options = branchOptions;
  } else {
    options = branchOptions2;
  }

  return (
    <Modal
      title={title}
      width={850}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => setModalVisible()}
    >
      <Row>
        <Col span={24}>
          <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} label="*分公司/车队名称">
            {form.getFieldDecorator('companyName', {
              basicinfo: [{ required: true, message: '请输入分公司/车队名称' }],
              initialValue: subsidiaryData.companyBranchName,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label="分公司/车队简称">
            {form.getFieldDecorator('sortName', {
              basicinfo: [{ required: true, message: '请输入分公司/车队简称' }],
              initialValue: subsidiaryData.companyBranchName,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属分公司">
            {form.getFieldDecorator('parentCompanyId', {
              basicinfo: [{ required: true, message: '请选择所属分公司' }],
              initialValue:
                branchOptions2.length === 0
                  ? (subsidiaryData.parentId = '暂无数据')
                  : subsidiaryData.parentId,
              // initialText: "九一八分公司一车队二"
            })(
              <Select placeholder="请选择" showSearch={true} style={{ width: '100%' }}>
                {options}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} label="*联系人">
            {form.getFieldDecorator('contactName', {
              basicinfo: [{ required: true, message: '请输入联系人' }],
              initialValue: subsidiaryData.fullname,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="*联系电话">
            {form.getFieldDecorator('contactPhone', {
              basicinfo: [{ required: true, message: '请输入联系电话' }],
              initialValue: subsidiaryData.mobile,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="备注">
            {form.getFieldDecorator('remark', {
              basicinfo: [{ required: true, message: 'Please input some description...' }],
              initialValue: subsidiaryData.remark,
            })(<TextArea placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
    </Modal>
  );
});

@connect(({ basicinfo, loading }) => ({
  basicinfo,
  loading: loading.effects['basicinfo/fetch1'],
}))
@Form.create()
export default class Subsidiary extends PureComponent {
  constructor(props) {
    super(props); // 调用积累所有的初始化方法
    this.isChange = false;
    this.userId = 0;
    this.disable = false;
    this.branchId = -1; //待编辑分公司ID
    this.state = {
      title: '新增',
      modalVisible: false,
      selectedRows: [],
      formValues: {},
      visible: false,
      //与添加分公司请求接口参数保持一致
      subsidiaryData: {
        companyName: '',
        sortName: '',
        parentCompanyId: '',
        contactName: '',
        contactPhone: '',
        remark: '',
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      subsidiaryData: nextProps.basicinfo.subsidiaryInfo,
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    //分公司列表
    dispatch({
      type: 'basicinfo/fetch1',
      payload: {
        // member_id: 26,
        page: 1,
        pageSize: 10,
      },
    });
    //上级分公司
    dispatch({
      type: 'basicinfo/fetch1Branch',
      payload: {
        // member_id: 26,
      },
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      // member_id: 26,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    //分公司列表
    dispatch({
      type: 'basicinfo/fetch1',
      payload: params,
    });
  };

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'basicinfo/fetch1',
      payload: {
        page: 1,
        pageSize: 10,
      },
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    // 表单校验
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = {
        // member_id: 26,
        page: 1,
        pageSize: 10,
        parentCompanyId: 0,
      };
      for (const prop in fieldsValue) {
        if (
          fieldsValue[prop] === '' ||
          fieldsValue[prop] === '全部' ||
          fieldsValue[prop] === undefined
        ) {
          delete fieldsValue[prop];
        }
      }
      const values = {
        ...params,
        companyName: fieldsValue.companyName,
        sortName: fieldsValue.sortName,
        parentCompanyId: fieldsValue.parentCompanyId,
      };
      dispatch({
        type: 'basicinfo/fetch1',
        payload: values,
      });
    });
  };

// close关闭modal
  closeModalVisible = (flag) => {
    const { dispatch, form} = this.props;
    this.setState({
      modalVisible: flag,
    })
  };
  // 新增
  handleModalVisible = flag => {
    const { dispatch } = this.props;
    this.isChange = false;
    dispatch({
      type: 'basicinfo/getUserData',
      payload: {},
    }).then(() => {
      const { getUserData } = this.props.basicinfo;
      //err=0成功
      if (getUserData.err == 0) {
        switch (getUserData.res.isOperation) {
          case 2:
            message.warning('无添加分公司权限!');
            break;
          case 1:
            this.setState({
              subsidiaryData: {
                companyName: '',
                sortName: '',
                parentCompanyId: '',
                contactName: '',
                contactPhone: '',
                remark: '',
              },
              title: '新增',
              modalVisible: !!flag,
            });
            break;
        }
      }
    });
  };

  //编辑
  handleEdit = (flag, key) => {
    const { dispatch } = this.props;
    this.isChange = true;
    //编辑页下拉框
    dispatch({
      type: 'basicinfo/subsidiaryOptions',
      payload: {},
    });
    // 编辑详情
    dispatch({
      type: 'basicinfo/subsidiaryInfo',
      payload: {
        // member_id: 26,
        branchId: key,
      },
    });

    this.branchId = key;
    this.setState({
      title: '编辑',
      modalVisible: !!flag,
    });
  };

  // 添加成功
  handleAdd = fields => {
    const { dispatch } = this.props;
    //判段是否选择了选项，是的话id
    if (fields.hasOwnProperty('parentCompanyId') == undefined) {
      message.warning('请选择分公司');
      return;
    }
    if (this.isChange === false) {
      //新增
      const payload = {
        // member_id: 26,
        companyName: fields.companyName,
        sortName: fields.sortName,
        parentCompanyId: fields.parentCompanyId,
        contactName: fields.contactName,
        contactPhone: fields.contactPhone,
        remark: fields.remark,
      };
      dispatch({
        type: 'basicinfo/addSubsidiary',
        payload,
      }).then(() => {
        const { addSubsidiary } = this.props.basicinfo;
        switch (addSubsidiary.err) {
          //err=0成功
          case 0:
            message.success(addSubsidiary.msg);
            //再次刷新下面的列表
            //分公司列表
            dispatch({
              type: 'basicinfo/fetch1',
              payload: {
                // member_id: 26,
                page: 1,
                pageSize: 10,
              },
            });
            this.setState({
              modalVisible: false
            });
            form.resetFields();
            break;
          default:
          this.setState({
            modalVisible: true
          });
            message.warning(addSubsidiary.msg);
        }
      });
    } else {
      //编辑
      const payload = {
        // member_id: 26,
        branchId: this.branchId,
        companyName: fields.companyName,
        sortName: fields.sortName,
        parentCompanyId: fields.parentCompanyId,
        contactName: fields.contactName,
        contactPhone: fields.contactPhone,
        remark: fields.remark,
      };
      dispatch({
        type: 'basicinfo/updateSubsidiary',
        payload,
      }).then(() => {
        const { updateSubsidiary } = this.props.basicinfo;
        switch (updateSubsidiary.err) {
          //err=0成功
          case 0:
            message.success(updateSubsidiary.msg);
            //再次刷新下面的列表
            //分公司列表
            dispatch({
              type: 'basicinfo/fetch1',
              payload: {
                // member_id: 26,
                page: 1,
                pageSize: 10,
              },
            });
            break;
          default:
            message.warning(updateSubsidiary.msg);
        }
      });
    }
  };

  render() {
    const { basicinfo, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const {
      subsidiaryList,
      subsidiaryBranchList,
      subsidiaryOptions,
      subsidiaryInfo,
      getUserData,
    } = basicinfo;
    const { count, list: tabledata } = subsidiaryList;
    const { subsidiaryData } = this.state;
    // console.log(subsidiaryData);

    //所属分公司
    const branchOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (subsidiaryBranchList != undefined && subsidiaryBranchList.length > 0) {
      subsidiaryBranchList.forEach(item => {
        branchOptions.push(
          // <Option key={item.branchId} value={`${item.branchId},${item.branchName}`}>
          <Option key={item.branchId} value={item.branchId}>
            {item.branchName}
          </Option>
        );
      });
    }

    //编辑页下拉框
    const branchOptions2 = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (subsidiaryOptions != undefined && subsidiaryOptions.length > 0) {
      subsidiaryOptions.forEach(item => {
        branchOptions2.push(
          // <Option key={item.branchName} value={`${item.branchId},${item.branchName}`}>
          <Option key={item.branchId} value={item.branchId}>
            {item.branchName}
          </Option>
        );
      });
    }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };
    const { selectedRows, modalVisible } = this.state;

    const column = [
      {
        title: '分公司/车队名称',
        dataIndex: 'branchName',
      },
      {
        title: '简称',
        dataIndex: 'branchShortname',
      },
      {
        title: '上级公司',
        dataIndex: 'superiorCompanyName',
      },
      {
        title: '是否有效',
        dataIndex: 'isValid',
        render: text =>
          text === 1 ? <Badge status="1" text="有效" /> : <Badge status="2" text="无效" />,
      },
      {
        title: '操作时间',
        dataIndex: 'createTime',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Button type="primary" onClick={() => this.handleEdit(true, record.key)}>
              编辑
            </Button>
          </Fragment>
        ),
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      closeModalVisible: this.closeModalVisible,
      branchOptions,
      branchOptions2,
      subsidiaryData,
      isChange: this.isChange,
    };

    return (
      <PageHeaderLayout>
        <div className={styles.tableList}>
          <Card bordered={false}>
            <div className={styles.tableListForm}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={12} sm={24}>
                    <FormItem label="分公司/车队名称">
                      {getFieldDecorator('companyName')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                  <Col md={12} sm={24}>
                    <FormItem label="简称">
                      {getFieldDecorator('sortName')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={12} sm={24}>
                    <FormItem label="上级分公司">
                      {getFieldDecorator('parentCompanyId', {
                        // initialValue: '全部',
                        // initialText: '全部',
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {branchOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={12} sm={24}>
                    <span style={{ float: 'right', marginBottom: 24 }}>
                      <Button type="primary" htmlType="submit">
                        <Icon type="search" />查询
                      </Button>
                      <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                        重置
                      </Button>
                    </span>
                  </Col>
                </Row>
              </Form>
            </div>
          </Card>
          <Row style={{ marginTop: 20 }}>
            <Card>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                  新增
                </Button>
              </div>
              <Table
                pagination={paginationProps}
                loading={loading}
                columns={column}
                dataSource={tabledata}
                onChange={this.handleStandardTableChange}
              />
            </Card>
          </Row>
        </div>
        <CreateForm {...parentMethods} modalVisible={modalVisible}/>
      </PageHeaderLayout>
    );
  }
}
