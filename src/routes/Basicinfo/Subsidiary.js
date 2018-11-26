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
import { isTelNumber, isArrayIterable } from '../../utils/utils';

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
      destroyOnClose={true}
      maskClosable={false}
      bodyStyle={{textAlign:'center'}}
    >
      <Row className={styles.modelStyle}>
        <Col span={24}>
          <FormItem labelCol={{ span: 4 }} wrapperCol={{ span: 18 }} label="分公司/车队名称">
            {form.getFieldDecorator('companyName', {
              rules: [{ type: 'string', required: true, message: '请输入分公司/车队名称!' }],
              initialValue: subsidiaryData.companyBranchName,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row className={styles.modelStyle}>
        <Col span={12}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} label="分公司/车队简称">
            {form.getFieldDecorator('sortName', {
              rules: [{ type: 'string', required: true, message: '请输入分公司/车队简称!' }],
              initialValue: subsidiaryData.companyShortname,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} label="所属分公司">
            {form.getFieldDecorator('parentCompanyId', {
              rules: [{ required: true, message: '请选择所属分公司!' }],
              initialValue: subsidiaryData.parentId,
            })(
              <Select 
              placeholder="请选择" 
              showSearch={true} 
              style={{ width: '100%' }} 
              disabled={isChange}>
                {options}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>

      <Row className={styles.modelStyle}>
        <Col span={12}>
          <FormItem labelCol={{ span: 8 }} wrapperCol={{ span: 14 }} label="分公司联系人&nbsp;">
            {form.getFieldDecorator('contactName', {
              rules: [{ type: 'string', required: true, message: '请输入联系人!' }],
              initialValue: subsidiaryData.fullname,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} label="联&nbsp;系&nbsp;电&nbsp;话&nbsp;">
            {form.getFieldDecorator('contactPhone', {
              rules: [{ type: 'string', required: true, message: '请输入联系电话!' },
              {
                validator: isTelNumber,
              },
            ],
              initialValue: subsidiaryData.mobile,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row className={styles.modelStyle}>
        <Col span={24}>
          <FormItem labelCol={{ span: 4}} wrapperCol={{ span: 18}} label="添&nbsp;加&nbsp;备&nbsp;注&nbsp;">
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
    this.userId = 0;
    this.disable = false;
    this.branchId = -1; //待编辑分公司ID
    this.title = '新增分公司',
    this.state = {
      current: 1,
      isChange: false,
      modalVisible: false,
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

    //获取分公司级别
    dispatch({
      type: 'basicinfo/getCompanyLevel',
      payload: {},
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

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    // 表单校验
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const params = {
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
        level: fieldsValue.level,
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
        level: fieldsValue.level,
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
    this.title = '新增分公司';
    this.setState({
      isChange: false,
    });
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
    this.setState({
      isChange: true,
    });
    this.title = '编辑分公司';
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
        branchId: key,
      },
    }).then(() => {
      this.setState({
        subsidiaryData: this.props.basicinfo.subsidiaryInfo,
      });
    });

    this.branchId = key;
    this.setState({
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
      companyLevel
    } = basicinfo;
    const { count, list: tabledata } = subsidiaryList;
    const { subsidiaryData } = this.state;

    //分公司管理-上级分公司，全部
    const branchOptions = [];
    if (isArrayIterable(subsidiaryBranchList)) {
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
    if (isArrayIterable(subsidiaryBranchList2)) {
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
    if (isArrayIterable(subsidiaryBranchList3)) {
      subsidiaryBranchList3.forEach(item => {
        branchOptions3.push(
          // <Option key={item.branchId} value={`${item.branchId},${item.branchName}`}>
          <Option key={item.branchId} value={item.branchId}>
            {item.branchName}
          </Option>
        );
      });
    }

    //  获取分公司级别
    const levelOptions = [];
    if (JSON.stringify(companyLevel) !== '{}') {
      companyLevel.forEach(item => {
        levelOptions.push(
          // <Option key={item.branchId} value={`${item.branchId},${item.branchName}`}>
          <Option key={item.key} value={item.key}>
            {item.value}
          </Option>
        );
      });
    }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: parseInt(count),
      current: this.state.current,
      showTotal: () => `共计 ${count} 条`,
    };
    const { modalVisible } = this.state;

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
        title: '分公司级别',
        dataIndex: 'level',
        render: text =>
          text === 1 ? <Badge status="1" text="一级" /> : <Badge status="2" text="二级" />,
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
          <Icon 
          type="form" 
          theme="outlined" 
          title="编辑" 
          onClick={() => this.handleEdit(true, record.key)}
          style={{ color:'#1890ff',fontSize:'16'}}/>
        ),
      },
    ];

    const parentMethods = {
      handleAdd: this.handleAdd,
      closeModalVisible: this.closeModalVisible,
      title: this.title,
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
                  <Col md={8} sm={24}>
                    <FormItem label="分公司名称">
                      {getFieldDecorator('companyName')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="简称">
                      {getFieldDecorator('sortName')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="上级分公司">
                      {getFieldDecorator('parentCompanyId', {
                        initialValue: '全部',
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          {branchOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={12} sm={24}>
                    <FormItem label="分公司级别">
                      {getFieldDecorator('level', {
                        initialValue: '全部',
                      })(
                        <Select placeholder="请选择" style={{ width: '60%' }}>
                          {levelOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={12} sm={24}>
                    <div style={{ float: 'right' }}>
                      <Button type="primary" htmlType="submit">
                        <Icon type="search" />查询
                      </Button>
                      <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                      <Icon type="sync" />重置
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Form>
            </div>
          </Card>
          <Row style={{ marginTop: 15 }}>
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
