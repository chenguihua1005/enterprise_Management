import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Select, Button, Table, DatePicker, message, } from 'antd';
import styles from '../OilFee.less';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
const { Option } = Select;
import moment from 'moment';
import { getTimeDistance } from '../../../utils/utils';

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch3Detail','oilfee/fetch3DetailExport'],
}))
@Form.create()
export default class AccountDriverDetailComponent extends PureComponent {
  state = {
    modalVisible: false,
    formValues: {},
    rangePickerValue: getTimeDistance('month'),
  };

  componentDidMount() {
    const { dispatch } = this.props;
    //帐户-司机油卡账户收支明细
    dispatch({
      type: 'oilfee/fetch3Detail',
      payload: {
        member_id: 26,
        page: 1,
        pageSize: 10,
        isCount: 1,
        driverId: this.props.driverId.employeeId,
      },
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const params = {
      member_id: 26,
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
      driverId: this.props.driverId.employeeId,
    };
    //帐户-司机油卡账户收支明细
    dispatch({
      type: 'oilfee/fetch3Detail',
      payload: params,
    });
  };

  // 重置搜索条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'oilfee/fetch',
      payload: {},
    });
  };

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    if(Object.keys(rangePickerValue).length != 0){
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        //默认值
        member_id: 26,
        page: 1,
        pageSize: 10,
        isCount: 1,
        startTime,
        endTime,
        driverId: this.props.driverId.employeeId,
        transactionType: 0,
      };
  
      // 表单校验
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
        const values = {
          ...params,
          transactionType: fieldsValue.transactionType,
        };
        //帐户-司机油卡账户收支明细
        dispatch({
          type: 'oilfee/fetch3Detail',
          payload: values,
        });
      });
    }else{message.error("日期不能为空");}

  };

  //禁用当前日期之后的时间
  disabledDate = current => {
    // console.log(moment().subtract(3,"months"));
    // return current && current < moment().subtract(3,"months");
    return current && current > moment().endOf('day');
  };

  //日期框设置值
  handleRangePickerChange = rangePickerValue => {
    this.setState({
      rangePickerValue,
    });
  };

    //导出
    handleExport = () => {
      console.log('handleExport');
      const { dispatch, form } = this.props;
      const { getFieldValue } = form;
      const { rangePickerValue } = this.state; //startValue,endValue
      const [startValue, endValue] = rangePickerValue;
      if(Object.keys(rangePickerValue).length != 0){
        const startTime = startValue.format('YYYY-MM-DD');
        const endTime = endValue.format('YYYY-MM-DD');
        const params = {
          actionType: 1,
          startTime,
          endTime,
          driverId: this.props.driverId.employeeId,
          transactionType: getFieldValue('transactionType'),
        };
        dispatch({
          type: 'oilfee/fetch3DetailExport',
          payload: params,
        }).then(() => {
          const { oilDriverInfodetailListExport } = this.props.oilfee;
          switch (oilDriverInfodetailListExport.err) {
            //err=0成功
            case 0:
              message.success(oilDriverInfodetailListExport.msg);
              window.open(oilDriverInfodetailListExport.res.path);
              break;
            default:
              message.warning(oilDriverInfodetailListExport.msg);
          }
        });
      }else{message.error("日期不能为空");}
      

    };

  // 搜索区表单
  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 24, lg: 24, xl: 48 }}>
          <Col md={6} sm={24}>
            <FormItem label="交易类型">
              {getFieldDecorator('transactionType', {
                initialValue: '0',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">全部</Option>
                  <Option value="1">发放油费</Option>
                  <Option value="2">回收</Option>
                  <Option value="3">加油</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={12} sm={24}>
            <FormItem label="起止日期">
              {getFieldDecorator('range-picke')(
                // < onChange={onChange} />
                <RangePicker
                  style={{ width: '100%' }}
                  disabledDate={this.disabledDate}
                  onChange={this.handleRangePickerChange}
                />
              )}
            </FormItem>
          </Col>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'right' }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
                导出
              </Button>
            </span>
          </div>
        </Row>
      </Form>
    );
  }

  render() {
    const { oilfee, loading } = this.props;
    const { oilDriverInfodetailList } = oilfee;
    const { count, list: tabledata } = oilDriverInfodetailList;
    //分页属性设置
    const paginationProps = {
      showQuickJumper: true,
      showSizeChanger: true,
      total: count,
      showTotal: () => `共计 ${count} 条`,
    };

    const columnData = [
      {
        title: '交易时间',
        dataIndex: 'createTime',
      },
      {
        title: '交易类型',
        dataIndex: 'transactionType',
      },
      {
        title: '金额(元)',
        dataIndex: 'rechargeAmount',
      },
      {
        title: '资金方向',
        dataIndex: 'direction',
      },
      {
        title: '交易后账户余额(元)',
        dataIndex: 'afterAmount',
      },
      {
        title: '交易方标识',
        dataIndex: 'transactionFlag',
      },
      {
        title: '账户交易流水号',
        dataIndex: 'flowNumber',
      },
      {
        title: '订单号',
        dataIndex: 'orderNumber',
      },
    ];

    const dirverInfo = (
      <div>
        <span>司机手机号：</span>
        <span>{this.props.driverId.employeeMobile}</span>
        <span style={{ marginLeft: 20 }}>账号：</span>
        <span>{this.props.driverId.accountNumber}</span>
      </div>
    );
    return (
      <div>
        <Row gutter={24}>
          <Col xs={24}>
            <Card bordered={false}>
              <div className={styles.tableListForm}>{this.renderAdvancedForm()}</div>
            </Card>
          </Col>
        </Row>

        <Card bordered={false} title={dirverInfo}>
          <div className={styles.tableList}>
            <Table
              pagination={paginationProps}
              loading={loading}
              rowKey={'key'}
              dataSource={tabledata}
              columns={columnData}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
      </div>
    );
  }
}
