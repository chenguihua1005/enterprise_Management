import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Card, Badge,Form, Button, Table, DatePicker, Input } from 'antd';
const { RangePicker } = DatePicker;
import styles from '../Settlement.less';
import moment from 'moment/moment';
import { getTimeDistance } from '../../../utils/utils';

const FormItem = Form.Item;

@connect(({ statement, loading }) => ({
  statement,
  loading: loading.models.statement,
}))
@Form.create()
export default class StatementDetail extends PureComponent {
  state = {
    modalVisible: false,
    formValues: {},
    rangePickerValue: getTimeDistance('month'),

  };

  componentDidMount() {
    const { dispatch, billNumber } = this.props;
    this.billId = 0;
    dispatch({
      type: 'statement/billDetail',
      payload: {
        billNumber: billNumber,
      },
    }).then(() => {
      const { billDetail } = this.props.statement;
      if (billDetail && JSON.stringify(billDetail) !== "{}") {
        // 列表
    dispatch({
      type: 'statement/billOrderList',
      payload: {
        isCount: 1,
        billId: billDetail.billId,
      },
    });
      }
    });
    
  }

  // 重置搜索条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'statement/fetch1',
      payload: {},
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
  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form, billDetail } = this.props;
    // 表单校验
    const {rangePickerValue}=this.state;
    const [startValue,endValue]=rangePickerValue;
    if(Object.keys(rangePickerValue).length!=0){
      const startTime = startValue.format('YYYY-MM-DD HH:mm:ss');
      const endTime = endValue.format('YYYY-MM-DD HH:mm:ss');
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
      const params={
        orderSn: fieldsValue.orderSn,
        billStartTime: startTime,
        billEndTime: endTime,
        minAmount: fieldsValue.minAmount,
        maxAmount: fieldsValue.maxAmount,
        page: 1,
        pageSize: 10,
        isCount: 1,
        billId: billDetail.billId,
      };

        const values = {
          ...params,
          transactionType: fieldsValue.transactionType,
          direction: fieldsValue.direction,
        };
        dispatch({
          type: 'statement/billOrderList',
          payload: values,
        });
      });
    }else{
      message.error("日期不能为空");
    }
  };
  // 搜索区表单
  renderAdvancedForm() {
    const { billDetail  } = this.props.statement;
    const { getFieldDecorator  } = this.props.form;
    return (
      <div>
        <Card>
          <Row>
            <Col span={8}>
              <p>账单周期：{billDetail.billCycle}</p>
            </Col>
            <Col span={8}>
              <p>账单日：{billDetail.billDate}</p>
            </Col>
            <Col span={8}>
              <p>账单总额：{billDetail.billAmount} 元</p>
            </Col>
          </Row>

          <Row>
            <Col span={8}>
              <p>已核销金额：{billDetail.billedAmount}元</p>
            </Col>
            <Col span={8}>
              <p>待核销金额：{billDetail.waitBillAmount} 元</p>
            </Col>
            <Col span={8}>
              <p>对账状态：{billDetail.billStatus == 1 ? '已核销' : '未核销'}</p>
            </Col>
          </Row>
        </Card>

        <Card>
        <Form onSubmit={this.handleSearch} layout="inline">
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col span={12}>
              <FormItem label="订单号">
                {getFieldDecorator('orderSn', {
                  basicinfo: [{ required: true, message: 'Please input some description...' }],
                })(<Input placeholder="请输入" />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label="创建时间">
                {getFieldDecorator('time', {
                  basicinfo: [{ required: true, message: 'Please input some description...' }],
                })(
                  <RangePicker
                    showTime
                    allowClear
                    placeholder={['Start Time', 'End Time']}
                    disabledDate={this.disabledDate}
                    onChange={this.handleRangePickerChange}
                    style={{ width: '100%' }} 
                  />
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
            <Col span={8}>
              <FormItem label="实收金额">
                {getFieldDecorator('minAmount', {
                  basicinfo: [{ required: true, message: 'Please input some description...' }],
                })(<Input placeholder="请输入最小值" />)}
              </FormItem>
            </Col>
            <Col span={2}>~</Col>
            <Col span={8}>
              <FormItem label="">
                {getFieldDecorator('maxAmount', {
                  basicinfo: [{ required: true, message: 'Please input some description...' }],
                })(<Input placeholder="请输入最大值" />)}
              </FormItem>
            </Col>
            <span style={{ float: 'right' }}>
                <Button type="primary" htmlType="submit">
                <Icon type="search" />查询
                </Button>
                <Button type="primary" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  重置
                </Button>
              </span>
          </Row>
        </Form>
          </Card>
      
      </div>
    );
  }
  getBillStatus = (status) => {
    if(status == 1) {
      return <Badge status="1" text="未结算"/>
    }else if(status == 2){
      return <Badge status="2" text="结算中"/>
    } else if(status === 3){
      return <Badge status="3" text="已完成"/>
    } else{
      return <Badge status="0" text="已取消"/>
    }
}
  render() {
    const { statement, loading } = this.props;
    const { billDetail, billOrderList } = statement;
    const { count, list: tableData } = billOrderList;

    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };
    
    const column = [
      {
        title: '订单号',
        dataIndex: 'orderNumber',
        width: 200,
        fixed: 'left',
      },
      {
        title: '区域',
        dataIndex: 'cityName',
      },
      {
        title: '油品',
        dataIndex: 'skuCodeName',
      },
      {
        title: '单价（元/升）',
        dataIndex: 'skuPrice',
      },
      {
        title: '升量',
        dataIndex: 'skuLitre',
      },
      {
        title: '订单金额（元）',
        dataIndex: 'amount',
      },
      {
        title: '合同结算系数',
        dataIndex: 'billScale',
      },
      {
        title: '结算单价（元/升）',
        dataIndex: 'settledPrice',
      },
      {
        title: '结算金额（元）',
        dataIndex: 'billAmount',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '对账状态',
        dataIndex: 'billStatus',
         render: status => this.getBillStatus(status)
      },
    ];

      

    return (
      <div>
        <Row gutter={24}>
          <Col xs={24}>
            <Card bordered={false}>
              <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            </Card>
          </Col>
        </Row>

        <Card>
          <Row>
            <Table
              columns={column}
              dataSource={tableData}
              pagination={paginationProps}
              scroll={{ x: 1400 }}
            />
          </Row>
        </Card>
      </div>
    );
  }
}