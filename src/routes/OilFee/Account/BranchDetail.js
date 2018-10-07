import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Select, Button, Table, DatePicker, Icon, message } from 'antd';

const { RangePicker } = DatePicker;

import styles from '../OilFee.less';

const FormItem = Form.Item;
const { Option } = Select;
import moment from 'moment';
import { getTimeDistance } from '../../../utils/utils';

@connect(({ oilfee, loading }) => ({
  oilfee,
  loading: loading.effects['oilfee/fetch2Detail','oilfee/fetch1ListExport'],
}))
@Form.create()
export default class AccountBranchDetailComponent extends PureComponent {
  state = {
    modalVisible: false,
    formValues: {},
    rangePickerValue: getTimeDistance('month'),
  };

  componentDidMount() {
    const { dispatch, companyId } = this.props;
    //帐户-公司账户流水明细（总公司/分公司)
    dispatch({
      type: 'oilfee/fetch2Detail',
      payload: {
        member_id: 26,
        branchId: companyId,
        page: 1,
        pageSize: 10,
        isCount: 1,
      },
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch, companyId } = this.props;
    const params = {
      member_id: 26,
      branchId: companyId,
      page: pagination.current,
      pageSize: pagination.pageSize,
      isCount: 1,
    };
    //帐户-公司账户流水明细（总公司/分公司)
    dispatch({
      type: 'oilfee/fetch2Detail',
      payload: params,
    });
  };

  // 搜索
  handleSearch = e => {
    e.preventDefault();
    const { dispatch, form, companyId } = this.props;
    const { getFieldValue } = form;
    const { rangePickerValue } = this.state; //startValue,endValue
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        member_id: 26,
        branchId: companyId,
        page: 1,
        pageSize: 10,
        isCount: 1,
        startTime,
        endTime,
        transactionType: 0,
        direction: 0,
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
          direction: fieldsValue.direction,
        };
        //帐户-公司账户流水明细（总公司/分公司)
        dispatch({
          type: 'oilfee/fetch2Detail',
          payload: values,
        });
      });
    } else {
      message.error('日期不能为空');
    }
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
    const { dispatch, form, companyId } = this.props;
    const { getFieldValue } = form;
    const { rangePickerValue } = this.state;
    const [startValue, endValue] = rangePickerValue;
    if (Object.keys(rangePickerValue).length != 0) {
      const startTime = startValue.format('YYYY-MM-DD');
      const endTime = endValue.format('YYYY-MM-DD');
      const params = {
        //branchId为1为导出
        actionType: 1,
        branchId: companyId,
        startTime,
        endTime,
        transactionType: 0,
        direction: 0,
      };
      const values = {
        ...params,
        transactionType: getFieldValue('transactionType'),
        direction: getFieldValue('direction'),
      };
      dispatch({
        type: 'oilfee/fetch1ListExport',
        payload: values,
      }).then(() => {
        const { oilAccountInfoListExport } = this.props.oilfee;
        switch (oilAccountInfoListExport.err) {
          //err=0成功
          case 0:
            message.success(oilAccountInfoListExport.msg);
            window.open(oilAccountInfoListExport.res.path);
            break;
          default:
            message.warning(oilAccountInfoListExport.msg);
        }
      });
    } else {
      message.error('日期不能为空');
    }
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
                  <Option value="1">充值</Option>
                  <Option value="2">发放油费</Option>
                  <Option value="3">回收</Option>
                  <Option value="4">加油</Option>
                  <Option value="5">退款</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={6} sm={24}>
            <FormItem label="资金方向">
              {getFieldDecorator('direction', {
                initialValue: '0',
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">全部</Option>
                  <Option value="1">收入</Option>
                  <Option value="2">支出</Option>
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
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right' }}>
            <Button type="primary" htmlType="submit">
              <Icon type="search" />
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleExport}>
              <Icon type="export" />导出
            </Button>
          </span>
        </div>
      </Form>
    );
  }

  renderForm() {
    return this.renderAdvancedForm();
  }

  render() {
    const { oilfee, loading } = this.props;
    const { oilBranchInfodetailList } = oilfee;
    const { count, list: tabledata } = oilBranchInfodetailList;
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

        <Card bordered={false} title={this.props.companyBranchName}>
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
