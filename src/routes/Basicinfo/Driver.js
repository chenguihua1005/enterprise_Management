import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Table,
  Select,
  Button,
  Modal,
  Badge,
  Divider,
  message,
  Popconfirm,
  Upload,
  Icon,
} from 'antd';
import reqwest from 'reqwest';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Basicinfo.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

//批量导入，弹框
const CreateForm2 = Form.create()(props => {
  const {
    importModal,
    form,
    setImportmodal,
    setDownload,
    branchOptions,
    handleAdd2,
    propsUpload,
  } = props;
  const { getFieldDecorator } = form;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd2(fieldsValue);
    });
  };

  return (
    <Modal
      centered
      title="批量导入"
      width={850}
      visible={importModal}
      okText="上传"
      onOk={okHandle}
      onCancel={() => setImportmodal()}
    >
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="*司机信息">
            {getFieldDecorator('excel', {})(
              // (<input type="file" name="excel" />)
              <Upload {...propsUpload}>
                <Button>
                  <Icon type="upload" /> 请选择excel文件导入
                </Button>
              </Upload>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属分公司">
            {getFieldDecorator('belongCompanyId', {
              // initialValue: '0',
            })(
              <Select
                placeholder="请选择"
                // onChange={this.handleBranchList}
                style={{ width: '100%' }}
              >
                {branchOptions}
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        {/* <Col span={3} offset={2}>
          <Upload action="//jsonplaceholder.typicode.com/posts/" directory>
            <Button type="primary" >上传</Button>
          </Upload>
        </Col> */}
        <Col span={2} className={styles.download}>
          <Button type="primary" onClick={() => setDownload()}>
            下载模板
          </Button>
        </Col>
      </Row>
    </Modal>
  );
});

//编辑，弹框
const CreateForm = Form.create()(props => {
  const {
    title,
    modalVisible,
    form,
    handleAdd,
    closeModalVisible,
    branchOptions,
    ValidationOptions,
    driverData,
    isChange,
  } = props;
  const { getFieldDecorator } = form;
  const okHandle = e => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
      // form.resetFields();
    });
  };
  const handleCloseModalVisible = flag => {
    form.resetFields();
    closeModalVisible(flag);
  };
  //验证手机号
  const checkAccount = (rule, value, callback) => {
    //正则用//包起来
    // var regex = /^((\+)?86|((\+)?86)?)0?1[3458]\d{9}$/;
    var regex = /^[1][3-8][0-9]{9}$/;
    var re = new RegExp(regex);
    if (value.length == 11) {
      //react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
      if (re.test(value)) {
        callback();
      } else {
        callback('请输入正确的手机号码！');
      }
    } else {
      callback('请输入11位的手机号码！');
    }
  };
  let tempBranchOptions = branchOptions;
  const tempKey = driverData.belongCompanyId+'';
  tempBranchOptions.forEach(option => {
    if (option.key === tempKey){
      if (tempKey !== 'undefined') {
        tempBranchOptions.push(
          <Option
            key={driverData.belongCompanyId}
            value={driverData.belongCompanyId}
          >
            暂无数据
          </Option>
        );
      }
    }
  });
  

  //编辑需要请求数据渲染
  return (
    <Modal
      title={title}
      width={850}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCloseModalVisible(false)}
    >
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号">
            {getFieldDecorator('employeeMobile', {
              initialValue: driverData.employeeMobile,
              rules: [
                { type: 'string', required: true, message: '请输入手机号码!' },
                {
                  //这里input内的输入内容进行绑定函数即可，在Input里面无需进行函数绑定开使用验证（红色部分）
                  validator: checkAccount,
                },
              ],
            })(<Input placeholder="请输入" disabled={isChange} />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="*姓名">
            {getFieldDecorator('employeeName', {
              basicinfo: [{ required: true, message: '请输入姓名' }],
              initialValue: driverData.employeeName,
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属分公司">
            {getFieldDecorator('companyId', {
              basicinfo: [{ required: true, message: 'Please input some description...' }],
              initialValue: driverData.belongCompanyId
              ,
            })(
              <Select
              id="sel"
                placeholder="请选择"
                // onChange={this.handleBranchList}
                style={{ width: '100%' }}
              >
                {tempBranchOptions}
              </Select>
            )}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="是否有效">
            {getFieldDecorator('status', {
              basicinfo: [{ required: true, message: '' }],
              initialValue: driverData.status + '',
            })(
              <Select
                placeholder="请选择"
                // onChange={this.handleValidList}
                style={{ width: '100%' }}
              >
                <Option key="1" value="1">
                  是
                </Option>
                <Option key="0" value="0">
                  否
                </Option>
              </Select>
            )}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="备注">
            {getFieldDecorator('remark', {
              basicinfo: [{ required: true, message: 'Please input some description...' }],
              initialValue: driverData.remark,
            })(<TextArea placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
    </Modal>
  );
});

@connect(({ basicinfo, loading }) => ({
  basicinfo,
  loading: loading.effects['basicinfo/fetch2','basicinfo/subsidiaryDownloadTemplet'],
}))
@Form.create()
export default class Driver extends PureComponent {
  state = {
    isChange: false, //默认新增
    driverProps: {
      bindRelationId: '',
      employeeId: '',
      belongCompanyId: '',
      belongCompanyType: '',
    },
    title: '新增',
    selectedRows: [],
    formValues: {},
    modalVisible: false,
    importModal: false,
    //与添加司机请求接口参数保持一致
    driverData: {
      employeeMobile: '',
      employeeName: '',
      companyId: '',
      status: '',
      remark: '',
    },
    //上传
    fileList: [],
  };

  componentWillReceiveProps(nextProps) {
    this.setState({
      driverData: nextProps.basicinfo.driverInfo,
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    //司机管理下拉列表
    dispatch({
      type: 'basicinfo/fetch2',
      payload: {
        member_id: 4,
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });

    //所属分公司下拉框
    dispatch({
      type: 'basicinfo/fetchBranchCompany',
      payload: {
        member_id: 4,
      },
    });
    // dispatch({
    //   type: 'basicinfo/fetchValidation',
    //   payload: {
    //     modelName: 'driver',
    //   },
    // });
  }

  //重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'basicinfo/fetch2',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
  };

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      member_id: 4,
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
    };

    dispatch({
      type: 'basicinfo/fetch2',
      payload: params,
    });
  };
  // close关闭modal
  closeModalVisible = flag => {
    const { dispatch, form } = this.props;
    this.setState({
      modalVisible: flag,
    });
  };
  // 新增司机 编辑司机对话框
  setModalVisible = (flag, record) => {
    const { dispatch, form } = this.props;
    if (record && record.hasOwnProperty('key')) {
      //编辑司机
      this.setState({
        isChange: true,
        driverProps: {
          ...this.driverProps,
          ...record,
        },
        title: '编辑',
        modalVisible: !!flag,
      });
      dispatch({
        type: 'basicinfo/fetchDriverInfo',
        payload: {
          bindRelationId: record.bindRelationId,
          employeeId: record.employeeId,
          belongCompanyId: record.belongCompanyId,
          belongCompanyType: record.belongCompanyType,
        },
      });
    } else {
      //新增司机
      this.setState({
        isChange: false,
        driverData: {
          employeeMobile: '',
          employeeName: '',
          companyId: '',
          status: 1,
          remark: '',
        },
        title: '新增',
        modalVisible: !!flag,
      });
    }
  };

  //添加成功
  handleAdd = fields => {
    const { dispatch, form } = this.props;
    const { isChange, driverProps } = this.state;
    //判段是否选择了选项，是的话id
    if (fields.hasOwnProperty('companyId') == undefined) {
      message.warning('请选择分公司');
      return;
    }
    if (isChange === false) {
      //新增
      const payload = {
        // member_id: 4,
        employeeMobile: fields.employeeMobile,
        employeeName: fields.employeeName,
        companyId: fields.companyId || 0, //不选默认传0
        status: fields.status || 1, //不选默认传1
        remark: fields.remark,
      };
      dispatch({
        type: 'basicinfo/driverAdd',
        payload,
      }).then(() => {
        const { driverAdd } = this.props.basicinfo;
        switch (driverAdd.err) {
          //err=0成功
          case 0:
            message.success(driverAdd.msg);
            //再次刷新下面的列表
            //分公司列表
            dispatch({
              type: 'basicinfo/fetch2',
              payload: {
                // member_id: 4,
                page: 1,
                pageSize: 10,
                isCount: 1,
              },
            });
            this.setState({
              modalVisible: false,
            });
            form.resetFields();
            break;
          default:
            this.state.modalVisible = true;
            this.state.driverData.status = 1;
            message.warning(driverAdd.msg);
        }
      });
    } else {
      //编辑
      console.log(driverProps);
      const params = {
        //默认值
        member_id: 4,
        employeeName: fields.employeeName,
        companyId: fields.companyId || 0, //不选默认传0
        status: fields.status,
        remark: fields.remark,
        bindRelationId: driverProps.bindRelationId,
        employeeId: driverProps.employeeId,
        beforeBelongCompanyId: driverProps.belongCompanyId,
        beforeBelongCompanyType: driverProps.belongCompanyType,
      };
      dispatch({
        type: 'basicinfo/driverUpdate',
        payload: params,
      }).then(() => {
        const { driverUpdate } = this.props.basicinfo;
        switch (driverUpdate.err) {
          //err=0成功
          case 0:
            message.success(driverUpdate.msg);
            //再次刷新下面的列表
            //分公司列表
            dispatch({
              type: 'basicinfo/fetch2',
              payload: {
                member_id: 4,
                page: 1,
                pageSize: 10,
                isCount: 1,
              },
            });
            this.setState({
              modalVisible: false,
            });
            form.resetFields();
            break;
          default:
            this.state.modalVisible = true;
            message.warning(driverUpdate.msg);
        }
      });
    }
  };

  //上传
  handleAdd2 = fields => {
    // const { dispatch } = this.props;
    const { fileList } = this.state;
    const formData = new FormData();
    formData.append('belongCompanyId', fields.belongCompanyId);
    fileList.forEach(file => {
      formData.append('excel', file);
    });
    // formData.append('excel', fields.excel.file);
    // You can use any AJAX library you like
    reqwest({
      // url: '//jsonplaceholder.typicode.com/posts/',
      url: '//test.api-bms.51zhaoyou.com/bms/driver/importDriverInfo',
      method: 'post',
      processData: false,
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('accessToken') || '',
      },
      data: formData,
      success: response => {
        // message.success('upload successfully.');
        message.success(response.msg);
        //部分成功，response.err=15556,response.res.downLoadUrl != "",下载出错提示文件
        if (response.err == 15556 && response.res.downLoadUrl != '') {
          window.open(response.res.downLoadUrl);
        }
        this.setState({
          modalVisible: false,
        });
      },
      error: err => {
        message.error('upload failed.');
        console.log(err);
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
        member_id: 4,
        page: 1,
        pageSize: 10,
        isCount: 1,
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
        employeeMobile: fieldsValue.employeeMobile,
        employeeName: fieldsValue.employeeName,
        companyId: fieldsValue.companyId,
        status: fieldsValue.status,
      };
      //司机管理下拉列表
      dispatch({
        type: 'basicinfo/fetch2',
        payload: values,
      });
    });
  };

  // 批量导入
  setImportmodal = flag => {
    this.setState({
      importModal: !!flag,
    });
    console.log('->setImportmodal');
  };

  // 下载模板
  setDownload = () => {
    console.log('setDownload');
    const { dispatch } = this.props;
    const params = {
      template: 'driver_1.0.0.xlsx',
    };
    //下载模板-司机查询
    dispatch({
      type: 'basicinfo/subsidiaryDownloadTemplet',
      payload: params,
    }).then(() => {
      const { subsidiaryTemplet } = this.props.basicinfo;
      switch (subsidiaryTemplet.err) {
        //err=0成功
        case 0:
          message.success(subsidiaryTemplet.msg);
          window.open(subsidiaryTemplet.res.template);
          break;
        default:
          message.warning(subsidiaryTemplet.msg);
      }
    });
  };

  // 删除
  handleDelete = record => {
    // alert(record);
    // 删除司机
    const { dispatch } = this.props;
    const params = {
      bindRelationId: record.bindRelationId,
      employeeId: record.employeeId,
      belongCompanyId: record.belongCompanyId,
      belongCompanyType: record.belongCompanyType,
    };
    dispatch({
      type: 'basicinfo/driverDel',
      payload: params,
    }).then(() => {
      const { driverDel } = this.props.basicinfo;
      switch (driverDel.err) {
        //err=0成功
        case 0:
          message.success(driverDel.msg);
          //再次刷新下面的列表
          //司机管理下拉列表
          dispatch({
            type: 'basicinfo/fetch2',
            payload: {
              member_id: 4,
              page: 1,
              pageSize: 10,
              isCount: 1,
            },
          });
          break;
        default:
          message.warning(driverDel.msg);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { basicinfo, loading, dispatch } = this.props;
    const { driverList, branchCompany, isValid, driverUpdate } = basicinfo;
    const { count, list: tabledata } = driverList;
    const { modalVisible, title, importModal } = this.state;
    const { driverData } = this.state;

    //所属分公司
    const branchOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (branchCompany != undefined && branchCompany.length > 0) {
      branchCompany.forEach(item => {
        branchOptions.push(
          <Option
            key={item.companyBranchId}
            // value={`${item.companyBranchId},${item.companyBranchName}`}
            value={item.companyBranchId}
          >
            {item.companyBranchName}
          </Option>
        );
      });
    }

    //是否有效
    const ValidationOptions = [];
    // for (let p in isValid) {
    //   // str = str + obj[p]; //这里p为键，obj[p]为值
    //   ValidationOptions.push(
    //     <Option key={p} value={`${p},${isValid[p]}`}>
    //       {p}
    //     </Option>
    //   );
    // }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };

    const propsUpload = {
      action: '//test.api-bms.51zhaoyou.com/bms/driver/importDriverInfo',
      // action: '//jsonplaceholder.typicode.com/posts/',
      onRemove: file => {
        this.setState(({ fileList }) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          return {
            fileList: newFileList,
          };
        });
      },
      beforeUpload: file => {
        this.setState(({ fileList }) => ({
          fileList: [...fileList, file],
        }));
        return false;
      },
      fileList: this.state.fileList,
    };

    const parentMethods = {
      handleAdd: this.handleAdd,
      closeModalVisible: this.closeModalVisible,
      branchOptions,
      ValidationOptions,
      driverData,
      isChange: this.state.isChange,
    };

    const parentMethods2 = {
      handleAdd2: this.handleAdd2,
      setImportmodal: this.setImportmodal,
      setDownload: this.setDownload,
      branchOptions,
      propsUpload,
      // fileList: this.state.fileList,
    };

    // 列表头
    const column = [
      {
        title: '姓名',
        dataIndex: 'employeeName',
      },
      {
        title: '手机号',
        dataIndex: 'employeeMobile',
      },
      {
        title: '所属分公司',
        dataIndex: 'belongCompanyName',
      },
      {
        title: '是否有效',
        dataIndex: 'status',
        render: text =>
          text === 1 ? <Badge status="1" text="是" /> : <Badge status="0" text="否" />,
      },
      {
        title: '操作时间',
        dataIndex: 'operateTime',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Button type="primary" onClick={() => this.setModalVisible(true, record)}>
              编辑
            </Button>
            <Divider type="vertical" />
            <Popconfirm title="确定要删除司机吗?" onConfirm={() => this.handleDelete(record)}>
              <Button type="danger">删除</Button>
            </Popconfirm>
          </Fragment>
        ),
      },
    ];
    return (
      <PageHeaderLayout>
        <div className={styles.tableList}>
          <Card bordered={false}>
            <div className={styles.tableListForm}>
              <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={12} sm={24}>
                    <FormItem label="手机号">
                      {getFieldDecorator('employeeMobile')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                  <Col md={12} sm={24}>
                    <FormItem label="姓名">
                      {getFieldDecorator('employeeName')(<Input placeholder="请输入" />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={12} sm={24}>
                    <FormItem label="所属分公司">
                      {getFieldDecorator('companyId', {
                        // initialValue: '全部',
                        // initialText: '全部',
                      })(
                        <Select
                          placeholder="请选择"
                          showSearch={true}
                          // onChange={this.handleBranchList}
                          style={{ width: '100%' }}
                        >
                          {branchOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={12} sm={24}>
                    <FormItem label="是否有效">
                      {getFieldDecorator('status', {})(
                        <Select
                          placeholder="请选择"
                          showSearch={true}
                          // onChange={this.handleValidList}
                          style={{ width: '100%' }}
                        >
                          {/* {ValidationOptions} */}
                          <Option value="0">全部</Option>
                          <Option value="1">是</Option>
                          <Option value="2">否</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ float: 'right', marginBottom: 24 }}>
                    <Button type="primary" htmlType="submit">
                      <Icon type="search" />查询
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                      重置
                    </Button>
                  </span>
                </div>
              </Form>
            </div>
          </Card>
          <Row style={{ marginTop: 20 }}>
            <Card>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={() => this.setModalVisible(true)}>
                  新增
                </Button>
                <Button type="primary" onClick={() => this.setImportmodal(true)}>
                  <Icon type="upload" />批量导入
                </Button>
              </div>
              <div>
                <Table
                  pagination={paginationProps}
                  loading={loading}
                  columns={column}
                  dataSource={tabledata}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          </Row>
        </div>

        <CreateForm {...parentMethods} modalVisible={modalVisible} />
        <CreateForm2 {...parentMethods2} importModal={importModal} />
      </PageHeaderLayout>
    );
  }
}
