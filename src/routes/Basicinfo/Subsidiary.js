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
    branchOptions2,
    branchOptions3,
    isChange,
    subsidiaryData,
  } = props;
  //模态对话框确定按钮
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue, form);
    });
  };

  const setModalVisible = flag => {
    form.resetFields();
    closeModalVisible(flag);
  };

  let options = [];
  if (isChange == false) {
    options = branchOptions2;
  } else {
    options = branchOptions3;
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
          <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} label="分公司/车队名称">
            {form.getFieldDecorator('companyName', {
              rules: [{ type: 'string', required: true, message: '请输入分公司/车队名称!' }],
              initialValue: subsidiaryData.companyBranchName,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 15 }} label="分公司/车队简称">
            {form.getFieldDecorator('sortName', {
              rules: [{ type: 'string', required: true, message: '请输入分公司/车队简称!' }],
              initialValue: subsidiaryData.companyShortname,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属分公司">
            {form.getFieldDecorator('parentCompanyId', {
              basicinfo: [{ required: true, message: '请选择所属分公司' }],
              initialValue:
                branchOptions2.length === 0
                  ? (subsidiaryData.parentId = '集团总公司')
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
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 18 }} label="联系人">
            {form.getFieldDecorator('contactName', {
              rules: [{ type: 'string', required: true, message: '请输入联系人!' }],
              initialValue: subsidiaryData.fullname,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="联系电话">
            {form.getFieldDecorator('contactPhone', {
              rules: [{ type: 'string', required: true, message: '请输入联系电话!' }],
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
    // this.isChange = false;
    this.userId = 0;
    this.disable = false;
    this.branchId = -1; //待编辑分公司ID
    this.state = {
      current: 1,
      isChange: false,
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

  componentDidMount() {
    const { dispatch } = this.props;
    //分公司列表
    dispatch({
      type: 'basicinfo/fetch1',
      payload: {
        page: 1,
        pageSize: 10,
      },
    });
    //分公司管理-上级分公司，全部
    dispatch({
      type: 'basicinfo/fetch1Branch',
      payload: {
        isNeedAll: 1, //1：需要全部字段
      },
    });
    //分公司管理-上级分公司-新增
    dispatch({
      type: 'basicinfo/fetch1BranchAdd',
      payload: {
        isNeedAll: 0,
      },
    });
  }

  //重置
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
    }).then(() => {
      this.setState({
        current: 1,
      });
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
      //分公司列表
      dispatch({
        type: 'basicinfo/fetch1',
        payload: values,
      }).then(() => {
        this.setState({
          current: 1,
        });
      });
    });
  };

  //列表变化翻页的回调
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, form } = this.props;
    // 表单校验
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = {
        // member_id: 26,
        page: pagination.current,
        pageSize: pagination.pageSize,
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
      //分公司列表
      dispatch({
        type: 'basicinfo/fetch1',
        payload: values,
      }).then(() => {
        this.setState({
          current: pagination.current,
        });
      });
    });
  };

  // close关闭modal
  closeModalVisible = flag => {
    const { form } = this.props;
    this.setState({
      modalVisible: flag,
    });
  };
  // 新增
  handleModalVisible = flag => {
    const { dispatch, form } = this.props;
    form.resetFields();
    this.setState({
      subsidiaryData: {
        companyName: '',
        sortName: '',
        parentCompanyId: '',
        contactName: '',
        contactPhone: '',
        remark: '',
      },
    });
    // this.isChange = false;
    this.setState({
      isChange: false,
    });
    dispatch({
      type: 'basicinfo/getUserData',
      payload: {},
    }).then(() => {
      const { getUserData } = this.props.basicinfo;
      console.log('getUserData.err =' + getUserData.err);
      console.log('getUserData.res.isOperation =' + getUserData.res.isOperation);
      //err=0成功
      if (getUserData.err == 0) {
        switch (getUserData.res.isOperation) {
          case 2:
            message.warning('无添加分公司权限!');
            break;
          case 1:
            this.setState({
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
    // this.isChange = true;
    this.setState({
      isChange: true,
    });
    //分公司管理-上级分公司-编辑
    dispatch({
      type: 'basicinfo/fetch1BranchEdit',
      payload: {
        branchId: key,
      },
    });
    // 编辑详情
    dispatch({
      type: 'basicinfo/subsidiaryInfo',
      payload: {
        // member_id: 26,
        branchId: key,
      },
    }).then(() => {
      this.setState({
        subsidiaryData: this.props.basicinfo.subsidiaryInfo,
      });
    });

    this.branchId = key;
    this.setState({
      title: '编辑',
      modalVisible: !!flag,
    });
  };

  // 添加成功
  handleAdd = (fields, form) => {
    const { dispatch } = this.props;
    //判段是否选择了选项，是的话id
    if (fields.parentCompanyId == undefined) {
      message.warning('请选择分公司');
      return;
    }
    if (this.state.isChange === false) {
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
              subsidiaryData: {
                companyName: '',
                sortName: '',
                parentCompanyId: '',
                contactName: '',
                contactPhone: '',
                remark: '',
              },
              modalVisible: false,
            });
            form.resetFields();
            break;
          default:
            this.setState({
              modalVisible: true,
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
            form.resetFields();
            //刷新上级分公司（有可能有变更）
            //分公司管理-上级分公司，全部
            dispatch({
              type: 'basicinfo/fetch1Branch',
              payload: {
                isNeedAll: 1, //1：需要全部字段
              },
            });
            //分公司管理-上级分公司-新增
            dispatch({
              type: 'basicinfo/fetch1BranchAdd',
              payload: {
                isNeedAll: 0,
              },
            });
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
              subsidiaryData: {
                companyName: '',
                sortName: '',
                parentCompanyId: '',
                contactName: '',
                contactPhone: '',
                remark: '',
              },
              modalVisible: false,
            });
            break;
          default:
            this.setState({
              modalVisible: true,
            });
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
      subsidiaryBranchList2,
      subsidiaryBranchList3,
      // subsidiaryInfo,
      // getUserData,
    } = basicinfo;
    const { count, list: tabledata } = subsidiaryList;
    const { subsidiaryData } = this.state;
    // console.log(subsidiaryData);

    //分公司管理-上级分公司，全部
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
    //分公司管理-上级分公司-新增
    const branchOptions2 = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (subsidiaryBranchList2 != undefined && subsidiaryBranchList2.length > 0) {
      subsidiaryBranchList2.forEach(item => {
        branchOptions2.push(
          // <Option key={item.branchId} value={`${item.branchId},${item.branchName}`}>
          <Option key={item.branchId} value={item.branchId}>
            {item.branchName}
          </Option>
        );
      });
    }
    //分公司管理-上级分公司-编辑
    const branchOptions3 = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (subsidiaryBranchList3 != undefined && subsidiaryBranchList3.length > 0) {
      subsidiaryBranchList3.forEach(item => {
        branchOptions3.push(
          // <Option key={item.branchId} value={`${item.branchId},${item.branchName}`}>
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
      current: this.state.current,
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
      branchOptions2,
      branchOptions3,
      subsidiaryData,
      isChange: this.state.isChange,
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
                        initialValue: -1,
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
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
