import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  Select,
  Button,
  Modal,
  message,
  Switch,
  Row,
  Col,
  notification,
  Table,
  Popconfirm,
} from 'antd';
import { isNum } from '../../../utils/utils';
const FormItem = Form.Item;
const { Option } = Select;
const Search = Input.Search;

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetchProvideDistribute'],
}))
@Form.create()
export default class OilFeeGrantComponent extends PureComponent {
  constructor(props) {
    super(props);
    this.allMotorcade = []; // 所有的车队
    this.allDrivers = []; // 所有的司机
    this.allCheckboxes = []; //table数据源
    this.selectedRows = []; //新的已选择的的item
    this.state = {
      current: 1,
      pageSize: 10,
      isAverage: false, // 是否平均发放
      averageCount: '',
      isDriver: '2', // 司机 or 分公司
      checkboxModalVisible: false, // 选择弹窗的显示隐藏
      willRenderTableData: [], // 选中要发放的车队
      allCheckboxes: [], //table数据源
      selectedRowKeys: [], // Check here to configure the default column
      searchText: '',
      selectedRowsKeys2: [],
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    //获取公司
    dispatch({
      type: 'oilfee/fetchProvideCompany',
      payload: {
        page: 1,
        pageSize: 10,
        // isAll: 1,
        isCount: 1,
        distribute: 1,
      },
    });
    //获取司机
    dispatch({
      type: 'oilfee/fetchProvideDriver',
      payload: {
        page: 1,
        pageSize: 10,
        // isAll: 1,
        isCount: 1,
        distribute: 1,
      },
    });
  }

  // 提交表单的操作
  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        const data = this.state.willRenderTableData;
        let objList = [];
        if (this.state.isAverage) {
          //等额发放
          if (!isNum(this.state.averageCount)) {
            message.warning('金额必须为数字');
            return;
          } else if (parseFloat(this.state.averageCount) <= 0) {
            message.warning('金额需大于0');
            return;
          } 
          else if (parseFloat(this.state.averageCount) > parseFloat(this.props.oilfee.oilAccountInfoAmount)) {
            message.warning('发放金额必须小于或等于可发放金额！');
            return;
          }
          for (let item of data) {
            objList.push({
              no: item.id,
              obj: item.id,
              amount: this.state.averageCount,
            });
          }
        } else {
          for (let item of data) {
            if (!isNum(item.average)) {
              message.warning('金额必须为数字');
              return;
            } else if (parseFloat(item.average) <= 0) {
              message.warning('金额需大于0');
              return;
            } 
            else if (parseFloat(item.average) > parseFloat(this.props.oilfee.oilAccountInfoAmount)) {
              message.warning('发放金额必须小于或等于可发放金额！');
              return;
            }            
            objList.push({
              no: item.id,
              obj: item.id,
              amount: item.average,
            });
          }
        }
        const grantType = form.getFieldValue('grantType');
        //发放油费
        dispatch({
          type: 'oilfee/fetchProvideDistribute',
          payload: {
            grantType,
            data: objList,
          },
        }).then(() => {
          const { form } = this.props;
          const { provideDistribute } = this.props.oilfee;
          const { activeKey } = this.props;
          switch (provideDistribute.err) {
            //err=0成功
            case 0:
              message.success(provideDistribute.msg);
              activeKey('list');
              //清空发放页面的旧数据
              this.setState({
                willRenderTableData: [],
              });
              //清空选择框旧数据
              this.selectedRows = [];
              //清空发放对象
              //清空等额发放旧数据
              form.resetFields();
              //清空是否等额发放
              this.setState({
                isAverage: false,
              });
              //总账户详情
              dispatch({
                type: 'oilfee/fetch1',
                payload: {  },
              });
              //获取公司
              dispatch({
                type: 'oilfee/fetchProvideCompany',
                payload: {
                  page: 1,
                  pageSize: 10,
                  // isAll: 1,
                  isCount: 1,
                  distribute: 1,
                },
              });
              //获取司机
              dispatch({
                type: 'oilfee/fetchProvideDriver',
                payload: {
                  page: 1,
                  pageSize: 10,
                  // isAll: 1,
                  isCount: 1,
                  distribute: 1,
                },
              });
              this.allCheckboxes = this.state.isDriver == '2' ? this.allDrivers : this.allMotorcade;
              this.setState({
                allCheckboxes: this.allCheckboxes,
              });
              this.setState({
                checkboxModalVisible: !!status,
                selectedRowsKeys2: [],
              });
              break;
            default:
              message.warning(provideDistribute.msg);
          }
        });
      }
    });
  };

  // 回调
  onSwitchChange = () => {
    this.setState({
      isAverage: !this.state.isAverage,
    });
  };

  // 点击弹窗确定或取消按钮后的回调
  toggleCheckboxModal = status => {
    const { form, dispatch } = this.props;
    //清空搜索框数据
    form.resetFields('search');
    //重置搜索前的原始数据
    //获取公司
    dispatch({
      type: 'oilfee/fetchProvideCompany',
      payload: {
        page: 1,
        pageSize: 10,
        // isAll: 1,
        isCount: 1,
        distribute: 1,
      },
    });
    //获取司机
    dispatch({
      type: 'oilfee/fetchProvideDriver',
      payload: {
        page: 1,
        pageSize: 10,
        // isAll: 1,
        isCount: 1,
        distribute: 1,
      },
    });
    this.allCheckboxes = this.state.isDriver == '2' ? this.allDrivers : this.allMotorcade;
    this.setState({
      allCheckboxes: this.allCheckboxes,
    });

    this.setState({
      checkboxModalVisible: !!status,
      selectedRowsKeys2: [],
    });
  };

  // 选择划拨对象后 页面展示
  handleSelectChange = value => {
    this.allCheckboxes = value == '2' ? this.allDrivers : this.allMotorcade;
    this.setState({
      isDriver: value,
      willRenderTableData: [],
      allCheckboxes: this.allCheckboxes,
    });
  };

  // 选择对话框的确定按钮
  handleAddMotorcade = () => {
    let array = Array.from(new Set([...this.state.willRenderTableData, ...this.selectedRows]));
    //去重
    let hash = {};
    array = array.reduce((preVal, curVal) => {
      hash[curVal.key] ? '' : (hash[curVal.key] = true && preVal.push(curVal));
      return preVal;
    }, []);
    this.setState({
      willRenderTableData: array,
      current: 1,
      pageSize: 10,
    });
    this.toggleCheckboxModal(false);
  };

  // 司机/分公司弹框的搜索框
  handleSearch = value => {
    const { dispatch } = this.props;
    this.setState({
      searchText: value,
    });
    const isDriver = this.state.isDriver == '2';
    if (isDriver) {
      //获取司机
      //value,全部数字，则为手机
      let re = /^\d+$/;
      let params;
      if (re.test(value)) {
        params = {
          mobilePhone: value,
        };
      } else {
        params = {
          employeeName: value,
        };
      }

      dispatch({
        type: 'oilfee/fetchProvideDriver',
        payload: {
          page: 1,
          pageSize: 10,
          isAll: 0,
          isCount: 1,
          distribute: 1,
          ...params,
        },
      }).then(() => {
        this.setState({
          allCheckboxes: this.allDrivers,
          current: 1,
          pageSize: 10,
        });
      });
    } else {
      //获取公司
      dispatch({
        type: 'oilfee/fetchProvideCompany',
        payload: {
          page: 1,
          pageSize: 10,
          // isAll: 1,
          isCount: 1,
          branchName: value,
          distribute: 1,
        },
      }).then(() => {
        this.setState({
          allCheckboxes: this.allMotorcade,
          current: 1,
          pageSize: 10,
        });
      });
    }
  };

  //列表变化翻页的回调
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    if (this.state.isDriver == '2') {
      // 司机
      //value,全部数字，则为手机
      let re = /^\d+$/;
      let params;
      if (re.test(this.state.searchText)) {
        params = {
          mobilePhone: this.state.searchText,
        };
      } else {
        params = {
          employeeName: this.state.searchText,
        };
      }
      //获取司机
      dispatch({
        type: 'oilfee/fetchProvideDriver',
        payload: {
          page: pagination.current,
          pageSize: pagination.pageSize,
          // isAll: 1,
          isCount: 1,
          distribute: 1,
          ...params,
        },
      }).then(() => {
        this.setState({
          allCheckboxes: this.allDrivers,
          current: pagination.current,
          pageSize: pagination.pageSize,
        });
      });
    } else {
      //获取公司
      dispatch({
        type: 'oilfee/fetchProvideCompany',
        payload: {
          page: pagination.current,
          pageSize: pagination.pageSize,
          // isAll: 1,
          isCount: 1,
          branchName: this.state.searchText,
          distribute: 1,
        },
      }).then(() => {
        this.setState({
          allCheckboxes: this.allMotorcade,
          current: pagination.current,
          pageSize: pagination.pageSize,
        });
      });
    }
  };

  // 选择车队、分公司 modal
  renderMotorcadeComponent = (provideCompanyCount, provideDriverCount) => {
    const columns = [
      {
        title: this.state.isDriver == '2' ? '司机姓名/手机号' : '分公司名称',
        dataIndex: 'name',
      },
      {
        title: '可用余额',
        dataIndex: 'charge',
      },
    ];
    // rowSelection object indicates the need for row selection
    const rowSelection = {
      selectedRowKeys: this.state.selectedRowsKeys2,
      onChange: (selectedRowKeys, selectedRows) => {
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        let array = Array.from(new Set([...this.selectedRows, ...selectedRows]));
        //去重
        let hash = {};
        array = array.reduce((preVal, curVal) => {
          hash[curVal.key] ? '' : (hash[curVal.key] = true && preVal.push(curVal));
          return preVal;
        }, []);
        this.selectedRows = array.filter(item => selectedRowKeys.includes(item.key));
        //超过某个条数，直接弹出警告，并返回
        if (this.selectedRows.length > 200) {
          notification.open({
            message: '提醒',
            description: '发放数量超过200条，请通过批量导入的方式发放油费！',
          });
          return;
        }
        this.setState({
          selectedRowsKeys2: selectedRowKeys,
        });
      },
      getCheckboxProps: record => ({
        disabled: record.name === 'Disabled User', // Column configuration not to be checked
        name: record.name,
      }),
    };
    let count;
    if (this.state.isDriver == '2') {
      //司机
      count = provideDriverCount;
    } else {
      count = provideCompanyCount;
    }
    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: parseInt(count),
      current: this.state.current,
      pageSize: this.state.pageSize,
      showTotal: () => `共计 ${count} 条`,
    };
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={this.state.isDriver == '2' ? '选择司机' : '选择分公司/车队'}
        width={850}
        // style={{ maxHeight: 400, marginBottom: 30 }}
        visible={this.state.checkboxModalVisible}
        onCancel={() => this.toggleCheckboxModal(false)}
        onOk={this.handleAddMotorcade}
        maskClosable={false}
      >
        <div style={{ borderBottom: '1px solid #E9E9E9', marginBottom: 10, paddingBottom: 10 }}>
          <Row>
            <Col span={12} offset={4}>
              {getFieldDecorator('search', {})(
                <Search
                  placeholder={this.state.isDriver == '2' ? '司机姓名 / 手机号' : '分公司名称'}
                  enterButton="查询"
                  size="default"
                  onSearch={this.handleSearch}
                />
              )}
            </Col>
          </Row>
        </div>
        <Table
          pagination={paginationProps}
          rowSelection={rowSelection}
          columns={columns}
          dataSource={this.state.allCheckboxes}
          onChange={this.handleStandardTableChange}
        />
      </Modal>
    );
  };

  // 车队、分公司 删除某一项
  handleDelete = row => {
    const willRenderTableData = [...this.state.willRenderTableData];
    this.setState({
      willRenderTableData: willRenderTableData.filter(item => item.key != row.key),
    });
  };

  // 均值发生变化
  averageHasChanged = e => {
    const averageCount = e.target.value || '0';
    this.setState({
      averageCount,
    });
    let willRenderTableData = this.state.willRenderTableData;
    willRenderTableData = willRenderTableData.map(k => (k.average = averageCount));
  };

  // 输入单项的发放金额
  changeEvent = (e, record) => {
    console.log(e, record);
    console.log(e.target.value);
    let willRenderTableData = this.state.willRenderTableData;
    for (let item of willRenderTableData) {
      if (item.id == record.id) {
        item.average = e.target.value;
        break;
      }
    }
  };

  render() {
    const { oilfee, loading } = this.props;
    const { form, modalVisible, handleModalVisible } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { provideCompany, provideDriver, provideCompanyCount, provideDriverCount } = oilfee;

    if (provideCompany != undefined && provideCompany.length > 0) {
      //所有的分公司
      this.allMotorcade = [];
      provideCompany.forEach(item => {
        this.allMotorcade.push({
          id: item.companyBranchId,
          name: item.companyBranchName,
          charge: item.balance,
          key: item.key,
        });
      });
    } else {
      this.allMotorcade = [];
    }

    if (provideDriver != undefined && provideDriver.length > 0) {
      //所有的司机
      this.allDrivers = [];
      provideDriver.forEach(item => {
        this.allDrivers.push({
          id: item.employeeId,
          name: `${item.employeeName} ${item.employeeMobile}`,
          charge: item.balance,
          key: item.key,
          mobile: item.employeeMobile,
          employeeName: item.employeeName,
        });
      });
    } else {
      this.allDrivers = [];
    }

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
        md: { span: 10 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 10 },
      },
    };
    const renderTableDataLayout = {
      xs: { span: 24, offset: 0 },
      sm: { span: 15, offset: 5 },
    };

    // console.log(form,'form')
    const motorcadeColumns = [
      {
        title: this.state.isDriver == '2' ? '司机' : '分公司/车队名称',
        dataIndex: 'name',
        key: 'name',
        editable: true,
      },
      {
        title: '账户余额(元)',
        dataIndex: 'charge',
        key: 'charge',
      },
      {
        title: '发放金额(元)',
        dataIndex: 'average',
        key: 'average',
        render: (text, record) => {
          return this.state.isAverage ? (
            <div>{this.state.averageCount}</div>
          ) : (
            <input type="text" onChange={e => this.changeEvent(e, record)} />
          );
        },
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record) => {
          return (
            <Popconfirm title="确定要删除吗?" onConfirm={() => this.handleDelete(record)}>
              <a href="javascript:;">删除</a>
            </Popconfirm>
          );
        },
      },
    ];

    return (
      <div style={{ minHeight: 500 }}>
        <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
          <FormItem {...formItemLayout} label="发放对象">
            {getFieldDecorator('grantType', {
              rules: [{ required: true, message: '请选择发放对象' }],
            })(
              <Select
                placeholder="请选择发放对象"
                style={{ width: '100%' }}
                onChange={this.handleSelectChange}
              >
                <Option value="1">分公司/车队</Option>
                <Option value="2">司机</Option>
              </Select>
            )}
          </FormItem>

          <FormItem {...formItemLayout} label="是否等额发放">
            {getFieldDecorator('client')(
              <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                checked={this.state.isAverage}
                onChange={this.onSwitchChange}
              />
            )}
          </FormItem>
          {this.state.isAverage ? (
            <FormItem {...formItemLayout} label="发放额度">
              {getFieldDecorator('average', {
                rules: [{ required: true, message: '请输入平均发放额度' }],
              })(<Input placeholder="请输入平均发放额度(元)" onChange={this.averageHasChanged} />)}
            </FormItem>
          ) : null}

          {getFieldValue('grantType') ? (
            <FormItem
              {...formItemLayout}
              label={getFieldValue('grantType') == '2' ? '收款司机' : '收款方'}
            >
              <Button onClick={() => this.toggleCheckboxModal(true)}>
                {getFieldValue('grantType') == '2' ? '请选择收款司机' : '请选择收款方'}
              </Button>
            </FormItem>
          ) : null}
          {/* 选中的数据结果 */}
          {this.state.willRenderTableData.length > 0 ? (
            <Row span={24}>
              <Col {...renderTableDataLayout}>
                <Table
                  dataSource={this.state.willRenderTableData}
                  columns={motorcadeColumns}
                  loading={loading}
                />
              </Col>
            </Row>
          ) : null}

          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </FormItem>
        </Form>
        {this.renderMotorcadeComponent(provideCompanyCount, provideDriverCount)}
      </div>
    );
  }
}
