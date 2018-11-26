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
  Badge,
  DatePicker,
  Table,
  Icon,
  message,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './OrderList.less';
import moment from 'moment/moment';
import { isArrayIterable } from '../../utils/utils';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY/MM/DD HH:mm:ss';

const CreateForm = Form.create()(props => {
  const { modalVisible, form, setModalVisible, orderDetails, orderStatus } = props;

  return (
    <Modal
      title="订单详情"
      width={1000}
      visible={modalVisible}
      maskClosable={false}
      onCancel={() => setModalVisible()}
      footer={null}
      bodyStyle={{paddingBottom:55}}
    >
      <Row className={styles.order}>
        <Col span={24}>
          <p>订单编号: {orderDetails.orderNumber}</p>
        </Col>
      </Row>
      <div className={styles.orderDetails}>
        <Row className={styles.orderRow}>
          <Col span={8}>
            <span>服务时间: {orderDetails.createTime}</span>
          </Col>
          <Col span={8}>
            <span>支付时间:{orderDetails.payTime}</span>
          </Col>
          <Col span={8}>
            <span>状态: {orderStatus}</span>
          </Col>
        </Row>
        <div className={styles.p} >
          
            <p>订单明细</p>
          
        </div>
        <Row className={styles.orderRow2}>
          <Col span={8}>
            <span>司机手机号: {orderDetails.driverPhone}</span>
          </Col>
          <Col span={8}>
            <span>车牌号:{orderDetails.carNumber}</span>
          </Col>
          <Col span={8}>
            <span>分公司名称: {orderDetails.branchName}</span>
          </Col>
        </Row>
        <Row className={styles.orderRow2}>
          <Col span={8}>
            <span>支付类型: {orderDetails.payType}</span>
          </Col>
          <Col span={8}>
            <span>油品类型:{orderDetails.productName}</span>
          </Col>
          <Col span={8}>
            <span>找油单价:{orderDetails.unitPrice}元/升</span>
          </Col>
        </Row>
        <Row className={styles.orderRow2}>
          <Col span={8}>
            <span>加油升量: {orderDetails.litres}L</span>
          </Col>
          <Col span={8}>
            <span>订单金额:{orderDetails.orderAmount}元</span>
          </Col>
          <Col span={8}>
            <span>实付金额:{orderDetails.payAmount}元</span>
          </Col>
        </Row>
        <Row className={styles.orderRow3}>
          <Col span={8}>
            <span>加油网点: {orderDetails.skidName}</span>
          </Col>
          <Col span={8}>
            <span>网点地址:{orderDetails.skidRegionName}</span>
          </Col>
        </Row>
      </div>
    </Modal>
  );
});

@connect(({ order, loading }) => ({
  order,
  loading: loading.effects['order/searchOrder'],
}))
@Form.create()
export default class OrderList extends PureComponent {
  constructor(props) {
    super(props); // 调用积累所有的初始化方法
    this.state = {
      selectedRows: [],
      modalVisible: false,
      current: 1,
      rangePickerValue: [],
    };
    this.startTime = '';
    this.endTime = '';
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // const { rangePickerValue } = this.state; //startValue,endValue
    // const [startValue, endValue] = rangePickerValue;
    // const startTime = startValue.format('YYYY-MM-DD');
    // const endTime = endValue.format('YYYY-MM-DD');
    //列表
    dispatch({
      type: 'order/searchOrder',
      payload: {
        page: 1,
        count: 10,
        // time: {start: startTime ,  end: endTime},
      },
    });

    // 网点
    dispatch({
      type: 'order/skidList',
      payload: {},
    });

    // 所属分公司
    dispatch({
      type: 'order/fetchBranchCompany',
      payload: {
        isNeedAll: 1,
      },
    });

    // 城市
    dispatch({
      type: 'order/regionList',
      payload: {
        level: 1,
        parentId: 1,
      },
    });
    // 用油类型
    dispatch({
      type: 'order/fetchGoodsCompany',
      payload: {},
    });
  }

  setModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };
  //订单详情
  orderDetails = row => {
    const { dispatch } = this.props;
    //列表
    dispatch({
      type: 'order/retailOrderDetails',
      payload: {
        orderNumber: row,
      },
    });
    this.setState({
      modalVisible: true,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state;
    if (Object.keys(rangePickerValue).length != 0) {
      const [startValue, endValue] = rangePickerValue;
      this.startTime = startValue.format('YYYY-MM-DD');
      this.endTime = endValue.format('YYYY-MM-DD');
    } else {
      this.startTime = '';
      this.endTime = '';
    }
      
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        for (const prop in fieldsValue) {
          if (
            fieldsValue[prop] === '' ||
            fieldsValue[prop] === '全部' ||
            fieldsValue[prop] === undefined
          ) {
            delete fieldsValue[prop];
          }
        }
        const params = {
          orderSn: fieldsValue.orderSn,
          ossId: fieldsValue.ossId,
          branchId: fieldsValue.branchId,
          payType: fieldsValue.payType,
          proSku: fieldsValue.proSku,
          provinceId: fieldsValue.provinceId,
          cityId: fieldsValue.cityId,
          status: fieldsValue.status,
          likeVal: fieldsValue.likeVal,
          time: [{ start: this.startTime }, { end: this.endTime }],
          page: pagination.current,
          count: pagination.pageSize,
          isCount: 1,
        };

        const values = {
          ...params,
          transactionType: fieldsValue.transactionType,
          direction: fieldsValue.direction,
        }; 
        dispatch({
          type: 'order/searchOrder',
          payload: values,
        }).then( () => {
          this.setState({
            current:pagination.current
          })
        });
      });
  
  };
  // 模糊查询
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state;
    if (Object.keys(rangePickerValue).length != 0) {
      const [startValue, endValue] = rangePickerValue;
      this.startTime = startValue.format('YYYY-MM-DD');
      this.endTime = endValue.format('YYYY-MM-DD');
    } else {
      this.startTime = '';
      this.endTime = '';
    }
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      for (const prop in fieldsValue) {
        if (
          fieldsValue[prop] === '' ||
          fieldsValue[prop] === '全部' ||
          fieldsValue[prop] === undefined
        ) {
          delete fieldsValue[prop];
        }
      }
      const params = {
        orderSn: fieldsValue.orderSn,
        ossId: fieldsValue.ossId,
        branchId: fieldsValue.branchId,
        payType: fieldsValue.payType,
        proSku: fieldsValue.proSku,
        provinceId: fieldsValue.provinceId,
        cityId: fieldsValue.cityId,
        status: fieldsValue.status,
        likeVal: fieldsValue.likeVal,
        time: {start: this.startTime ,  end: this.endTime},
        page: 1,
        count: 10,
      };

      const values = {
        ...params,
        transactionType: fieldsValue.transactionType,
        direction: fieldsValue.direction,
      }; 
      dispatch({
        type: 'order/searchOrder',
        payload: values,
      }).then( () => {
        this.setState({
          current:1
        })
      });
    });
  };
  //日期框设置值
  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };
  //禁用当前日期之后的时间
  disabledDate = current => {
    // console.log(moment().subtract(3,"months"));
    // return current && current < moment().subtract(3,"months");
    return current && current > moment().endOf('day');
  };
  //重置
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
      rangePickerValue: [],
    });
    // const [startValue, endValue] = getTimeDistance('month');
    // const startTime = startValue.format('YYYY-MM-DD');
    // const endTime = endValue.format('YYYY-MM-DD');
    //列表
    dispatch({
      type: 'order/searchOrder',
      payload: {
        page: 1,
        count: 10,
        // time: {start: startTime ,  end: endTime},
      },
    }).then( () => {
      this.setState({
        current:1
      })
    });
  };

  //导出
  handleExport = () => {
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state;
    if (Object.keys(rangePickerValue).length != 0) {
      const [startValue, endValue] = rangePickerValue;
      this.startTime = startValue.format('YYYY-MM-DD');
      this.endTime = endValue.format('YYYY-MM-DD');
    } else {
      this.startTime = '';
      this.endTime = '';
    }
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      for (const prop in fieldsValue) {
        if (
          fieldsValue[prop] === '' ||
          fieldsValue[prop] === '全部' ||
          fieldsValue[prop] === undefined
        ) {
          delete fieldsValue[prop];
        }
      }
      const params = {
        orderSn: fieldsValue.orderSn,
        ossId: fieldsValue.ossId,
        branchId: fieldsValue.branchId,
        payType: fieldsValue.payType,
        proSku: fieldsValue.proSku,
        provinceId: fieldsValue.provinceId,
        cityId: fieldsValue.cityId,
        status: fieldsValue.status,
        likeVal: fieldsValue.likeVal,
        time: [{ start: this.startTime }, { end: this.endTime }],
        page: 1,
        count: 10,
        actionType: 1,
      };

      const values = {
        ...params,
        transactionType: fieldsValue.transactionType,
        direction: fieldsValue.direction,
      };
      dispatch({
        type: 'order/searchOrderExport',
        payload: values,
      }).then(() => {
        const { exportList } = this.props.order;
        switch (exportList.err) {
          //err=0成功
          case 0:
            message.success(exportList.msg);
            window.open(exportList.res.path);
            break;
          default:
            message.warning(exportList.msg);
        }
      });
    });
  };

  //城市联动
  handleProvinceChange = value => {
    const { dispatch } = this.props;
    dispatch({
      type: 'order/regionList2',
      payload: {
        level: 2,
        parentId: Number(value),
      },
    });
  };
  // 订单状态
  getOrderDetails = value => {
    if (value === '待支付' || value === '支付中' || value === '支付失败') {
      return '待付款';
    } else if (
      value === '退款申请提交' ||
      value === '退款审核通过' ||
      value === '退款中' ||
      value === '退款审核失败' ||
      value === '退款失败'
    ) {
      return '退款中';
    } else if (value === '成功订单') {
      return '已付款';
    } else if (value === '退款成功') {
      return '已退款';
    } else {
      return '已取消';
    }
  };

  render() {
    const { order, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const {
      orderList,
      skidList,
      branchCompany,
      GoodsCompany,
      regionCompany,
      cityCompany,
      orderDetails,
    } = order;
    const { total, list: tableData } = orderList;
    const { rangePickerValue, modalVisible } = this.state;
    const orderStatus = this.getOrderDetails(orderDetails.orderStatus);
    //网点
    const SkidOptions = [];
    if (isArrayIterable(skidList)) {
      skidList.forEach(item => {
        SkidOptions.push(
          <Option key={item.key} value={`${item.key}`}>
            {item.ossName}
          </Option>
        );
      });
    }

    //所属分公司
    const branchOptions = [];
    if (isArrayIterable(branchCompany)) {
      branchCompany.forEach(item => {
        branchOptions.push(
          <Option key={item.key} value={`${item.key}`}>
            {item.companyBranchName}
          </Option>
        );
      });
    }

    // 用油类型
    const goodOptions = [];
    if (isArrayIterable(GoodsCompany)) {
      GoodsCompany.forEach(item => {
        goodOptions.push(
          <Option key={item.key} value={`${item.key}`}>
            {item.name}
          </Option>
        );
      });
    }
    // 城市
    const regionOptions = [];
    if (isArrayIterable(regionCompany)) {
      regionCompany.forEach(item => {
        regionOptions.push(
          <Option key={item.key} value={`${item.key}`}>
            {item.regionName}
          </Option>
        );
      });
    }
    // 地区
    const cityOptions = [];
    if (isArrayIterable(cityCompany)) {
      cityCompany.forEach(item => {
        cityOptions.push(
          <Option key={item.key} value={`${item.key}`}>
            {item.regionName}
          </Option>
        );
      });
    }

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: parseInt(total),
      current: this.state.current,
      showTotal: () => `共计 ${total} 条`,
    };

    const parentMethods = {
      setModalVisible: this.setModalVisible,
      SkidOptions,
      branchOptions,
      goodOptions,
      regionOptions,
      cityOptions,
      orderDetails,
      orderStatus,
    };

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
    };

    const column = [
      {
        title: '订单编号',
        dataIndex: 'orderSn',
      },
      {
        title: '司机手机号',
        dataIndex: 'employeeMobile',
      },
      {
        title: '分公司名称',
        dataIndex: 'branchName',
      },
      {
        title: '加油地点',
        dataIndex: 'region',
      },
      {
        title: '用油类型',
        dataIndex: 'productName',
      },
      {
        title: '加油升量',
        dataIndex: 'skuLitre',
      },
      {
        title: '单价(元/升)',
        dataIndex: 'price',
      },
      {
        title: '订单金额(元)',
        dataIndex: 'amount',
      },
      {
        title: '服务时间',
        dataIndex: 'createTime',
      },
      {
        title: '状态',
        dataIndex: 'statusVal',
        // render: status => this.getBillStatus(status)
        //   // text === 1 ? <Badge status="1" text="待付款" /> : <Badge payStatus="2" text="已付款" />,
      },
      {
        title: '操作',
        fixed: 'right',
        render: record => (
          <Icon type="exception" style={{ color:'#1890ff',fontSize:'16'}} title="查看详情" onClick={() => this.orderDetails(record.orderSn)}/>
        ),
      },
    ];
    return (
      <PageHeaderLayout>
        <div className={styles.tableList}>
          <Card bordered={false} style={{marginTop:18}}>
            <div className={styles.tableListForm}>
              <Form layout="inline" onSubmit={this.handleSearch}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="加油网点">
                      {getFieldDecorator('ossId',{
                        initialText: '全部',
                        initialValue: '全部',
                      })(
                        <Select
                          showSearch
                          allowClear
                          placeholder="加油网点"
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {SkidOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="分&nbsp;公&nbsp;司&nbsp;">
                      {getFieldDecorator('branchId',{
                        initialText: '全部',
                        initialValue: '全部',
                      })(
                        <Select
                          showSearch
                          allowClear
                          placeholder="分公司名称"
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {branchOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="支付类型">
                      {getFieldDecorator('payType',{
                        initialText: '全部',
                        initialValue: '全部',
                      })(
                        <Select allowClear placeholder="支付类型">
                          <Option value="0">全部</Option>
                          <Option value="1">余额</Option>
                          <Option value="21">授信</Option>
                          <Option value="31">微信</Option>
                          <Option value="32">支付宝</Option>
                          <Option value="33">银行卡</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="用油类型">
                      {getFieldDecorator('proSku',{
                        initialText: '全部',
                        initialValue: '全部',
                      })(
                        <Select allowClear placeholder="用油类型" style={{ width: '100%' }}>
                          {goodOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="加油城市">
                      {getFieldDecorator('provinceId',{
                        initialText: '全部',
                        initialValue: '全部',
                      })(
                        <Select
                          allowClear
                          placeholder="城市"
                          style={{ width: '100%' }}
                          onChange={this.handleProvinceChange}
                        >
                          {regionOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="加油地区">
                      {getFieldDecorator('cityId')(
                        <Select
                          allowClear
                          placeholder="地区"
                          style={{ width: '100%' }}
                          onChange={this.onSecondCityChange}
                        >
                          {cityOptions}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={8} sm={24}>
                    <FormItem label="加油状态">
                      {getFieldDecorator('status',{
                        initialText: '全部',
                        initialValue: '全部',
                      })(
                        <Select allowClear placeholder="请选择状态" style={{ width: '100%' }}>
                          <Option value="">全部</Option>
                          <Option value="1">待付款</Option>
                          <Option value="3">已付款</Option>
                          <Option value="5">退款中</Option>
                          <Option value="8">已退款</Option>
                          <Option value="0">已取消</Option>
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="加油时间">
                    {getFieldDecorator('time')(
                      <RangePicker
                        // allowClear
                        // showTime
                        // value={rangePickerValue}
                        // disabledDate={this.disabledDate}
                        onChange={this.handleRangePickerChange}
                        style={{ width: '100%' }}
                      />)}
                    </FormItem>
                  </Col>
                  <Col md={8} sm={24}>
                    <FormItem label="关&nbsp;键&nbsp;词&nbsp;">
                      {getFieldDecorator('likeVal')(
                        <Input placeholder="请输入订单编号/手机号/车牌号" />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ float: 'right'}}>
                    <Button type="primary" htmlType="submit">
                      <Icon type="search" />查询
                    </Button>
                    <Button style={{ marginLeft: 8 }} type="" onClick={this.handleExport}>
                      <Icon type="export" />导出
                    </Button>
                    <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                      <Icon type="sync" />重置
                    </Button>
                    
                  </span>
                </div>
              </Form>
            </div>
          </Card>
          <Row style={{ marginTop: 15 }}>
            <Card>
              <div>
                <Table
                  pagination={paginationProps}
                  // rowSelection={rowSelection}
                  loading={loading}
                  columns={column}
                  dataSource={tableData}
                  onChange={this.handleStandardTableChange}
                  scroll={{ x: 1500 }}
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
