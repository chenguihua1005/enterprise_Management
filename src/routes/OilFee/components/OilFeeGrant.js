import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  Select,
  Button,
  InputNumber,
  Modal,
  message,
  Switch,
  Icon,
  Row,
  Col,
  Checkbox,
  Card,
  Table,
  Popconfirm,
} from 'antd';
const FormItem = Form.Item;
const { Option } = Select;
const Search = Input.Search;

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetchProvideDriver'],
}))
@Form.create()
export default class OilFeeGrantComponent extends PureComponent {
  constructor(props) {
    super(props);

    this.allMotorcade = []; // 所有的车队
    this.allDrivers = []; // 所有的司机
    this.checkedMotocardId = []; // 已选车队
    this.checkedDriversId = []; // 已选司机
    this.allCheckboxes = []; //已选列表
    this.state = {
      isAverage: false, // 是否平均发放
      averageCount: '',
      grantForm: {},
      isDriver: '2', // 司机 or 分公司
      checkboxModalVisible: false, // 选择弹窗的显示隐藏
      checkedAll: false, // 车队、分公司选中
      indeterminate: false, // 全不选 - 全选中间状态
      willRenderTableData: [], // 选中要发放的车队
      allCheckboxesItems: [],
      allCheckboxes: [],
      checkedMotocardId: [], // 已选车队
      checkedDriversId: [], // 已选司机
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    //获取公司
    dispatch({
      type: 'oilfee/fetchProvideCompany',
      payload: {
        member_id: 26,
        page: 1,
        pageSize: 10,
        isAll: 1,
      },
    });
    //获取司机
    dispatch({
      type: 'oilfee/fetchProvideDriver',
      payload: {
        member_id: 26,
        page: 1,
        pageSize: 10,
        isAll: 1,
      },
    });
  }

  // 提交表单的操作
  handleSubmit = e => {
    e.preventDefault();
    const data = this.state.willRenderTableData;
    let objList = [];
    if (this.state.isAverage) {
      for (let item of data) {
        console.log(item);
        objList.push({
          no: item.id,
          obj: item.id,
          amount: this.state.averageCount,
        });
      }
    } else {
      for (let item of data) {
        console.log(item);
        objList.push({
          no: item.id,
          obj: item.id,
          amount: item.average,
        });
      }
    }

    console.log('willRenderTableData =' + objList);
    for (let item of objList) {
      console.log(item);
    }
    //等额发放
    const { dispatch, form } = this.props;
    const grantType = form.getFieldValue('grantType');
    //发放油费
    dispatch({
      type: 'oilfee/fetchProvideDistribute',
      payload: {
        member_id: 26,
        grantType,
        data: objList,
      },
    }).then(() => {
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
          //总账户详情
          dispatch({
            type: 'oilfee/fetch1',
            payload: { member_id: 26 },
          });
          break;
        default:
          message.warning(provideDistribute.msg);
      }
    });
  };

  // 回调
  onSwitchChange = () => {
    this.setState({
      isAverage: !this.state.isAverage,
    });
  };
  // 点击选择后出现的弹窗
  toggleCheckboxModal = status => {
    this.setState({
      checkboxModalVisible: status,
      //弹窗的item依次放进allCheckboxesItems
      allCheckboxesItems: this.allCheckboxes.map(k => {
        return (
          <Col span={12} style={{ marginBottom: 12 }} key={k.id}>
            <Checkbox value={k.id}>
              {k.name} - {k.charge}
            </Checkbox>
          </Col>
        );
      }),
    });
  };
  // 选择划拨对象后 页面展示
  handleSelectChange = value => {
    this.allCheckboxes = value == '2' ? this.allDrivers : this.allMotorcade;
    this.setState({
      isDriver: value,
      willRenderTableData: [],
      indeterminate: false,
      checkedAll: false,
      checkedMotocardId: [],
      checkedDriversId: [],
      allCheckboxes: value == '2' ? this.allDrivers : this.allMotorcade,
    });
    console.log(this.checkedDriversId, this.checkedMotocardId);
  };
  // 单个选择
  selectedChange = checkedList => {
    console.log(99);
    console.log(checkedList, 'danxuan');
    // this.checkedMotocardId = checkedList;
    // this.checkedDriversId = checkedList;
    this.setState({
      indeterminate: !!checkedList.length && checkedList.length < this.allCheckboxes.length,
      checkedAll: checkedList.length === this.state.allCheckboxes.length,
      checkedMotocardId: checkedList,
      checkedDriversId: checkedList,
    });
  };
  // 全选 取消全选
  onCheckedAll = e => {
    const list = e.target.checked ? this.state.allCheckboxes.map(k => k.id) : [];
    console.log(list);
    this.setState({
      indeterminate: false,
      checkedAll: e.target.checked,
      checkedMotocardId: list,
      checkedDriversId: list,
    });
  };
  // 选择之后的添加操作
  handleAddMotorcade = () => {
    const selectedIds =
      this.state.isDriver == '2' ? this.state.checkedDriversId : this.state.checkedMotocardId;
    this.setState({
      willRenderTableData: this.state.allCheckboxes.filter(k => selectedIds.includes(k.id)),
    });
    this.toggleCheckboxModal(false);
  };

