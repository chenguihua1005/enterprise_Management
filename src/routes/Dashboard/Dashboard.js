import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Row, Col, Icon, Card, Tabs, DatePicker, Menu, Dropdown } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import numeral from 'numeral';
import { ChartCard, yuan, Bar, Linear } from 'components/Charts';
import { getTimeDistance } from '../../utils/utils';
import styles from './Dashboard.less';
import sha1 from 'crypto-js/sha1';
import Authorized from '../../utils/Authorized';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const Yuan = ({ children }) => (
  <span
    dangerouslySetInnerHTML={{ __html: yuan(children) }} /* eslint-disable-line react/no-danger */
  />
);
const havePermissionAsync = new Promise(resolve => {
  setTimeout(() => resolve(), 1000);
  });
  const { Secured } = Authorized;
  @Secured(havePermissionAsync)
@connect(({ dashboard, loading }) => ({
  dashboard,
  loading: loading.effects['dashboard/fetch'],
}))
export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.type = 1;
    this.accountType = false;
    this.accountType2 = false;
    this.state = {
      salesType: 'all',
      currentTabKey: '',
      rangePickerValue: getTimeDistance('week'),
      tabTitle:"liter",
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    // 基础信息
    dispatch({
      type: 'dashboard/statisticsInfo',
      payload: {},
    });
    // tab数据
    dispatch({
      type: 'dashboard/addOilStatistics',
      payload: {
        type: 1,
      },
    });
    // 排行榜
    dispatch({
      type: 'dashboard/branchAddOilStatistics',
      payload: {
        type: 1,
      },
    });
  }

  //切换分页图形
  handleTabCallback=(key)=>{
    this.setState({
      tabTitle:key
    });
  }
    //取对应的标注数据
  titleChartMapSource=(data,targetTitle)=>{
  //与之前不同的处理方法，每次都是固定的类型可以写死
    if(data){
      let rObj={}
      for(const prop in data){
        if(prop==targetTitle){
          rObj["y1"]= data[prop];
        }
      }
      return rObj;
    }
  }
  //本周:1, 本月:2
  selectDate = type => {
    if(type === 1) {
      this.setState({
        rangePickerValue: getTimeDistance('week'),
      });
    }else if(type === 2) {
      this.setState({
        rangePickerValue: getTimeDistance('month'),
      });
    }
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboard/addOilStatistics',
      payload: {
        type,
      },
    });
    dispatch({
      type: 'dashboard/branchAddOilStatistics',
      payload: {
        type,
      },
    });
  };

  isActive(type) {
    const { rangePickerValue } = this.state;
    const value = getTimeDistance(type);
    if (!rangePickerValue[0] || !rangePickerValue[1]) {
      return;
    }
    if (
      rangePickerValue[0].isSame(value[0], 'day') &&
      rangePickerValue[1].isSame(value[1], 'day')
    ) {
      return styles.currentDate;
    }
  }

  //图形数据处理
  chartFormatData=(data,enumdata)=>{  
    if(data){
      let reformat=data.map((item,index)=>{
      let newObj={};
      for(const prop in item){
        if(prop=="date"){
          newObj["month"]=item[prop];
        }else if(prop=="key"){
          delete item[prop];
        }else{
          newObj[enumdata[prop]]=item[prop];
        }
      }
        return newObj;
      });
      return reformat;
    }
  }

  render() {
    const { dashboard, loading, form } = this.props;
    const { statisticsInfo, addOilStatistics, branchAddOilStatistics } = dashboard;
    const { tabTitle } = this.state;
    const enumData={"money":"加油金额","liter":"加油升数"};
    const titleMapSource=this.titleChartMapSource(enumData,tabTitle);
    // //图形数据处理
    const chartFormat=this.chartFormatData(addOilStatistics,enumData);

    // const { rangePickerValue } = this.state;
    // const { salesData } = dashboard;
    // let salesData = [];
    // let salesData2 = [];
    if (branchAddOilStatistics === {}) {
      branchAddOilStatistics: [];
    }
    // if(Object.prototype.toString.call(addOilStatistics) === '[object Array]'){
    //   addOilStatistics.map(item => {
    //     salesData.push({ x: item.date, y: item.liter });
    //   });
    //   addOilStatistics.map(item => {
    //     salesData2.push({ x: item.date, y: item.money });
    //   });
    // }

    const salesExtra = (
      <div className={styles.salesExtraWrap}>
        <div className={styles.salesExtra}>
          <a className={this.isActive('week')} onClick={() => this.selectDate(1)}>
            本周
          </a>
          <a className={this.isActive('month')} onClick={() => this.selectDate(2)}>
            本月
          </a>
        </div>
        {/* <RangePicker
          value={rangePickerValue}
          onChange={this.handleRangePickerChange}
          disabled
          style={{ width: 256 }}
        /> */}
      </div>
    );

    return (
      <PageHeaderLayout>
        <Row gutter={0} style={{ marginBottom: 15 }}>
          <Col span={24}>
            <Card
              title={`${statisticsInfo.parentCompany === undefined ? '-' : statisticsInfo.parentCompany}/${statisticsInfo.belongCompany === undefined ? '-' : statisticsInfo.belongCompany}`}
              bordered={false}
              bodyStyle={{ padding: 10 }}
            >
              <Row gutter={0}>
                <Col span={4}>
                  <ChartCard
                    bordered={false}
                    title="账户余额"
                    loading={loading}
                    contentHeight={46}
                  />
                </Col>
                {statisticsInfo.accountType == 10 ? (
                  <Col span={8}>
                    <ChartCard
                      bordered={false}
                      title="预存账户余额（元）"
                      loading={loading}
                      total={() => <h4>{statisticsInfo.accountAmount}</h4>}
                      contentHeight={46}
                    />
                  </Col>
                ) : (
                  <Col span={8}>
                    <ChartCard
                      bordered={false}
                      title="授信账户可用额度（元）"
                      loading={loading}
                      total={() => <h4>{statisticsInfo.accountAmount}</h4>}
                      contentHeight={46}
                    />
                  </Col>
                )}
              </Row>
              <Row gutter={0}>
                <Col span={4}>
                  <ChartCard
                    bordered={false}
                    title="今日加油"
                    loading={loading}
                    contentHeight={46}
                  />
                </Col>
                <Col span={8}>
                  <ChartCard
                    bordered={false}
                    title="今日加油总额（元）"
                    loading={loading}
                    total={() => <h4>{statisticsInfo.oilTotalAmount}</h4>}
                    contentHeight={46}
                  />
                </Col>
                <Col span={8}>
                  <ChartCard
                    bordered={false}
                    title="今日加油总升数（升）"
                    loading={loading}
                    total={() => <h4>{statisticsInfo.oilTotalLitre}</h4>}
                    contentHeight={46}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Card loading={loading} bordered={false} bodyStyle={{ padding: 0 }}>
          <div className={styles.salesCard}>
            <Tabs tabBarExtraContent={salesExtra} size="large" tabBarStyle={{ marginBottom: 24 }} defaultActiveKey="liter" onChange={this.handleTabCallback}>
              <TabPane tab="加油升数" key="liter">
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                      {/* <Bar height={295} title="加油升数趋势" data={salesData} /> */}
                      <Linear height={295} width={300} title="加油升数趋势" data={chartFormat} titleMap={titleMapSource} />
                    </div>
                  </Col>
                  {branchAddOilStatistics &&
                  JSON.stringify(branchAddOilStatistics) == '{}' ? null : (
                    <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                      <div className={styles.salesRank}>
                        <h4 className={styles.rankingTitle}>加油升数排名</h4>
                        <ul className={styles.rankingList}>
                          {branchAddOilStatistics.map((item, i) => (
                            <li key={item.branchName}>
                              <span className={i < 3 ? styles.active : ''}>{i + 1}</span>
                              <span>{item.branchName}</span>
                              <span>{numeral(item.liter).format('0,0')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Col>
                  )}
                </Row>
              </TabPane>
              <TabPane tab="加油金额" key="money">
                <Row>
                  <Col xl={16} lg={12} md={12} sm={24} xs={24}>
                    <div className={styles.salesBar}>
                      {/* <Bar height={292} title="加油金额趋势" data={salesData} /> */}
                      <Linear height={292} title="加油金额趋势" data={chartFormat} titleMap={titleMapSource} />                    </div>
                  </Col>
                  {branchAddOilStatistics &&
                  JSON.stringify(branchAddOilStatistics) == '{}' ? null : (
                    <Col xl={8} lg={12} md={12} sm={24} xs={24}>
                      <div className={styles.salesRank}>
                        <h4 className={styles.rankingTitle}>加油金额排名</h4>
                        <ul className={styles.rankingList}>
                          {branchAddOilStatistics.map((item, i) => (
                            <li key={item.branchName}>
                              <span className={i < 3 ? styles.active : ''}>{i + 1}</span>
                              <span>{item.branchName}</span>
                              <span>{numeral(item.liter).format('0,0')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Col>
                  )}
                </Row>
              </TabPane>
            </Tabs>
          </div>
        </Card>
      </PageHeaderLayout>
    );
  }
}
