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
  Table,
  Badge,
  Divider,
  Icon,
  message
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './Basicinfo.less';
import { getTimeDistance } from '../../utils/utils';
import props from './../../layouts/BlankLayout';

const FormItem = Form.Item;
const Option = Select.Option;
const confirm = Modal.confirm;
const { TextArea } = Input;

// 新增/编辑
const CreateForm = Form.create()(props => {
  const {
    modalVisible,
    form,
    handleAdd,
    closeModalVisible,
    branchOptions,
    userData,
    disable,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // form.resetFields();
      handleAdd(fieldsValue);
    });
  };

  const handleCloseModalVisible = (flag) => {
     form.resetFields();
     closeModalVisible(flag);
   };
   //验证手机号
   const checkAccount = (rule, value, callback) => {
    //与表单数据进行关联
    //正则用//包起来
    var regex = /^[1][3-8][0-9]{9}$/;
    var re = new RegExp(regex);
    if (value.length == 11) {
      //react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
      if (re.test(value)) {
        callback()
      } else {
        callback('请输入正确的手机号码！');
      }
    } else {
      callback('请输入11位的手机号码！');
    }
  }
  const compareToFirstPassword = (rule, value, callback) => {
    if (value && value !== form.getFieldValue('password')) {
      callback('请输入正确的密码');
    } else {
      callback();
    }
  }
  return (
    <Modal
      title={this.title}
      width={850}
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleCloseModalVisible(false)}
    >
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
            {form.getFieldDecorator('userName', {
              initialValue:userData.userName,

              rules: [
                { type: 'string', required: true, message: '请输入用户名!'},
              ]
            })(<Input placeholder="请输入" disabled={disable}/>)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="姓名">
            {form.getFieldDecorator('realName', {
              rules: [
                { type: 'string', required: true, message: '请输入姓名!'},
              ],
              initialValue:userData.realName
            })(<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号">
            {form.getFieldDecorator('mobilePhone',{
              initialValue:userData.mobilePhone,
              rules: [
                { type: 'string', required: true, message: '请输入手机号!'},
                {
                  //这里input内的输入内容进行绑定函数即可，在Input里面无需进行函数绑定开使用验证（红色部分）
                  validator: checkAccount,
                }
              ],
              })
            (<Input placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="所属分公司">
            {form.getFieldDecorator('branchId', {
              basicinfo: [{ required: true, message: '请选择分公司' }],
              initialValue:userData.parentBranchId
            })(
              <Select
              placeholder="请选择"
              // onChange={this.handleBranchList}
              style={{ width: '100%' }}
            >
              {branchOptions}
            </Select>)
          }
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
            {form.getFieldDecorator('password', {
              // basicinfo: [{ required: true, message: '请输入密码' }],
              initialValue:userData.password,
              rules: [
                { type: 'string', required: true, message: '请输入密码!'}
              ]
            })(<Input type="password" placeholder="请输入" />)}
          </FormItem>
        </Col>
        <Col span={12}>
          <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码确认">
            {form.getFieldDecorator('repeatPassword', {
              // basicinfo: [{ required: true, message: '请输入正确的密码' }],
              initialValue:userData.repeatPassword,
              rules: [
                {
                  validator:compareToFirstPassword
                },
                {
                   required: true, message: '请输入正确的密码' 
                }
              ]
            })(<Input type="password" placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <FormItem labelCol={{ span: 2 }} wrapperCol={{ span: 20 }} label="备注">
            {form.getFieldDecorator('remark', {
              basicinfo: [{ required: true, message: 'Please input some description...' }],
              initialValue:userData.remark
            })(<TextArea placeholder="请输入" />)}
          </FormItem>
        </Col>
      </Row>
    </Modal>
  );
});

@connect(({ basicinfo, loading }) => ({
  basicinfo,
  loading: loading.effects['basicinfo/fetch3'],
}))
@Form.create()
export default class Driver extends PureComponent {
  constructor(props) {
    super(props); // 调用积累所有的初始化方法
    this.isChange = false;
    this.userId = 0;
    this.memberIds = '';
    this.selectedRows = [],
    this.title = '新增'
    this.disable = false;
    this.state = {
      memberIds: '',
      modalVisible: false,
      disable: false,
      userData:{
        "userName":'',
        "mobilePhone":'',
        "realName":'',
        "password":'',
        "repeatPassword":'',
        'remark':'',
        'branchId':'全部',
        'parentBranchId': 0
      }
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      userData : nextProps.basicinfo.userInfo,
    });
}

  componentDidMount() {
    const { dispatch } = this.props;
    // 列表
    dispatch({
      type: 'basicinfo/fetch3',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
    // 所属分公司
    dispatch({
      type: 'basicinfo/fetchBranchCompany',
      payload: {
      },
    });
  }
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;

    const params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
    };

    dispatch({
      type: 'basicinfo/fetch3',
      payload: params,
    });
  };
  // 模糊查询
  handleSearch = e => {
    e.preventDefault();
    const {dispatch,form } = this.props;
    form.validateFields((err, fieldsValue) => {
        if (err) return;
        for (const prop in fieldsValue){
          if(fieldsValue[prop]===""||fieldsValue[prop]==="全部"||fieldsValue[prop]===undefined){
            delete fieldsValue[prop];
          }
          if(Array.isArray(fieldsValue[prop])){
            if(fieldsValue[prop].join(",")==="全部"){
              delete fieldsValue[prop];
            }
          }
        }
        const params={//默认值
          username: fieldsValue.username,
          mobilePhone: fieldsValue.mobile,
          realName: fieldsValue.truename,
          branchId: fieldsValue.branchId,
          status: fieldsValue.status,
          page: 1,
          pageSize: 10,
          isCount: 1,
        };
        dispatch({
          type: 'basicinfo/fetch3',
          payload: params,
        });
      });

  };
  //重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
      rangePickerValue: getTimeDistance('month'),
    });
    // const startTime = startValue.format('YYYY-MM-DD');
    // const endTime = endValue.format('YYYY-MM-DD');

    dispatch({
      type: 'basicinfo/fetch3',
      payload: {
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
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
  setModalVisible = flag => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.isChange = false;
    this.title = '新增',
    this.state.userData = {
      "userName":'',
      "mobilePhone":'',
      "realName":'',
      "password":'',
      "repeatPassword":'',
      'remark':'',
      'branchId':'',
      'parentBranchId':0
    };
  
    this.setState({
      modalVisible: !!flag,
      disable: false,
    });
    
  };

  // 添加成功
  handleAdd = fields => {
    const { dispatch,form} = this.props;
    if (this.isChange === false) {
      dispatch({
        type: 'basicinfo/addUser',
        payload: {
          mobilePhone: fields.mobilePhone,
          realName: fields.realName,
          username: fields.userName,
          branchId: fields.branchId,
          password: fields.password,
          repeatPassword: fields.repeatPassword,
          remark: fields.remark,
        },
      }).then(() => {
        const { addUser } = this.props.basicinfo;
        switch (addUser.err) {
          //err=0成功
          case 0:
            message.success(addUser.msg);
            dispatch({
              type: 'basicinfo/fetch3',
              payload: {
                page: 1,
                pageSize: 10,
                isCount: 1,
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
            message.warning(addUser.msg);
            
        }
      });
    } else {
      // fields.memberId = 43;
      dispatch({
        type: 'basicinfo/updateUser',
        payload: {
          mobilePhone: fields.mobilePhone,
          realName: fields.realName,
          username: fields.userName,
          branchId: fields.branchId,
          password: fields.password,
          repeatPassword: fields.repeatPassword,
          remark: fields.remark,
          userId: this.userId,
        },
      }).then(() => {
        const { updateUser } = this.props.basicinfo;
        switch (updateUser.err) {
          //err=0成功
          case 0:
            message.success(updateUser.msg);
            dispatch({
              type: 'basicinfo/fetch3',
              payload: {
                page: 1,
                pageSize: 10,
                isCount: 1,
              },
            });
            this.setState({
              modalVisible:false
            })
            form.resetFields();
            break;
          default:
          this.setState({
            modalVisible:true
          })
            message.warning(updateUser.msg);
        }
      });
    }
    // form.resetFields();
    // this.setState({
    //   modalVisible: false,
    // });
  };
  //编辑
  handleEdit = (flag,key) => {
    const { dispatch } = this.props;
    this.isChange = true;
    this.title = '编辑',
    dispatch({
      type: 'basicinfo/userInfo',
      payload: {
        memberId: key,
      },
    });
    this.userId = key;
    this.setState({
      modalVisible: !!flag,
      disable: true,
    });
  };

  // 启用/停用
  enable = (value) => {
    const { dispatch } = this.props;
    // if (value.isLive == 1) {
    //   this.setState({ actionType: 2 })
    // } else {
    //   this.setState({ actionType: 1 })
    // }
    const params = {
      memberId: value.memberId,
      actionType: value.isLive == 1 ? 2 : 1
    };

    dispatch({
      type: 'basicinfo/closeUser',
      payload: params,
    });
  }

 // 重置密码
  showConfirm = () => {
    const { dispatch } = this.props;
    const { memberIds } =  this.state;
    if (this.selectedRows.length > 0) {
      confirm({
        title: '确定要重置用户密码吗?',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          const params = {
            memberIds: memberIds.join(','),
          };
          dispatch({
            type: 'basicinfo/resetPassword',
            payload: params,
          });
          // this.selectedRows = [];
        },
        onCancel() {},
      });
     
    } else{
      message.error('请选择你需要重置密码的数据!')
    }
  
  }

  renderAdvanceForm() {
    return (
      <Form layout="inline" onSubmit={this.handleSearch}>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名">{<Input placeholder="请输入" />}</FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="手机号码">
              {<Input placeholder="请输入" style={{ width: '100%' }} />}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="姓名">
              {<Input placeholder="请输入" style={{ width: '100%' }} />}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="分公司">
              {
                <Select
                    placeholder="请选择"
                    showSearch={true}
                    style={{ width: '100%' }}
                  >
                  {branchOptions}
                </Select>
              }
            </FormItem>
          </Col>
          {/*<Col md={8} sm={24}>*/}
            {/*<FormItem label="角色">*/}
              {/*{<Input placeholder="请输入" style={{ width: '100%' }} />}*/}
            {/*</FormItem>*/}
          {/*</Col>*/}
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option key="0" value="0">全部</Option>
                  <Option key="1" value="1">停用</Option>
                  <Option key="2" value="2">正常</Option>
                </Select>
              }
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
            <Icon type="search" />查询
            </Button>
            <Button style={{ marginLeft: 8 }}>重置</Button>
          </span>
        </div>
      </Form>
    );
  }
  render() {
    const { basicinfo, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const { accountList, branchCompany, userInfo, addUser } = basicinfo;
    const { count, list: tableData } = accountList;
    const { modalVisible, userData,disable } = this.state;
    // const dataCount = accountList.total;

     //所属分公司
     const branchOptions = [];
    //遍历前要检查是否存在，不然会报错： Cannot read property 'forEach' of undefined
    if (branchCompany != undefined && branchCompany.length > 0) {
      branchCompany.forEach(item => {
        branchOptions.push(
          <Option key={item.companyBranchId} value={item.companyBranchId}>
            {item.companyBranchName}
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
    const parentMethods = {
      handleAdd: this.handleAdd,
      closeModalVisible: this.closeModalVisible,
      branchOptions,
      userData,
      disable,
    };
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          memberIds: selectedRowKeys,
        })
        this.selectedRows = selectedRows;
        this.state.selectedRows = selectedRows;console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        console.log(this.memberIds)
      },
      // getCheckboxProps: record => ({
      //   disabled: record.name === 'Disabled User', // Column configuration not to be checked
      //   name: record.name,
      // }),
    };


    const column = [
      {
        title: '用户名',
        dataIndex: 'username',
      },
      {
        title: '姓名',
        dataIndex: 'realName',
      },
      {
        title: '手机号',
        dataIndex: 'mobilePhone',
      },
      {
        title: '所属分公司',
        dataIndex: 'branchName',
      },
      {
        title: '状态',
        dataIndex: 'isLive',
        render: text =>
          text === 1 ? <Badge status="1" text="启用" /> : <Badge status="2" text="停用" />,
      },
      {
        title: '操作时间',
        dataIndex: 'operateTime',
      },
      {
        title: '操作',
        render: (text, record) => (
          <Fragment>
            <Button type="primary" onClick={() => this.handleEdit(true,record.memberId)}>编辑</Button>
            <Divider type="vertical" />
            <Button type="danger" onClick={() => this.enable(record)}>{record.isLive == 1 ? '停用' : '启用'}</Button>
          </Fragment>
        ),
      },
    ];
    return (
      <PageHeaderLayout>
        <div className={styles.tableList}>
          <Card bordered={false}>
            <div className={styles.tableListForm}>
              <Form layout="inline" onSubmit={this.handleSearch}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="用户名">{getFieldDecorator('username')(<Input placeholder="请输入" />)}</FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="手机号码">
                      {getFieldDecorator('mobile')(<Input placeholder="请输入" style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="姓名">
                      {getFieldDecorator('truename')(<Input placeholder="请输入" style={{ width: '100%' }} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="分公司">
                      {getFieldDecorator('branchId')(
                        <Select
                          placeholder="请选择"
                          showSearch={true}
                          style={{ width: '100%' }}
                        >
                          {branchOptions}
                        </Select>)
                      }
                    </FormItem>
                  </Col>
                  {/*<Col md={8} sm={24}>*/}
                    {/*<FormItem label="角色">*/}
                      {/*{<Input placeholder="请输入" style={{ width: '100%' }} />}*/}
                    {/*</FormItem>*/}
                  {/*</Col>*/}
                  <Col md={8} sm={24}>
                    <FormItem label="状态">
                      {getFieldDecorator('status')(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          <Option key="0" value="0">全部</Option>
                          <Option key="1" value="1">停用</Option>
                          <Option key="2" value="2">正常</Option>
                        </Select>)
                      }
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <Button type="primary" htmlType="submit">
                      <Icon type="search" />查询
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
                  </Col>
                </Row>
                {/*<div style={{ overflow: 'hidden' }}>*/}
                  {/*<span style={{ float: 'right', marginBottom: 24 }}>*/}
                    {/*<Button type="primary" htmlType="submit">*/}
                    {/*<Icon type="search" />查询*/}
                    {/*</Button>*/}
                    {/*<Button style={{ marginLeft: 8 }}>重置</Button>*/}
                  {/*</span>*/}
                {/*</div>*/}
              </Form>

            </div>
          </Card>
          <Row style={{marginTop:20}}>
            <Card>
              <div className={styles.tableListOperator}>
                <Button icon="plus" type="primary" onClick={() => this.setModalVisible(true)}>
                  新增
                </Button>
                <Button type="primary" onClick={this.showConfirm}>
                  重置密码
                </Button>
              </div>
              <div>
                <Table
                  rowSelection={rowSelection}
                  pagination={paginationProps}
                  loading={loading}
                  columns={column}
                  dataSource={tableData}
                  onChange={this.handleStandardTableChange}
                />
              </div>
            </Card>
          </Row>
        </div>
        <CreateForm {...parentMethods} modalVisible={modalVisible} />
      </PageHeaderLayout>
    );
  }
}