  // 司机/分公司弹框的搜索框
  handleSearch = value => {
    console.log('value = ' + value);
    let allCheckboxes = [];
    const isDriver = this.state.isDriver == '2';
    let checkedAll = false;

    if (isDriver) {
      // 司机
      allCheckboxes = this.allDrivers.filter(item => item.mobile.indexOf(value) > -1);
    } else {
      // 分公司
      allCheckboxes = this.allMotorcade.filter(item => item.name.indexOf(value) > -1);
    }
    const newIds = allCheckboxes.map(item => item.id);
    const checkedDriversId = newIds.filter(i => this.state.checkedDriversId.includes(i));
    const checkedMotocardId = newIds.filter(i => this.state.checkedDriversId.includes(i));
    if (isDriver) {
      // 司机
      checkedAll = allCheckboxes.length === checkedDriversId.length;
    } else {
      // 分公司
      checkedAll = allCheckboxes.length === checkedMotocardId.length;
    }
    // 搜索内容为空
    if (allCheckboxes.length === 0) {
      checkedAll = false;
    }
    console.log(newIds, checkedDriversId, allCheckboxes);
    this.setState({
      allCheckboxes,
      checkedDriversId,
      checkedMotocardId,
      indeterminate: isDriver ? checkedDriversId.length > 0 : checkedMotocardId.length > 0,
      checkedAll,
    });
    console.log('this.allCheckboxes = ' + allCheckboxes);
  };

  // 选择车队、分公司 modal
  renderMotorcadeComponent = () => {
    return (
      <Modal
        title={this.state.isDriver == '2' ? '选择司机' : '选择分公司/车队'}
        width={850}
        style={{ maxHeight: 600, overflowY: 'scroll' }}
        visible={this.state.checkboxModalVisible}
        onCancel={() => this.toggleCheckboxModal(false)}
        onOk={this.handleAddMotorcade}
      >
        <div style={{ borderBottom: '1px solid #E9E9E9', marginBottom: 20, paddingBottom: 20 }}>
          <Row>
            <Col span={12} offset={4}>
              <Search
                placeholder={this.state.isDriver == '2' ? '司机手机号' : '分公司名称'}
                enterButton="查询"
                size="default"
                onSearch={this.handleSearch}
              />
            </Col>
            <Col span={8} style={{ textAlign: 'right' }}>
              <Checkbox
                indeterminate={this.state.indeterminate}
                onChange={this.onCheckedAll}
                checked={this.state.checkedAll}
              >
                全选
              </Checkbox>
            </Col>
          </Row>
        </div>
        <Checkbox.Group
          style={{ width: '100%' }}
          value={
            this.state.isDriver == '2' ? this.state.checkedDriversId : this.state.checkedMotocardId
          }
          onChange={this.selectedChange}
        >
          <Row>
            {this.state.allCheckboxes.map(k => {
              return (
                <Col span={12} style={{ marginBottom: 12 }} key={k.id}>
                  <Checkbox value={k.id}>
                    {k.name} - {k.charge}
                  </Checkbox>
                </Col>
              );
            })}
          </Row>
        </Checkbox.Group>
      </Modal>
    );
  };
  // 车队、分公司 删除某一项
  handleDelete = row => {
    const willRenderTableData = [...this.state.willRenderTableData];
    const checkedMotocardId = [...this.state.checkedMotocardId];
    const checkedDriversId = [...this.state.checkedDriversId];

    const isDriver = this.state.isDriver == '2';
    this.setState({
      willRenderTableData: willRenderTableData.filter(item => item.key != row.key),
      checkedMotocardId: checkedMotocardId.filter(item => item != row.id),
      checkedDriversId: checkedDriversId.filter(item => item != row.id),
    });
    setTimeout(() => {
      this.setState({
        indeterminate: isDriver
          ? this.state.checkedDriversId && this.state.checkedDriversId.length > 0
          : this.state.checkedMotocardId && this.state.checkedMotocardId.length > 0,
      });
    }, 0);
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
    const { oilfee } = this.props;
    const { form, modalVisible, handleModalVisible } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { provideCompany, provideDriver } = oilfee;

    if (provideCompany != undefined && provideCompany.length > 0) {
      //所有的分公司
      this.allMotorcade = [];
      provideCompany.forEach(item => {
        this.allMotorcade.push({
          id: item.companyBranchId,
          name: item.companyBranchName,
          charge: `可用余额： ${item.balance}`,
          key: item.key,
        });
      });
    }
    if (provideDriver != undefined && provideDriver.length > 0) {
      //所有的司机
      this.allDrivers = [];
      provideDriver.forEach(item => {
        this.allDrivers.push({
          id: item.employeeId,
          name: `${item.employeeName} ${item.employeeMobile}`,
          charge: `可用余额： ${item.balance}`,
          key: item.key,
          mobile: item.employeeMobile,
        });
      });
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
                defaultChecked={this.state.isAverage}
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
                <Table dataSource={this.state.willRenderTableData} columns={motorcadeColumns} />
              </Col>
            </Row>
          ) : null}

          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
            {/* <Button style={{ marginLeft: 8 }}>重置</Button> */}
          </FormItem>
        </Form>
        {this.renderMotorcadeComponent()}
      </div>
    );
  }
}
